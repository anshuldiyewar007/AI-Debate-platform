# AI Debate Bot - Frontend

Fully functional React + Vite app with real backend integration.

## Quick Start

```bash
npm install
npm run dev
```

Then visit http://localhost:5173

## Features Implemented

✅ **Authentication**
- Register / Login flows
- JWT token storage and management
- Protected pages
- Logout

✅ **Debate Management**
- List all debates with pagination
- Create new debates (authenticated users)
- View debate details
- Real-time WebSocket updates

✅ **Participation**
- Add arguments to debates (FOR/AGAINST)
- Vote on arguments (one vote per user per argument)
- View user-submitted arguments separately
- Generate debate summary

✅ **API Integration**
- Axios with interceptors for JWT auth
- Error handling and token refresh
- Full debate, auth, topic, and admin services

## API Services

- `api/authService.js` - Register, login, logout
- `api/debateService.js` - Debates, arguments, voting
- `api/topicService.js` - Topic management
- `api/adminService.js` - Analytics

## Pages

- **Home** - Browse debates, create new ones
- **Login** - User authentication
- **Register** - New user signup
- **Debate Details** - Full debate view with voting and participation

## WebSocket Integration

Real-time updates on each debate room:
- User join/leave notifications
- Live argument additions
- Active user count

## Environment Variables

```bash
VITE_API_URL=http://localhost:8000
```

## Tech Stack

- React 18
- Vite
- Axios
- React Router v6
- WebSocket API

See README.md for API details - backend must be running on port 8000.
