from django.db import models
import json
from datetime import date, datetime


# from django.contrib.auth.models import AbstractBaseUser


class OrganizationTag(models.Model):
    tagId = models.AutoField(primary_key=True)
    organizationName = models.CharField(max_length=255)
    tagName = models.CharField(max_length=100, default="BoltAbacus", unique=True)
    isIndividualTeacher = models.BooleanField(default=False)
    numberOfTeachers = models.IntegerField(default=0)
    numberOfStudents = models.IntegerField(default=0)
    expirationDate = models.DateField(default=datetime.today)
    totalNumberOfStudents = models.IntegerField(default=0)
    maxLevel = models.IntegerField(default=1)
    maxClass = models.IntegerField(default=1)


class UserDetails(models.Model):
    userId = models.AutoField(primary_key=True)
    firstName = models.CharField(max_length=50)
    lastName = models.CharField(max_length=50)
    phoneNumber = models.CharField(max_length=15)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20)
    encryptedPassword = models.CharField(max_length=255)
    created_date = models.DateField()
    blocked = models.BooleanField()
    blockedTimestamp = models.DateField(default=datetime.today)
    last_login_date = models.DateField(null=True, blank=True)
    current_streak = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)
    xp = models.IntegerField(default=0)
    tag = models.ForeignKey(OrganizationTag, to_field="tagId", null=True, on_delete=models.CASCADE, default=1)


class TopicDetails(models.Model):
    levelId = models.IntegerField()
    classId = models.IntegerField()
    topicId = models.IntegerField()


class Curriculum(models.Model):
    quizId = models.AutoField(primary_key=True)
    levelId = models.IntegerField()
    classId = models.IntegerField()
    topicId = models.IntegerField()
    quizType = models.CharField(max_length=50)
    quizName = models.CharField(max_length=50)


class QuizQuestions(models.Model):
    questionId = models.AutoField(primary_key=True)
    quiz = models.ForeignKey(Curriculum, to_field='quizId', null=True, on_delete=models.CASCADE)
    question = models.CharField(max_length=1000)
    correctAnswer = models.CharField(max_length=100)


class Progress(models.Model):
    quiz = models.ForeignKey(Curriculum, to_field='quizId', null=True, on_delete=models.CASCADE)
    user = models.ForeignKey(UserDetails, to_field='userId', null=True, on_delete=models.CASCADE)
    score = models.IntegerField(default=0)
    time = models.IntegerField(default=0)
    quizPass = models.BooleanField(default=False)
    percentage = models.FloatField(default=0)


class Batch(models.Model):
    batchId = models.AutoField(primary_key=True)
    timeDay = models.CharField(max_length=20)
    timeSchedule = models.CharField(max_length=100)
    numberOfStudents = models.IntegerField()
    active = models.BooleanField()
    batchName = models.CharField(max_length=255)
    latestLevelId = models.IntegerField()
    latestClassId = models.IntegerField()
    latestLink = models.CharField(max_length=500)
    tag = models.ForeignKey(OrganizationTag, to_field="tagId", null=True, on_delete=models.CASCADE, default=1)


class Student(models.Model):
    user = models.OneToOneField(UserDetails, to_field='userId', on_delete=models.CASCADE)
    batch = models.ForeignKey(Batch, to_field='batchId', on_delete=models.DO_NOTHING)
    latestLevelId = models.IntegerField(default=1)
    latestClassId = models.IntegerField(default=1)


class Teacher(models.Model):
    user = models.ForeignKey(UserDetails, to_field='userId', on_delete=models.CASCADE)
    batchId = models.IntegerField()


class PracticeQuestions(models.Model):
    practiceQuestionId = models.AutoField(primary_key=True)
    user = models.ForeignKey(UserDetails, to_field='userId', on_delete=models.CASCADE)
    practiceType = models.CharField(max_length=20)
    operation = models.CharField(max_length=50)
    numberOfDigits = models.IntegerField(default=1)
    numberOfQuestions = models.IntegerField(default=0)
    numberOfRows = models.IntegerField(default=1)
    zigZag = models.BooleanField(default=False)
    includeSubtraction = models.BooleanField(default=False)
    persistNumberOfDigits = models.BooleanField(default=False)
    score = models.IntegerField(default=0)
    totalTime = models.FloatField(default=0)
    averageTime = models.FloatField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)


# Multiplayer Game Models
class GameRoom(models.Model):
    roomId = models.AutoField(primary_key=True)
    roomName = models.CharField(max_length=100)
    createdBy = models.ForeignKey(UserDetails, to_field='userId', on_delete=models.CASCADE)
    maxPlayers = models.IntegerField(default=2)
    currentPlayers = models.IntegerField(default=0)
    isActive = models.BooleanField(default=True)
    isPrivate = models.BooleanField(default=False)
    roomCode = models.CharField(max_length=10, unique=True, null=True, blank=True)
    gameType = models.CharField(max_length=50, default='abacus_pvp')  # abacus_pvp, speed_math, etc.
    difficulty = models.CharField(max_length=20, default='medium')  # easy, medium, hard
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Room {self.roomId}: {self.roomName}"


