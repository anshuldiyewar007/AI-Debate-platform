# AI Debate Bot - Backend API

FastAPI backend with full debate platform implementation, Gemini 2.5 Flash AI integration, WebSocket support, and in-memory storage (ready for MongoDB).

## Quick Start

### 1. Install Dependencies
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Get Gemini API Key (Free)

Visit [Google AI Studio](https://aistudio.google.com/app/apikey) to get a free Gemini API key:
1. Go to https://aistudio.google.com/app/apikey
2. Click "Get API Key"
3. Create a new API key
4. Copy the key

### 3. Setup Environment
```bash
cp .env.example .env
```

Edit `.env` and add your Gemini API key:
```
GOOGLE_API_KEY=your-api-key-here
JWT_SECRET=your-secret-key-here
```

### 4. Run Server
```bash
uvicorn app.main:app --reload
```

Server runs on **http://localhost:8000**

## Features Implemented

✅ **Authentication (JWT + bcrypt)**
- `POST /auth/register` - User signup
- `POST /auth/login` - User login with JWT token

✅ **Debate Management**
- `GET /debates?page=1&limit=10` - Paginated debate listing
- `GET /debates/{id}` - Debate details with all arguments
- `POST /debates` - Create new debate (calls Gemini API)

✅ **AI-Powered Arguments (Gemini 2.5 Flash)**
- Auto-generates FOR/AGAINST arguments on debate creation
- `POST /debates/{id}/summary` - AI-generated neutral summary
- Graceful fallback to placeholders if API unavailable

✅ **User Participation**
- `POST /debates/{id}/participate` - Add user argument (FOR/AGAINST)
- `POST /debates/{id}/vote/{argumentId}` - Vote on argument
- One vote per user per argument (verified in-memory)

✅ **Topic Management**
- `GET /topics` - List all topics
- `POST /topics` - Create topic (admin only)
- `DELETE /topics/{id}` - Delete topic (admin only)

✅ **Admin Analytics**
- `GET /admin/analytics` - Platform stats (admin only)
- Total users, total debates, most voted debate, most active user

✅ **Real-Time Updates**
- `WS /ws/debate/{id}` - WebSocket connection manager
- Live user join/leave notifications
- Broadcast debate updates to all connected clients

## Environment Variables

```bash
MONGODB_URI=mongodb://localhost:27017      # MongoDB connection
DATABASE_NAME=ai_debate_db                  # DB name
JWT_SECRET=your-secret-key-here             # JWT signing key
GOOGLE_API_KEY=your-gemini-api-key-here     # Free Gemini API key
```

## Tech Stack

- **Framework**: FastAPI (fully async)
- **Authentication**: JWT + bcrypt
- **AI**: Google Generative AI (Gemini 2.5 Flash - free tier)
- **Database**: In-memory storage (ready for MongoDB)
- **Real-time**: WebSocket
- **Validation**: Pydantic

## Models Used

- **Debate Generation**: `gemini-2.5-flash` (free tier)
- **Summary Generation**: `gemini-2.5-flash` (free tier)

Both models are free tier with generous rate limits for development.

## Next Steps

1. Create `.env` file and add your free Gemini API key
2. Run `uvicorn app.main:app --reload`
3. Connect frontend on http://localhost:5173
4. Create and participate in debates!
