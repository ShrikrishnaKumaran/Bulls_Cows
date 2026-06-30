# TheProject — Bulls & Cows: Definitive Engineering Handbook & V2 Strategy

> **Audience:** Senior engineers onboarding to this codebase or designing Version 2.
> **Scope:** Complete reverse-engineering of the MERN + Socket.IO real-time game.
> **Method:** Every source file in the repo was read. Findings are backed by `file:line` references.
> **Status of repo at analysis time:** branch `main`; working tree has uncommitted changes (duplicate `AuthPage`/`ProfilePage` files, unmounted `routes/user.js`, `.bak` files). These are flagged as technical debt where relevant.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Complete System Architecture](#2-complete-system-architecture)
3. [Repository Structure Analysis](#3-repository-structure-analysis)
4. [Frontend Deep Dive](#4-frontend-deep-dive)
5. [Backend Deep Dive](#5-backend-deep-dive)
6. [MongoDB Analysis](#6-mongodb-analysis)
7. [Authentication & Authorization](#7-authentication--authorization)
8. [API Documentation](#8-api-documentation)
9. [Business Logic Analysis](#9-business-logic-analysis)
10. [Frontend ↔ Backend Communication](#10-frontend--backend-communication)
11. [State Management Analysis](#11-state-management-analysis)
12. [Security Review](#12-security-review)
13. [Performance Review](#13-performance-review)
14. [Scalability Assessment](#14-scalability-assessment)
15. [Code Quality Assessment](#15-code-quality-assessment)
16. [Testing Analysis](#16-testing-analysis)
17. [Deployment & DevOps Analysis](#17-deployment--devops-analysis)
18. [Technical Debt Report](#18-technical-debt-report)
19. [Version 2 Brainstorming](#19-version-2-brainstorming)
20. [Future Architecture Proposal](#20-future-architecture-proposal)

---

## 1. Executive Summary

### What problem this application solves
This is a real-time, multiplayer implementation of the classic **Bulls & Cows** (a.k.a. "Mastermind with digits") code-breaking game. Each player picks a secret number with unique digits (3 or 4); players alternate guessing each other's secret, receiving feedback as **Bulls** (right digit, right position), **Cows** (right digit, wrong position), and **"Shit"** (digit not present — the app's internal name for misses; see `Backend/utils/gameRules.js:96`). First to crack the opponent's code wins the round; best-of-N (1/3/5) wins the match.

### Target users
Casual gamers who want a quick head-to-head puzzle duel. The app is a **mobile-first PWA** (`Frontend/public/manifest.json`, `Frontend/src/main.jsx:7` registers a service worker), targeting phone players who pass-and-play, play a bot, or duel friends online.

### Core workflows
The app offers **four game modes**, three of which run entirely client-side:

| Mode | Route | Persistence | Store |
|------|-------|-------------|-------|
| **Offline** (pass-and-play, 2 humans, 1 device) | `/offline/*` | None (client only) | `useOfflineGameStore` |
| **VS Bot** (human vs AI) | `/bot/*` | None (client only) | `useBotGameStore` |
| **Online 1v1** (real-time, 2 devices) | `/lobby/*`, `/game/online/:roomCode` | Socket + Mongo stats | `useOnlineGameStore` |
| **Friends system** (social layer around online) | via modals | Mongo | `useAuthStore` actions |

### Key features
- **Real-time multiplayer** over Socket.IO with in-memory game state (`Backend/sockets/`).
- **AI bot** with two personalities: Easy "SURVIVOR" (random + 20% glitch) and Hard "DOMINATOR" (minimax most-informative-guess) — `Frontend/src/utils/botLogic.js`.
- **JWT auth** with access/refresh token rotation, httpOnly refresh cookie, and Google OAuth (`Backend/services/authService.js`).
- **Friends system**: search by username/UID, bidirectional requests, online presence, in-game invites.
- **Best-of-N rounds**, **Hard mode 30s turn timer**, **disconnect = forfeit**, **match history & W/L stats**.
- **Cyber/neon themed UI** with custom input widgets (drum, numpad, holo-sphere) and a PWA shell.

### Current architecture overview
```
React 18 SPA (Vite, Zustand, Tailwind)  ──HTTP/REST──►  Express API  ──►  MongoDB (Mongoose)
        │                                                     │
        └───────────────── Socket.IO (WebSocket) ────────────┘
                          (real-time gameplay, in-memory state)
```
Frontend on Vercel/Render static hosting; backend on Railway (single Node process). Online game state lives **in server RAM** (`activeGames` map in `socketManager.js:17`), not Mongo — only final results and stats are persisted.

### Strengths
- **Clean layering on the backend**: routes → controllers → services → models is consistently applied (auth, friends, match).
- **Authoritative game server**: secrets never leave the server; Bulls/Cows computed server-side (`gameHandler.js:278`). Cheating via client tampering is largely prevented for online mode.
- **Thoughtful real-time UX**: multi-tab presence tracking (`userSockets` Set per user), reconnection support, cold-start warmup pings, optimistic timeouts.
- **Strong separation of game modes** into dedicated stores, so offline/bot/online don't interfere.
- **Good bot design**: a genuine minimax implementation, not a fake AI.

### Weaknesses & limitations
- **No automated tests anywhere** (`Backend/package.json:9` is the default "no test" stub). All game-rule and scoring logic is unverified.
- **In-memory game state** = a single backend instance only; a restart drops all live games and **cannot scale horizontally** without sticky sessions + shared state.
- **Duplicated/divergent code**: two `gameRules.js` (front+back), two `AuthPage.jsx`, three `ProfilePage` variants (`.jsx`, `.bak`, `.bak2`), an orphaned legacy `useGameStore.js`, and an unmounted `routes/user.js`.
- **Weak input validation** on REST (no schema validation library; `validationMiddleware.js` is partial and hard-codes 4 digits).
- **CORS allows all origins in non-production**, and dev mode is permissive; secrets management relies on env files.
- **Data model gaps**: a `Match` model and a `Room` model overlap and duplicate intent; `Match` is essentially unused. UID is a 4-digit `#NNNN` with only ~9000 possible values — collision-prone at scale.

---

## 2. Complete System Architecture

### 2.1 End-to-end request/data flow
```
┌──────────┐     HTTPS/REST      ┌───────────────────────────┐      ┌──────────────┐
│          │ ─────────────────►  │  Express App (app.js)     │      │              │
│  User    │                     │  ├─ CORS / cookies / json │      │   MongoDB    │
│ (Browser │                     │  ├─ /api/auth   ──►ctrl──►svc──►│   (Atlas)    │
│   PWA)   │ ◄─────────────────  │  ├─ /api/friends──►ctrl──►svc──►│  users,      │
│          │     JSON + cookie   │  ├─ /api/matches──►ctrl──►svc──►│  rooms,      │
│          │                     │  └─ /health               │      │  refreshtok. │
│          │                     └───────────────────────────┘      │              │
│          │                                                        │              │
│          │     WebSocket (Socket.IO)   ┌──────────────────────┐  │              │
│          │ ◄════════════════════════►  │ socketManager (auth) │  │              │
│          │   game-init, submit-secret, │  ├─ lobbyHandler      │  │              │
│          │   submit-guess, turn-result,│  ├─ gameHandler ──────┼─►│ stats,       │
│          │   game-over, timer-tick ... │  ├─ roundManager      │  │ matchHistory │
│          │                             │  ├─ timerManager      │  │              │
│          │                             │  └─ activeGames (RAM) │  └──────────────┘
└──────────┘                             └──────────────────────┘
```

### 2.2 Frontend architecture
- **SPA** built with **React 18 + Vite 4** (`Frontend/vite.config.js`).
- **Routing**: `react-router-dom@6` with a localStorage-token-gated `ProtectedRoute` (`App.jsx:38`).
- **State**: **Zustand** stores (no Redux/Context for app state; Context only via `GoogleOAuthProvider`).
- **Styling**: Tailwind CSS with a custom cyber theme; per-feature CSS (`features/auth/auth.css`).
- **Transport**: `axios` instance with interceptors for token attach + 401 refresh (`services/api.js`); `socket.io-client` singleton (`services/socket.js`).
- **PWA**: service worker + manifest + icons (`public/`).
- **Build output**: manual chunks `vendor`/`state`/`socket` for cache efficiency (`vite.config.js:14`).

### 2.3 Backend architecture
- **Express 4** HTTP server wrapped by `http.createServer` so **Socket.IO shares the same port** (`server.js:13-16`).
- **Layered**: `routes/*` (thin) → `controllers/*` (HTTP mapping) → `services/*` (business logic) → `models/*` (Mongoose).
- **Real-time** is a parallel subsystem under `sockets/`, with its own auth middleware and an in-memory `activeGames` store keyed by room code.
- **Cross-cutting helpers**: `utils/tokenGenerator.js` (JWT), `utils/gameRules.js` (Bulls/Cows math), `middleware/authMiddleware.js` (`protect`).

### 2.4 Database architecture
- **MongoDB via Mongoose 7**, single connection (`config/database.js`), connection string from `MONGO_URI`.
- Collections: `users`, `rooms`, `refreshtokens`, `matches` (latter largely unused).
- **TTL indexes** auto-expire rooms/matches after 1h and refresh tokens at `expiresAt` (`models/Room.js:46`, `models/RefreshToken.js:21`).
- **No transactions**; multi-document writes (friend requests, match recording) are sequential and non-atomic.

### 2.5 Authentication architecture
- **Stateless access token** (JWT, default 15m) sent in `Authorization: Bearer`.
- **Stateful refresh token** (JWT, 30d) stored in an **httpOnly cookie** *and* a `refreshtokens` collection row (revocable) — `authService.js:12,111`.
- **Socket auth**: JWT passed in `socket.handshake.auth.token`, verified in `io.use(...)` (`socketManager.js:75`).
- **Google OAuth**: ID token verified server-side via `google-auth-library` (`authService.js:163`).

### 2.6 State management architecture
Five Zustand stores, each owning one concern:
- `useAuthStore` (persisted, partialized) — user, auth flows, friend actions, periodic refresh.
- `useOnlineGameStore` — the canonical online-multiplayer store with all socket listeners.
- `useOfflineGameStore`, `useBotGameStore` — pure client-side game state machines.
- `useToastStore` — global notifications.
- `useGameStore` — **legacy/orphaned** (uses `socket.id` as identity; superseded by `useOnlineGameStore`).

### 2.7 Deployment architecture
```
        ┌─────────────────────────┐         ┌──────────────────────────┐
        │  Vercel / Render (static)│  HTTPS  │  Railway (Node service)  │
 User ─►│  Frontend SPA + PWA      │ ──────► │  Express + Socket.IO     │ ─► MongoDB Atlas
        │  SPA rewrite → index.html│  WSS    │  NIXPACKS build, npm start│
        └─────────────────────────┘         └──────────────────────────┘
   VITE_API_URL / VITE_SOCKET_URL point at the Railway URL in .env.production
```

---

## 3. Repository Structure Analysis

### Top-level
```
Bulls_Cows/
├── Backend/         Node/Express/Socket.IO API + game server
├── Frontend/        React/Vite SPA (PWA)
├── Planning/        Design docs (game interface, tutorial, points table, workflow)
├── package.json     Root (minimal; sub-projects have their own)
├── *.md             Documentation set (see below)
└── .gitignore       Ignores node_modules, .env, dist, promts.md
```

**Documentation files present** (significant for V2 context): `README.md`, `API_REFERENCE.md`, `TECHNICAL_DOCUMENTATION.md`, `WEBSOCKET_EVENTS.md`, `DEPLOYMENT.md`, `PROJECT_SUMMARY.md`, plus per-project `Backend/README.md`, `Backend/API_DOCUMENTATION.md`, `Backend/HOME_PAGE_API.md`, `Frontend/README.md`, `Frontend/COMPONENT_TREE.md`. These are extensive but risk drift from code.

### Backend map
| Path | Purpose | Key dependencies |
|------|---------|------------------|
| `server.js` | Entry: dotenv, DB connect, HTTP server, socket init | `app`, `config/database`, `sockets/socketManager` |
| `app.js` | Express app: CORS, parsers, route mounting, error handler | `cors`, `cookie-parser`, `morgan`, routes |
| `config/database.js` | Mongoose connect | `mongoose` |
| `models/User.js` | Core user schema (auth, stats, friends, matchHistory, UID) | mongoose |
| `models/Room.js` | Online room/lobby (roomCode, host, opponent, settings, TTL) | mongoose |
| `models/RefreshToken.js` | Revocable refresh tokens (TTL) | mongoose |
| `models/match.js` | **Largely unused** alt-room model | mongoose |
| `routes/auth.js` | `/api/auth/*` | authController, `protect` |
| `routes/friends.js` | `/api/friends/*` (all protected) | friendController, `protect` |
| `routes/match.js` | `/api/matches/*` | matchController, `protect` |
| `routes/user.js` | **NOT mounted** in app.js (dead code) | inline handlers |
| `controllers/*` | HTTP request/response mapping | services |
| `services/authService.js` | Register/login/refresh/logout/google, token issuance | User, RefreshToken, bcrypt, jwt, google-auth-library |
| `services/friendService.js` | Friend graph operations | User |
| `services/roomService.js` | Room create/join/leave, code generation | Room |
| `middleware/authMiddleware.js` | `protect` — Bearer JWT verify | jwt, User |
| `middleware/validationMiddleware.js` | Partial REST validators (**unused by routes**) | — |
| `sockets/socketManager.js` | Socket.IO init, auth, presence, activeGames, disconnect-forfeit | jwt, User, handlers |
| `sockets/lobbyHandler.js` | Room lifecycle events, invites, start-game | roomService, timerManager, gameHandler |
| `sockets/gameHandler.js` | Secret/guess events, win/round logic, **recordMatchResult** | gameRules, roundManager, timerManager, User |
| `sockets/roundManager.js` | Scoring, best-of logic, round reset, first-player | — |
| `sockets/timerManager.js` | Hard-mode 30s per-turn timer | — |
| `utils/gameRules.js` | Bulls/Cows calculation + validation (server) | — |
| `utils/tokenGenerator.js` | Access/refresh JWT signing | jwt |
| `scripts/resetMatchData.js` | Admin script to reset stats/history | mongoose, User |
| `railway.json` | Railway deploy config (NIXPACKS, npm start) | — |
| `test-server.js` | Untracked scratch file | — |

### Frontend map
| Path | Purpose |
|------|---------|
| `src/main.jsx` | React root + service-worker registration |
| `src/App.jsx` | Router, `ProtectedRoute`, GoogleOAuthProvider, global Toast/Invite |
| `src/services/api.js` | axios instance, token interceptor, 401-refresh queue |
| `src/services/socket.js` | socket.io-client singleton + lifecycle helpers |
| `src/store/*` | Zustand stores (auth, online, offline, bot, toast, legacy game) |
| `src/hooks/useSocket.js` | Socket lifecycle hook + cold-start warmup |
| `src/hooks/useBot.js` | Bot candidate state + `makeMove` with thinking delay |
| `src/hooks/useAuth.js` | Redirect-if-unauth helper (**routes to `/login` which redirects to `/auth`**) |
| `src/utils/gameRules.js` | Bulls/Cows + `generateSecret` (client) |
| `src/utils/botLogic.js` | Combination gen, candidate filter, minimax, taunts |
| `src/utils/constants.js` | Centralized constants (some unused/duplicated, e.g. ROOM_CODE_LENGTH=6 but backend uses 4) |
| `src/pages/**` | Route screens (auth, home, profile, offline, bot, online) |
| `src/components/**` | UI library: `ui/`, `game/`, `home/`, `lobby/`, `setup/`, `profile/`, `layout/` |
| `vite.config.js` | Dev proxy to `:5000`, manual chunks, terser |
| `vercel.json` / `render.yaml` / `public/_redirects` | SPA rewrite configs (three hosts supported) |

**Duplication hot-spots** (debt): `pages/auth/AuthPage.jsx` vs `features/auth/AuthPage.jsx`; `pages/profile/ProfilePage.jsx` + `.bak` + `.bak2`; `pages/online/GamePage.jsx` vs `OnlineGamePage.jsx`; `store/useGameStore.js` (legacy) vs `useOnlineGameStore.js`.

---

## 4. Frontend Deep Dive

### 4.1 Routing (`App.jsx`)
- Public: `/auth` (and `/`, `/login`, `/register` redirect to it).
- Protected (token gate): `/home`, `/profile`, `/online/setup`, `/lobby/*`, `/game/online/:roomCode`.
- **Unprotected game routes**: `/offline/*` and `/bot/*` are deliberately open (no login needed for local play).
- **`ProtectedRoute`** (`App.jsx:38`) reads `localStorage.token` synchronously and checks it *looks* like a JWT (`startsWith('eyJ')`). It does **not** verify the token — only its shape — to avoid hydration flicker. Real validation happens on first API call.

### 4.2 Pages (purpose / flow / API / state)
- **AuthPage** (`pages/auth/`) — login/register/Google. Flow: form → `useAuthStore.login/register/googleLogin` → store token → init socket → navigate `/home`. State: `useAuthStore`.
- **HomePage** (`pages/home/`) — mode selection (Offline / Online Duel / VS Bot), opens `VsFriendModal` & `GameRulesModal`. Pure navigation container (Container/Presentation pattern, `HomePage.jsx:1`).
- **ProfilePage** — user stats, match history, friends list/requests. API: `/auth/profile`, `/friends/*`.
- **Offline SetupPage/GamePage** — 4-step wizard (config → P1 secret → handover → P2 secret) then `GameArena`. State: `useOfflineGameStore`. No API.
- **Bot SetupPage/GamePage** — config + player secret, then human vs `useBot`. State: `useBotGameStore` + `useBot` hook.
- **Online flow**:
  - `OnlineSetupPage` → choose format/digits/difficulty.
  - `CreateRoomPage`/`JoinRoomPage` → emit `create-room`/`join-room`.
  - `RoomWaitingPage`/`LobbyPage` → wait for opponent, host clicks Start (`start-game`).
  - `OnlineGamePage` (`pages/online/OnlineGamePage.jsx`) — the real container: drives SETUP (secret entry), PLAYING (`GameArena`), ROUND_OVER, GAME_OVER, ROOM_CLOSED states off `useOnlineGameStore`.

### 4.3 Component hierarchy (online game)
```
App
└─ OnlineGamePage (container, reads useOnlineGameStore)
   ├─ SecretEntryStep        (SETUP phase, reused from offline setup)
   ├─ Round/GameOver markup  (inline JSX, heavily styled)
   └─ GameArena              (PLAYING phase)
      ├─ MatchInfoPill / PlayerCard / TimerBar
      ├─ GameLogCard (list of guesses w/ Bulls/Cows/Miss)
      └─ GameInputDrawer (CyberNumpad / CyberDrumInput / HoloSphereInput)
```
Shared UI lives in `components/ui/` (Button, Modal, Input, Loader, ConfigSelector, Toast, custom inputs). Game presentation in `components/game/`. Lobby/social in `components/lobby/` (`GameInviteNotification`, `InviteFriendModal`, `VsFriendModal`).

### 4.4 Hooks
- **`useSocket`** — initializes/owns socket lifecycle, warms up server (`/health` ping), and **hard-redirects to `/auth`** on auth errors clearing the token (`useSocket.js:59`).
- **`useBot`** — holds candidate list in `useRef`, `makeMove(feedback)` returns a Promise resolving after a randomized "thinking" delay; first move uses optimal starters.
- **`useAuth`** — redirect guard (note: navigates to `/login`, a legacy path that re-redirects).

### 4.5 API integration & error handling
- All REST via the shared `api` axios instance. **401 → silent refresh → replay** with a `failedQueue` to coalesce concurrent refreshes (`api.js:51-114`). Auth endpoints are excluded from retry to avoid loops.
- Socket calls use **ack callbacks** with client-side **timeouts (20s)** to survive Render/Railway cold starts (`useOnlineGameStore.js:171`).
- Errors surface via `useToastStore` and per-page error states; the online store stores `error`/`connectionError`.

### 4.6 Form handling
- Manual controlled inputs (no form library). Secret entry validates length + uniqueness inline before emitting (`OnlineGamePage.jsx:106`). Custom widgets (numpad/drum/sphere) produce digit strings.

---

## 5. Backend Deep Dive

### 5.1 Express setup (`app.js`)
1. Custom CORS with env-driven allowlist; **dev allows all origins** (`app.js:21`).
2. Explicit `OPTIONS *` preflight handler.
3. `express.json`, `urlencoded`, `cookie-parser`.
4. `morgan('dev')` only when `NODE_ENV==='development'`.
5. Routes mounted: `/api/auth`, `/api/matches`, `/api/friends`. **`/health`** for warmup.
6. 404 + centralized error handler (leaks error object only in dev).

### 5.2 REST flow (example: friend request)
```
POST /api/friends/request {targetUid}
  → routes/friends.js (router.use(protect))
    → middleware/authMiddleware.protect  (verify Bearer, attach req.user)
      → friendController.sendRequest
        → friendService.sendFriendRequest(senderId, targetUid)
          → User.findOne / findById, mutate both docs, save() x2
        → 200 {success, message, targetUser}
```
**Auth sequence (REST):**
```
Client ──Bearer access token──► protect ──jwt.verify(JWT_SECRET)──► User.findById ──► req.user ──► controller
   on 401 ──► api.js interceptor ──POST /auth/refresh (cookie)──► new access token ──► replay original
```

### 5.3 Socket/game flow (the core engine)
**Connection & presence** (`socketManager.js`):
- `io.use` verifies JWT, loads user, attaches `socket.user`.
- On connect: add socket id to `userSockets.get(userId)` Set; if first connection → mark `isOnline:true`.
- On disconnect: remove socket; if Set empty → `isOnline:false`; if user was in an active game and has no remaining sockets → **opponent wins by forfeit** and `recordMatchResult(...,'disconnect-forfeit')`.

**Game lifecycle sequence (online match):**
```
Host: create-room ──► Room (Mongo, status 'waiting') ; socket.join(roomCode)
Guest: join-room  ──► Room.opponent set, status 'active' ; emits 'player-joined' to host
Host: start-game  ──► activeGames[roomCode] = {host,opponent,secrets:{},scores,...,status:'SETUP'}
                      io.to(room).emit('game-start')
Both: submit-secret ─► validate, store game.secrets[oderId]; emit 'opponent-ready'
       when both present ► status 'PLAYING', determineFirstPlayer(), emit 'match-start' (+timer if hard)
Turn: submit-guess ──► validate, calculateBullsAndCows(secret[opponent],guess)
                      push log, flip currentTurn, emit 'turn-result'
                      if isWin: updateScore; if hasWonMatch ► 'game-over' + recordMatchResult
                                else ► resetForNextRound + 'round-over'
Hard mode: timerManager ticks 'timer-tick'; on timeout skipTurn → 'turn-skipped'
```

**Key engine modules:**
- `roundManager.js`: `getWinsNeeded = ceil(format/2)`, `hasWonMatch`, `resetForNextRound` (loser starts next), `determineFirstPlayer` (random round 1, loser thereafter).
- `timerManager.js`: per-room `setInterval`, 30s, hard mode only; `skipTurn` flips turn.
- `gameHandler.recordMatchResult`: verifies both users exist, `$inc` stats, `$push` capped (`$slice:50`) matchHistory for both players, with a `matchRecorded` idempotency guard and heavy diagnostic logging.

### 5.4 Hidden assumptions in the backend
- **`activeGames` is the single source of truth** for a live match; if the process restarts mid-game, the game is lost (clients will time out / forfeit on reconnect).
- **`game.host.oderId`** is a deliberately misspelled key used consistently everywhere ("oderId" ≈ "user id"). It is *not* a bug per se but a pervasive naming smell.
- **One active game per room code**, and room codes are 4 chars from a 36-char alphabet (~1.68M combos) generated with `Math.random` and a DB uniqueness check (`roomService.js:4`).
- **Win attribution = the guesser who reaches `bulls===digits`** (`gameHandler.js:313`). Forfeit attribution = the non-leaving player.

---

## 6. MongoDB Analysis

### 6.1 Collections & schemas

**`users`** (`models/User.js`) — the central document.
| Field | Type | Notes |
|-------|------|-------|
| `uid` | String, unique | Public `#NNNN` (4-digit), generated with retry-on-collision (`User.js:140`). **Only ~9000 values** |
| `username` | String, unique | 3–20 chars, `[a-zA-Z0-9_]` |
| `email` | String, unique, lowercased | regex-validated |
| `password` | String, `select:false` | required unless `provider==='google'` (`User.js:39`); bcrypt hashed in service |
| `provider` | enum local/google | |
| `googleId` | String, sparse unique | |
| `stats` | `{totalGames,wins,losses}` | embedded counters |
| `friends` | `[ObjectId→User]` | adjacency list |
| `friendRequests` | `{incoming:[{from,status,createdAt}], outgoing:[{to,...}]}` | bidirectional duplication |
| `matchHistory` | `[{opponent,opponentName,result,score,format,digits,difficulty,playedAt}]` | capped at 50 via `$slice` |
| `isOnline` | Boolean | reset to false on server boot (`socketManager.js:29`) |
| timestamps | createdAt/updatedAt | |

**`rooms`** (`models/Room.js`) — online lobby. `roomCode` (4, uppercase, unique), `host`, `opponent`, `status` (waiting/active/completed/cancelled), `format` [1,3,5], `digits` [3,4], `difficulty` [easy,hard]. **TTL 1h** on `createdAt`.

**`refreshtokens`** (`models/RefreshToken.js`) — `user`, `token`, `expiresAt`, `isRevoked`. TTL on `expiresAt`; indexes on `token` and `user`.

**`matches`** (`models/match.js`) — overlaps with Room (`roomId`, `host`, `guest`, `mode`, `format`, `status`, `difficulty`, TTL 1h). **Created by no live code path** — vestigial.

### 6.2 Relationships
```
User ──friends[]──────────────► User      (many-to-many adjacency list, bidirectional)
User ──friendRequests.in/out──► User      (embedded refs)
User ──matchHistory.opponent──► User      (embedded denormalized: opponentName cached)
Room ──host / opponent────────► User
RefreshToken ──user───────────► User
Match (unused) ──host/guest───► User
```

### 6.3 Indexes & validation
- Unique indexes: `users.uid`, `users.username`, `users.email`, `users.googleId(sparse)`, `rooms.roomCode`, `matches.roomId`.
- TTL: rooms/matches (1h), refresh tokens (at expiry).
- **Missing**: no index on `users.friends`, no compound indexes for friend lookups. Search uses **unanchored `$regex`** on username (`friendService.js:26`) — non-indexed scan.

### 6.4 Usage across the app
- `users` touched by: auth (register/login/profile), friends (all ops), socket presence, match recording. It is a **God document** — auth + social + stats + history all embedded.

---

## 7. Authentication & Authorization

### 7.1 Registration flow
```
POST /api/auth/register {username,email,password}
 → authService.register: check email/username unique → bcrypt.hash(10)
   → User.create → generateAccessToken(15m) + createRefreshToken(30d, stored in DB)
 → controller sets httpOnly refreshToken cookie + returns {user, accessToken}
```

### 7.2 Login flow
```
POST /api/auth/login {email,password}
 → User.findOne(email).select('+password') → bcrypt.compare
 → issue access+refresh → set cookie → return access token
```

### 7.3 JWT lifecycle
- **Access**: `jwt.sign({id}, JWT_SECRET, 15m)` (`tokenGenerator.js:4`). Stored in `localStorage` on the client.
- **Refresh**: `jwt.sign({id}, JWT_REFRESH_SECRET, 30d)`; persisted in `refreshtokens` and as httpOnly cookie. Verified + checked for existence/revocation/expiry on refresh (`authService.js:111`).
- Client refreshes **proactively every 10 min** (`useAuthStore.js:183`) and **reactively on 401** (`api.js`).

### 7.4 Session handling & protected routes
- **REST**: `protect` middleware requires `Authorization: Bearer`; loads `req.user`.
- **Socket**: `io.use` requires `handshake.auth.token`.
- **Client route guard**: `ProtectedRoute` (shape-only token check). Offline/bot routes intentionally unguarded.

### 7.5 Google OAuth sequence
```
Client (Google button) ──idToken──► POST /api/auth/google
 → google-auth-library verifyIdToken(audience=GOOGLE_CLIENT_ID)
 → find by googleId → else link by email → else create google user (unique username gen)
 → issue access+refresh, set cookie
```

### 7.6 RBAC
- **No roles.** Authorization is **ownership-based** only: host-only checks for invites/start-game (`matchController.js:80`, `lobbyHandler.js:75`), self-checks in friends. No admin role; the `scripts/resetMatchData.js` admin op is a manual CLI run, not an endpoint.

### 7.7 Security quality of auth (summary; full review in §12)
- **Good**: bcrypt(10), httpOnly+secure+sameSite cookie in prod, refresh-token revocation list, server-side Google verification, password `select:false`.
- **Concerns**: access token in `localStorage` (XSS-exposable); **refresh tokens are not rotated** on use (same token reused for 30d); no rate limiting on login; `JWT_REFRESH_SECRET` falls back to `JWT_SECRET` if unset (`tokenGenerator.js:12`).

---

## 8. API Documentation

> All protected routes require `Authorization: Bearer <accessToken>`. Refresh uses the httpOnly cookie. Base path `/api`.

### Auth — `/api/auth`
| Method | Route | Auth | Body / Params | Success | Errors |
|--------|-------|------|---------------|---------|--------|
| POST | `/register` | public | `{username,email,password}` | 201 `{_id,uid,username,email,accessToken}` + cookie | 400 email/username taken |
| POST | `/login` | public | `{email,password}` | 200 same shape + cookie | 401 invalid creds |
| POST | `/google` | public | `{idToken}` | 200 same shape + cookie | 400 no token / 401 google fail |
| POST | `/refresh` | cookie | — | 200 `{accessToken}` | 401 expired/invalid |
| GET | `/profile` | private | — | 200 user (no password) | 404 |
| POST | `/logout` | private | — (cookie) | 200 message; clears cookie | 500 |

### Friends — `/api/friends` (all private)
| Method | Route | Body/Query | Success | Errors |
|--------|-------|-----------|---------|--------|
| GET | `/search?q=` | q≥2 chars | 200 `[{uid,username,isOnline,stats…}]` (≤10) | 400 too short |
| GET | `/` | — | 200 friends[] (populated) | 400 |
| GET | `/requests` | — | 200 `{incoming[],outgoing[]}` | 400 |
| GET | `/user/:uid` | — | 200 public profile | 404 |
| GET | `/profile/:userId` | — | 200 profile + `{isFriend,hasPendingRequest,hasIncomingRequest,isSelf}` | 404 |
| POST | `/request` | `{targetUid}` | 200 (auto-accepts if reciprocal) | 400 self/dup/exists |
| POST | `/accept` | `{requesterId}` | 200 `{friend}` | 400 not found |
| POST | `/reject` | `{requesterId}` | 200 | 400 |
| POST | `/cancel` | `{targetId}` | 200 | 400 |
| DELETE | `/:friendId` | — | 200 | 400 |

### Matches — `/api/matches` (all private)
| Method | Route | Body/Params | Success | Errors |
|--------|-------|------------|---------|--------|
| POST | `/create` | `{format,digits,difficulty}` | 201 `{success,roomCode,roomId}` | 500 |
| POST | `/join` | `{roomCode}` | 200 `{matchData}` | 404 not found / 400 full/own |
| POST | `/invite` | `{friendId,roomCode}` | 200 (emits `match-invite`) | 403 not host / 400 full / 404 |
| GET | `/:roomId` | — (roomCode) | 200 `{matchData}` | 404 |

> Note REST `create`/`join` (`roomService`) **duplicate** the socket `create-room`/`join-room` paths. The live app uses the **socket** versions; the REST match routes appear legacy/secondary.

### Socket.IO events (see also `WEBSOCKET_EVENTS.md`)
**Client → Server (ack callbacks):** `create-room`, `join-room`, `start-game`, `leave-room`, `get-room`, `game-init`, `submit-secret`, `submit-guess`, `room-message`, `player-ready`, `send-game-invite`, `decline-game-invite`.
**Server → Client:** `player-joined`, `player-left`, `room-closed`, `game-start`, `opponent-ready`, `match-start`, `turn-result`, `timer-tick`, `turn-skipped`, `round-over`, `game-over`, `room-message`, `game-invite`, `match-invite`, `invite-declined`.

---

## 9. Business Logic Analysis

### 9.1 Domain entities
**User**, **Room** (lobby), **Game** (ephemeral in-RAM), **Round**, **Match** (best-of series), **FriendRequest**, **MatchHistory entry**.

### 9.2 Core business rules
- **Secret/guess validity** (`gameRules.validateInput`): exactly N digits (3 or 4), numeric, **all unique**.
- **Bulls/Cows/Shit**: bulls = same digit+position; cows = digit present elsewhere; shit = N−bulls−cows; win when bulls===N (`gameRules.calculateBullsAndCows`).
- **Best-of-N**: wins needed = `ceil(N/2)` (`roundManager.getWinsNeeded`). Round loser starts next round; first round random.
- **Turn alternation** with server as authority; only `currentTurn` user may guess (`gameHandler.js:267`).
- **Hard mode**: 30s/turn; timeout skips turn (no penalty beyond losing the turn).
- **Forfeit**: leaving (`leave-room`) or fully disconnecting from an active SETUP/PLAYING game → opponent wins; recorded with reason tag.
- **Stats**: only **online** matches update `stats`/`matchHistory` (offline/bot are not persisted).
- **Friend reciprocity**: sending a request to someone who already requested you **auto-accepts** (`friendService.js:76`).

### 9.3 How requirements map to code
| Requirement | Implementation |
|-------------|----------------|
| Authoritative scoring | server computes Bulls/Cows; secrets stay in `activeGames` |
| No cheating in online | client never receives opponent secret; only feedback |
| Resilience to drops | disconnect/leave forfeit + idempotent `recordMatchResult` |
| Quick rematch | client `resetState`/`playAgain`; rooms TTL-expire |
| Social play | friends graph + socket invites + presence |

### 9.4 Edge cases handled
- Duplicate match recording prevented via `game.matchRecorded` (`gameHandler.js:27`).
- Multi-tab presence (a user with 2 tabs stays online until both close).
- Reconnection: `game-init` returns current game snapshot.
- UID collisions retried up to 10 times.

### 9.5 Edge cases **not** handled
- Both players disconnecting simultaneously (race in the disconnect loop).
- Server restart mid-game (state lost; no rehydration from Mongo).
- A guess submitted exactly as the timer fires (timer + guess race; no lock).
- Identical secrets allowed (both can pick the same number — by design, fine for the game).

---

## 10. Frontend ↔ Backend Communication

### 10.1 Channels
- **REST (axios)** for auth, profile, friends, and the secondary match endpoints.
- **WebSocket (socket.io)** for all real-time gameplay and invites/presence.

### 10.2 Data contracts (representative)
- **Login response**: `{_id, uid, username, email, accessToken}` + httpOnly `refreshToken` cookie.
- **`turn-result`**: `{player, playerName, guess, bulls, cows, shit, guessNumber, timestamp, nextTurn}`.
- **`game-over`**: `{winner, winnerName?, reason?, finalScores:{[id]:n}, hostId, opponentId}`.
- **`game-start`**: `{roomId, roomCode, format, digits, difficulty, host, opponent}`.

### 10.3 Request lifecycle (online guess)
```
GameArena.onGuess(guess)
 → useOnlineGameStore.sendGuess → socket.emit('submit-guess',{roomCode,guess}, ack)
   → server validates turn + computes result → emits 'turn-result' to room
 → store 'turn-result' listener splits into myLogs/opponentLogs, flips turn, resets timer
 → OnlineGamePage re-renders GameArena with combinedLogs (sorted by guessNumber)
```

### 10.4 Error & loading strategy
- REST: interceptor handles 401 refresh; component try/catch → toast.
- Socket: ack callbacks + 20s client timeouts; `connection_error` surfaces via store; auth errors force re-login (`useSocket.js`).
- Loading: per-page booleans (`loading`) and a global app-init spinner (`App.jsx:74`).

### 10.5 Identity mapping caveat
The online store derives "me vs opponent" by comparing the **auth store user `_id`** (string-cast) against IDs in socket payloads (`useOnlineGameStore.js:463`). This is robust, but the **legacy `useGameStore` uses `socket.id`** as identity — a bug class that motivated the rewrite into `useOnlineGameStore`.

---

## 11. State Management Analysis

### 11.1 Global vs local
- **Global (Zustand)**: auth/session, online game, offline game, bot game, toasts.
- **Local (useState/useRef)**: form inputs, secret entry buffers, bot candidate set (`useBot`), submit flags.
- **Persisted**: only `useAuthStore` via `persist` middleware, **partialized** to `{user, isAuthenticated}` (token deliberately kept in raw `localStorage`, `useAuthStore.js:363`).

### 11.2 Data-flow patterns
- **Socket-driven reducers**: `useOnlineGameStore.setupListeners` is effectively a set of event reducers mutating store slices; pages are thin renderers of store state (good unidirectional flow).
- **Command actions** return ack results via callbacks (createRoom/joinRoom/sendGuess), bridging imperative socket I/O into the store.

### 11.3 Maintainability evaluation
- **Pros**: clear store-per-mode boundaries; minimal prop drilling; listeners centralized.
- **Cons**: `useOnlineGameStore` is **770 lines** with substantial defensive score-reconciliation logic (`round-over`/`game-over` recompute scores three different ways — `useOnlineGameStore.js:599-618`), indicating past bugs in ID/score mapping. Two parallel online stores (`useGameStore` legacy + `useOnlineGameStore`) is confusing. `constants.js` has stale values (ROOM_CODE_LENGTH=6 vs actual 4).

---

## 12. Security Review

Findings ranked by severity.

### CRITICAL
- **C1 — Access token in `localStorage` (XSS token theft).** `api.js`/`useAuthStore` store the JWT in `localStorage`; any XSS can exfiltrate it. The httpOnly refresh cookie is safe, but a stolen 15-min access token is exploitable. *Mitigation: keep the access token in memory only; rely on the httpOnly refresh cookie + silent refresh.*

### HIGH
- **H1 — No rate limiting / brute-force protection** on `/login`, `/register`, `/refresh`, or socket auth. Credential stuffing is unimpeded. *Mitigation: `express-rate-limit` + account lockout/backoff.*
- **H2 — Refresh tokens are not rotated.** The same 30-day refresh token is reused on every refresh (`authService.refreshAccessToken` issues only a new access token). A leaked refresh token is valid for 30 days. *Mitigation: rotate + reuse-detection.*
- **H3 — `JWT_REFRESH_SECRET` silently falls back to `JWT_SECRET`** (`tokenGenerator.js:12`). If misconfigured, access and refresh tokens share a secret. *Mitigation: fail fast if unset.*
- **H4 — Permissive CORS in non-production** (`app.js:21`, `socketManager.js:54`) allows **all origins**. If a staging deploy runs without `NODE_ENV=production`, it's open. *Mitigation: explicit allowlist in all envs.*

### MEDIUM
- **M1 — Weak / inconsistent input validation on REST.** `validationMiddleware.js` exists but **is not wired into any route**; it also hard-codes 4-digit guesses. Friend/match bodies are trusted. *Mitigation: adopt `zod`/`joi` schemas per route.*
- **M2 — No CSRF protection** despite cookie-based refresh with `sameSite:'none'` in prod. *Mitigation: CSRF token or `sameSite:'lax'` where feasible.*
- **M3 — Verbose error logging leaks token** (`authMiddleware.js:26` logs the failing token) and stack traces; in dev the error handler returns the full error object. *Mitigation: redact; never log tokens.*
- **M4 — UID space is tiny** (`#1000–#9999`, ~9000 users) and is also used as a friend-add identifier; enumeration is trivial and collisions force registration failures at scale. *Mitigation: larger UID / different friend-code scheme.*
- **M5 — No payload size / flood limits on socket events**; a client can spam `room-message`/`submit-guess`. *Mitigation: per-socket rate limiting.*

### LOW
- **L1 — Username search uses unanchored regex** (`friendService.js:26`) with no escaping of regex metachars in `q`; enables broad enumeration. *Mitigation: escape input, anchor, or use a text index.*
- **L2 — Password policy minimal** (≥6 chars, no complexity).
- **L3 — `console.log` PII/identifiers** throughout socket handlers (usernames, IDs) — noisy and privacy-adjacent in production.

### Positive controls present
bcrypt(10); httpOnly+secure+sameSite cookie; refresh revocation list; server-side Google token verification; secrets never sent to clients; `.env` correctly gitignored and not tracked (verified).

---

## 13. Performance Review

### Frontend
- **Bundle**: manual chunks (`vendor/state/socket`) + terser minify — reasonable.
- **Re-renders**: `OnlineGamePage` consumes the whole store object (`useOnlineGameStore()` without selectors), so **every store update re-renders the page** and `GameArena`. `combinedLogs` is memoized (`OnlineGamePage.jsx:81`), which helps, but selector-based subscriptions would cut renders — important under rapid `timer-tick`.
- **Bot compute**: `generateAllCombinations(4)` = 5040 perms generated **twice** on hook init (ref + state, `useBot.js:24-25`); `pickHardGuess` is O(candidates²) but capped (≤500 eval, slice 300). The first hard-mode move over 5040 candidates can briefly block the main thread.

### Backend
- **Game state in RAM** = sub-ms reads/writes for live play (intended, fast).
- **DB queries**: friend ops do **multiple sequential `findById` + `save`** (N round-trips, non-atomic). `recordMatchResult` does 2 updates + 2 read-backs (4 queries) plus verification logging on the hot win path.
- **Search**: unindexed `$regex` scan on `users.username`.
- **Presence**: `updateMany({}, {isOnline:false})` on every boot — full-collection write at large scale.

### Database
- TTL + unique indexes are sensible. Missing indexes for friend/search scans. `matchHistory` capped at 50 (good).

### Bottlenecks (ranked)
1. Single-process in-memory `activeGames` (throughput ceiling, no HA).
2. Whole-store subscriptions in online pages (render churn under rapid `timer-tick`).
3. Sequential, non-atomic multi-doc friend writes.
4. Hard-mode minimax first move (transient CPU spike).

---

## 14. Scalability Assessment

### Current ceiling
The app is **vertically scalable only**. The hard blocker is `activeGames` + `userSockets` + `activeTimers` living in **one Node process's memory** (`socketManager.js`, `timerManager.js`). Two backend instances behind a load balancer require:
- a **shared adapter** (e.g., `socket.io-redis-adapter`) for cross-instance event routing,
- **externalized game state** (Redis) so any instance can serve any room, and
- **sticky sessions or full state sharing** for reconnections.

### Growth dimensions
- **More users**: `users` is a God document; embedded friend arrays degrade for power users (large arrays bloat the doc and every `findById`). UID space (~9000) **breaks** well before that.
- **More data**: matchHistory capped (good); rooms/matches TTL-expire (good).
- **More API traffic**: no caching layer; profile/friends hit Mongo every time.
- **More concurrent games**: each hard-mode game holds a `setInterval`; thousands of timers in one process adds GC/scheduler pressure.

### Future risks
- Cold starts already require 20s client timeouts and warmup pings — a symptom of serverless-ish hosting fighting a stateful socket server.
- A single crash forfeits **all** in-flight matches.

---

## 15. Code Quality Assessment

| Dimension | Score (/10) | Justification |
|-----------|-------------|---------------|
| Folder structure | 7 | Clean layered backend; feature-grouped frontend. Lost points: duplicate `features/` vs `pages/`, `.bak` files, unmounted routes. |
| Naming conventions | 5 | Pervasive `oderId` misspelling; "shit" as a domain term; mixed `match`/`room` naming. Otherwise readable. |
| Reusability | 7 | Shared `ui/` library, reused `SecretEntryStep` across modes, shared `gameRules` (but duplicated front/back). |
| Separation of concerns | 8 (backend) / 6 (frontend) | Backend services/controllers clean. Frontend mixes large inline JSX result screens in `OnlineGamePage` and defensive logic in stores. |
| Design patterns | 7 | Container/Presentation (HomePage), service layer, store-as-reducer, minimax strategy. |
| Technical debt | 4 | See §18 — significant dead/duplicate code, no tests, env drift in constants/docs. |
| Consistency | 6 | Two online stores, two room models, REST vs socket duplication. |

**Overall: ~6/10** — a solid, working, thoughtfully-built app with real engineering (authoritative server, real AI, refresh tokens) held back by missing tests, duplication, and single-instance state.

---

## 16. Testing Analysis

### Existing tests
**None.** `Backend/package.json:9` test script is the npm default error stub. No `*.test.js`, no test runner, no CI test step. `Backend/test-server.js` is an untracked manual scratch file, not a test.

### Highest-value missing tests (recommended priority)
1. **`gameRules.calculateBullsAndCows`** (both copies) — pure, critical, trivially unit-testable. Table-driven: duplicates, all-bulls, all-miss, 3 vs 4 digits.
2. **`roundManager`** — `getWinsNeeded`, `hasWonMatch`, `determineFirstPlayer` (loser-starts), `resetForNextRound`.
3. **`botLogic`** — `filterCandidates` correctness, `pickHardGuess` reduces candidate set monotonically.
4. **`authService`** — register dedupe, login compare, refresh revocation/expiry, Google account linking.
5. **`friendService`** — reciprocal auto-accept, bidirectional add/remove, duplicate-request rejection.
6. **Socket integration** — full match flow with two mock clients (create→join→start→secrets→guesses→game-over→stats recorded once).
7. **Frontend**: `useOnlineGameStore` reducers (turn-result split, score reconciliation), `ProtectedRoute` token-shape logic, axios refresh-queue.

### Recommended stack
- Backend: **Vitest/Jest** + **mongodb-memory-server** + **socket.io-client** for integration; **supertest** for REST.
- Frontend: **Vitest + React Testing Library**; mock socket.
- Add a **CI pipeline** (GitHub Actions) running lint + tests on PR.

### Coverage targets
Get pure logic (`gameRules`, `roundManager`, `botLogic`) to ~100% first; these encode the actual game and are currently the riskiest untested surface.

---

## 17. Deployment & DevOps Analysis

### Environment variables
**Backend** (`.env.example`): `NODE_ENV`, `PORT`, `MONGO_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_URL` (comma-sep allowlist), `GOOGLE_CLIENT_ID`, optional `JWT_ACCESS_EXPIRE`/`JWT_REFRESH_EXPIRE`.
**Frontend** (`.env`/`.env.production`): `VITE_API_URL`, `VITE_SOCKET_URL`, `VITE_GOOGLE_CLIENT_ID`. Prod points at `https://bullscows-production.up.railway.app`.

### Build & deploy
- **Backend**: Railway, NIXPACKS builder, `npm start` (`railway.json`). Healthcheck path `/` — note: the app's real health route is `/health`; root returns 404 from the catch-all, so the `railway.json` healthcheck may be misconfigured.
- **Frontend**: Vite build → `dist/`; SPA rewrite configured for **Vercel** (`vercel.json`), **Render** (`render.yaml`), and `_redirects`. Multiple hosts supported simultaneously (some leftover).
- **Service worker** caches the shell for PWA/offline.

### CI/CD
- **No CI/CD pipeline** in the repo (no `.github/workflows`). Deploys are platform-triggered on push. No automated lint/test gate.

### Deployment diagram
```
git push ──► Railway (backend, NIXPACKS, npm start) ──► MongoDB Atlas
        └──► Vercel/Render (frontend static build) ──► serves SPA
Frontend .env.production hard-points VITE_*_URL at Railway backend
CORS allowlist (CLIENT_URL) must include the frontend origin
```

### DevOps gaps
- No containerization (no Dockerfile / compose) — deployment is platform-managed.
- No structured logging/metrics/error tracking (only `console.*`).
- Healthcheck path mismatch (`/` vs `/health`).

---

## 18. Technical Debt Report

### CRITICAL
- **No tests + no CI** — game scoring, auth, and the stats write-path are unverified.
- **Single-instance in-memory game state** — blocks HA and horizontal scale; a restart loses all live games.

### HIGH
- **Security items C1/H1–H4** from §12 (localStorage token, no rate limiting, no refresh rotation, secret fallback, permissive dev CORS).
- **Duplicate/divergent source**: `features/auth/AuthPage.jsx` vs `pages/auth/AuthPage.jsx`; `ProfilePage.jsx(.bak/.bak2)`; `pages/online/GamePage.jsx` vs `OnlineGamePage.jsx`; `store/useGameStore.js` (legacy) vs `useOnlineGameStore.js`. Risk of editing the wrong file.
- **Two overlapping room models** (`Room` used, `Match` vestigial) + **REST match endpoints duplicating socket lobby logic**.

### MEDIUM
- **Unmounted `routes/user.js`** (dead endpoints) and **unused `validationMiddleware.js`**.
- **`constants.js` drift** (ROOM_CODE_LENGTH=6, ROUTES that don't match `App.jsx`, API_ENDPOINTS pointing to non-existent paths).
- **Healthcheck path mismatch** in `railway.json`.
- **Tiny UID space** used as a public friend identifier.
- **Defensive triple-computation of scores** in the online store signals an unresolved root-cause around ID mapping.

### LOW
- **Naming**: `oderId` typo everywhere; `shit` as a domain field; `myoderId`.
- **Verbose production `console.log`** with identifiers/usernames.
- **Doc drift**: large `.md` set may not match current code.
- `useAuth.js` redirects to legacy `/login`.

---

## 19. Version 2 Brainstorming

### Product improvements
- **Persistent matchmaking & quick-play queue** (ELO-based) instead of manual room codes only.
- **Spectator mode** and **shareable replays** (you already log every guess server-side).
- **Tournaments / brackets** (the unused `Match.mode:'tournament'` hints this was intended).
- **Finish chat** (`room-message` exists, no UI) with moderation.
- **Achievements, streaks, leaderboards** off the existing stats.
- **Variable digit lengths / repeated-digit variant / time-attack** modes.
- **Bot difficulty curve** + "hint" economy for casual players.
- **Push notifications** (PWA) for invites and "your turn".

### Frontend improvements
- **Selector-based Zustand subscriptions** to kill re-render churn under `timer-tick`.
- **Delete the legacy store/duplicate pages**; one canonical online store/page.
- **Extract result screens** (Round/GameOver) from `OnlineGamePage` into components; it's 530+ lines of mostly JSX.
- **TypeScript** end-to-end to eliminate the ID-mapping defensive code (typed event contracts).
- **Shared types/contracts package** for socket events.
- **React Query** for REST caching of profile/friends.
- **Code-split** game modes; move minimax to a Web Worker.

### Backend improvements
- **Externalize game state to Redis**; make handlers stateless. Add `socket.io-redis-adapter`.
- **Schema validation layer** (`zod`) at every REST and socket boundary; delete ad-hoc validators.
- **Move scoring/round logic into a tested domain module** shared with the client (one `@bulls/game-core` package).
- **Idempotent, transactional match recording** (Mongo transactions or a dedicated `matches` write).
- **Structured logging** (pino) + request IDs; remove token/PII logs.
- **Rate limiting** (REST + socket) and **refresh-token rotation with reuse detection**.
- **Collapse `Room`/`Match`** into one model; finish or remove tournament scaffolding.

### Database improvements
- **Split the User God-document**: separate `friendships`/`friend_requests` collections to bound document growth and enable atomic edge ops + indexing.
- **Persist live games** (`games` collection) so a restart can rehydrate and reconnection is reliable.
- **Bigger UID / dedicated friend-code** (base32, 6–8 chars) with a unique index.
- **Text index** on username for search; index friend edges.
- **Leaderboard** via materialized view or Redis sorted set.

### Security improvements
- Access token in memory; httpOnly refresh cookie only; **rotation + reuse detection**.
- **Rate limiting + lockout**, CAPTCHA on abuse, audit log for auth events.
- **CSRF** mitigation for cookie endpoints; strict CORS in all envs.
- **Helmet**, payload size limits, socket flood control.
- Fail-fast on missing secrets; per-env secret management.

### Scalability improvements
- **Redis** for: socket adapter, presence, game state, leaderboards, rate limits.
- **Queue** (BullMQ) for async stats/history writes and notifications off the hot path.
- **Event-driven**: emit `match.completed` events → workers update stats, achievements, leaderboards.
- **Horizontal scaling** once state is in Redis; autoscale the socket tier.
- **Dedicated timer service** (or Redis-backed timers) instead of per-process `setInterval`.

---

## 20. Future Architecture Proposal

### 20.1 Target architecture
```
                         ┌────────────── CDN (static SPA, PWA) ──────────────┐
        Users ──────────►│  React + TypeScript + Vite (selector stores,      │
                         │  React Query, shared @game-core + @contracts)     │
                         └───────────────┬───────────────────────────────────┘
                                         │ HTTPS / WSS
                         ┌───────────────▼───────────────────────────────────┐
                         │            API Gateway / LB (sticky-free)          │
                         └───────┬───────────────────────────┬───────────────┘
                                 │                           │
                   ┌─────────────▼─────────┐     ┌───────────▼───────────────┐
                   │  REST service (Express │     │  Realtime service (Socket  │
                   │  /Fastify, zod, helmet,│     │  .IO + redis-adapter,      │
                   │  rate-limit, JWT)      │     │  stateless handlers)       │
                   └───────┬────────────────┘     └─────┬──────────────┬───────┘
                           │                            │              │
                   ┌───────▼────────┐         ┌─────────▼───┐   ┌──────▼───────┐
                   │   MongoDB      │         │   Redis     │   │  Worker pool │
                   │ users,         │◄────────┤ game state, │   │ (BullMQ):    │
                   │ friendships,   │         │ presence,   │   │ stats,       │
                   │ games, matches │         │ adapter,    │   │ history,     │
                   │ leaderboards   │         │ ratelimit   │   │ notifications│
                   └────────────────┘         └─────────────┘   └──────────────┘
```

### 20.2 Recommended technologies
- **Language**: TypeScript everywhere; shared `@bulls/contracts` (socket event types) and `@bulls/game-core` (rules, scoring, bot — one tested implementation).
- **Backend**: Express (or Fastify) + `zod` + `helmet` + `express-rate-limit`; Socket.IO with `@socket.io/redis-adapter`.
- **Data**: MongoDB (split collections) + **Redis** (state/presence/adapter/leaderboards) + **BullMQ** workers.
- **Auth**: in-memory access token, rotating refresh tokens, optional passkeys later.
- **Infra**: Docker images, a platform with persistent long-lived containers (avoid cold starts for the socket tier); GitHub Actions CI (lint + test + build + deploy).
- **Observability**: pino logs, OpenTelemetry traces, Sentry, Prometheus/Grafana.

### 20.3 Migration strategy (incremental, low-risk)
1. **Stabilize**: add tests around `gameRules`/`roundManager`/`authService`; delete dead/duplicate files; fix healthcheck. *(No behavior change.)*
2. **Extract `@game-core`**: unify the two `gameRules.js` and round logic; both client and server import it.
3. **Introduce contracts + TypeScript** incrementally (start with socket payloads); remove defensive ID/score code.
4. **Add Redis as game-state store** behind the existing handlers (adapter pattern), API identical; verify single-instance.
5. **Make handlers stateless** and turn on the Redis adapter; deploy a second instance.
6. **Offload writes to workers** (stats/history/notifications) via BullMQ; make match recording transactional/idempotent.
7. **Data migration**: split `friends`/`friendRequests` into `friendships`; add `games` persistence; widen UID/friend-code with a backfill script (reuse `scripts/` pattern).
8. **Harden**: rate limiting, refresh rotation, CSRF, helmet, strict CORS; move access token to memory.

### 20.4 Risks & tradeoffs
- **Stateful→stateless socket** is the riskiest step; mitigate with feature flags, shadow traffic, reconnection tests.
- **Splitting the User document** requires reversible migrations and dual-read/dual-write during cutover.
- **Redis introduces a new failure domain**; needs HA or graceful degradation to single-instance mode.
- **TypeScript migration** is effort-heavy but removes the current class of ID-mapping bugs.
- **Tradeoff**: more infra (Redis, workers, CI) raises operational cost — justified only at real concurrent scale; for a portfolio/hobby scope, steps 1–3 alone deliver most of the quality win.

### 20.5 Implementation roadmap
| Phase | Goal | Exit criteria |
|-------|------|---------------|
| 0 (1–2 wk) | Hygiene + tests | Dead code removed, core logic ≥90% covered, CI green |
| 1 (2–3 wk) | Shared core + contracts + partial TS | One game-rules impl, typed socket events |
| 2 (2–4 wk) | Redis-backed state, stateless handlers | 2 instances run a match correctly |
| 3 (2–3 wk) | Workers + transactional stats + persistence | Restart mid-game recovers; stats exactly-once |
| 4 (2 wk) | Security hardening | Rate limits, rotation, CSRF, helmet, memory token |
| 5 (ongoing) | Product features | Matchmaking, leaderboards, tournaments, chat |

---

### Appendix A — Key file reference index
- Auth: `Backend/services/authService.js`, `controllers/authController.js`, `middleware/authMiddleware.js`, `utils/tokenGenerator.js`, `Frontend/src/store/useAuthStore.js`, `services/api.js`.
- Realtime engine: `Backend/sockets/{socketManager,lobbyHandler,gameHandler,roundManager,timerManager}.js`, `Frontend/src/store/useOnlineGameStore.js`, `services/socket.js`, `hooks/useSocket.js`.
- Game rules/AI: `Backend/utils/gameRules.js`, `Frontend/src/utils/{gameRules,botLogic}.js`, `hooks/useBot.js`.
- Data: `Backend/models/{User,Room,RefreshToken,match}.js`.
- Social: `Backend/services/friendService.js`, `controllers/friendController.js`, `routes/friends.js`.
- Deploy: `Backend/railway.json`, `Frontend/{vercel.json,render.yaml,vite.config.js}`, `.env*` (gitignored).

### Appendix B — Glossary of in-codebase terms
- **`oderId`**: (typo for) a user's MongoDB `_id` string, used as the in-game player key.
- **"shit"**: count of guessed digits not present in the secret (misses); = digits − bulls − cows.
- **`activeGames`**: in-RAM map (room code → live game state) — the authoritative live-match store.
- **Format**: best-of-N (1/3/5); **wins needed** = ceil(N/2).
