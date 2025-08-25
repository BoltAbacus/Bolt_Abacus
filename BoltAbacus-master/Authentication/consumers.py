import json
import jwt
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from .models import (
    UserDetails, GameRoom, GameMatch, GamePlayer, 
    GameQuestion, GameAnswer, PlayerConnection
)
from . import Constants
import random
import asyncio


class BaseConsumer(AsyncWebsocketConsumer):
    """Base consumer with common authentication and utility methods"""
    
    async def connect(self):
        """Handle WebSocket connection with JWT authentication"""
        try:
            # Get token from query parameters or headers
            token = self.scope.get('url_route', {}).get('kwargs', {}).get('token')
            if not token:
                # Try to get from query parameters
                query_string = self.scope.get('query_string', b'').decode()
                params = dict(item.split('=') for item in query_string.split('&') if '=' in item)
                token = params.get('token', '')
            
            if not token:
                await self.close(code=4001)  # No token provided
                return
            
            # Verify JWT token
            user = await self.get_user_from_token(token)
            if not user:
                await self.close(code=4002)  # Invalid token
                return
            
            self.user = user
            self.user_id = user.userId
            
            await self.accept()
            await self.on_connect()
            
        except Exception as e:
            print(f"Connection error: {e}")
            await self.close(code=4000)
    
    @database_sync_to_async
    def get_user_from_token(self, token):
        """Verify JWT token and return user"""
        try:
            payload = jwt.decode(token, Constants.SECRET_KEY, algorithms=['HS256'])
            user_id = payload.get(Constants.USER_ID)
            if user_id:
                return UserDetails.objects.filter(userId=user_id, blocked=False).first()
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
        return None
    
    async def on_connect(self):
        """Override in subclasses for connection-specific logic"""
        pass
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        await self.on_disconnect(close_code)
    
    async def on_disconnect(self, close_code):
        """Override in subclasses for disconnection-specific logic"""
        pass