class GameMatch(models.Model):
    matchId = models.AutoField(primary_key=True)
    room = models.ForeignKey(GameRoom, to_field='roomId', on_delete=models.CASCADE)
    status = models.CharField(max_length=20, default='waiting')  # waiting, active, completed, cancelled
    gameState = models.TextField(default='{}')  # JSON field for game state
    currentQuestion = models.IntegerField(default=0)
    totalQuestions = models.IntegerField(default=10)
    timeLimit = models.IntegerField(default=60)  # seconds per question
    started_at = models.DateTimeField(null=True, blank=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def get_game_state(self):
        try:
            return json.loads(self.gameState)
        except:
            return {}

    def set_game_state(self, state):
        self.gameState = json.dumps(state)
        self.save()


class GamePlayer(models.Model):
    playerId = models.AutoField(primary_key=True)
    match = models.ForeignKey(GameMatch, to_field='matchId', on_delete=models.CASCADE)
    user = models.ForeignKey(UserDetails, to_field='userId', on_delete=models.CASCADE)
    isReady = models.BooleanField(default=False)
    currentScore = models.IntegerField(default=0)
    totalCorrect = models.IntegerField(default=0)
    totalIncorrect = models.IntegerField(default=0)
    averageTime = models.FloatField(default=0)
    lastAnswerTime = models.DateTimeField(null=True, blank=True)
    joined_at = models.DateTimeField(auto_now_add=True)
    left_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('match', 'user')


class GameQuestion(models.Model):
    questionId = models.AutoField(primary_key=True)
    match = models.ForeignKey(GameMatch, to_field='matchId', on_delete=models.CASCADE)
    questionNumber = models.IntegerField()
    questionText = models.CharField(max_length=500)
    correctAnswer = models.CharField(max_length=50)
    questionType = models.CharField(max_length=50, default='addition')  # addition, subtraction, multiplication, division
    difficulty = models.CharField(max_length=20, default='medium')
    timeLimit = models.IntegerField(default=30)  # seconds
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('match', 'questionNumber')


class GameAnswer(models.Model):
    answerId = models.AutoField(primary_key=True)
    question = models.ForeignKey(GameQuestion, to_field='questionId', on_delete=models.CASCADE)
    player = models.ForeignKey(GamePlayer, to_field='playerId', on_delete=models.CASCADE)
    answer = models.CharField(max_length=50)
    isCorrect = models.BooleanField()
    responseTime = models.FloatField()  # seconds
    answered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('question', 'player')


class PlayerConnection(models.Model):
    connectionId = models.AutoField(primary_key=True)
    user = models.ForeignKey(UserDetails, to_field='userId', on_delete=models.CASCADE)
    room = models.ForeignKey(GameRoom, to_field='roomId', on_delete=models.CASCADE, null=True, blank=True)
    match = models.ForeignKey(GameMatch, to_field='matchId', on_delete=models.CASCADE, null=True, blank=True)
    isOnline = models.BooleanField(default=True)
    lastSeen = models.DateTimeField(auto_now=True)
    connected_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'room', 'match')


class UserStreak(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(UserDetails, to_field='userId', on_delete=models.CASCADE, related_name='streak')
    current_streak = models.IntegerField(default=0, db_index=True)
    max_streak = models.IntegerField(default=0, db_index=True)
    last_activity_date = models.DateField(null=True, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user',)
        db_table = 'Authentication_userstreak'
        indexes = [
            models.Index(fields=['user', 'last_activity_date']),
            models.Index(fields=['current_streak']),
            models.Index(fields=['max_streak']),
        ]

    def __str__(self):
        return f"Streak for {self.user.firstName} {self.user.lastName}: {self.current_streak} days"

    def update_streak(self, activity_date=None):
        """Update streak based on activity date with improved logic"""
        if activity_date is None:
            activity_date = date.today()
        
        # Handle timezone-aware dates
        if hasattr(activity_date, 'date'):
            activity_date = activity_date.date()
        
        if self.last_activity_date is None:
            # First time activity
            self.current_streak = 1
            self.max_streak = 1
            self.last_activity_date = activity_date
        else:
            # Check if it's a consecutive day
            days_diff = (activity_date - self.last_activity_date).days
            
            if days_diff == 1:
                # Consecutive day
                self.current_streak += 1
                self.max_streak = max(self.max_streak, self.current_streak)
            elif days_diff == 0:
                # Same day, no change needed
                return self.current_streak
            elif days_diff < 0:
                # Future date (shouldn't happen in normal usage)
                return self.current_streak
            else:
                # Streak broken (more than 1 day gap), start new streak
                self.current_streak = 1
            
            self.last_activity_date = activity_date
        
        self.save(update_fields=['current_streak', 'max_streak', 'last_activity_date', 'updated_at'])
        return self.current_streak

    def reset_streak(self):
        """Reset the current streak to 0"""
        self.current_streak = 0
        self.last_activity_date = None
        self.save(update_fields=['current_streak', 'last_activity_date', 'updated_at'])
        return self.current_streak

    @classmethod
    def get_or_create_streak(cls, user):
        """Get or create streak for user with proper error handling"""
        try:
            streak, created = cls.objects.get_or_create(user=user)
            return streak, created
        except Exception as e:
            # Log the error for debugging
            print(f"Error getting/creating streak for user {user.userId}: {e}")
            # Try to get existing streak
            try:
                streak = cls.objects.filter(user=user).first()
                if streak:
                    return streak, False
                else:
                    # Create new streak if none exists
                    streak = cls.objects.create(user=user)
                    return streak, True
            except Exception as e2:
                print(f"Critical error creating streak for user {user.userId}: {e2}")
                raise


# Create your models here.
