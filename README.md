# AI Debate Bot - Full-Stack Platform

A production-ready debate platform powered by **Gemini 2.5 Flash** (free tier) AI. Users can create debates, participate with arguments, vote on debate points, and experience real-time updates via WebSocket.

## Architecture

```
┌─────────────────────────────────────┐
│   React Frontend (Port 5173)        │
│   - Vite + React 18                 │
│   - Real-time WebSocket updates     │
│   - JWT authentication              │
└──────────────┬──────────────────────┘
               │ HTTP + WebSocket
┌──────────────▼──────────────────────┐
│   FastAPI Backend (Port 8000)       │
│   - Async/await throughout          │
│   - Gemini 2.5 Flash AI integration │
│   - JWT + bcrypt auth               │
│   - In-memory storage (MongoDB-ready)
└─────────────────────────────────────┘
```

## Quick Setup (Local Development)

### Prerequisites
- Python 3.9+ with pip
- Node.js 18+ with npm
- Free Gemini API key (get at https://aistudio.google.com/app/apikey)

### Backend Setup
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env and add your GOOGLE_API_KEY

# Run server
uvicorn app.main:app --reload
```

Backend runs at **http://localhost:8000**

### Frontend Setup
```bash
cd frontend
npm install

# Create .env.local
echo "VITE_API_URL=http://localhost:8000" > .env.local

# Run dev server
npm run dev
```

Frontend runs at **http://localhost:5173**

### Verify Both Are Running
- **Backend:** `curl http://localhost:8000/` → Returns `{"message":"AI Debate Bot API is running","version":"1.0.0"}`
- **Frontend:** Open http://localhost:5173 in browser

## Key Features

### 🔐 Authentication
- User registration with email validation
- Login with JWT tokens (24-hour expiry)
- Bcrypt password hashing (12 rounds)
- Persistent login (localStorage)

### 💬 Debate Management
- Create debates with auto-generated AI arguments
- Browse debates with pagination (10 per page)
- Add personal arguments (FOR or AGAINST side)
- Vote on arguments (one vote per user per argument)
- Generate neutral AI summaries

### 🤖 AI Integration (Gemini 2.5 Flash)
- **Free Tier:** Generous rate limits for development
- **Debate Arguments:** AI generates FOR/AGAINST perspectives automatically
- **Summaries:** AI creates balanced 2-3 sentence summaries
- **Graceful Fallback:** Placeholder text if API unavailable

### 🔄 Real-Time Updates (WebSocket)
- Live user join/leave notifications
- Active participant count per debate
- Broadcasting to all connected clients
- Automatic reconnection on disconnect

### 📊 Admin Analytics
- Total users and debates
- Most voted debate
- Most active user
- Platform statistics endpoint

### 🔒 Authorization
- Regular users: Create debates, participate, vote
- Admins: Topic management, view analytics
- JWT-based protected routes

## Project Structure

```
AI Debate platform/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI app + routes
│   │   ├── config.py               # Environment variables
│   │   ├── database.py             # MongoDB connection
│   │   ├── websocket.py            # Connection manager
│   │   ├── services/
│   │   │   ├── storage_service.py  # In-memory storage (MongoDB-ready)
│   │   │   └── gemini_service.py   # Gemini AI integration
│   │   ├── routes/                 # Route handlers
│   │   │   ├── auth_routes.py
│   │   │   ├── debate_routes.py
│   │   │   ├── topic_routes.py
│   │   │   └── admin_routes.py
│   │   ├── schemas/                # Pydantic models
│   │   │   ├── user_schema.py
│   │   │   └── debate_schema.py
│   │   └── utils/
│   │       └── auth_utils.py       # JWT + password utilities
│   ├── requirements.txt
│   ├── .env.example
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx                # React entry point
│   │   ├── App.jsx                 # Route configuration
│   │   ├── api/
│   │   │   ├── axiosConfig.js      # HTTP client with JWT interceptors
│   │   │   ├── authService.js
│   │   │   ├── debateService.js
│   │   │   ├── topicService.js
│   │   │   └── adminService.js
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Global auth state
│   │   ├── pages/
│   │   │   ├── Home.jsx            # Debate list + create
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Debate.jsx          # Debate view + voting + WebSocket
│   │   └── components/
│   │       └── Navbar.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── .env.example
│   └── README.md
│
└── README.md (this file)
```

## API Endpoints

### Authentication
- `POST /auth/register` - User signup
- `POST /auth/login` - User login (returns JWT)

### Debates
- `GET /debates?page=1&limit=10` - Paginated debate list
- `GET /debates/{id}` - Debate details with arguments
- `POST /debates` - Create new debate (authenticated, calls Gemini API)
- `POST /debates/{id}/participate` - Add argument to debate
- `POST /debates/{id}/vote/{argumentId}` - Vote on argument
- `POST /debates/{id}/summary` - Generate debate summary (Gemini)

### Topics
- `GET /topics` - List all topics
- `POST /topics` - Create topic (admin only)
- `DELETE /topics/{id}` - Delete topic (admin only)

### Admin
- `GET /admin/analytics` - Platform statistics (admin only)

### WebSocket
- `WS /ws/debate/{id}` - Connect to real-time debate room updates

## Technology Stack

### Backend
- **FastAPI** - Modern async Python framework
- **Motor** - Async MongoDB driver (installed, ready for swap)
- **Python-dotenv** - Environment configuration
- **Pydantic** - Data validation
- **PyJWT** - JSON Web Token handling
- **Bcrypt** - Password hashing
- **Google Generative AI** - Gemini API client

### Frontend
- **React 18** - UI component library
- **Vite** - Fast build tool
- **Axios** - HTTP client with interceptors
- **React Router v6** - SPA routing
- **WebSocket API** - Native browser implementation

## Authentication Flow

1. User registers with email + password
2. Password hashed with bcrypt (12 rounds)
3. User data stored (in-memory or MongoDB)
4. On login, password verified and JWT token returned
5. Token stored in localStorage (frontend)
6. All subsequent requests auto-include token via Axios interceptor
7. Backend verifies token on protected routes
8. Token expires after 24 hours (refresh not yet implemented)

## Storage Design

### Current: In-Memory Storage
- Global Python lists for users, debates, topics, votes
- Perfect for development and testing
- Data lost on server restart (intentional for demo)

### Migration to MongoDB
Only file needing changes: `backend/app/services/storage_service.py`
- All methods already designed for async (Motor-compatible)
- Database connection in `app/database.py` (Motor initialized)
- Environment variable `MONGODB_URI` ready in `.env`

## Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=ai_debate_db
JWT_SECRET=your-secret-key-here
GOOGLE_API_KEY=your-gemini-api-key-here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:8000
```

## Running the Application

### Terminal 1: Backend
```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```

### Terminal 3: Browser
Open http://localhost:5173

## Testing the Platform

1. **Register** at `/register` (requires valid email format)
2. **Login** with your credentials
3. **Create Debate** from Home page (Gemini generates FOR/AGAINST arguments)
4. **View Debate** - See all arguments and vote
5. **Participate** - Add your own arguments (marked as user-submitted)
6. **Generate Summary** - Creates AI-powered neutral summary
7. **Real-time Updates** - Join debate room, watch user count update

## Free Gemini API

This project uses **Gemini 2.5 Flash (free tier)**:

- **Rate Limits:** 15 requests per minute (more than enough for development)
- **Get API Key:** https://aistudio.google.com/app/apikey
- **Cost:** $0 (no credit card required)
- **Capabilities:** Full generative AI for debate arguments and summaries

## Next Steps for Production

- [ ] Integrate real MongoDB database
- [ ] Add token refresh endpoint (extend 24-hour window)
- [ ] Implement pagination cursor-based tokens
- [ ] Add email verification for user accounts
- [ ] Deploy backend (Heroku, Railway, Render)
- [ ] Deploy frontend (Vercel, Netlify)
- [ ] Add rate limiting per user
- [ ] Implement debate reporting/moderation
- [ ] Add user profiles with debate history
- [ ] Add search and filtering
- [ ] Implement WebSocket authentication
- [ ] Add database indexes for performance

## Troubleshooting

**Backend won't start**
```bash
# Check port 8000 is free
lsof -i :8000
# Kill if needed
kill -9 <PID>
```

**Frontend can't reach backend**
- Verify `.env.local` has `VITE_API_URL=http://localhost:8000`
- Check backend is running: `curl http://localhost:8000/`
- Clear browser cache and refresh

**Gemini API errors**
- Verify `GOOGLE_API_KEY` is set correctly in `.env`
- Check API key is from free tier: https://aistudio.google.com/app/apikey
- Check rate limits (15/min) not exceeded
- API key should not have quotes around it in `.env`

**JWT authentication failing**
- Verify `JWT_SECRET` in backend `.env` (should match across sessions)
- Clear localStorage in browser DevTools
- Make sure token not expired (24 hours)

## License

Open source - Build, modify, and deploy as needed.