class LobbyConsumer(BaseConsumer):
    """Consumer for game lobby functionality"""
    
    async def on_connect(self):
        """Handle lobby connection"""
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'lobby_{self.room_id}'
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        # Add user to room
        await self.add_user_to_room()
        
        # Send room info to user
        await self.send_room_info()
    
    async def on_disconnect(self, close_code):
        """Handle lobby disconnection"""
        if hasattr(self, 'room_group_name'):
            # Remove user from room
            await self.remove_user_from_room()
            
            # Leave room group
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
    
    async def receive(self, text_data):
        """Handle incoming messages from WebSocket"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'ready':
                await self.handle_ready(data)
            elif message_type == 'start_game':
                await self.handle_start_game(data)
            elif message_type == 'leave_room':
                await self.handle_leave_room(data)
            elif message_type == 'chat_message':
                await self.handle_chat_message(data)
            
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON format'
            }))
    
    @database_sync_to_async
    def add_user_to_room(self):
        """Add user to room and update player count"""
        room = GameRoom.objects.filter(roomId=self.room_id, isActive=True).first()
        if room and room.currentPlayers < room.maxPlayers:
            room.currentPlayers += 1
            room.save()
            
            # Create or update player connection
            PlayerConnection.objects.update_or_create(
                user_id=self.user_id,
                room_id=self.room_id,
                defaults={'isOnline': True}
            )
            return True
        return False
    
    @database_sync_to_async
    def remove_user_from_room(self):
        """Remove user from room and update player count"""
        room = GameRoom.objects.filter(roomId=self.room_id).first()
        if room:
            room.currentPlayers = max(0, room.currentPlayers - 1)
            room.save()
            
            # Update player connection
            PlayerConnection.objects.filter(
                user_id=self.user_id,
                room_id=self.room_id
            ).update(isOnline=False)
    
    @database_sync_to_async
    def get_room_info(self):
        """Get room information with players"""
        room = GameRoom.objects.filter(roomId=self.room_id).first()
        if not room:
            return None
        
        players = PlayerConnection.objects.filter(
            room_id=self.room_id,
            isOnline=True
        ).select_related('user')
        
        player_list = []
        for player in players:
            player_list.append({
                'userId': player.user.userId,
                'firstName': player.user.firstName,
                'lastName': player.user.lastName,
                'isReady': getattr(player, 'isReady', False)
            })
        
        return {
            'roomId': room.roomId,
            'roomName': room.roomName,
            'maxPlayers': room.maxPlayers,
            'currentPlayers': room.currentPlayers,
            'gameType': room.gameType,
            'difficulty': room.difficulty,
            'players': player_list
        }
    
    async def send_room_info(self):
        """Send room information to connected user"""
        room_info = await self.get_room_info()
        if room_info:
            await self.send(text_data=json.dumps({
                'type': 'room_info',
                'data': room_info
            }))
    
    async def handle_ready(self, data):
        """Handle player ready status"""
        is_ready = data.get('ready', False)
        await self.set_player_ready(is_ready)
        
        # Broadcast to all players in room
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'player_ready',
                'userId': self.user_id,
                'ready': is_ready
            }
        )
    
    @database_sync_to_async
    def set_player_ready(self, is_ready):
        """Set player ready status"""
        PlayerConnection.objects.filter(
            user_id=self.user_id,
            room_id=self.room_id
        ).update(isReady=is_ready)
    
    async def handle_start_game(self, data):
        """Handle game start request"""
        # Check if all players are ready
        all_ready = await self.check_all_players_ready()
        if all_ready:
            # Create new match
            match_id = await self.create_match()
            if match_id:
                # Broadcast game start to all players
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'game_start',
                        'matchId': match_id
                    }
                )
    
    @database_sync_to_async
    def check_all_players_ready(self):
        """Check if all players in room are ready"""
        players = PlayerConnection.objects.filter(
            room_id=self.room_id,
            isOnline=True
        )
        return all(player.isReady for player in players)
    
    @database_sync_to_async
    def create_match(self):
        """Create new game match"""
        room = GameRoom.objects.filter(roomId=self.room_id).first()
        if not room:
            return None
        
        match = GameMatch.objects.create(
            room=room,
            status='waiting',
            totalQuestions=10,
            timeLimit=30
        )
        
        # Add all players to match
        players = PlayerConnection.objects.filter(
            room_id=self.room_id,
            isOnline=True
        )
        for player in players:
            GamePlayer.objects.create(
                match=match,
                user=player.user
            )
        
        return match.matchId
    
    async def handle_leave_room(self, data):
        """Handle player leaving room"""
        await self.remove_user_from_room()
        
        # Broadcast player left
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'player_left',
                'userId': self.user_id,
                'firstName': self.user.firstName,
                'lastName': self.user.lastName
            }
        )
    
    async def handle_chat_message(self, data):
        """Handle chat message"""
        message = data.get('message', '')
        if message.strip():
            # Broadcast chat message
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'userId': self.user_id,
                    'firstName': self.user.firstName,
                    'lastName': self.user.lastName,
                    'message': message
                }
            )
    
    # Group message handlers
    async def player_ready(self, event):
        """Handle player ready broadcast"""
        await self.send(text_data=json.dumps({
            'type': 'player_ready',
            'userId': event['userId'],
            'ready': event['ready']
        }))
    
    async def game_start(self, event):
        """Handle game start broadcast"""
        await self.send(text_data=json.dumps({
            'type': 'game_start',
            'matchId': event['matchId']
        }))
    
    async def player_left(self, event):
        """Handle player left broadcast"""
        await self.send(text_data=json.dumps({
            'type': 'player_left',
            'userId': event['userId'],
            'firstName': event['firstName'],
            'lastName': event['lastName']
        }))
    
    async def chat_message(self, event):
        """Handle chat message broadcast"""
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'userId': event['userId'],
            'firstName': event['firstName'],
            'lastName': event['lastName'],
            'message': event['message']
        }))


class GameConsumer(BaseConsumer):
    """Consumer for active game functionality"""
    
    async def on_connect(self):
        """Handle game connection"""
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'game_{self.room_id}'
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        # Get active match
        self.match = await self.get_active_match()
        if not self.match:
            await self.close(code=4003)  # No active match
            return
        
        # Add player to match
        await self.add_player_to_match()
    
    async def on_disconnect(self, close_code):
        """Handle game disconnection"""
        if hasattr(self, 'room_group_name'):
            await self.remove_player_from_match()
            
            # Leave room group
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
    
    async def receive(self, text_data):
        """Handle incoming game messages"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'answer':
                await self.handle_answer(data)
            elif message_type == 'ready_for_next':
                await self.handle_ready_for_next(data)
            elif message_type == 'game_action':
                await self.handle_game_action(data)
            
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON format'
            }))
    
    @database_sync_to_async
    def get_active_match(self):
        """Get active match for room"""
        return GameMatch.objects.filter(
            room_id=self.room_id,
            status__in=['waiting', 'active']
        ).first()
    
    @database_sync_to_async
    def add_player_to_match(self):
        """Add player to match"""
        player, created = GamePlayer.objects.get_or_create(
            match=self.match,
            user_id=self.user_id,
            defaults={'isReady': True}
        )
        return player
    
    @database_sync_to_async
    def remove_player_from_match(self):
        """Remove player from match"""
        GamePlayer.objects.filter(
            match=self.match,
            user_id=self.user_id
        ).update(left_at=timezone.now())
    
    async def handle_answer(self, data):
        """Handle player answer"""
        question_number = data.get('questionNumber')
        answer = data.get('answer')
        response_time = data.get('responseTime', 0)
        
        # Process answer
        result = await self.process_answer(question_number, answer, response_time)
        
        # Broadcast answer result
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'answer_result',
                'userId': self.user_id,
                'questionNumber': question_number,
                'isCorrect': result['isCorrect'],
                'score': result['score']
            }
        )
    
    @database_sync_to_async
    def process_answer(self, question_number, answer, response_time):
        """Process player answer and update score"""
        question = GameQuestion.objects.filter(
            match=self.match,
            questionNumber=question_number
        ).first()
        
        if not question:
            return {'isCorrect': False, 'score': 0}
        
        is_correct = str(answer) == str(question.correctAnswer)
        
        # Create answer record
        GameAnswer.objects.create(
            question=question,
            player_id=self.user_id,
            answer=answer,
            isCorrect=is_correct,
            responseTime=response_time
        )
        
        # Update player score
        player = GamePlayer.objects.filter(
            match=self.match,
            user_id=self.user_id
        ).first()
        
        if player:
            if is_correct:
                player.currentScore += 10
                player.totalCorrect += 1
            else:
                player.totalIncorrect += 1
            
            player.averageTime = (player.averageTime + response_time) / 2
            player.save()
        
        return {
            'isCorrect': is_correct,
            'score': player.currentScore if player else 0
        }
    
    async def handle_ready_for_next(self, data):
        """Handle player ready for next question"""
        # Check if all players are ready for next question
        all_ready = await self.check_all_players_ready_for_next()
        if all_ready:
            # Move to next question or end game
            await self.next_question_or_end_game()
    
    @database_sync_to_async
    def check_all_players_ready_for_next(self):
        """Check if all players are ready for next question"""
        players = GamePlayer.objects.filter(
            match=self.match,
            left_at__isnull=True
        )
        return all(player.isReady for player in players)
    
    async def next_question_or_end_game(self):
        """Move to next question or end game"""
        if self.match.currentQuestion >= self.match.totalQuestions:
            # End game
            await self.end_game()
        else:
            # Next question
            await self.next_question()
    
    @database_sync_to_async
    def end_game(self):
        """End the game and calculate final results"""
        self.match.status = 'completed'
        self.match.ended_at = timezone.now()
        self.match.save()
        
        # Calculate final rankings
        players = GamePlayer.objects.filter(
            match=self.match
        ).order_by('-currentScore', 'averageTime')
        
        rankings = []
        for i, player in enumerate(players, 1):
            rankings.append({
                'rank': i,
                'userId': player.user.userId,
                'firstName': player.user.firstName,
                'lastName': player.user.lastName,
                'score': player.currentScore,
                'correct': player.totalCorrect,
                'incorrect': player.totalIncorrect,
                'averageTime': player.averageTime
            })
        
        return rankings
    
    @database_sync_to_async
    def next_question(self):
        """Move to next question"""
        self.match.currentQuestion += 1
        self.match.save()
        
        # Generate new question
        question = self.generate_question()
        return question
    
    def generate_question(self):
        """Generate a new question for the current level"""
        # Simple question generation - can be enhanced
        num1 = random.randint(1, 100)
        num2 = random.randint(1, 100)
        operation = random.choice(['+', '-', '*'])
        
        if operation == '+':
            answer = num1 + num2
        elif operation == '-':
            answer = num1 - num2
        else:
            answer = num1 * num2
        
        question_text = f"{num1} {operation} {num2} = ?"
        
        # Create question in database
        question = GameQuestion.objects.create(
            match=self.match,
            questionNumber=self.match.currentQuestion,
            questionText=question_text,
            correctAnswer=str(answer),
            questionType='arithmetic',
            timeLimit=30
        )
        
        return {
            'questionNumber': question.questionNumber,
            'questionText': question.questionText,
            'timeLimit': question.timeLimit
        }
    
    async def handle_game_action(self, data):
        """Handle general game actions"""
        action = data.get('action')
        
        if action == 'request_question':
            # Send current question to player
            question = await self.get_current_question()
            if question:
                await self.send(text_data=json.dumps({
                    'type': 'question',
                    'data': question
                }))
    
    @database_sync_to_async
    def get_current_question(self):
        """Get current question for the match"""
        question = GameQuestion.objects.filter(
            match=self.match,
            questionNumber=self.match.currentQuestion
        ).first()
        
        if question:
            return {
                'questionNumber': question.questionNumber,
                'questionText': question.questionText,
                'timeLimit': question.timeLimit
            }
        return None
    
    # Group message handlers
    async def answer_result(self, event):
        """Handle answer result broadcast"""
        await self.send(text_data=json.dumps({
            'type': 'answer_result',
            'userId': event['userId'],
            'questionNumber': event['questionNumber'],
            'isCorrect': event['isCorrect'],
            'score': event['score']
        }))
    
    async def game_ended(self, event):
        """Handle game ended broadcast"""
        await self.send(text_data=json.dumps({
            'type': 'game_ended',
            'rankings': event['rankings']
        }))
    
    async def new_question(self, event):
        """Handle new question broadcast"""
        await self.send(text_data=json.dumps({
            'type': 'new_question',
            'data': event['question']
        }))


