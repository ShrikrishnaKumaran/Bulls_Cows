# Bulls & Cows - Technical Documentation
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
14. [Deployment Guide](#14-deployment-guide)
15. [Development Guide](#15-development-guide)

---

## 1. Project Overview

Bulls & Cows  is a full-stack multiplayer number guessing game where players try to guess each other's secret numbers. The game features both offline (Pass & Play) and online 1v1 multiplayer modes with real-time communication.

### Game Rules

1. Each player chooses a secret number with 3 or 4 **unique digits**
2. Players take turns guessing each other's secrets
3. For each guess, feedback is given:
   - 🟢 **Bulls**: Correct digit in correct position
   - 🟡 **Cows**: Correct digit in wrong position
   - ⚫ **Miss**: Digit not in the secret number
4. First player to guess the secret correctly wins the round
5. Match can be Single, Best of 3, or Best of 5 rounds

### Features

| Feature | Status | Description |
|---------|--------|-------------|
| User Authentication | ✅ | JWT with refresh tokens |
| User Profiles | ✅ | Stats tracking, match history |
| Offline Mode | ✅ | Pass & Play (2 players, 1 device) |
| Online 1v1 | ✅ | Real-time multiplayer via Socket.io |
| Room System | ✅ | 4-character room codes |
| Friend System | ✅ | Friend requests, search, online status |
| Timer Mode | ✅ | Hard mode with 30-second turn timer |
| Cyber Minimalist UI | ✅ | Tailwind CSS design system |
| Mobile Responsive | ✅ | Optimized for all screen sizes |
| PWA Support | ✅ | Install to home screen, offline assets |

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
2. **MongoDB for Persistence**: Users, refresh tokens, room metadata, match history stored in MongoDB
3. **Socket.io Rooms**: Players join socket rooms by `roomCode` for targeted broadcasts
4. **Zustand for State**: Lightweight state management with automatic React binding and persistence
5. **Cross-Origin Support**: CORS configured with `sameSite: 'none'` for cross-subdomain cookie support

---

## 3. Technology Stack

### Backend

| Package | Version | Purpose |
|---------|---------|---------|
| Node.js | ≥18.0.0 | Runtime |
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
| Axios | 1.x | HTTP client |

---

## 4. Directory Structure

```
Bulls_Cows/
├── Backend/
│   ├── config/
│   │   └── database.js         # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js   # Auth HTTP handlers
│   │   ├── friendController.js # Friend system handlers
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
│   │   ├── friends.js          # /api/friends routes
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
│   ├── server.js               # Entry point
│   └── package.json
│
├── Frontend/
│   ├── public/
│   │   ├── _redirects          # SPA routing for Render
│   │   ├── manifest.json       # PWA manifest
│   │   ├── sw.js               # Service worker
│   │   └── icons/              # PWA icons (192x192, 512x512)
│   └── src/
│       ├── components/
│       │   ├── game/
│       │   │   ├── GameArena.jsx       # Main game UI
│       │   │   ├── GameInputDrawer.jsx # Digit input interface
│       │   │   ├── GameLogCard.jsx     # Guess result card
│       │   │   ├── GameOverScreen.jsx  # Victory/defeat screen
│       │   │   ├── GameRulesModal.jsx  # Tutorial modal
│       │   │   ├── MatchInfoPill.jsx   # Round/score display
│       │   │   ├── PlayerCard.jsx      # Player info card
│       │   │   ├── RoundOverScreen.jsx # Round results
│       │   │   └── TimerBar.jsx        # Countdown timer
│       │   ├── home/
│       │   │   ├── GameModeCard.jsx
│       │   │   └── HomeHeader.jsx
│       │   ├── layout/
│       │   │   ├── Footer.jsx
│       │   │   ├── Header.jsx
│       │   │   └── MainLayout.jsx
│       │   ├── lobby/
│       │   │   └── VsFriendModal.jsx   # Create/Join room modal
│       │   ├── setup/
│       │   │   ├── ConfigStep.jsx      # Difficulty/format select
│       │   │   ├── HandoverStep.jsx    # Device handover
│       │   │   ├── OnlineStepper.jsx   # Online game config
│       │   │   ├── SecretEntryStep.jsx # Secret input
│       │   │   ├── SetupStepper.jsx    # Progress indicator
│       │   │   └── TechTile.jsx
│       │   └── ui/
│       │       ├── Button.jsx
│       │       ├── ConfigSelector.jsx
│       │       ├── CyberDrumInput.jsx
│       │       ├── CyberNumpad.jsx
│       │       ├── HoloSphereInput.jsx
│       │       ├── Input.jsx
│       │       ├── Loader.jsx
│       │       ├── Modal.jsx
│       │       └── ToastContainer.jsx
│       ├── hooks/
│       │   ├── useAuth.js          # Auth hook with redirect
│       │   └── useSocket.js        # Socket lifecycle hook
│       ├── pages/
│       │   ├── auth/
│       │   │   ├── AuthComponents.jsx
│       │   │   └── AuthPage.jsx
│       │   ├── home/
│       │   │   └── HomePage.jsx
│       │   ├── offline/
│       │   │   ├── GamePage.jsx
│       │   │   └── SetupPage.jsx
│       │   ├── online/
│       │   │   ├── CreateRoomPage.jsx
│       │   │   ├── GamePage.jsx
│       │   │   ├── JoinRoomPage.jsx
│       │   │   └── RoomWaitingPage.jsx
│       │   └── profile/
│       │       └── ProfilePage.jsx
│       ├── services/
│       │   ├── api.js              # Axios instance
│       │   └── socket.js           # Socket.io client
│       ├── store/
│       │   ├── useAuthStore.js     # Auth state (persisted)
│       │   ├── useGameStore.js     # Online game state
│       │   ├── useOfflineGameStore.js # Offline game state
│       │   └── useToastStore.js    # Toast notifications
│       ├── utils/
│       │   ├── constants.js        # App constants
│       │   ├── gameHelpers.js      # Game utilities
│       │   ├── gameLogic.js        # Offline game logic
│       │   ├── gameRules.js        # Bulls/cows calculation
│       │   └── validators.js       # Input validation
│       ├── App.jsx                 # Routes
│       ├── index.css               # Global styles
│       └── main.jsx                # Entry point
│
├── Planning/                       # Design documents
│   └── Game Aspects/
│       ├── Game Interface.md
│       ├── Game Tutorial.md
│       └── Points table.md
│
├── .env.example                    # Environment template
├── .env.production                 # Production config
├── DEPLOYMENT.md                   # Deployment guide
├── TECHNICAL_DOCUMENTATION.md      # This file
├── README.md
└── package.json                    # Root package.json
```

---

## 5. Backend Documentation

### 5.1 Models

#### User (`models/User.js`)
```javascript
{
  uid: String,              // Auto-generated #XXXX format
  username: String,         // 3-20 chars, alphanumeric + underscore
  email: String,            // Unique, lowercase
  password: String,         // Hashed, select: false
  stats: {
    totalGames: Number,
    wins: Number,
    losses: Number,
    draws: Number
  },
  friends: [ObjectId],      // User references
  friendRequests: {
    incoming: [{
      from: ObjectId,
      status: 'pending',
      createdAt: Date
    }],
    outgoing: [{
      to: ObjectId,
      status: 'pending',
      createdAt: Date
    }]
  },
  matchHistory: [{
    opponent: ObjectId,
    opponentName: String,
    result: 'win' | 'loss' | 'draw',
    score: String,          // e.g., "3-1"
    format: Number,
    playedAt: Date
  }],
  isOnline: Boolean
}
```

#### Room (`models/Room.js`)
```javascript
{
  roomCode: String,         // Unique, 4 uppercase chars
  host: ObjectId,           // User who created room
  opponent: ObjectId,       // User who joined (or null)
  status: 'waiting' | 'active' | 'completed' | 'cancelled',
  format: Number,           // 1, 3, or 5 (best of)
  digits: Number,           // 3 or 4
  difficulty: String,       // 'easy' | 'hard'
  createdAt: Date           // Auto-expires after 1 hour (TTL)
}
```

#### RefreshToken (`models/RefreshToken.js`)
```javascript
{
  user: ObjectId,
  token: String,
  device: String,
  ipAddress: String,
  expiresAt: Date,          // 30 days
  isRevoked: Boolean        // TTL index for auto-cleanup
}
```

### 5.2 Services

#### authService.js
- `register(userData)` - Create user with UID, generate tokens
- `login(credentials)` - Verify credentials, generate tokens
- `refreshAccessToken(token)` - Generate new access token
- `logout(token)` - Revoke refresh token

#### roomService.js
- `createRoom(hostId, settings)` - Create new room with 4-char code
- `joinRoom(roomCode, userId)` - Add opponent to room
- `leaveRoom(roomCode, userId)` - Remove player (delete if host)
- `getRoomByCode(code)` - Get room details
- `generateRoomCode()` - Generate unique 4-char code

### 5.3 Socket Handlers

#### socketManager.js
Initializes Socket.io with JWT authentication:
```javascript
io.use(async (socket, next) => {
  // Verify token from socket.handshake.auth.token
  // Attach user to socket.user
  // Track user socket mapping
});
```

Exports:
- `initializeSocket(server)` - Initialize Socket.io
- `getIO()` - Get Socket.io instance
- `getUserSocketId(oderId)` - Get socket ID for user
- `getSocketByUserId(oderId)` - Get socket instance

#### lobbyHandler.js
In-memory storage: `activeGames` object

Events handled:
- `create-room` → Creates room, joins socket room
- `join-room` → Joins room, notifies host
- `start-game` → Host starts game when opponent present
- `leave-room` → Leaves room, handles forfeit if game active
- `get-room` → Get room info
- `send-message` → Room chat
- `player-ready` → Toggle ready status

#### gameHandler.js
Game state management with timer support

Events handled:
- `game-init` → Get/restore current game state
- `submit-secret` → Submit secret number (validates unique digits)
- `submit-guess` → Make a guess, calculate results

Features:
- **Round loser starts next round** (random for first round)
- **Hard mode timer**: 30-second turn limit with auto-skip
- **Match history recording** on game completion

---

## 6. Frontend Documentation

### 6.1 Key Page Components

#### AuthPage.jsx
- Login and register forms
- Uses `useAuthStore` for auth actions
- Redirects to `/home` on success

#### HomePage.jsx
- Main menu with game mode selection
- Pass & Play (offline)
- Online Duel (1v1)
- Profile access

#### ProfilePage.jsx
- User stats display
- Match history
- Friends list
- Friend requests (incoming/outgoing)
- User search

#### SetupPage.jsx (Offline)
- 4-step wizard: Config → P1 Secret → Handover → P2 Secret
- Uses `useOfflineGameStore`

#### GamePage.jsx (Offline)
- Pass & Play game arena
- Turn indicator with handover
- Full game flow handling

#### GamePage.jsx (Online)
- Real-time 1v1 game
- Socket-based communication
- Setup → Playing → Round Over → Game Over phases

### 6.2 Key UI Components

#### GameArena.jsx
Main game UI featuring:
- Two PlayerCards with turn indicator
- Game logs for both players
- Input drawer for guesses
- Timer bar (hard mode)
- Match info pill

#### PlayerCard.jsx
Mobile-responsive player card:
- Truncated names for long usernames
- Responsive sizing (`w-8 h-8 sm:w-10 sm:h-10`)
- Active state with glow effect
- "TURN" badge indicator

#### GameInputDrawer.jsx
Digit input interface:
- CyberNumpad for digit selection
- Validation for unique digits
- Submit and clear actions

#### VsFriendModal.jsx
Room creation/joining modal:
- Create room with config options
- Join room by code input
- Socket-based room operations

---

## 7. Game Logic

### calculateBullsAndCows(secret, guess, digits)

Located in `Backend/utils/gameRules.js` and `Frontend/src/utils/gameRules.js`:

```javascript
// Example: secret = "1234", guess = "1325"
// Bulls = 1 (the "1" is correct position)
// Cows = 2 (the "3" and "2" exist but wrong position)
// Shit = 1 (the "5" doesn't exist)

function calculateBullsAndCows(secret, guess) {
  let bulls = 0, cows = 0;
  
  for (let i = 0; i < secret.length; i++) {
    if (guess[i] === secret[i]) {
      bulls++;
    } else if (secret.includes(guess[i])) {
      cows++;
    }
  }
  
  const shit = secret.length - bulls - cows;
  const isWin = bulls === secret.length;
  
  return { bulls, cows, shit, isWin };
}
```

### Validation Rules
- All digits must be unique (no repeats)
- Length must match game configuration (3 or 4)
- Only numeric digits allowed (0-9)

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

### Friends (`/api/friends`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/search` | Search users by username or UID | Yes |
| GET | `/` | Get friends list with online status | Yes |
| GET | `/requests` | Get pending friend requests | Yes |
| GET | `/user/:uid` | Get user profile by UID | Yes |
| POST | `/request` | Send friend request (targetUid) | Yes |
| POST | `/accept` | Accept friend request (requesterId) | Yes |
| POST | `/reject` | Reject friend request (requesterId) | Yes |
| POST | `/cancel` | Cancel outgoing request (targetId) | Yes |
| DELETE | `/:friendId` | Remove a friend | Yes |

### Matches (`/api/matches`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/create` | Create game room | Yes |
| POST | `/join` | Join game room | Yes |
| POST | `/invite` | Invite friend | Yes |
| GET | `/:roomCode` | Get room details | Yes |

---

## 9. Socket Events

### Client → Server (Lobby)

| Event | Payload | Description |
|-------|---------|-------------|
| `create-room` | `{ format, digits, difficulty }` | Create new room |
| `join-room` | `roomCode` | Join existing room |
| `start-game` | `roomCode` | Host starts game |
| `leave-room` | `roomCode` | Leave room |
| `get-room` | `roomCode` | Get room info |
| `send-message` | `{ roomCode, message }` | Chat message |
| `player-ready` | `{ roomCode }` | Toggle ready |

### Client → Server (Game)

| Event | Payload | Description |
|-------|---------|-------------|
| `game-init` | `{ roomCode }` | Get current game state |
| `submit-secret` | `{ roomCode, secret }` | Submit secret number |
| `submit-guess` | `{ roomCode, guess }` | Make a guess |

### Server → Client (Lobby)

| Event | Payload | Description |
|-------|---------|-------------|
| `player-joined` | `{ oderId, username }` | Opponent joined room |
| `player-left` | `{ oderId }` | Player left room |
| `game-start` | `{ roomCode, format, digits, ... }` | Game starting |

### Server → Client (Game)

| Event | Payload | Description |
|-------|---------|-------------|
| `match-start` | `{ currentTurnId, roundNumber }` | Both players ready |
| `opponent-ready` | `{ oderId }` | Opponent submitted secret |
| `turn-result` | `{ player, guess, bulls, cows, shit, nextTurn }` | Guess result |
| `timer-tick` | `{ timeLeft }` | Timer countdown (hard mode) |
| `turn-skipped` | `{ skippedPlayer, nextTurn }` | Timeout skip |
| `round-over` | `{ roundWinner, roundWinnerName, scores, isMatchOver }` | Round won |
| `game-over` | `{ winner, winnerName, finalScores, reason }` | Match finished |
| `match-invite` | `{ roomCode, host, format }` | Friend invite |

---

## 10. State Management

### useAuthStore (Persisted)
```javascript
{
  // State
  user: null | { _id, oderId, uid, username, email },
  token: string | null,
  isAuthenticated: boolean,
  loading: boolean,
  error: string | null,
  
  // Actions
  register(userData),
  login(credentials),
  logout(),
  getProfile(),
  refreshToken(),
  initialize(),
  
  // Friend Actions
  searchUsers(query),
  getFriends(),
  getPendingRequests(),
  sendFriendRequest(targetUid),
  acceptFriendRequest(requesterId),
  rejectFriendRequest(requesterId),
  removeFriend(friendId),
  getUserByUid(uid)
}
```

### useOnlineGameStore
```javascript
{
  // State
  isConnected: boolean,
  roomCode: string | null,
  status: 'IDLE' | 'LOBBY' | 'SETUP' | 'PLAYING' | 'ROUND_OVER' | 'GAME_OVER' | 'ROOM_CLOSED',
  isHost: boolean,
  players: {
    me: { name, oderId, connected, ready },
    opponent: { name, oderId, connected, ready }
  },
  gameData: {
    format, digits, difficulty,
    turn, currentTurnId,
    myLogs: [], opponentLogs: [],
    timer, roundNumber,
    scores: { me, opponent }
  },
  winner, winnerName, gameOverReason,
  roundWinner, roundWinnerName,
  roomClosedReason, roomClosedMessage,  // When host leaves
  
  // Actions
  connectSocket(token),
  disconnectSocket(),
  createRoom(config, callback),
  joinRoom(code, callback),
  leaveRoom(callback),
  setSecret(secret, callback),
  sendGuess(guess, callback),
  setupListeners(),
  removeListeners(),
  resetState()
}
```

### useOfflineGameStore
```javascript
{
  // State
  setupStep: 1-4,           // Config, P1 Secret, Handover, P2 Secret
  config: { digits, difficulty, format },
  gamePhase: 'SETUP' | 'PLAYING' | 'ROUND_OVER' | 'GAME_OVER',
  turn: 'PLAYER_1' | 'PLAYER_2',
  player1Secret, player2Secret,
  player1Guesses: [], player2Guesses: [],
  score: { player1, player2 },
  currentRound: number,
  winner, roundWinner,
  
  // Actions
  setStep(step),
  setConfig(key, value),
  setSecret(player, code),
  resetSetup(),
  startGame(),
  submitGuess(guess),       // Returns { success, result, isWin }
  continueToNextRound(),
  skipTurn(),               // Hard mode timeout
  resetGame(),
  playAgain()
}
```

### useToastStore
```javascript
{
  toasts: [{ id, message, type }],
  
  addToast(message, type),  // Auto-dismiss in 3s
  removeToast(id),
  clearAllToasts()
}
```

---

## 11. Authentication Flow

### Access Token (15 days)
- Stored in localStorage
- Sent in `Authorization: Bearer {token}` header
- Used for API requests and socket auth
- Auto-refresh on 401 response

### Refresh Token (30 days)
- Stored in httpOnly cookie
- `sameSite: 'none'` for cross-origin support
- `secure: true` in production
- Used to get new access token when expired
- Revoked on logout

### Token Refresh Flow
```
API Request → 401 Error → Queue pending requests
                       → Call /refresh endpoint
                       → Retry queued requests with new token
```

---

## 12. Game Flow

### Online Game Flow
```
┌──────────────┐
│  CREATE/JOIN │  Create room or enter room code
└──────┬───────┘
       │
       ▼
┌──────────────┐
│    LOBBY     │  Wait for opponent
└──────┬───────┘
       │ opponent joins + host starts
       ▼
┌──────────────┐
│    SETUP     │  Both players choose secrets
└──────┬───────┘
       │ both submit-secret
       ▼
┌──────────────┐
│   PLAYING    │  Alternating turns guessing
│              │  (30s timer in hard mode)
└──────┬───────┘
       │ guess correct (all bulls)
       ▼
┌──────────────┐
│  Round Over  │  Update scores
└──────┬───────┘
       │
       ├─── Not enough wins → Back to SETUP (loser starts)
       │
       ▼
┌──────────────┐
│  GAME_OVER   │  Show winner, record match history
└──────────────┘
```

### Offline Game Flow
```
┌──────────────┐
│   CONFIG     │  Step 1: Choose digits, difficulty, format
└──────┬───────┘
       ▼
┌──────────────┐
│  P1 SECRET   │  Step 2: Player 1 enters secret
└──────┬───────┘
       ▼
┌──────────────┐
│  HANDOVER    │  Step 3: Pass device to Player 2
└──────┬───────┘
       ▼
┌──────────────┐
│  P2 SECRET   │  Step 4: Player 2 enters secret
└──────┬───────┘
       ▼
┌──────────────┐
│   PLAYING    │  Pass & Play turns (with handover screens)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  GAME_OVER   │  Show winner
└──────────────┘
```

---

## 13. Environment Variables

### Backend (`.env`)
```bash
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/bulls_cows

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_EXPIRE=15d

# CORS
CLIENT_URL=http://localhost:5173
```

### Frontend (`.env`)
```bash
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### Production Environment Variables

#### Backend (Railway)
```bash
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/bulls_cows
JWT_SECRET=<strong-random-secret>
JWT_REFRESH_SECRET=<strong-random-secret>
CLIENT_URL=https://bulls-cows-pied.vercel.app/
GOOGLE_CLIENT_ID=<your-google-oauth-client-id>
```

#### Frontend (Vercel)
```bash
VITE_API_URL=https://bullscows-production.up.railway.app
VITE_SOCKET_URL=https://bullscows-production.up.railway.app
VITE_GOOGLE_CLIENT_ID=<your-google-oauth-client-id>
```

---

## 14. Deployment Guide

### Backend Deployment (Render Web Service)

1. **Create Web Service** on Render
2. **Configure:**
   - Root Directory: `Backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Node Version: ≥18.0.0

3. **Environment Variables:** Add all production env vars

4. **Health Check:** `/health` endpoint returns `{ status: 'ok' }`

### Frontend Deployment (Render Static Site)

1. **Create Static Site** on Render
2. **Configure:**
   - Root Directory: `Frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

3. **SPA Routing:** Create `public/_redirects`:
   ```
   /* /index.html 200
   ```

4. **Environment Variables:** Add VITE_API_URL and VITE_SOCKET_URL

### Frontend Deployment (Vercel - Recommended)

1. **Connect to Vercel** via GitHub
2. **Configure:**
   - Framework: Vite
   - Root Directory: `Frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Environment Variables:** Add VITE_API_URL and VITE_SOCKET_URL

4. **PWA:** manifest.json and sw.js in `public/` are automatically served

### Production URLs
- Frontend: `https://bulls-cows-pied.vercel.app`
- Backend: `https://bullscows-production.up.railway.app`

### PWA Configuration

The app supports Progressive Web App features:

1. **manifest.json** - App metadata for install prompts:
   ```json
   {
     "name": "Bulls & Cows",
     "short_name": "Bulls&Cows",
     "start_url": "/",
     "display": "standalone",
     "theme_color": "#0f172a"
   }
   ```

2. **Service Worker (sw.js)** - Caches static assets for faster loading

3. **Install Prompt** - Users can add to home screen on mobile/desktop

---

## 15. Development Guide

### Local Setup
```bash
# Clone repository
git clone <repo-url>
cd Bulls_Cows

# Install all dependencies
npm install

# Start backend (Terminal 1)
cd Backend && npm run dev

# Start frontend (Terminal 2)
cd Frontend && npm run dev
```

### Common Tasks

**Add new socket event:**
1. Add handler in `lobbyHandler.js` or `gameHandler.js`
2. Add listener in appropriate store (`useOnlineGameStore.js`)
3. Add cleanup in `removeListeners()`

**Add new API endpoint:**
1. Add route in `routes/` folder
2. Add controller function in `controllers/`
3. Add service function if needed in `services/`
4. Update API documentation

**Add new game feature:**
1. Update `activeGames` structure in handlers
2. Update socket events as needed
3. Update store state and actions
4. Update UI components

**Mobile Responsiveness:**
- Use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`)
- Use `truncate` for long text
- Use `min-w-0` with flex containers
- Test on various screen sizes

### Code Quality
- ESLint configured for both frontend and backend
- Use consistent naming conventions
- Comment complex logic
- Keep components focused and reusable

---

## Appendix: Quick Reference

### Room Codes
- 4 uppercase alphanumeric characters
- Generated randomly, verified unique
- Auto-expire after 1 hour (TTL index)

### Game Formats
- Single: First to 1 win
- Best of 3: First to 2 wins
- Best of 5: First to 3 wins

### Digit Modes
- 3 digits: Faster games
- 4 digits: Standard mode

### Difficulty Modes
- Easy: No time limit, full guess history visible
- Hard: 30-second turn timer (auto-skip on timeout) + only last 5 guesses visible (FIFO queue)

### Turn Order
- Round 1: Random first player
- Subsequent rounds: Previous round loser starts

### User IDs
- `oderId`: MongoDB ObjectId (used internally)
- `uid`: User-facing ID in #XXXX format

---

*Last updated: February 6, 2026*
