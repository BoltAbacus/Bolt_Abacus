# BoltAbacus Multiplayer Setup Guide

## 🚀 Real-time Multiplayer Features Implemented

### ✅ Features Ready
- **Real-time PVP matches** with live player connections
- **Matchmaking system** with room creation and joining
- **Real-time game state synchronization** via WebSockets
- **Instant messaging** of game events (moves, answers, actions)
- **Real-time leaderboard updates** during ongoing games
- **Player connection management** (join, leave, disconnect)
- **Persistent game state** with broadcast updates
- **Background game engine** for multiplayer gameplay logic
- **Secure WebSocket authentication** with JWT tokens
- **Scalable architecture** with Redis channel layers

### 🎮 Game Modes
- **Abacus PVP**: Real-time abacus calculation competitions
- **Speed Math**: Fast-paced arithmetic challenges
- **Custom Rooms**: Private and public game rooms
- **Tournament Mode**: Multi-round competitions

## 🛠️ Local Development Setup

### Prerequisites
- Python 3.11+
- Redis Server
- Node.js 16+ (for frontend)

### Quick Start (Docker)
```bash
# Clone the repository
git clone <your-repo>
cd BoltAbacus-master

# Start all services with Docker Compose
docker-compose up -d

# Setup database and migrations
docker-compose exec web python setup_local.py

# Access the application
# Backend: http://localhost:8000
# Redis: localhost:6379
```

### Manual Setup
```bash
# 1. Install Python dependencies
pip install -r requirements.txt

# 2. Install Redis (Windows: use WSL or Docker)
# macOS: brew install redis
# Ubuntu: sudo apt-get install redis-server

# 3. Start Redis server
redis-server

# 4. Setup environment (copy env.example to .env)
cp env.example .env
# Edit .env with your configuration

# 5. Run setup script
python setup_local.py

# 6. Start Django server
python manage.py runserver

# 7. Start React frontend (in another terminal)
cd ../src
npm install
npm run dev
```

## 🌐 WebSocket Endpoints

### Connection URLs
```
ws://localhost:8000/ws/lobby/{room_id}/?token={jwt_token}
ws://localhost:8000/ws/game/{room_id}/?token={jwt_token}
ws://localhost:8000/ws/leaderboard/?token={jwt_token}
ws://localhost:8000/ws/chat/{room_id}/?token={jwt_token}
```

### Message Types

#### Lobby Messages
```json
// Join room
{"type": "join_room", "roomId": "123"}

// Ready status
{"type": "ready", "ready": true}

// Start game
{"type": "start_game"}

// Chat message
{"type": "chat_message", "message": "Hello everyone!"}
```

#### Game Messages
```json
// Submit answer
{"type": "answer", "questionNumber": 1, "answer": "42", "responseTime": 3.5}

// Ready for next question
{"type": "ready_for_next"}

// Request current question
{"type": "game_action", "action": "request_question"}
```

## 🗄️ Database Models

### New Multiplayer Models
- **GameRoom**: Game rooms and lobbies
- **GameMatch**: Active game sessions
- **GamePlayer**: Player participation in matches
- **GameQuestion**: Questions for each match
- **GameAnswer**: Player answers and scoring
- **PlayerConnection**: Real-time connection tracking

### API Endpoints
```
POST /api/game/create-room/     # Create new game room
POST /api/game/join-room/       # Join existing room
GET  /api/game/rooms/           # List available rooms
POST /api/game/room-details/    # Get room information
POST /api/game/leave-room/      # Leave room
POST /api/game/match-history/   # Get match history
GET  /api/game/user-stats/      # Get user statistics
```

## ☁️ Google Cloud Deployment

### 1. Google Cloud Setup
```bash
# Install Google Cloud SDK
# https://cloud.google.com/sdk/docs/install

# Initialize project
gcloud init
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable storage.googleapis.com
```

### 2. Database Setup (Cloud SQL)
```bash
# Create PostgreSQL instance
gcloud sql instances create boltabacus-db \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region=us-central1 \
    --root-password=YOUR_ROOT_PASSWORD

# Create database
gcloud sql databases create boltabacus --instance=boltabacus-db

# Create user
gcloud sql users create boltabacus-user \
    --instance=boltabacus-db \
    --password=YOUR_USER_PASSWORD
```

