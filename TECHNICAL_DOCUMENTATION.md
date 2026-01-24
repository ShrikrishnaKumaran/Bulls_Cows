# Bulls, Cows & Shit - Technical Documentation

**Version:** 2.0.0  
**Last Updated:** January 23, 2026  
**Status:** Production Ready

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Directory Structure](#4-directory-structure)
5. [Backend Documentation](#5-backend-documentation)
6. [Frontend Documentation](#6-frontend-documentation)
7. [Game Logic](#7-game-logic)
8. [API Endpoints](#8-api-endpoints)
9. [Socket Events](#9-socket-events)
10. [State Management](#10-state-management)
11. [Authentication Flow](#11-authentication-flow)
12. [Game Flow](#12-game-flow)
13. [Environment Variables](#13-environment-variables)
14. [Development Guide](#14-development-guide)

---

## 1. Project Overview

Bulls, Cows & Shit is a multiplayer number guessing game where players try to guess each other's secret numbers. The game features both offline (Pass & Play) and online 1v1 multiplayer modes.

### Game Rules

1. Each player chooses a secret number with 3 or 4 **unique digits**
2. Players take turns guessing each other's secrets
3. For each guess, feedback is given:
   - 🟢 **Bulls**: Correct digit in correct position
   - 🟡 **Cows**: Correct digit in wrong position
   - ⚫ **Shit**: Digit not in the secret number
4. First player to guess the secret correctly wins the round
5. Match can be Best of 1, 3, or 5 rounds

### Features

| Feature | Status | Description |
|---------|--------|-------------|
| User Authentication | ✅ | JWT with refresh tokens |
| User Profiles | ✅ | Stats tracking |
| Offline Mode | ✅ | Pass & Play (2 players, 1 device) |
| Online 1v1 | ✅ | Real-time multiplayer via Socket.io |
| Room System | ✅ | 4-character room codes |
| Friend Invites | ✅ | Real-time invite notifications |
| Cyber Minimalist UI | ✅ | Tailwind CSS design system |

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Zustand   │  │   Socket.io │  │     React Router    │  │
│  │   Stores    │  │   Client    │  │     Navigation      │  │
│  └─────────────┘  └──────┬──────┘  └─────────────────────┘  │
└───────────────────────────┼─────────────────────────────────┘
                            │
              HTTP REST API │ WebSocket
                            │
┌───────────────────────────┼─────────────────────────────────┐
│                    BACKEND (Node.js + Express)              │
│  ┌─────────────┐  ┌──────┴──────┐  ┌─────────────────────┐  │
│  │ Controllers │  │  Socket.io  │  │    Middleware       │  │
│  │  (Routes)   │  │   Server    │  │  (Auth, Validate)   │  │
│  └──────┬──────┘  └──────┬──────┘  └─────────────────────┘  │
│         │                │                                   │
│  ┌──────┴──────┐  ┌──────┴──────┐                           │
│  │  Services   │  │   Handlers  │   In-Memory: activeGames  │
│  │ (Business)  │  │(Lobby,Game) │                           │
│  └──────┬──────┘  └─────────────┘                           │
│         │                                                    │
│  ┌──────┴──────┐                                            │
│  │   Models    │   MongoDB Database                         │
│  │ (Mongoose)  │                                            │
│  └─────────────┘                                            │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

1. **In-Memory Game State**: Active games stored in `activeGames` object for low-latency real-time play
2. **MongoDB for Persistence**: Users, refresh tokens, room metadata stored in MongoDB
3. **Socket.io Rooms**: Players join socket rooms by `roomCode` for targeted broadcasts
4. **Zustand for State**: Lightweight state management with automatic React binding

---

## 3. Technology Stack

### Backend

| Package | Version | Purpose |
|---------|---------|---------|
| Node.js | 20.x | Runtime |
| Express | 4.18.2 | Web framework |
| MongoDB | 7.x | Database |
| Mongoose | 7.5.0 | ODM |
| Socket.io | 4.7.2 | Real-time communication |
| jsonwebtoken | 9.0.2 | JWT tokens |
| bcryptjs | 2.4.3 | Password hashing |

### Frontend

| Package | Version | Purpose |
|---------|---------|---------|
| React | 18.2.0 | UI framework |
| Vite | 4.4.9 | Build tool |
| React Router | 6.16.0 | Routing |
| Zustand | 4.4.1 | State management |
| Socket.io Client | 4.7.2 | WebSocket client |
| Tailwind CSS | 3.x | Styling |

---

## 4. Directory Structure

```
Bulls_Cows/
├── Backend/
│   ├── config/
│   │   ├── database.js         # MongoDB connection
│   │   └── env.js              # Environment config
│   ├── controllers/
│   │   ├── authController.js   # Auth HTTP handlers
│   │   └── matchController.js  # Room HTTP handlers
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT verification
│   │   └── validationMiddleware.js
│   ├── models/
│   │   ├── User.js             # User schema
│   │   ├── RefreshToken.js     # Token storage
│   │   └── Room.js             # Game room schema
│   ├── routes/
│   │   ├── auth.js             # /api/auth routes
│   │   └── match.js            # /api/matches routes
│   ├── services/
│   │   ├── authService.js      # Auth business logic
│   │   └── roomService.js      # Room CRUD operations
│   ├── sockets/
│   │   ├── socketManager.js    # Socket.io initialization
│   │   ├── lobbyHandler.js     # Room socket events
│   │   └── gameHandler.js      # Game socket events
│   ├── utils/
│   │   ├── gameRules.js        # Bulls/Cows calculation
│   │   └── tokenGenerator.js   # JWT generation
│   ├── app.js                  # Express app
│   └── server.js               # Entry point
│
├── Frontend/
│   └── src/
│       ├── components/
│       │   ├── Home.jsx            # Main menu
│       │   ├── OfflineGame.jsx     # Offline gameplay
│       │   ├── PassAndPlaySetup.jsx
│       │   ├── VsFriendModal.jsx   # Friend invite modal
│       │   └── ui/                 # Reusable UI components
│       ├── features/
│       │   ├── auth/               # Login/Register
│       │   ├── game/
│       │   │   └── OnlineGame.jsx  # Online gameplay
│       │   ├── lobby/
│       │   │   ├── CreateRoom.jsx
│       │   │   ├── JoinRoom.jsx
│       │   │   └── RoomWaiting.jsx
│       │   └── profile/
│       ├── hooks/
│       │   └── useSocket.js        # Socket hook
│       ├── services/
│       │   ├── api.js              # Axios instance
│       │   └── socket.js           # Socket.io client
│       ├── store/
│       │   ├── useAuthStore.js     # Auth state
│       │   ├── useGameStore.js     # Online game state
│       │   └── useOfflineGameStore.js
│       ├── utils/
│       │   └── gameRules.js        # Client-side validation
│       └── App.jsx                 # Routes
│
└── Planning/                       # Design documents
```

---

## 5. Backend Documentation

### 5.1 Models

#### User (`models/User.js`)
```javascript
{
  username: String,     // Unique, 3-20 chars
  email: String,        // Unique, validated
  password: String,     // Hashed, select: false
  stats: {
    totalGames: Number,
    wins: Number,
    losses: Number
  },
  friends: [ObjectId], // User references
  isOnline: Boolean
}
```

#### Room (`models/Room.js`)
```javascript
{
  roomCode: String,     // Unique, 4 uppercase chars
  host: ObjectId,       // User who created room
  opponent: ObjectId,   // User who joined (or null)
  status: String,       // 'waiting' | 'active' | 'completed'
  format: Number,       // 1, 3, or 5 (best of)
  digits: Number,       // 3 or 4
  difficulty: String,   // 'easy' | 'hard'
  createdAt: Date       // Auto-expires after 1 hour
}
```

#### RefreshToken (`models/RefreshToken.js`)
```javascript
{
  user: ObjectId,
  token: String,
  device: String,
  ipAddress: String,
  expiresAt: Date,      // 30 days
  isRevoked: Boolean
}
```

### 5.2 Services

#### authService.js
- `register(userData)` - Create user + generate tokens
- `login(credentials)` - Verify credentials + generate tokens
- `refreshAccessToken(token)` - Generate new access token
- `logout(token)` - Revoke refresh token

#### roomService.js
- `createRoom(hostId, settings)` - Create new room with 4-char code
- `joinRoom(roomCode, userId)` - Add opponent to room
- `leaveRoom(roomCode, userId)` - Remove player (delete if host)
- `getRoomByCode(code)` - Get room details

### 5.3 Socket Handlers

#### socketManager.js
Initializes Socket.io with JWT authentication:
```javascript
io.use(async (socket, next) => {
  // Verify token from socket.handshake.auth.token
  // Attach user to socket.user
});
```

Exports:
- `getIO()` - Get Socket.io instance
- `getUserSocketId(userId)` - Get socket ID for user

#### lobbyHandler.js
Room management events:
- `create-room` → Creates room, joins socket room
- `join-room` → Joins room, notifies host, starts game if full
- `leave-room` → Leaves room, cleans up
- `get-room` → Get room info

#### gameHandler.js
Game logic events:
- `game-init` → Get current game state
- `submit-secret` → Submit secret number
- `submit-guess` → Make a guess

---

## 6. Frontend Documentation

### 6.1 Key Components

#### OnlineGame.jsx
Three-phase game UI:
1. **SETUP**: Submit secret number with number pad
2. **PLAYING**: Turn indicator, guess history, make guesses
3. **GAME_OVER**: Victory/defeat modal with scores

#### RoomWaiting.jsx
Waiting room that:
- Joins socket room on mount
- Shows room info and players
- Listens for `game-start` event
- Navigates to OnlineGame when opponent joins

#### VsFriendModal.jsx
Modal for creating/joining games:
- Generate room code (creates room via API)
- Enter room code to join
- Invite by username (coming soon)

### 6.2 Stores (Zustand)

#### useGameStore.js
Online game state:
```javascript
{
  gameState: 'SETUP' | 'PLAYING' | 'GAME_OVER',
  roomCode: string,
  currentTurn: string,        // User ID
  logs: [{ player, guess, bulls, cows, shit }],
  roundNumber: number,
  scores: { [oderId]: wins },
  mySecret: string,           // Local only
  isMySecretSubmitted: boolean,
  isOpponentReady: boolean,
  winner: string,
  winnerName: string
}
```

Actions:
- `initializeGame(roomCode, gameData)`
- `submitSecret(secret, callback)`
- `makeGuess(guess, callback)`
- `setupSocketListeners()`
- `removeSocketListeners()`
- `resetGame()`

---

## 7. Game Logic

### calculateBullsAndCows(secret, guess, digits)

Located in `Backend/utils/gameRules.js`:

```javascript
// Example: secret = "1234", guess = "1325"
// Bulls = 1 (the "1" is correct position)
// Cows = 2 (the "3" and "2" exist but wrong position)
// Shit = 1 (the "5" doesn't exist)
```

Algorithm:
1. Validate both inputs (unique digits, correct length)
2. Count bulls (same digit, same position)
3. Count cows (same digit, different position)
4. Calculate shit (digits - bulls - cows)
5. Check win condition (bulls === digits)

---

## 8. API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Create new user | No |
| POST | `/login` | Login user | No |
| GET | `/profile` | Get user profile | Yes |
| POST | `/refresh` | Refresh access token | No |
| POST | `/logout` | Logout (revoke token) | Yes |

### Matches (`/api/matches`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/create` | Create game room | Yes |
| POST | `/join` | Join game room | Yes |
| POST | `/invite` | Invite friend | Yes |
| GET | `/:roomCode` | Get room details | Yes |

---

## 9. Socket Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `create-room` | `{ format, digits, difficulty }` | Create new room |
| `join-room` | `roomCode` | Join existing room |
| `leave-room` | `roomCode` | Leave room |
| `get-room` | `roomCode` | Get room info |
| `submit-secret` | `{ roomCode, secret }` | Submit secret number |
| `submit-guess` | `{ roomCode, guess }` | Make a guess |
| `game-init` | `{ roomCode }` | Get current game state |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `player-joined` | `{ opponent }` | Opponent joined room |
| `player-left` | `{ oderId }` | Player left room |
| `game-start` | `{ roomCode, format, digits, host, opponent }` | Game starting |
| `opponent-ready` | `{ oderId }` | Opponent submitted secret |
| `match-start` | `{ currentTurn, roundNumber }` | Both players ready |
| `turn-result` | `{ player, guess, bulls, cows, shit, nextTurn }` | Guess result |
| `round-over` | `{ roundWinner, scores, nextRound }` | Round won |
| `game-over` | `{ winner, winnerName, finalScores }` | Match finished |
| `match-invite` | `{ roomCode, host, format }` | Friend invite |

---

## 10. State Management

### Auth Flow
```
Login → Store token in localStorage → Initialize socket with token
     → Store user in useAuthStore → Navigate to /home
```

### Game Flow
```
1. Create/Join Room → Navigate to /lobby/room/:roomCode
2. RoomWaiting joins socket room
3. Opponent joins → game-start event
4. initializeGame() → Navigate to /game/online/:roomCode
5. OnlineGame sets up socket listeners
6. SETUP phase: Both submit secrets
7. match-start → PLAYING phase
8. Turn-based guessing with turn-result events
9. Win → round-over or game-over event
10. resetGame() → Navigate home
```

---

## 11. Authentication Flow

### Access Token (15 min)
- Stored in localStorage
- Sent in `Authorization: Bearer {token}` header
- Used for API requests and socket auth

### Refresh Token (30 days)
- Stored in httpOnly cookie
- Used to get new access token when expired
- Revoked on logout

---

## 12. Game Flow

```
┌──────────────┐
│    SETUP     │  Both players choose secrets
└──────┬───────┘
       │ both submit-secret
       ▼
┌──────────────┐
│   PLAYING    │  Alternating turns guessing
└──────┬───────┘
       │ guess correct (4 bulls)
       ▼
┌──────────────┐
│  Round Over  │  Update scores
└──────┬───────┘
       │
       ├─── Not enough wins → Back to SETUP
       │
       ▼
┌──────────────┐
│  GAME_OVER   │  Show winner, final scores
└──────────────┘
```

---

## 13. Environment Variables

### Backend (`.env`)
```bash
PORT=5000
MONGO_URI=mongodb://localhost:27017/bulls_cows
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_EXPIRE=15m
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend (`.env`)
```bash
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## 14. Development Guide

### Setup
```bash
# Install all dependencies
npm install

# Start backend (from Backend folder)
cd Backend && npm start

# Start frontend (from Frontend folder)
cd Frontend && npm run dev
```

### Testing
```bash
# Backend tests
cd Backend && npm test

# Frontend tests
cd Frontend && npm test
```

### Common Tasks

**Add new socket event:**
1. Add handler in `lobbyHandler.js` or `gameHandler.js`
2. Add listener in appropriate store (`useGameStore.js`)
3. Add cleanup in `removeSocketListeners()`

**Add new API endpoint:**
1. Add route in `routes/` folder
2. Add controller function in `controllers/`
3. Add service function if needed in `services/`

**Add new game feature:**
1. Update `activeGames` structure in `lobbyHandler.js`
2. Update `gameHandler.js` socket events
3. Update `useGameStore.js` state and actions
4. Update `OnlineGame.jsx` UI

---

## Appendix: Quick Reference

### Room Codes
- 4 uppercase alphanumeric characters
- Generated randomly, verified unique
- Auto-expire after 1 hour

### Game Formats
- Best of 1: First to 1 win
- Best of 3: First to 2 wins
- Best of 5: First to 3 wins

### Digit Modes
- 3 digits: Faster games
- 4 digits: Standard mode

---

*Last updated: January 23, 2026*