class LeaderboardConsumer(BaseConsumer):
    """Consumer for real-time leaderboard updates"""
    
    async def on_connect(self):
        """Handle leaderboard connection"""
        self.leaderboard_group_name = 'leaderboard'
        
        # Join leaderboard group
        await self.channel_layer.group_add(
            self.leaderboard_group_name,
            self.channel_name
        )
        
        # Send current leaderboard
        await self.send_leaderboard()
    
    async def on_disconnect(self, close_code):
        """Handle leaderboard disconnection"""
        if hasattr(self, 'leaderboard_group_name'):
            await self.channel_layer.group_discard(
                self.leaderboard_group_name,
                self.channel_name
            )
    
    @database_sync_to_async
    def get_leaderboard(self):
        """Get current leaderboard"""
        students = UserDetails.objects.filter(
            role=Constants.STUDENT
        ).order_by('-xp')[:20]
        
        leaderboard = []
        for idx, student in enumerate(students, start=1):
            leaderboard.append({
                'rank': idx,
                'name': f"{student.firstName} {student.lastName}",
                'xp': student.xp,
                'userId': student.userId,
            })
        
        return leaderboard
    
    async def send_leaderboard(self):
        """Send leaderboard to connected user"""
        leaderboard = await self.get_leaderboard()
        await self.send(text_data=json.dumps({
            'type': 'leaderboard_update',
            'data': leaderboard
        }))
    
    async def receive(self, text_data):
        """Handle leaderboard messages"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'request_update':
                await self.send_leaderboard()
            
        except json.JSONDecodeError:
            pass
    
    # Group message handlers
    async def leaderboard_update(self, event):
        """Handle leaderboard update broadcast"""
        await self.send(text_data=json.dumps({
            'type': 'leaderboard_update',
            'data': event['data']
        }))


class ChatConsumer(BaseConsumer):
    """Consumer for chat functionality"""
    
    async def on_connect(self):
        """Handle chat connection"""
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.chat_group_name = f'chat_{self.room_id}'
        
        # Join chat group
        await self.channel_layer.group_add(
            self.chat_group_name,
            self.channel_name
        )
    
    async def on_disconnect(self, close_code):
        """Handle chat disconnection"""
        if hasattr(self, 'chat_group_name'):
            await self.channel_layer.group_discard(
                self.chat_group_name,
                self.channel_name
            )
    
    async def receive(self, text_data):
        """Handle chat messages"""
        try:
            data = json.loads(text_data)
            message = data.get('message', '').strip()
            
            if message:
                # Broadcast chat message
                await self.channel_layer.group_send(
                    self.chat_group_name,
                    {
                        'type': 'chat_message',
                        'userId': self.user_id,
                        'firstName': self.user.firstName,
                        'lastName': self.user.lastName,
                        'message': message,
                        'timestamp': timezone.now().isoformat()
                    }
                )
        
        except json.JSONDecodeError:
            pass
    
    # Group message handlers
    async def chat_message(self, event):
        """Handle chat message broadcast"""
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'userId': event['userId'],
            'firstName': event['firstName'],
            'lastName': event['lastName'],
            'message': event['message'],
            'timestamp': event['timestamp']
        }))