### 3. Redis Setup (Memorystore)
```bash
# Create Redis instance
gcloud redis instances create boltabacus-redis \
    --size=1 \
    --region=us-central1 \
    --redis-version=redis_7_0
```

### 4. Storage Setup (Cloud Storage)
```bash
# Create storage bucket
gsutil mb gs://boltabacus-static

# Make bucket public
gsutil iam ch allUsers:objectViewer gs://boltabacus-static
```

### 5. Environment Configuration
```bash
# Create .env.production file
DATABASE_TYPE=gcp_postgresql
DB_NAME=boltabacus
DB_USER=boltabacus-user
DB_PASSWORD=YOUR_USER_PASSWORD
DB_HOST=YOUR_SQL_INSTANCE_IP
DB_PORT=5432

REDIS_HOST=YOUR_REDIS_IP
REDIS_PORT=6379

USE_GOOGLE_CLOUD_STORAGE=True
GS_BUCKET_NAME=boltabacus-static
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json

DEBUG=False
SECRET_KEY=your-production-secret-key
```

### 6. Deploy to Cloud Run
```bash
# Build and deploy
gcloud run deploy boltabacus-backend \
    --source . \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --set-env-vars DATABASE_TYPE=gcp_postgresql,DEBUG=False \
    --memory 1Gi \
    --cpu 1
```

## 🔧 Configuration Options

### Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_TYPE` | Database type (local/gcp_postgresql/gcp_mysql) | `local` |
| `DEBUG` | Debug mode | `True` |
| `REDIS_HOST` | Redis server host | `127.0.0.1` |
| `REDIS_PORT` | Redis server port | `6379` |
| `USE_GOOGLE_CLOUD_STORAGE` | Use GCS for static files | `False` |
| `GS_BUCKET_NAME` | GCS bucket name | `boltabacus-static` |

### Database Options
- **Local SQLite**: Fast development setup
- **Google Cloud PostgreSQL**: Production-ready with high availability
- **Google Cloud MySQL**: Alternative production database

## 🧪 Testing

### WebSocket Testing
```bash
# Install wscat for WebSocket testing
npm install -g wscat

# Test connection (replace with your JWT token)
wscat -c "ws://localhost:8000/ws/lobby/123/?token=YOUR_JWT_TOKEN"

# Send test message
{"type": "chat_message", "message": "Test message"}
```

### API Testing
```bash
# Test room creation
curl -X POST http://localhost:8000/api/game/create-room/ \
  -H "Content-Type: application/json" \
  -H "AUTH-TOKEN: YOUR_JWT_TOKEN" \
  -d '{"roomName": "Test Room", "maxPlayers": 2}'
```

## 🚨 Troubleshooting

### Common Issues

1. **Redis Connection Failed**
   ```bash
   # Check Redis is running
   redis-cli ping
   # Should return PONG
   ```

2. **Database Migration Issues**
   ```bash
   # Reset migrations
   python manage.py migrate Authentication zero
   python manage.py makemigrations Authentication
   python manage.py migrate
   ```

3. **WebSocket Connection Issues**
   - Check CORS settings
   - Verify JWT token is valid
   - Ensure Redis is running

4. **Google Cloud Issues**
   - Verify service account permissions
   - Check firewall rules for database access
   - Ensure APIs are enabled

## 📈 Performance & Scaling

### Redis Configuration
- **Memory**: 1GB minimum for production
- **Persistence**: AOF enabled for data durability
- **Clustering**: Consider Redis Cluster for high availability

### Database Optimization
- **Connection Pooling**: Configure for your load
- **Indexing**: Add indexes on frequently queried fields
- **Read Replicas**: Use for read-heavy workloads

### WebSocket Scaling
- **Load Balancing**: Use sticky sessions
- **Horizontal Scaling**: Multiple Django instances
- **Monitoring**: Track connection counts and message rates

## 🔒 Security Considerations

### WebSocket Security
- JWT token validation on every connection
- Rate limiting for message frequency
- Input validation for all messages
- CORS configuration for allowed origins

### Database Security
- Use connection encryption (SSL/TLS)
- Implement proper user permissions
- Regular security updates
- Backup and recovery procedures

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review Django Channels documentation
3. Check Google Cloud documentation
4. Create an issue in the repository

---

**🎉 You're now ready to run real-time multiplayer games with BoltAbacus!**
