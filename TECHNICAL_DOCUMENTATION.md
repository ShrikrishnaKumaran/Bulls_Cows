# Bulls, Cows & Shit - Technical Documentation

**Version:** 1.0.0  
**Last Updated:** January 16, 2026  
**Branch:** feature/OflineMode

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Directory Structure](#directory-structure)
5. [Backend Documentation](#backend-documentation)
6. [Frontend Documentation](#frontend-documentation)
7. [Game Logic](#game-logic)
8. [API Endpoints](#api-endpoints)
9. [Socket Events](#socket-events)
10. [State Management](#state-management)
11. [Authentication Flow](#authentication-flow)
12. [Game Modes](#game-modes)
13. [Development Guide](#development-guide)
14. [Environment Variables](#environment-variables)

---

## Project Overview

Bulls, Cows & Shit is a multiplayer number guessing game where players try to guess each other's secret numbers. The game features both offline (Pass & Play) and online multiplayer modes.

### Game Rules
- Players choose a secret number with 3 or 4 unique digits
- Players take turns guessing each other's secrets
- Feedback is given for each guess:
  - **Bulls**: Correct digit in correct position
  - **Cows**: Correct digit in wrong position
  - **Shit**: Digit not in the secret number
- First player to guess the secret correctly wins

### Current Features
- ✅ User authentication (JWT with refresh tokens)
- ✅ User profiles with stats
- ✅ Offline mode (Pass & Play)
- ✅ Online multiplayer lobby system
- ✅ Real-time communication via Socket.io
- 🚧 Tournament mode (in progress)

---

## Architecture

The application follows a **client-server architecture**:

```
┌─────────────────────────────────────┐
│         Frontend (React)            │
│  - Vite Build Tool                  │
│  - Zustand State Management         │
│  - React Router for Navigation      │
│  - Socket.io Client                 │
└──────────────┬──────────────────────┘
               │
               │ HTTP/WebSocket
               │
┌──────────────┴──────────────────────┐
│         Backend (Node.js)           │
│  - Express REST API                 │
│  - Socket.io Server                 │
│  - MongoDB Database                 │
│  - JWT Authentication               │
└─────────────────────────────────────┘
```

### Design Patterns
- **MVC Pattern**: Models, Controllers, Services separation
- **Repository Pattern**: Service layer abstracts data access
- **Middleware Pattern**: Auth, validation, error handling
- **State Management**: Zustand stores for React state

---

## Technology Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | Latest | Runtime environment |
| Express | 4.18.2 | Web framework |
| MongoDB | Latest | Database |
| Mongoose | 7.5.0 | ODM for MongoDB |
| Socket.io | 4.7.2 | Real-time communication |
| JWT | 9.0.2 | Authentication tokens |
| bcryptjs | 2.4.3 | Password hashing |
| cookie-parser | 1.4.6 | Cookie handling |
| cors | 2.8.5 | CORS middleware |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | UI framework |
| Vite | 4.4.9 | Build tool & dev server |
| React Router | 6.16.0 | Client-side routing |
| Zustand | 4.4.1 | State management |
| Axios | 1.5.0 | HTTP client |
| Socket.io Client | 4.7.2 | WebSocket client |

---

## Directory Structure

```
Bulls_Cows/
├── Backend/
│   ├── config/
│   │   ├── database.js          # MongoDB connection
│   │   └── env.js               # Environment validation
│   ├── controllers/
│   │   ├── authController.js    # Auth endpoints logic
│   │   ├── matchController.js   # Match game logic
│   │   └── tournamentController.js
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT verification
│   │   └── validationMiddleware.js
│   ├── models/
│   │   ├── User.js              # User schema
│   │   ├── RefreshToken.js      # Refresh token schema
│   │   ├── Room.js              # Game room schema
│   │   └── tournament.js
│   ├── routes/
│   │   ├── auth.js              # Auth routes
│   │   ├── match.js             # Match routes
│   │   └── tournament.js
│   ├── services/
│   │   ├── authService.js       # Auth business logic
│   │   ├── matchService.js
│   │   └── roomService.js       # Room management
│   ├── sockets/
│   │   ├── socketManager.js     # Socket.io setup
│   │   └── lobbyHandler.js      # Lobby socket events
│   ├── utils/
│   │   ├── gameRules.js         # Bulls/Cows calculation
│   │   └── tokenGenerator.js    # JWT token generation
│   ├── app.js                   # Express app setup
│   ├── server.js                # Server entry point
│   └── package.json
│
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Home.jsx                # Main menu
│   │   │   ├── PassAndPlaySetup.jsx    # Offline setup
│   │   │   ├── OfflineGame.jsx         # Offline gameplay (TO BE CREATED)
│   │   │   ├── VsFriendModal.jsx       # VS Friend modal
│   │   │   └── TournamentModal.jsx     # Tournament modal
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   └── RegisterForm.jsx
│   │   │   ├── lobby/
│   │   │   │   ├── CreateRoom.jsx
│   │   │   │   ├── JoinRoom.jsx
│   │   │   │   └── RoomWaiting.jsx
│   │   │   └── profile/
│   │   │       └── UserProfile.jsx
│   │   ├── hooks/
│   │   │   └── useSocket.js            # Socket.io hook
│   │   ├── services/
│   │   │   ├── api.js                  # Axios instance
│   │   │   └── socket.js               # Socket.io client
│   │   ├── store/
│   │   │   ├── useAuthStore.js         # Auth state
│   │   │   ├── useGameStore.js         # Online game state
│   │   │   └── useOfflineGameStore.js  # Offline game state
│   │   ├── utils/
│   │   │   ├── gameRules.js            # Game logic (shared)
│   │   │   ├── gameLogic.js
│   │   │   ├── gameHelpers.js
│   │   │   └── validators.js
│   │   ├── App.jsx                     # Main app component
│   │   ├── main.jsx                    # React entry point
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── Planning/                   # Design documents
├── README.md
└── package.json               # Workspace root
```

---

## Backend Documentation

### Server Setup (server.js)
- Loads environment variables from `.env`
- Connects to MongoDB via `connectDB()`
- Creates HTTP server with Express app
- Initializes Socket.io on the HTTP server
- Listens on port 5000 (default)

### Express App (app.js)
```javascript
Middleware Stack:
1. CORS (allows credentials from frontend)
2. JSON body parser
3. URL-encoded parser
4. Cookie parser (for refresh tokens)
5. Morgan (HTTP logging)

Routes:
- /api/auth      → Authentication
- /api/matches   → Match games
- /health        → Health check endpoint
```

### Models

#### User Model (`models/User.js`)
```javascript
{
  username: String (unique, 3-20 chars, alphanumeric + underscore),
  email: String (unique, validated),
  password: String (hashed, select: false),
  stats: {
    totalGames: Number (default: 0),
    wins: Number (default: 0),
    losses: Number (default: 0),
    draws: Number (default: 0)
  },
  friends: [ObjectId] (ref: 'User'),
  isOnline: Boolean (default: false)
}
```

#### RefreshToken Model (`models/RefreshToken.js`)
```javascript
{
  user: ObjectId (ref: 'User'),
  token: String (the JWT refresh token),
  device: String (device type from user-agent),
  ipAddress: String,
  expiresAt: Date,
  isRevoked: Boolean (default: false),
  timestamps: true
}

Indexes:
- expiresAt: Auto-delete expired tokens
- token: Fast lookup
- user: Fast user queries
```

#### Room Model (`models/Room.js`)
```javascript
{
  roomCode: String (unique, 4 chars, uppercase),
  host: ObjectId (ref: 'User'),
  players: [ObjectId] (ref: 'User'),
  playerCount: Number (2-4, default: 2),
  status: String ('waiting' | 'active' | 'completed' | 'cancelled'),
  mode: String ('online' | 'tournament'),
  format: Number (1 | 3 | 5 - best of),
  digits: Number (3 | 4),
  difficulty: String ('easy' | 'hard'),
  timestamps: true
}

Indexes:
- createdAt: Auto-delete after 1 hour
```

### Controllers

#### Auth Controller (`controllers/authController.js`)
Handles HTTP requests for authentication:
- `register(req, res)` - Register new user
- `login(req, res)` - Login user
- `getProfile(req, res)` - Get user profile (protected)
- `refresh(req, res)` - Refresh access token
- `logout(req, res)` - Logout (revoke refresh token)
- `logoutAll(req, res)` - Logout from all devices

Helper functions:
- `getDeviceInfo(userAgent)` - Extract device type
- `getIpAddress(req)` - Extract IP address
- `getCookieOptions()` - Cookie configuration

### Services

#### Auth Service (`services/authService.js`)
Business logic for authentication:
- `register(userData, device, ipAddress)` - Create user + tokens
- `login(credentials, device, ipAddress)` - Verify user + tokens
- `getUserProfile(userId)` - Fetch user profile
- `refreshAccessToken(refreshToken)` - Generate new access token
- `logout(refreshToken)` - Revoke refresh token
- `logoutAll(userId)` - Revoke all user's tokens

#### Room Service (`services/roomService.js`)
Manages game rooms:
- `generateRoomCode()` - Generate unique 4-char code
- `createRoom(hostId, settings)` - Create new room
- `joinRoom(roomCode, playerId)` - Join existing room
- `leaveRoom(roomCode, playerId)` - Leave room (delete if host)
- `getRoomByCode(roomCode)` - Get room details

### Middleware

#### Auth Middleware (`middleware/authMiddleware.js`)
- `protect(req, res, next)` - Verify JWT from Authorization header
- Extracts token from "Bearer {token}" format
- Verifies token with JWT_SECRET
- Attaches user to req.user
- Returns 401 if invalid/missing

### Utilities

#### Game Rules (`utils/gameRules.js`)
```javascript
validateInput(str, digits)
  → Returns: { isValid: boolean, error: string }
  → Checks: length, all digits, unique digits

calculateBullsAndCows(secret, guess, digits)
  → Returns: { 
      bulls: number, 
      cows: number, 
      shit: number, 
      isWin: boolean, 
      error: string 
    }
  → Algorithm:
    1. Validate secret and guess
    2. Count bulls (same digit, same position)
    3. Count cows (same digit, different position)
    4. Calculate shit (digits - bulls - cows)
    5. Check if won (bulls === digits)
```

#### Token Generator (`utils/tokenGenerator.js`)
```javascript
generateAccessToken(userId)
  → JWT with 15 minutes expiry
  → Signed with JWT_SECRET

generateRefreshToken(userId)
  → JWT with 30 days expiry
  → Signed with JWT_REFRESH_SECRET (fallback to JWT_SECRET)
```

### Socket.io

#### Socket Manager (`sockets/socketManager.js`)
- Initializes Socket.io with CORS configuration
- Authentication middleware: Verifies JWT from handshake
- Attaches user to socket.user
- Registers lobby handlers
- Exports `getIO()` to access io instance

#### Lobby Handler (`sockets/lobbyHandler.js`)
Socket events for room management:

**Client → Server:**
- `create-room` - Create new room
  - Payload: `{ mode, format, digits, difficulty }`
  - Callback: `{ success, room? }`
  
- `join-room` - Join existing room
  - Payload: `roomCode`
  - Callback: `{ success, room? }`
  - Emits to room: `player-joined`
  - Emits to room if full: `game-start`
  
- `leave-room` - Leave room
  - Payload: `roomCode`
  - Callback: `{ success }`
  - Emits to room: `player-left`
  
- `get-room` - Get room info
  - Payload: `roomCode`
  - Callback: `{ success, room? }`
  
- `room-message` - Send chat message
  - Payload: `{ roomCode, message }`
  - Emits to room: `room-message`
  
- `player-ready` - Signal ready status
  - Payload: `roomCode`
  - Emits to room: `player-ready`

**Server → Client:**
- `player-joined` - New player joined
- `player-left` - Player left
- `game-start` - Game starting (room full)
- `room-message` - Chat message
- `player-ready` - Player ready status

---

## Frontend Documentation

### App Structure (App.jsx)
```javascript
Routes:
- /                  → Redirect to /login
- /login             → LoginForm
- /register          → RegisterForm
- /home              → Home (Protected)
- /profile           → UserProfile (Protected)
- /offline/setup     → PassAndPlaySetup
- /offline/game      → OfflineGame
- /lobby/create      → CreateRoom (Protected)
- /lobby/join        → JoinRoom (Protected)
- /lobby/room/:code  → RoomWaiting (Protected)

ProtectedRoute Component:
- Checks localStorage for token
- Redirects to /login if not found
```

### State Management (Zustand Stores)

#### Auth Store (`store/useAuthStore.js`)
```javascript
State:
- user: Object | null
- token: String | null
- isAuthenticated: Boolean
- loading: Boolean
- error: String | null

Actions:
- register(userData) → Register and login
- login(credentials) → Login user
- logout() → Clear state and tokens
- getProfile() → Fetch user profile
- clearError() → Clear error message

Persistence:
- Persists: user, token, isAuthenticated
- Storage: localStorage (key: 'auth-storage')

Side Effects:
- Sets token in localStorage
- Initializes Socket.io on login
- Destroys Socket.io on logout
```

#### Offline Game Store (`store/useOfflineGameStore.js`)
```javascript
State:
- gamePhase: 'SETUP' | 'PLAYING' | 'GAME_OVER'
- turn: 'PLAYER_1' | 'PLAYER_2'
- digits: 3 | 4
- player1Secret: String
- player2Secret: String
- player1Guesses: Array<{ guess, bulls, cows, shit, attempt }>
- player2Guesses: Array<{ guess, bulls, cows, shit, attempt }>
- winner: 'PLAYER_1' | 'PLAYER_2' | 'DRAW' | null

Actions:
- setDigits(digits) → Set game digits
- setPlayer1Secret(secret) → Store P1 secret
- setPlayer2Secret(secret) → Store P2 secret
- startGame() → Validate and start game
- submitGuess(guess) → Process guess, switch turn, check win
- resetGame() → Reset to SETUP phase
- playAgain() → Same as resetGame

No Persistence: State is in-memory only
```

### Services

#### API Service (`services/api.js`)
```javascript
Base URL: http://localhost:5000/api (from VITE_API_URL)

Request Interceptor:
- Adds Authorization header with Bearer token from localStorage

Response Interceptor:
- Handles 401: Clear token, redirect to /login
- Rejects other errors

Usage:
import api from '../services/api'
api.get('/auth/profile')
api.post('/auth/login', credentials)
```

#### Socket Service (`services/socket.js`)
```javascript
Socket URL: http://localhost:5000 (from VITE_SOCKET_URL)

Functions:
- initializeSocket(token) → Create socket instance
- getSocket() → Get existing socket
- connectSocket() → Connect if disconnected
- disconnectSocket() → Disconnect if connected
- destroySocket() → Disconnect and destroy

Features:
- Auth via handshake.auth.token
- Auto-connect: false (manual control)
- Event listeners: connect, disconnect, connect_error

Usage:
import { initializeSocket, getSocket } from '../services/socket'
initializeSocket(token)
const socket = getSocket()
socket.emit('create-room', settings, callback)
```

### Components

#### Home Component (`components/Home.jsx`)
Main menu after login:
- 3 game mode buttons:
  - 📱 Pass & Play (Offline) → `/offline/setup`
  - ⚔️ VS Friend → Opens VsFriendModal
  - 🏆 Tournament → Opens TournamentModal
- Footer buttons:
  - ❓ How to Play → Alert (not implemented)
  - 👤 My Profile → `/profile`
- Logout button (top-right)
- Modals: VsFriendModal, TournamentModal

#### PassAndPlaySetup Component (`components/PassAndPlaySetup.jsx`)
Two-step secret setup for offline mode:

**State:**
- `digits` - 3 or 4 (local state)
- `step` - 1 or 2 (Player 1 or 2)
- `secret` - Current input (local state)
- `error` - Error message
- `showSecret` - Toggle visibility

**Flow:**
1. Player 1 selects digits (3 or 4)
2. Player 1 enters secret via number pad
3. Click "Next" → Store in useOfflineGameStore
4. Player 2 enters secret via number pad
5. Click "Start Game" → Navigate to `/offline/game`

**Features:**
- Number pad (0-9 grid)
- Backspace button
- Show/Hide toggle (eye icon)
- Disabled digits (already used or max reached)
- Visual feedback (stars vs numbers)
- Error messages
- Cancel button → `/home`

#### OfflineGame Component (`components/OfflineGame.jsx`)
**STATUS: TO BE CREATED**

**Required Features:**
- Display current turn (Player 1 or Player 2)
- Number pad for guess input
- Submit guess button
- Display guess history:
  - Two columns (Player 1 | Player 2)
  - Show: guess, bulls, cows, shit, attempt number
- Real-time feedback after each guess
- Turn switching
- Win condition detection
- Game Over modal:
  - Show winner
  - "Play Again" button → Reset game
  - "Home" button → Navigate to `/home`

**Implementation Plan:**
```javascript
import useOfflineGameStore from '../store/useOfflineGameStore'
import { validateInput } from '../utils/gameRules'

State needed:
- currentGuess (local state)
- error (local state)

Store subscriptions:
- gamePhase, turn, digits
- player1Guesses, player2Guesses
- winner

UI Sections:
1. Header: Show current player turn
2. Guess Input: Number pad + display
3. History: Two-column table
4. Game Over Modal: Conditional render
```

#### LoginForm Component (`features/auth/LoginForm.jsx`)
- Email and password inputs
- Submit button (shows loading state)
- Error display
- Link to register page
- Calls `useAuthStore.login()`
- Navigates to `/home` on success

#### RegisterForm Component (`features/auth/RegisterForm.jsx`)
Similar to LoginForm with username field

#### CreateRoom Component (`features/lobby/CreateRoom.jsx`)
- Settings form:
  - Mode: online | tournament
  - Format: 1 | 3 | 5 (best of)
  - Digits: 3 | 4
  - Difficulty: easy | hard
- "Create Room" button
- Emits `create-room` socket event
- Navigates to `/lobby/{roomCode}` on success

---

## Game Logic

### Bulls and Cows Calculation Algorithm

The core game logic is in `gameRules.js` (shared between backend and frontend):

```javascript
// Example: Secret = "1234", Guess = "1352"
calculateBullsAndCows("1234", "1352", 4)

Step-by-step:
1. Validate secret: "1234" ✓ (4 unique digits)
2. Validate guess: "1352" ✓ (4 unique digits)

3. Count Bulls (correct position):
   - Position 0: '1' === '1' ✓ → bulls = 1
   - Position 1: '2' !== '3' ✗
   - Position 2: '3' !== '5' ✗
   - Position 3: '4' !== '2' ✗
   → Total Bulls: 1

4. Count Cows (wrong position):
   - Position 1: '3' in secret? Yes (at pos 2) → cows = 1
   - Position 2: '5' in secret? No
   - Position 3: '2' in secret? Yes (at pos 1) → cows = 2
   → Total Cows: 2

5. Calculate Shit (not in secret):
   - shit = digits - bulls - cows
   - shit = 4 - 1 - 2 = 1

6. Check Win:
   - isWin = bulls === digits
   - isWin = 1 === 4 = false

Result: { bulls: 1, cows: 2, shit: 1, isWin: false, error: null }
```

### Validation Rules
- **Length**: Must be exactly `digits` length (3 or 4)
- **Digits Only**: All characters must be 0-9
- **Unique**: All digits must be unique
- **No Leading Zero**: (Optional, not enforced currently)

---

## API Endpoints

### Authentication

#### POST /api/auth/register
**Description:** Register a new user  
**Access:** Public  
**Body:**
```json
{
  "username": "player1",
  "email": "player1@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "_id": "user_id",
  "username": "player1",
  "email": "player1@example.com",
  "accessToken": "jwt_access_token"
}
```
**Cookies:** Sets `refreshToken` httpOnly cookie  
**Status:** 201 Created | 400 Bad Request

#### POST /api/auth/login
**Description:** Login user  
**Access:** Public  
**Body:**
```json
{
  "email": "player1@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "_id": "user_id",
  "username": "player1",
  "email": "player1@example.com",
  "accessToken": "jwt_access_token"
}
```
**Cookies:** Sets `refreshToken` httpOnly cookie  
**Status:** 200 OK | 401 Unauthorized

#### GET /api/auth/profile
**Description:** Get user profile  
**Access:** Protected (requires Bearer token)  
**Response:**
```json
{
  "_id": "user_id",
  "username": "player1",
  "email": "player1@example.com",
  "stats": {
    "totalGames": 10,
    "wins": 5,
    "losses": 3,
    "draws": 2
  },
  "friends": [],
  "isOnline": false
}
```
**Status:** 200 OK | 401 Unauthorized | 404 Not Found

#### POST /api/auth/refresh
**Description:** Refresh access token  
**Access:** Public (requires refreshToken cookie)  
**Response:**
```json
{
  "accessToken": "new_jwt_access_token"
}
```
**Status:** 200 OK | 401 Unauthorized

#### POST /api/auth/logout
**Description:** Logout user (revoke refresh token)  
**Access:** Protected  
**Response:**
```json
{
  "message": "Logged out successfully"
}
```
**Cookies:** Clears `refreshToken` cookie  
**Status:** 200 OK | 400 Bad Request

#### POST /api/auth/logout-all
**Description:** Logout from all devices  
**Access:** Protected  
**Response:**
```json
{
  "message": "Logged out from all devices"
}
```
**Cookies:** Clears `refreshToken` cookie  
**Status:** 200 OK | 400 Bad Request

### Health Check

#### GET /health
**Description:** Server health check  
**Access:** Public  
**Response:**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```
**Status:** 200 OK

---

## Socket Events

### Connection
**Event:** `connection`  
**Direction:** Server side  
**Description:** Fired when client connects  
**Auth:** Requires token in handshake.auth.token  
**Data:** socket.user contains authenticated user

### Create Room
**Event:** `create-room`  
**Direction:** Client → Server  
**Payload:**
```javascript
{
  mode: 'online' | 'tournament',
  format: 1 | 3 | 5,
  digits: 3 | 4,
  difficulty: 'easy' | 'hard'
}
```
**Callback:**
```javascript
{
  success: true,
  room: {
    roomCode: "AB12",
    host: "user_id",
    players: ["user_id"],
    playerCount: 1,
    format: 3,
    digits: 4,
    difficulty: "easy",
    status: "waiting"
  }
}
```

### Join Room
**Event:** `join-room`  
**Direction:** Client → Server  
**Payload:** `"AB12"` (roomCode)  
**Callback:**
```javascript
{
  success: true,
  room: { ...room details }
}
```
**Emits to room:** `player-joined`, `game-start` (if full)

### Leave Room
**Event:** `leave-room`  
**Direction:** Client → Server  
**Payload:** `"AB12"` (roomCode)  
**Callback:**
```javascript
{
  success: true
}
```
**Emits to room:** `player-left`

### Get Room
**Event:** `get-room`  
**Direction:** Client → Server  
**Payload:** `"AB12"` (roomCode)  
**Callback:**
```javascript
{
  success: true,
  room: { ...room details }
}
```

### Room Message
**Event:** `room-message`  
**Direction:** Bidirectional  
**Client → Server:**
```javascript
{
  roomCode: "AB12",
  message: "Hello!"
}
```
**Server → All in room:**
```javascript
{
  sender: {
    _id: "user_id",
    username: "player1"
  },
  message: "Hello!",
  timestamp: "2026-01-16T..."
}
```

### Player Ready
**Event:** `player-ready`  
**Direction:** Bidirectional  
**Client → Server:** `"AB12"` (roomCode)  
**Server → All in room:**
```javascript
{
  playerId: "user_id"
}
```

---

## State Management

### Zustand Store Pattern
All Zustand stores follow this pattern:

```javascript
import { create } from 'zustand';

const useStore = create((set, get) => ({
  // State
  value: initialValue,
  
  // Actions
  action: (params) => {
    const currentState = get();
    set({ value: newValue });
  }
}));

// Usage in components
const { value, action } = useStore();
```

### Store Comparison

| Feature | useAuthStore | useOfflineGameStore | useGameStore |
|---------|--------------|---------------------|--------------|
| **Purpose** | User auth | Offline game | Online game |
| **Persistence** | Yes (localStorage) | No (in-memory) | No (socket sync) |
| **Network** | HTTP API | None | Socket.io |
| **Lifecycle** | Global (session) | Per-game | Per-match |

---

## Authentication Flow

### Registration Flow
```
1. User fills RegisterForm
2. Frontend: useAuthStore.register(userData)
3. POST /api/auth/register
4. Backend: Hash password with bcrypt
5. Backend: Create user in MongoDB
6. Backend: Generate access + refresh tokens
7. Backend: Store refresh token in RefreshToken collection
8. Backend: Set refreshToken in httpOnly cookie
9. Backend: Return user + accessToken
10. Frontend: Store token in localStorage
11. Frontend: Initialize Socket.io with token
12. Frontend: Navigate to /home
```

### Login Flow
```
1. User fills LoginForm
2. Frontend: useAuthStore.login(credentials)
3. POST /api/auth/login
4. Backend: Find user by email
5. Backend: Compare password with bcrypt
6. Backend: Generate access + refresh tokens
7. Backend: Store refresh token in RefreshToken collection
8. Backend: Set refreshToken in httpOnly cookie
9. Backend: Return user + accessToken
10. Frontend: Store token in localStorage
11. Frontend: Initialize Socket.io with token
12. Frontend: Navigate to /home
```

### Token Refresh Flow
```
1. Frontend: Access token expires (15 min)
2. Frontend: POST /api/auth/refresh (with cookie)
3. Backend: Read refreshToken from cookie
4. Backend: Verify refresh token
5. Backend: Check if revoked or expired
6. Backend: Generate new access token
7. Backend: Return new accessToken
8. Frontend: Update localStorage
```

### Logout Flow
```
1. User clicks Logout
2. Frontend: useAuthStore.logout()
3. POST /api/auth/logout (optional)
4. Backend: Revoke refresh token (set isRevoked = true)
5. Backend: Clear refreshToken cookie
6. Frontend: Remove token from localStorage
7. Frontend: Destroy Socket.io connection
8. Frontend: Navigate to /login
```

### Protected Route Flow
```
1. User navigates to protected route
2. ProtectedRoute checks localStorage for token
3. If no token → Redirect to /login
4. If token exists → Render children
5. API request with expired token → 401
6. Axios interceptor → Clear token, redirect to /login
```

---

## Game Modes

### 1. Pass & Play (Offline Mode)

**Status:** Setup complete, Gameplay component pending

**Flow:**
```
1. Home → "Pass & Play" button
2. Navigate to /offline/setup (PassAndPlaySetup)
3. Player 1 selects digits (3 or 4)
4. Player 1 enters secret via number pad
5. Click "Next" → Store in useOfflineGameStore
6. Player 2 enters secret via number pad
7. Click "Start Game" → startGame() in store
8. Navigate to /offline/game (OfflineGame - TO BE CREATED)
9. Players alternate turns:
   - Current player enters guess via number pad
   - Submit guess → submitGuess() in store
   - Calculate bulls/cows using gameRules.js
   - Display feedback
   - Switch turn
10. First player to guess correctly wins
11. Show Game Over modal with winner
12. "Play Again" → Reset store, go to /offline/setup
```

**No Backend Required:** All state in `useOfflineGameStore`

**Architecture:**
- **Setup Phase:** PassAndPlaySetup component
- **Playing Phase:** OfflineGame component (to be created)
- **Game Over:** Modal in OfflineGame
- **State:** Zustand store (in-memory)
- **Logic:** gameRules.js (shared utility)

### 2. VS Friend (Online Mode)

**Status:** Lobby system complete, Game logic pending

**Flow:**
```
1. Home → "VS Friend" button → VsFriendModal
2. Choose: Create Room or Join Room
3a. Create Room:
    - Select settings (format, digits, difficulty)
    - Socket: emit 'create-room'
    - Navigate to /lobby/room/{code}
3b. Join Room:
    - Enter room code
    - Socket: emit 'join-room'
    - Navigate to /lobby/room/{code}
4. RoomWaiting component:
   - Show players
   - Chat functionality
   - Ready status
5. When 2 players → Socket: emit 'game-start'
6. Navigate to game (TO BE IMPLEMENTED)
7. Real-time gameplay via Socket.io
8. Update stats after game
```

**Backend Required:** Room management, Socket.io

### 3. Tournament Mode

**Status:** Not implemented

**Planned Flow:**
```
1. Home → "Tournament" button → TournamentModal
2. Create tournament (4 players)
3. Round-robin matches
4. Points table
5. Winner determined by points
```

---

## Development Guide

### Prerequisites
- Node.js (v16+)
- MongoDB (running locally or cloud)
- Git

### Setup Instructions

1. **Clone Repository:**
```bash
git clone <repository-url>
cd Bulls_Cows
```

2. **Install Dependencies:**
```bash
# Root workspace
npm install

# Backend
cd Backend
npm install

# Frontend
cd ../Frontend
npm install
```

3. **Environment Variables:**

**Backend (.env):**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/bulls-cows
JWT_SECRET=your_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=30d
FRONTEND_URL=http://localhost:5173
CLIENT_URL=http://localhost:5173
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

4. **Start Development Servers:**

**Backend:**
```bash
cd Backend
npm run dev   # Uses nodemon for auto-reload
```

**Frontend:**
```bash
cd Frontend
npm run dev   # Starts Vite dev server
```

**Or use VS Code tasks:**
- "Start Backend Server" (npm start in Backend)
- "Start Frontend Dev Server" (npm run dev in Frontend)

5. **Access Application:**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Health check: http://localhost:5000/health

### Git Workflow

**Current Branch:** `feature/OflineMode`

**Branch Strategy:**
```
main (production)
  ↑
develop (integration)
  ↑
feature/OflineMode (offline game mode)
feature/OnlineGame (online multiplayer)
feature/Tournament (tournament mode)
```

**Common Commands:**
```bash
# Check current branch
git branch --show-current

# Switch branch
git checkout develop
git checkout feature/OflineMode

# Pull latest
git pull origin develop

# Merge develop into feature
git checkout feature/OflineMode
git merge origin/develop

# Stage and commit
git add .
git commit -m "Descriptive message"

# Push to remote
git push origin feature/OflineMode
```

### Code Style

**Backend:**
- Use `const` / `let` (no `var`)
- Async/await over promises
- Error handling with try-catch
- JSDoc comments for functions
- Consistent naming: camelCase for variables/functions

**Frontend:**
- Functional components only (no class components)
- Hooks for state management
- Arrow functions for components
- Props destructuring
- Inline styles (no CSS modules yet)

### Testing

**Currently:** No test suite implemented

**Planned:**
- Backend: Jest + Supertest
- Frontend: Vitest + React Testing Library

### Debugging

**Backend:**
```bash
# View logs
npm run dev   # Morgan logs HTTP requests

# Debug mode (VS Code)
F5 → Attach to Node process
```

**Frontend:**
```bash
# React DevTools (browser extension)
# Zustand DevTools (browser extension)

# View state
import useOfflineGameStore from './store/useOfflineGameStore'
console.log(useOfflineGameStore.getState())
```

---

## Environment Variables

### Backend Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 5000 | Server port |
| `NODE_ENV` | No | development | Environment mode |
| `MONGODB_URI` | Yes | - | MongoDB connection string |
| `JWT_SECRET` | Yes | - | Secret for access tokens |
| `JWT_REFRESH_SECRET` | No | JWT_SECRET | Secret for refresh tokens |
| `JWT_ACCESS_EXPIRE` | No | 15m | Access token expiry |
| `JWT_REFRESH_EXPIRE` | No | 30d | Refresh token expiry |
| `FRONTEND_URL` | No | http://localhost:5173 | Frontend URL for CORS |
| `CLIENT_URL` | No | http://localhost:5173 | Client URL for CORS |

### Frontend Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | No | http://localhost:5000/api | Backend API base URL |
| `VITE_SOCKET_URL` | No | http://localhost:5000 | Socket.io server URL |

---

## Next Steps

### Immediate Tasks (Feature: Offline Mode)
1. **Create OfflineGame Component**
   - Number pad for guess input
   - Display guess history (two columns)
   - Turn indicator
   - Bulls/Cows/Shit feedback
   - Game Over modal
   - "Play Again" functionality

2. **Test Offline Mode End-to-End**
   - Setup → Gameplay → Game Over
   - 3-digit and 4-digit modes
   - Win detection
   - Error handling

### Future Tasks
1. **Online Game Logic**
   - Socket.io gameplay events
   - Turn management
   - Secret submission
   - Guess validation server-side
   - Best-of-N format tracking
   - Match results

2. **Tournament Mode**
   - 4-player round-robin
   - Points table
   - Match scheduling
   - Winner determination

3. **User Profile Enhancements**
   - Stats display
   - Friend system
   - Match history
   - Leaderboard

4. **UI/UX Improvements**
   - Responsive design
   - Loading states
   - Animations
   - Tutorial/How to Play
   - Error boundaries

5. **Testing**
   - Unit tests (backend services)
   - Integration tests (API endpoints)
   - Component tests (React components)
   - E2E tests (Playwright/Cypress)

6. **Deployment**
   - Production environment setup
   - CI/CD pipeline
   - MongoDB Atlas
   - Hosting (Vercel/Netlify + Railway/Render)

---

## Troubleshooting

### Common Issues

**1. "Cannot connect to MongoDB"**
- Check if MongoDB is running: `mongod --version`
- Verify MONGODB_URI in .env
- Check network/firewall settings

**2. "401 Unauthorized"**
- Check if token is in localStorage
- Verify token format: "Bearer {token}"
- Check token expiry (15 min for access token)
- Try refreshing token or re-login

**3. "Socket connection error"**
- Verify backend is running on port 5000
- Check VITE_SOCKET_URL in frontend .env
- Ensure token is valid
- Check browser console for errors

**4. "Room not found"**
- Rooms auto-delete after 1 hour
- Verify room code is correct (4 chars)
- Check if room status is not 'cancelled'

**5. "Port already in use"**
- Check if another process is using port 5000
- Kill process: `taskkill /F /IM node.exe` (Windows)
- Change PORT in .env

**6. "Module not found"**
- Run `npm install` in affected folder
- Delete node_modules and package-lock.json, reinstall
- Check import paths (case-sensitive)

---

## Glossary

**Bulls:** Correct digit in correct position  
**Cows:** Correct digit in wrong position  
**Shit:** Digit not in the secret number  

**Access Token:** Short-lived JWT for API authentication (15 min)  
**Refresh Token:** Long-lived JWT for getting new access tokens (30 days)  

**Pass & Play:** Offline mode where players share one device  
**Best of N:** Match format (best of 1, 3, or 5 games)  

**Room:** Multiplayer lobby where players wait before game starts  
**Room Code:** Unique 4-character identifier for a room  

**Zustand:** State management library for React  
**Socket.io:** Real-time bidirectional communication library  

**Mongoose:** ODM (Object Data Modeling) library for MongoDB  
**bcryptjs:** Password hashing library  
**JWT:** JSON Web Token for authentication  

---

## Contact & Support

**Repository:** [GitHub URL]  
**Documentation:** This file (TECHNICAL_DOCUMENTATION.md)  
**Planning:** See `/Planning` folder for design documents

---

**Last Updated:** January 16, 2026  
**Version:** 1.0.0  
**Branch:** feature/OflineMode
