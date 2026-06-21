# PROJECT RESUME REFERENCE

> A comprehensive technical reference for the **Bulls & Cows** multiplayer game project.
> Built by reading the actual source code in this repository. Every claim below is grounded
> in real files; where something is *inferred* rather than directly visible, it is marked
> **(Inferred)**.

---

## 1. Project Overview

### Project Name
**Bulls & Cows** — a real-time, multiplayer code-breaking number game.
(Package names: `bulls-cows-backend`, `bulls-cows-frontend`.)

### Problem it solves
Bulls & Cows is a classic deduction game where each player secretly picks a number with
unique digits, and players take turns guessing the opponent's number. After each guess the
guesser is told:
- **Bulls** — correct digit in the correct position.
- **Cows** — correct digit in the wrong position.
- **Shit** (the project's term for misses) — digits not present in the secret at all.

The project turns this pen-and-paper game into a polished web application supporting
**three distinct play modes**, real-time online matchmaking, a friend system, ranked-style
match history, and an AI bot opponent — solving the problem of *"I want to play Bulls & Cows
with a friend remotely, against a computer, or pass-and-play on one device."*

### Target users
Casual gamers and puzzle enthusiasts who want a quick, competitive number-deduction game
playable on desktop or mobile (the frontend is a PWA — installable, with a service worker).

### High-level workflow
1. User registers / logs in (email+password **or** Google OAuth).
2. From the home page, user chooses a mode:
   - **Offline (pass-and-play)** — two humans share one device.
   - **Bot** — single player vs an AI opponent (Easy "SURVIVOR" / Hard "DOMINATOR").
   - **Online 1v1** — create or join a room (4-char code), or invite a friend.
3. In online mode, both players submit secret numbers, then alternate guesses in real time
   over WebSockets until someone cracks the opponent's secret.
4. Best-of-N formats (1/3/5) decide the match; results update each player's win/loss stats
   and match history.

### Major features
- **Authentication**: JWT access tokens + refresh tokens (httpOnly cookie), Google Sign-In.
- **Three game modes**: offline local, vs-bot (client-side AI), online real-time 1v1.
- **Real-time multiplayer** via Socket.IO (rooms, turns, timers, disconnect handling).
- **Friend system**: search by username/UID, send/accept/reject/cancel requests, unfriend.
- **Game invites**: invite online friends to a room via real-time notification.
- **Match formats**: Best of 1 / 3 / 5; 3 or 4 digit secrets; Easy / Hard difficulty.
- **Hard mode turn timer**: 30-second server-authoritative countdown with auto-skip.
- **Forfeit handling**: disconnect or leave during an active game gives the opponent the win.
- **Stats & match history**: persisted per user (last 50 matches kept).
- **PWA**: installable, offline shell caching via service worker.

### Current development status
Actively developed / near-complete but **not production-hardened**. Evidence from the repo:
- Heavy `console.log` instrumentation in the game/record code paths (debugging in progress).
- Backend `package.json` test script is a placeholder (`"Error: no test specified"`) — **no automated tests**.
- Several **untracked / WIP files** in git status: `routes/user.js` (defined but **not mounted**
  in `app.js`), `models/match.js` (a `Match` model that exists but the active code uses
  `Room` instead), `test-server.js`, and `ProfilePage.jsx.bak` / `.bak2` backups.
- Multiple deployment configs present (Railway, Render, Vercel) suggesting deployment was iterated on.

---

## 2. Tech Stack

### Frontend
- **Framework**: React 18 (`react`, `react-dom` ^18.2) with JSX, built by **Vite 4**.
- **Language**: JavaScript (ES Modules, `"type": "module"`). No TypeScript (only `@types`
  dev deps are present, but source is `.jsx`/`.js`).
- **State Management**: **Zustand 4** (`zustand`) — multiple domain stores, with the
  `persist` middleware for auth.
- **Routing**: **React Router DOM 6** (`react-router-dom`) — `BrowserRouter` with a custom
  `ProtectedRoute` wrapper.
- **HTTP client**: **Axios** with request/response interceptors (token injection + auto-refresh).
- **Real-time**: **socket.io-client 4**.
- **Auth UI**: **@react-oauth/google** (`GoogleOAuthProvider`, Google Sign-In).
- **Styling/UI**: **Tailwind CSS 3** (custom neon/cyber theme in `tailwind.config.js`),
  PostCSS, Autoprefixer. No component library — UI is hand-built (`src/components/ui/*`).
- **PWA**: custom service worker (`public/sw.js`) + `manifest.json`; icons generated via `sharp`.
- **Build optimizations**: Terser minification, manual Rollup chunks (`vendor`, `state`, `socket`).

### Backend
- **Language**: JavaScript (Node.js, `engines: node >=18`), CommonJS modules.
- **Framework**: **Express 4** (`express`).
- **Architecture**: Layered — Routes → Controllers → Services → Mongoose Models, plus a
  separate **Socket.IO layer** (`sockets/`) for real-time game logic.
- **Real-time**: **Socket.IO 4** (`socket.io`) attached to the same HTTP server.
- **Authentication**: **JWT** (`jsonwebtoken`) access + refresh tokens, **bcryptjs** for
  password hashing, **google-auth-library** for verifying Google ID tokens, **cookie-parser**
  for the httpOnly refresh-token cookie.
- **APIs**: REST (`/api/auth`, `/api/matches`, `/api/friends`) + WebSocket events.
- **Middleware**: `cors`, `morgan` (dev logging), custom `protect` auth middleware,
  custom validation middleware.

### Database
- **Database**: **MongoDB** (MongoDB Atlas in production, per `.env.example`).
- **ODM**: **Mongoose 7** (`mongoose`). (It's an ODM, not an ORM — MongoDB is document-based.)
- **Migrations**: **None** — schema is defined in Mongoose models; no migration framework.
- **Schema**: Defined via Mongoose schemas in `Backend/models/`: `User`, `Room`,
  `RefreshToken`, and (unused) `Match`.
- **TTL indexes** used for auto-expiry (rooms after 1h, refresh tokens at `expiresAt`).

### AI / ML
**No ML / LLM / vector DB / embeddings.** The "AI" is a **deterministic game-playing bot**
implemented in plain JavaScript on the **client** (`Frontend/src/utils/botLogic.js`):
- **Hard mode**: a **minimax / "most-informative-guess"** algorithm over the candidate space.
- **Easy mode**: random valid guess from the filtered candidate set with a 20% "glitch" (brain-fart) chance.
- No models, no embeddings, no LLMs, no retrieval pipeline.

### DevOps
- **Docker / Docker Compose**: **None present** in the repo. (Do **not** claim Docker.)
- **CI/CD**: No CI config (no GitHub Actions etc.) found.
- **Deployment** (config files present):
  - Backend: **Railway** (`railway.json`, NIXPACKS builder, `npm start`, restart policy)
    and references to **Render** (`.env.example` mentions Render).
  - Frontend: **Render static site** (`render.yaml` SPA rewrite) and **Vercel** (`vercel.json`
    SPA rewrite). Both are static-host configs for the Vite `dist/` build.
- **Env management**: `dotenv` on the backend; Vite `import.meta.env` (`VITE_*`) on the frontend.

---

## 3. Complete Architecture

### Folder structure (top level)

```
Bulls_Cows/
├── Backend/                 # Node/Express + Socket.IO API server
│   ├── app.js               # Express app: CORS, middleware, REST route mounting, error handler
│   ├── server.js            # Entry point: HTTP server + DB connect + Socket.IO init
│   ├── config/database.js   # Mongoose connection
│   ├── controllers/         # HTTP request handlers (auth, friend, match)
│   ├── services/            # Business logic (auth, friend, room)
│   ├── models/              # Mongoose schemas (User, Room, RefreshToken, match[unused])
│   ├── routes/              # Express routers (auth, friends, match, user[unmounted])
│   ├── middleware/          # protect (JWT), validation
│   ├── sockets/             # Real-time game engine (the heart of multiplayer)
│   │   ├── socketManager.js # Socket.IO init, auth handshake, connection registry, disconnect
│   │   ├── lobbyHandler.js  # Room lifecycle events (create/join/start/leave/invite/chat)
│   │   ├── gameHandler.js   # Gameplay events (secret, guess, win/round logic, recordMatchResult)
│   │   ├── roundManager.js  # Scoring + best-of-N + round reset + first-player selection
│   │   └── timerManager.js  # Hard-mode 30s turn timer + auto-skip
│   ├── utils/               # gameRules (bulls/cows calc + validation), tokenGenerator (JWT)
│   └── scripts/             # resetMatchData.js (maintenance script)
│
├── Frontend/                # React + Vite SPA (PWA)
│   ├── src/
│   │   ├── App.jsx          # Router + ProtectedRoute + global providers
│   │   ├── main.jsx         # React root + service worker registration
│   │   ├── pages/           # Route-level screens (auth, home, profile, offline, bot, online)
│   │   ├── components/      # Reusable UI grouped by domain (game, lobby, setup, ui, ...)
│   │   ├── store/           # Zustand stores (auth, online/offline/bot game, toast)
│   │   ├── services/        # api.js (axios), socket.js (socket.io-client wrapper)
│   │   ├── hooks/           # useAuth, useSocket, useBot
│   │   ├── utils/           # gameRules, botLogic, validators, constants, helpers
│   │   └── features/auth/   # (newer AuthPage variant — duplicated with pages/auth)
│   ├── public/              # PWA manifest, sw.js, icons, _redirects
│   ├── vite.config.js       # Build + dev proxy (/api, /socket.io -> :5000)
│   └── tailwind.config.js   # Custom theme
│
├── Planning/                # Design docs / game-design notes
└── *.md                     # Documentation (API_REFERENCE, WEBSOCKET_EVENTS, DEPLOYMENT, etc.)
```

### Responsibilities of every major backend module

| Module | Responsibility |
|---|---|
| `server.js` | Loads env, connects MongoDB, creates the HTTP server, attaches Socket.IO, listens on `PORT`. Handles `unhandledRejection`. |
| `app.js` | Builds the Express app: configurable CORS (env-driven allowlist), JSON/urlencoded/cookie parsing, mounts `/api/auth`, `/api/matches`, `/api/friends`, `/health`, 404 + central error handler. |
| `controllers/authController.js` | Register/login/google/refresh/logout/profile. Sets the refresh token in an httpOnly cookie; returns the access token in the body. Maps service errors to friendly messages + status codes. |
| `controllers/friendController.js` | Thin HTTP layer over `friendService`; also enriches `getUserById` with friendship status flags. |
| `controllers/matchController.js` | Create/join/invite/get room via `roomService`; `invite` uses Socket.IO `emitToUser` to ping a friend in real time. |
| `services/authService.js` | Core auth logic: bcrypt hashing, JWT issuance, refresh-token persistence/rotation/revocation, Google token verification + account linking/creation. |
| `services/friendService.js` | Friend graph operations on the embedded `friends` / `friendRequests` arrays; bidirectional request management; auto-accept on mutual request. |
| `services/roomService.js` | Room CRUD: unique 4-char code generation (retry on collision), join validation, leave/cleanup, populated reads. |
| `middleware/authMiddleware.js` | `protect`: extracts `Bearer` token, verifies JWT, loads `req.user`. |
| `middleware/validationMiddleware.js` | Body validation for registration/login/guess. |
| `sockets/socketManager.js` | Socket.IO bootstrap, **JWT handshake auth**, `userId → Set<socketId>` registry (multi-tab support), online/offline status sync, **disconnect-forfeit** logic, in-memory `activeGames` store, helper exports (`emitToUser`, `isUserOnline`, etc.). |
| `sockets/lobbyHandler.js` | Room socket events: `create-room`, `join-room`, `start-game` (initializes in-memory game state), `leave-room` (forfeit), `get-room`, `room-message`, `send-game-invite`, `decline-game-invite`. |
| `sockets/gameHandler.js` | Gameplay socket events: `game-init`, `submit-secret`, `submit-guess`; computes bulls/cows, manages turn switching, win/round detection, and **`recordMatchResult`** (persists stats + match history with idempotency). |
| `sockets/roundManager.js` | Pure functions for scoring, `getWinsNeeded` (best-of), `hasWonMatch`, round reset, and first-player selection (random first round, loser-starts thereafter). |
| `sockets/timerManager.js` | 30-second per-turn timer for Hard mode; `setInterval` tick, `skipTurn` on timeout. |
| `utils/gameRules.js` | `validateInput` (length, digits-only, uniqueness) and `calculateBullsAndCows` (the core algorithm). Shared logic; mirrored on the frontend. |
| `utils/tokenGenerator.js` | `generateAccessToken` (15m) and `generateRefreshToken` (30d). |

### How a REST request travels through the system

```
Client (axios)                 Express
   │  Authorization: Bearer <JWT>
   ▼
[CORS] → [express.json] → [cookieParser] → Router (/api/...)
   │
   ▼
protect middleware  ──verify JWT──> load req.user from MongoDB
   │
   ▼
Controller (e.g. friendController.sendRequest)
   │
   ▼
Service (friendService.sendFriendRequest)  ── Mongoose ──> MongoDB
   │
   ▼
res.status(...).json(...)   ◄── (errors caught per-handler or by central error handler)
```

### How a real-time game action travels through the system

```
Client (socket.io-client)   socket.emit('submit-guess', {roomCode, guess}, cb)
   │   handshake.auth.token = JWT
   ▼
io.use() auth middleware ── verify JWT ── attach socket.user
   ▼
gameHandler 'submit-guess'
   │  validate turn + input
   │  calculateBullsAndCows(secret, guess)
   │  push log, switch currentTurn
   ├─ io.to(roomCode).emit('turn-result', ...)        ← broadcast to both players
   ├─ if win → roundManager.updateScore / hasWonMatch
   │     ├─ round won → emit 'round-over'
   │     └─ match won → emit 'game-over' + recordMatchResult() → MongoDB
   └─ Hard mode → timerManager.stop/start → emit 'timer-tick'
   ▼
Both clients' useOnlineGameStore listeners update Zustand state → React re-renders
```

### Internal communication & data flow notes
- **REST and WebSocket share the same Express HTTP server** (`http.createServer(app)` then
  `initializeSocket(server)`).
- The **REST `matchController.inviteToMatch` reaches into the socket layer** (`emitToUser`,
  `isUserOnline`) to send live invite notifications — a deliberate cross-layer bridge.
- **Authoritative game state lives in server memory** (`activeGames` object keyed by room code),
  *not* in MongoDB. MongoDB stores rooms (transient, TTL 1h), users/stats, and refresh tokens.
- **Secrets never leave the server**: a player's secret number is stored in
  `activeGames[roomCode].secrets[userId]` and is only used server-side to compute bulls/cows.
  Clients only ever receive guess *results*, never the opponent's secret — a key anti-cheat property.

---

## 4. End-to-End Flow

### A) Login (email/password)
1. User submits the form → `useAuthStore.login()` → `POST /api/auth/login` (axios, `withCredentials`).
2. `authController.login` → `authService.login`: finds user with `.select('+password')`,
   `bcrypt.compare`, then issues an access token (15m) and a refresh token (30d, stored in
   `RefreshToken` collection).
3. Controller sets `refreshToken` in an **httpOnly cookie**; returns `{ accessToken, user }`.
4. Store saves the access token to `localStorage`, initializes the Socket.IO connection with
   that token, starts a 10-minute periodic refresh, and flips `isAuthenticated`.
5. On the socket side, the handshake re-verifies the JWT, registers the socket, and marks the
   user **online** in MongoDB.

### B) Creating and starting an online match
1. Host: `create-room` socket event → `roomService.createRoom` persists a `Room` (unique
   4-char code), host socket joins the Socket.IO room → store goes to `LOBBY`.
2. Opponent: `join-room` with the code → `roomService.joinRoom` sets `opponent` + status
   `active`; server emits `player-joined` to the host.
3. Host clicks Start → `start-game` event: server verifies caller is host and opponent exists,
   then **initializes `activeGames[roomCode]`** (status `SETUP`, empty secrets, scores 0-0,
   round 1) and emits `game-start` to both.
4. Both players submit secrets via `submit-secret` (validated by `validateInput`). When both
   secrets are present, status → `PLAYING`, first player chosen by `determineFirstPlayer`
   (random for round 1), and `match-start` is emitted (with timer duration if Hard).
5. Players alternate `submit-guess`. Each guess is validated, scored with
   `calculateBullsAndCows`, logged, and broadcast as `turn-result` with the next turn.
6. On a winning guess (`bulls === digits`): `updateScore`; if `hasWonMatch` → `game-over`
   and `recordMatchResult` (writes stats + match history to both users, idempotent). Otherwise
   `round-over`, reset state, the round loser starts the next round.
7. Cleanup: the in-memory game is deleted ~60s after game over; the `Room` doc TTL-expires after 1h.

### C) Disconnect / leave during a live game
- `socket.on('disconnect')` checks `activeGames`: if the user is in a `PLAYING`/`SETUP` game
  and has **no remaining connections**, the timer is stopped, the opponent is declared winner
  via `game-over` (`reason: 'disconnect'`), and `recordMatchResult` is called with the
  `disconnect-forfeit` tag. `leave-room` does the analogous `opponent_quit` forfeit.

### D) Vs-Bot game (fully client-side)
1. `BotSetupPage` configures digits/difficulty; `BotGamePage` + `useBot` drive play.
2. `useBot` pre-generates all permutations (5040 for 4 digits, 720 for 3) as the candidate set.
3. After each round of feedback, `filterCandidates` keeps only numbers consistent with all
   prior bulls/cows results; Hard mode picks via minimax (`pickHardGuess`), Easy mode picks
   randomly with a 20% glitch. A simulated "thinking" delay adds personality. No server involved.

---

## 5. Backend Deep Dive

### APIs (REST)

**Auth — `/api/auth`** (`routes/auth.js`)
- `POST /register` — create account (validation in service), returns access token + sets refresh cookie.
- `POST /login` — credential login.
- `POST /google` — Google Sign-In (verifies ID token, links/creates user).
- `POST /refresh` — issues a new access token from the refresh cookie.
- `GET /profile` *(protected)* — current user profile.
- `POST /logout` *(protected)* — revokes refresh token + clears cookie.

**Matches — `/api/matches`** (`routes/match.js`, all protected)
- `POST /create` — create a room (`format`, `digits`, `difficulty`).
- `POST /join` — join by `roomCode`.
- `POST /invite` — host-only; emits a live `match-invite` to a friend.
- `GET /:roomId` — fetch a room by code.

**Friends — `/api/friends`** (`routes/friends.js`, `router.use(protect)` for all)
- `GET /search?q=` — search by username (and UID if query starts with `#`).
- `GET /` — friends list. `GET /requests` — pending in/outgoing.
- `GET /user/:uid`, `GET /profile/:userId` — public profiles (the latter adds relationship flags).
- `POST /request | /accept | /reject | /cancel` — request lifecycle. `DELETE /:friendId` — unfriend.

> Note: `routes/user.js` defines `/api/users/*` (profile, add/remove friend) but is **not
> mounted** in `app.js`, so those endpoints are inactive. (Verified — `app.js` only mounts
> auth/matches/friends.)

### Controllers
Thin HTTP adapters. They read `req.user` / `req.body` / `req.params`, call a service, and
shape the JSON response. Error handling is **try/catch per handler** that maps known service
error strings (e.g. `'Room not found'` → 404, `'Invalid credentials'` → 401) to status codes
and user-friendly messages.

### Services
Where the business logic lives:
- **`authService`** — hashing, token issuance, refresh-token storage/rotation/revocation, and
  Google login with account-linking (existing email → link `googleId`; otherwise create a user
  with a uniquified username). Refresh validation checks DB existence, `isRevoked`, and expiry.
- **`friendService`** — operates on `User.friends` (array of ObjectIds) and
  `User.friendRequests.{incoming,outgoing}`; keeps both sides consistent; **auto-accepts** when
  a user sends a request to someone who already requested them.
- **`roomService`** — code generation with collision retry, join guards (not started, not full,
  not self), populated reads.

### Repositories
**No explicit repository layer.** Services call Mongoose models directly (Mongoose *is* the
data-access layer). This is the standard Node/Express convention.

### Business logic (game)
Lives in the **socket layer + `utils/gameRules.js`**:
- `calculateBullsAndCows` — counts bulls (positional match), cows (present elsewhere), and
  "shit" (`digits - bulls - cows`); win when `bulls === digits`.
- `roundManager` — `getWinsNeeded = ceil(format/2)`, `hasWonMatch`, scoring, round reset
  (loser starts next), random first player for round 1.
- `recordMatchResult` — verifies both users exist, prevents double-recording via a
  `game.matchRecorded` flag, and atomically `$inc`s stats and `$push`es a capped
  (`$slice: 50`) match-history entry for winner and loser.

### Validation
- **REST**: `validationMiddleware` (presence + email regex + password length + guess format).
- **Mongoose schema validation**: username regex/length, email regex, password min length,
  enums for `format`/`digits`/`difficulty`/`status`/`provider`.
- **Game input**: `validateInput` enforces exact length, digits-only, and **unique digits**.

### Exception handling
- Central Express error handler in `app.js` (logs stack, returns `{message, error}`; error
  details only leaked when `NODE_ENV === 'development'`).
- Per-handler try/catch in controllers and socket handlers (socket handlers respond via the
  ack `callback({ success, message })`).
- `recordMatchResult` swallows its own errors (logs but never throws) so a stats-write failure
  can't crash the game.

### Authentication
- **JWT** access tokens (15m) signed with `JWT_SECRET`; refresh tokens (30d) signed with
  `JWT_REFRESH_SECRET`, persisted in `RefreshToken` (TTL index on `expiresAt`, plus `isRevoked`).
- **Two-layer**: REST uses the `protect` middleware (`Bearer` header); Socket.IO uses an
  `io.use` handshake middleware reading `socket.handshake.auth.token`.
- **Google OAuth**: ID token verified server-side via `google-auth-library` against `GOOGLE_CLIENT_ID`.

### Authorization
- Route-level: `protect` gates all private routes.
- Resource-level checks in handlers: only the **host** can start a game or send a room invite;
  guess turn ownership is enforced (`game.currentTurn !== oderId` → rejected); membership checks
  (`you are not part of this game`).

### Database interactions
- Mongoose queries throughout services (`findOne`, `findById`, `findByIdAndUpdate` with
  `$inc`/`$push`, `populate`, `select`, `lean`).
- `password` is `select:false` (excluded by default; pulled with `.select('+password')` for login).
- TTL indexes auto-expire rooms and refresh tokens; lookup indexes on `RefreshToken.token`/`user`.

---

## 6. Frontend Deep Dive

### Routing (`src/App.jsx`)
`BrowserRouter` with routes for auth, home, profile, and the three modes. A `ProtectedRoute`
wrapper guards private routes by **reading `localStorage.getItem('token')` directly** and
validating it starts with `eyJ` (a JWT header marker), redirecting to `/auth` otherwise — a
deliberately synchronous check to avoid hydration flicker. The whole app is wrapped in
`GoogleOAuthProvider` (client ID from `VITE_GOOGLE_CLIENT_ID`). Global `ToastContainer` and
`GameInviteNotification` are mounted once at the top.

### Components
Organized by domain under `src/components/`:
- `ui/` — primitives: `Button`, `Input`, `Modal`, `Loader`, `ToastContainer`, and themed
  number inputs (`CyberNumpad`, `CyberDrumInput`, `HoloSphereInput`, `ConfigSelector`).
- `game/` — `GameArena`, `PlayerCard`, `GameLogCard`, `TimerBar`, `GameInputDrawer`,
  `RoundOverScreen`, `GameOverScreen`, `GameRulesModal`, `MatchInfoPill`.
- `lobby/` — `InviteFriendModal`, `VsFriendModal`, `GameInviteNotification`.
- `setup/` — multi-step wizards (`SetupStepper`, `OnlineStepper`, `ConfigStep`,
  `SecretEntryStep`, `HandoverStep`).
- `home/`, `profile/`, `layout/` — page-specific composition.

### State management (Zustand, `src/store/`)
- `useAuthStore` — auth + the friend-system API actions; uses `persist` middleware but
  **partializes** to store only `user` + `isAuthenticated` (the token is kept separately in
  raw `localStorage`). Owns socket init and the periodic refresh interval.
- `useOnlineGameStore` — the big one: socket lifecycle, room/players/gameData/result state, and
  **all socket event listeners** (`game-start`, `match-start`, `turn-result`, `timer-tick`,
  `round-over`, `game-over`, etc.). Maps server player IDs to `me`/`opponent` using the auth
  user's `_id` as the source of truth.
- `useOfflineGameStore` — pure local pass-and-play state machine (setup wizard → secrets →
  play → game over), scoring computed client-side with the shared `calculateBullsAndCows`.
- `useBotGameStore` / `useGameStore` — bot and generic game state.
- `useToastStore` — global toast queue.

### API integration (`src/services/`)
- `api.js` — axios instance (`baseURL` from `VITE_API_URL` or `/api` proxy, `withCredentials`).
  **Request interceptor** injects the bearer token; **response interceptor** transparently
  refreshes on 401 via `/auth/refresh`, with a **queue** so concurrent 401s wait for a single
  refresh (`isRefreshing` + `failedQueue`) and then retry.
- `socket.js` — singleton socket factory with reconnection (infinite attempts, backoff),
  `['websocket','polling']` transports, and a long timeout tuned for Render cold starts.

### Forms
Auth forms (`AuthPage`) and the setup wizards. Validation uses `utils/validators.js` and
shared `gameRules`. Number entry is via custom touch-friendly components (numpad/drum/sphere).

### Rendering flow
Server emits a socket event → the corresponding listener in `useOnlineGameStore` calls `set()`
→ Zustand notifies subscribed components → React re-renders only the affected pieces
(`GameArena`, `TimerBar`, logs, score). Turn ownership (`gameData.turn === 'me'`) drives whether
the input drawer is enabled.

### UI architecture
Tailwind-first with a custom **neon/cyberpunk** theme (`tailwind.config.js`: `primary #facc14`,
glow shadows, `pulse-glow`/`scanline` animations, Space Grotesk font). Component-per-concern,
no CSS-in-JS, no UI kit. PWA shell registered in `main.jsx`.

---

## 7. Database Design

MongoDB (document store) via Mongoose. Four schemas; **three are active**.

### `User` (`models/User.js`)
| Field | Type | Notes |
|---|---|---|
| `uid` | String, unique | Public short id like `#1234`, auto-generated with collision retry (`pre('save')`). |
| `username` | String, unique | 3–20 chars, regex `^[a-zA-Z0-9_]+$`. |
| `email` | String, unique, lowercase | Email regex. |
| `password` | String, `select:false` | Required only when `provider !== 'google'`; min 6; bcrypt-hashed. |
| `provider` | enum `local`/`google` | Auth source. |
| `googleId` | String, sparse, unique | For Google accounts. |
| `stats` | `{ totalGames, wins, losses }` | Updated on match completion. |
| `friends` | `[ObjectId→User]` | Embedded friend graph (adjacency list). |
| `friendRequests` | `{ incoming[], outgoing[] }` | Each entry has `from/to`, `status`, `createdAt`. |
| `matchHistory` | `[ {opponent, opponentName, result, score, format, digits, difficulty, playedAt} ]` | Capped at 50 (`$slice`). |
| `isOnline` | Boolean | Synced by socket connect/disconnect. |
| timestamps | createdAt/updatedAt | `{ timestamps: true }`. |

### `Room` (`models/Room.js`)
| Field | Type | Notes |
|---|---|---|
| `roomCode` | String, unique, uppercase, len 4 | Join code. |
| `host` / `opponent` | ObjectId→User | Players (opponent nullable). |
| `status` | enum waiting/active/completed/cancelled | Lifecycle. |
| `format` | enum 1/3/5 | Best-of-N. |
| `digits` | enum 3/4 | Secret length. |
| `difficulty` | enum easy/hard | Hard adds the turn timer. |
| TTL | `createdAt` index, `expireAfterSeconds: 3600` | Auto-deletes stale rooms after 1h. |

### `RefreshToken` (`models/RefreshToken.js`)
| Field | Type | Notes |
|---|---|---|
| `user` | ObjectId→User | Owner. |
| `token` | String | The signed refresh JWT. |
| `expiresAt` | Date | TTL index `expireAfterSeconds: 0` (auto-delete at expiry). |
| `isRevoked` | Boolean | Set on logout. |
| indexes | `token`, `user` | Faster lookups. |

### `Match` (`models/match.js`) — **defined but unused**
A `Match` schema (`roomId`, `host`, `guest`, `mode`, `format`, `status`, `difficulty`, TTL 1h)
exists but the active code uses `Room` for matchmaking and `User.matchHistory` for results.
**(Inferred: this is leftover/abandoned from an earlier design.)**

### Relationships
- `User 1—N Room` (as host or opponent).
- `User N—N User` via the embedded `friends` array (self-referential).
- `User 1—N RefreshToken`.
- `User 1—N matchHistory` entries, each referencing another `User` as `opponent`.

### Constraints & indexes
- Uniqueness on `User.uid/username/email/googleId(sparse)` and `Room.roomCode`.
- Enum constraints on room/match config and `provider`.
- TTL indexes (rooms, refresh tokens); secondary indexes on `RefreshToken.token/user`.

### ER explanation
The schema is **document-oriented**: the friend graph and request lists are **embedded inside
each User document** rather than normalized into join tables, optimizing for the common reads
("get my friends", "get my requests") at the cost of write-amplification (both users must be
updated on each friend operation). Game results are **denormalized** into `matchHistory`
(storing `opponentName` and `score` as strings) so the profile page can render history without
extra joins. Transient matchmaking state (`Room`) is TTL-expired; **authoritative live game
state is intentionally kept in server memory, not the DB.**

---

## 8. External Services

| Service / SDK / Package | Where | Why it's used |
|---|---|---|
| **MongoDB Atlas** | `MONGO_URI` | Cloud-hosted primary database. |
| **Mongoose** | backend models/services | ODM for schema modeling + queries. |
| **Express** | `app.js` | HTTP framework / routing / middleware. |
| **Socket.IO** (server + client) | `sockets/`, `services/socket.js` | Real-time bidirectional game communication. |
| **jsonwebtoken** | tokenGenerator, auth | Sign/verify access & refresh JWTs. |
| **bcryptjs** | authService | Salted password hashing. |
| **google-auth-library** | authService | Verify Google OAuth ID tokens server-side. |
| **@react-oauth/google** | App.jsx, AuthPage | Google Sign-In button + provider on the client. |
| **cookie-parser** | app.js | Read the httpOnly refresh-token cookie. |
| **cors** | app.js | Env-driven cross-origin allowlist. |
| **morgan** | app.js | HTTP request logging (dev). |
| **dotenv** | server.js | Load env vars. |
| **axios** | services/api.js | HTTP client with interceptors. |
| **zustand** | stores | Lightweight global state. |
| **react-router-dom** | App.jsx | SPA routing. |
| **Vite** + **@vitejs/plugin-react** | build/dev | Bundler + dev server with proxy. |
| **Tailwind CSS / PostCSS / Autoprefixer** | styling | Utility-first CSS. |
| **terser** | vite build | JS minification. |
| **sharp** | scripts/generate-icons.js | Generate PWA icon PNGs. |
| **Railway / Render / Vercel** | deploy configs | Hosting (backend on Railway/Render; frontend static on Render/Vercel). |

**Not used (do not claim):** Docker, Redis, RabbitMQ/Kafka, any SQL DB, any LLM/vector DB, CI services.

---

## 9. Design Decisions

**1. In-memory authoritative game state (`activeGames`) instead of DB-per-move.**
- *Why*: low-latency turn-based play; a guess shouldn't require a DB round-trip.
- *Alternatives*: persist every move to MongoDB; use Redis as shared state.
- *Tradeoffs*: fast and simple, but **state is lost on server restart** and **doesn't scale
  horizontally** (a second server instance wouldn't see the game). Acceptable for a single-instance
  hobby deployment; the explicit `resetAllUsersOffline()` on boot is a nod to this fragility.

**2. Server computes bulls/cows; secrets never sent to clients.**
- *Why*: cheating prevention — a client could otherwise read the opponent's secret.
- *Alternatives*: client-side scoring (insecure) — which is exactly what offline/bot mode does
  (acceptable there since there's no adversary).
- *Tradeoffs*: requires the secret to live server-side; adds a server dependency for online play.

**3. Access token in `localStorage` + refresh token in httpOnly cookie.**
- *Why*: short-lived access token is easy to attach to both REST and socket auth; the long-lived
  refresh token is protected from XSS in an httpOnly cookie.
- *Alternatives*: both tokens in cookies; both in memory; sessions.
- *Tradeoffs*: access token in `localStorage` is **XSS-readable** (a known weakness) but expires
  in 15m; the cookie approach mitigates the high-value refresh token. The axios interceptor +
  periodic refresh keep UX smooth on mobile.

**4. Embedded friend graph in the User document.**
- *Why*: fast, simple reads; no join collection.
- *Alternatives*: a dedicated `Friendship` collection.
- *Tradeoffs*: every friend op must update two documents and isn't transactional, risking drift
  under concurrency; fine at small scale.

**5. Bot AI on the client (minimax) rather than server.**
- *Why*: zero server load for single-player; instant feedback.
- *Alternatives*: server-side bot.
- *Tradeoffs*: candidate generation (5040 combos) runs in the browser; the minimax evaluation set
  is **capped to 300 candidates** when large to keep the UI responsive — a pragmatic
  accuracy/performance trade.

**6. Zustand over Redux.**
- *Why*: minimal boilerplate, hook-based, easy `persist`.
- *Tradeoffs*: less middleware/devtools ecosystem than Redux; fine for this app's size.

**7. Multiple deploy targets (Railway/Render/Vercel).**
- *Why*: free-tier hosting; static frontend + Node backend split.
- *Tradeoffs*: cold starts on free tiers — handled with long socket timeouts and 20s client
  request timeouts.

---

## 10. Scalability

### Current bottlenecks
- **Single-instance, in-memory state** (`activeGames`, `userSockets`, `activeTimers`) — the
  hard ceiling. Horizontal scaling would break room routing unless state moves to a shared store
  and Socket.IO uses an adapter.
- **No connection pool tuning / no caching layer.**
- **Friend ops write two full documents** (write amplification).
- **Match-history `$push` with `$slice: 50`** keeps documents bounded (good), but heavy logging
  in `recordMatchResult` adds overhead.

### Scaling strategy (what you'd say in an interview)
- Introduce **Redis** for shared game/session state + the **Socket.IO Redis adapter** to allow
  multiple Node instances behind a load balancer (sticky sessions or the adapter for fan-out).
- Move authoritative game state out of process memory so games survive restarts and rebalancing.
- Add MongoDB read replicas / proper indexes for friend search (`username` regex search is not
  index-friendly — could add a text index).

### Performance optimizations already present
- **Async persistence off the hot path**: stats are written only at round/match end, not per guess.
- **Server-side timers via a single `setInterval` per room** (not per client).
- **Bot minimax capped** at 300-candidate evaluation; perfect-split early exit (`bestScore === 1`).
- **Frontend**: manual Rollup chunks (`vendor`/`state`/`socket`), Terser minification, lazy
  socket connection, and a refresh-request queue to avoid stampedes.
- **TTL indexes** auto-clean rooms/tokens (no cron needed).

### Caching
- **Client**: PWA service worker caches the app shell (network-first, skips `/api` & socket).
- **Server**: no application cache (Redis not used).

### Async processing
- Node's event loop + `async/await`; `Promise.all` for parallel user reads in `recordMatchResult`;
  no queue/worker system.

---

## 11. Security

- **Authentication**: bcrypt-hashed passwords (`select:false`); JWT access (15m) + refresh (30d);
  refresh tokens stored, **revocable** (`isRevoked`) and TTL-expired; socket handshake re-verifies JWT.
- **Authorization**: `protect` middleware on private REST routes; host-only and turn-ownership
  checks in the socket layer.
- **Validation**: middleware + Mongoose schema validators + game `validateInput` (length, digits,
  uniqueness). Inputs are constrained to digits, blocking most injection vectors.
- **Secret management**: secrets in `.env` (`JWT_SECRET`, `JWT_REFRESH_SECRET`, `MONGO_URI`,
  `GOOGLE_CLIENT_ID`); `.env.example` documents them without real values. Game secrets stay server-side.
- **SQL injection**: N/A (NoSQL). Mongoose casts query values, reducing NoSQL-injection risk;
  queries use typed model methods, not raw `$where`. *(Note: regex search on user input is not
  sanitized for ReDoS — a minor hardening gap.)*
- **XSS**: React escapes rendered content by default; the **refresh token is httpOnly** (not
  JS-readable). *Caveat*: the access token in `localStorage` is XSS-readable (mitigated by short TTL).
- **CSRF**: REST relies on the bearer token in the `Authorization` header (not ambient cookies),
  so traditional CSRF is largely mitigated for the API; the refresh cookie uses
  `sameSite: 'none'` + `secure` in production (cross-site by necessity for the split deploy).
- **CORS**: env-driven allowlist (`CLIENT_URL`, comma-separated) with `credentials: true`; dev
  allows all origins. Applied to both Express and Socket.IO.
- **Rate limiting**: **none** — a clear gap worth mentioning as future work.

---

## 12. Interesting Engineering Challenges

**1. Correct multiplayer turn/round/match state machine over WebSockets.**
- *Problem*: coordinate two clients through SETUP → PLAYING → ROUND_OVER → GAME_OVER, with
  best-of-N scoring, loser-starts-next-round, and a single source of truth.
- *Solution*: server-authoritative `activeGames` + pure `roundManager` functions; clients are
  thin renderers reacting to broadcast events.
- *Why hard*: distributed state, race conditions, and ensuring both clients agree on whose turn it is.

**2. Reliable winner attribution + idempotent stat recording.**
- *Problem*: a match can end via a winning guess, a disconnect, or a leave — from three different
  code paths — and stats must be written **exactly once** with the **correct** winner/loser.
- *Solution*: a `game.matchRecorded` flag guards `recordMatchResult`; the function re-verifies both
  user IDs against the DB and read-backs the write. The extensive logging shows this was a real bug
  fought during development (e.g., guesser-is-winner reasoning, host/opponent ID mapping).
- *Why hard*: identity confusion (host vs opponent vs "me") across server and client is a classic
  source of subtle multiplayer bugs.

**3. Multi-tab / multi-device presence and forfeit-on-disconnect.**
- *Problem*: a user with two tabs shouldn't appear offline when one closes, and a true disconnect
  during a live game should award the win to the opponent.
- *Solution*: `userId → Set<socketId>` registry; only mark offline when the set empties; on
  disconnect, only forfeit if the user has no remaining sockets and the game is live.
- *Why hard*: reconnection vs genuine quit are ambiguous; getting it wrong either ends games early
  or lets players dodge losses.

**4. Seamless token refresh without logging users out.**
- *Problem*: 15-minute access tokens would otherwise interrupt gameplay/mobile sessions.
- *Solution*: axios response interceptor refreshes on 401 and **queues concurrent failures** behind
  one refresh; a 10-minute periodic refresh keeps the socket token fresh; the socket is
  re-initialized with the new token.
- *Why hard*: avoiding refresh stampedes and request loss during the refresh window.

**5. A responsive, "thinking" bot that's actually good (Hard mode).**
- *Problem*: a strong solver must reason over 5040 combinations without freezing the browser.
- *Solution*: candidate filtering + minimax worst-case-bucket minimization, capped evaluation set,
  optimal opening guesses, and a simulated delay for UX.
- *Why hard*: balancing solver strength against client-side performance.

---

## 13. Resume Bullet Candidates

> Mix and match. Impact numbers marked *(inferred)* are reasonable estimates from the code,
> not measured benchmarks — swap in real metrics if you have them.

1. Built a full-stack real-time multiplayer Bulls & Cows game using **React 18**, **Node.js/Express**, **Socket.IO**, and **MongoDB**, supporting offline, vs-AI, and online 1v1 modes.
2. Designed a **server-authoritative game engine** in Node.js with in-memory state and pure scoring functions, computing bulls/cows results and best-of-N match outcomes for concurrent rooms.
3. Implemented **real-time 1v1 multiplayer over WebSockets (Socket.IO)** with room lifecycle, turn management, live result broadcasting, and reconnection handling.
4. Engineered a **JWT authentication system** with 15-minute access tokens and revocable 30-day refresh tokens persisted in MongoDB with TTL-based auto-expiry.
5. Secured the refresh token in an **httpOnly, SameSite cookie** and added an **Axios interceptor** that transparently refreshes expired tokens and queues concurrent 401s behind a single refresh.
6. Integrated **Google OAuth** sign-in by verifying Google ID tokens server-side (`google-auth-library`) with automatic account linking and username generation.
7. Developed a **friend system** (search by username/UID, send/accept/reject/cancel requests, unfriend) backed by an embedded friend graph in MongoDB with auto-accept on mutual requests.
8. Built a **client-side AI opponent** using a **minimax "most-informative-guess"** strategy over a 5040-combination candidate space, with candidate filtering and bounded evaluation for browser performance.
9. Implemented **multi-tab/multi-device presence tracking** via a `userId → Set<socketId>` registry, marking users offline only after all sockets disconnect.
10. Added **forfeit-on-disconnect logic** that awards the win to the remaining player and records the result idempotently across three end-game code paths.
11. Created an **idempotent match-recording pipeline** that atomically updates win/loss stats and a capped 50-entry match history with MongoDB `$inc`/`$push`/`$slice` operators.
12. Built a **server-authoritative 30-second turn timer** for Hard mode using a single per-room interval with automatic turn-skip on timeout.
13. Modeled the domain in **Mongoose 7** with schema validation, enums, unique/sparse indexes, and **TTL indexes** for auto-expiring rooms and refresh tokens.
14. Architected the **backend in clean layers** (routes → controllers → services → models) plus a dedicated Socket.IO layer, keeping HTTP and real-time concerns separated.
15. Implemented **global state management with Zustand**, including a persisted auth store and a dedicated online-game store wiring 11+ real-time socket events to the UI.
16. Configured an **environment-driven CORS allowlist** with credentialed cross-origin requests for both Express and Socket.IO across a split frontend/backend deployment.
17. Optimized the React build with **Vite + Terser** and manual **Rollup code-splitting** (vendor/state/socket chunks) for faster initial loads.
18. Shipped the frontend as an installable **PWA** with a custom service worker (network-first, app-shell caching) and a Web App Manifest.
19. Designed a **touch-friendly UI** with a custom Tailwind neon/cyber theme and bespoke number-entry components (numpad/drum/sphere) for mobile gameplay.
20. Deployed a split architecture (Node backend on **Railway/Render**, static React frontend on **Render/Vercel**) with health checks, restart policies, and cold-start-tolerant client timeouts.

---

## 14. Resume Project Summary

**2-line version**
> Full-stack real-time multiplayer Bulls & Cows game (React, Node/Express, Socket.IO, MongoDB)
> with online 1v1, an AI bot, friend system, and JWT/Google auth.

**4-line version**
> Built a full-stack, real-time multiplayer Bulls & Cows game with React, Node.js/Express,
> Socket.IO, and MongoDB. Engineered a server-authoritative game engine for online 1v1 play with
> turn timers, best-of-N scoring, and forfeit-on-disconnect. Implemented JWT + refresh-token auth
> with Google OAuth, a friend system, and persisted match stats. Added a client-side minimax AI
> opponent and shipped the frontend as an installable PWA.

**6-line version**
> Designed and built a full-stack, real-time multiplayer Bulls & Cows game (React 18 + Vite,
> Node.js/Express, Socket.IO, MongoDB/Mongoose) supporting offline pass-and-play, single-player
> vs an AI bot, and online 1v1 matchmaking. Engineered a server-authoritative game engine with
> in-memory room state, turn management, a 30s Hard-mode timer, best-of-N scoring, and idempotent
> match recording with disconnect/leave forfeits. Implemented a secure auth system: bcrypt
> passwords, 15-minute JWT access tokens, revocable refresh tokens in an httpOnly cookie with
> transparent Axios-based refresh, and Google OAuth. Added a friend/invite system, Zustand state
> management, a minimax client-side bot over 5040 combinations, and an installable PWA, deployed
> across Railway/Render/Vercel.

---

## 15. ATS Keywords

- **Languages**: JavaScript (ES6+), Node.js, HTML5, CSS3, JSX.
- **Frameworks/Libraries**: React 18, Express.js, Socket.IO, Vite, React Router, Zustand, Axios,
  Tailwind CSS, Mongoose, bcryptjs, jsonwebtoken, google-auth-library, @react-oauth/google.
- **Databases**: MongoDB, MongoDB Atlas, Mongoose ODM, TTL indexes, schema design, indexing.
- **Cloud/Hosting**: Railway, Render, Vercel, MongoDB Atlas.
- **AI/Algorithms**: minimax, game-tree search, candidate elimination, combinatorics/permutations,
  heuristic/optimal opening.
- **Architecture**: REST API, WebSockets, real-time systems, layered architecture (MVC/service),
  client-server, event-driven, SPA, PWA, microservice-style split deploy.
- **DevOps**: environment configuration, CORS, health checks, build optimization, code splitting,
  service workers, NIXPACKS.
- **Concepts**: JWT authentication, OAuth 2.0 / OpenID, refresh tokens, session management, RBAC-style
  authorization, password hashing, input validation, idempotency, presence/online status, reconnection,
  state management, optimistic UI, rate limiting *(as future work)*, caching.

---

## 16. Interview Preparation — 50 Q&A

> Each answer notes **where in the codebase** it lives.

**Architecture**

1. **How is the project structured?** Layered backend (routes→controllers→services→models) + a
   Socket.IO layer; React SPA frontend with Zustand stores and service wrappers. *Where*: `Backend/`,
   `Frontend/src/`.
2. **How do REST and WebSocket coexist?** One HTTP server: `http.createServer(app)` then
   `initializeSocket(server)`. *Where*: `server.js`.
3. **Where does authoritative game state live?** In server memory: the `activeGames` object keyed
   by room code. *Where*: `sockets/socketManager.js`, populated in `lobbyHandler.start-game`.
4. **Why not store live game state in MongoDB?** Latency — turn-based moves shouldn't hit the DB;
   stats are persisted only at round/match end. *Where*: `gameHandler.submit-guess`.
5. **How does the REST layer talk to the socket layer?** `matchController.inviteToMatch` calls
   `emitToUser`/`isUserOnline` exported from `socketManager`. *Where*: `controllers/matchController.js`.
6. **What happens to rooms after a game?** In-memory game deleted ~60s after game over; `Room` docs
   TTL-expire after 1h. *Where*: `gameHandler` `setTimeout`, `models/Room.js` index.
7. **How is the frontend kept in sync?** Server broadcasts socket events; `useOnlineGameStore`
   listeners call `set()`; Zustand re-renders subscribers. *Where*: `store/useOnlineGameStore.js`.
8. **Is the architecture horizontally scalable today?** No — in-memory state ties it to one
   instance; you'd add Redis + the Socket.IO Redis adapter. *Where*: `socketManager.js` (state maps).

**Backend**

9. **What does the `protect` middleware do?** Reads the `Bearer` token, verifies it with
   `JWT_SECRET`, loads `req.user`. *Where*: `middleware/authMiddleware.js`.
10. **How are services separated from controllers?** Controllers handle HTTP; services hold logic
    and DB calls. *Where*: `controllers/*` vs `services/*`.
11. **Is there a repository layer?** No — Mongoose models are the data layer. *Where*: `models/`.
12. **How are errors handled?** Per-handler try/catch mapping known errors to status codes, plus a
    central Express error handler. *Where*: controllers, `app.js`.
13. **How is the bulls/cows result computed?** `calculateBullsAndCows` counts positional matches
    (bulls), present-elsewhere (cows), and misses (shit). *Where*: `utils/gameRules.js`.
14. **How is a winning guess detected?** `result.isWin = bulls === digits`. *Where*: `utils/gameRules.js`.
15. **How is best-of-N decided?** `getWinsNeeded = ceil(format/2)`, `hasWonMatch` compares score.
    *Where*: `sockets/roundManager.js`.
16. **Who starts each round?** Random for round 1; the previous round's loser thereafter.
    *Where*: `roundManager.determineFirstPlayer`.
17. **How are stats recorded?** `recordMatchResult` `$inc`s wins/losses and `$push`es a capped
    history entry for both users. *Where*: `gameHandler.recordMatchResult`.
18. **How do you prevent double-recording?** A `game.matchRecorded` boolean flag. *Where*:
    `gameHandler.recordMatchResult`.
19. **How is the turn timer implemented?** One `setInterval` per room (Hard only), ticking 1s,
    skipping on timeout. *Where*: `sockets/timerManager.js`.
20. **How are unused endpoints handled?** `routes/user.js` exists but isn't mounted in `app.js`
    (dead code). *Where*: `app.js`, `routes/user.js`.

**Frontend**

21. **What state library and why?** Zustand — minimal boilerplate, hooks, `persist`. *Where*:
    `store/`.
22. **How is auth state persisted?** `persist` middleware stores only `user`+`isAuthenticated`;
    the token lives in raw `localStorage`. *Where*: `store/useAuthStore.js`.
23. **How does `ProtectedRoute` work?** Synchronously reads `localStorage` token and checks it
    starts with `eyJ`. *Where*: `App.jsx`.
24. **How does the app handle expired tokens?** Axios response interceptor refreshes on 401 and
    queues concurrent requests. *Where*: `services/api.js`.
25. **Why a periodic refresh too?** To keep mobile sessions/socket token alive (every 10 min).
    *Where*: `useAuthStore.startPeriodicRefresh`.
26. **How is the socket initialized on the client?** Singleton factory with reconnection +
    websocket/polling transports. *Where*: `services/socket.js`.
27. **How does the UI know whose turn it is?** `gameData.turn === 'me'` derived by comparing
    `currentTurnId` to the auth user's `_id`. *Where*: `useOnlineGameStore` listeners.
28. **How are "me" vs "opponent" determined reliably?** Compare server IDs to the auth store's
    `user._id` (string-normalized). *Where*: `useOnlineGameStore.game-start`.
29. **How is the build optimized?** Terser + manual chunks (vendor/state/socket). *Where*:
    `vite.config.js`.
30. **How does dev talk to the backend?** Vite proxy forwards `/api` and `/socket.io` to `:5000`.
    *Where*: `vite.config.js`.

**Database**

31. **Why MongoDB?** Document model fits embedded friend graph + denormalized match history.
    *Where*: `models/User.js`.
32. **How is the friend graph stored?** Embedded `friends: [ObjectId]` + `friendRequests.{in,out}`.
    *Where*: `models/User.js`.
33. **How are rooms auto-cleaned?** TTL index `expireAfterSeconds: 3600`. *Where*: `models/Room.js`.
34. **How are refresh tokens auto-expired?** TTL index on `expiresAt` (`expireAfterSeconds: 0`).
    *Where*: `models/RefreshToken.js`.
35. **How is the password protected at the schema level?** `select:false`, bcrypt-hashed in the
    service. *Where*: `models/User.js`, `services/authService.js`.
36. **What's the UID for?** A public short id (`#1234`) for friend search/sharing, with collision
    retry. *Where*: `models/User.js` `pre('save')`.
37. **Is there a migration system?** No — schema lives in Mongoose models. *Where*: `models/`.

**APIs**

38. **List the auth endpoints.** register/login/google/refresh (public), profile/logout (protected).
    *Where*: `routes/auth.js`.
39. **How is friend search done?** Regex on username (+UID when query starts with `#`), limit 10,
    excludes self. *Where*: `services/friendService.searchUsers`.
40. **How does invite work?** Host-only REST `POST /matches/invite` → `emitToUser('match-invite')`.
    *Where*: `controllers/matchController.js`.

**Concurrency**

41. **How are concurrent token refreshes handled?** `isRefreshing` flag + `failedQueue` so one
    refresh serves many requests. *Where*: `services/api.js`.
42. **How is multi-tab presence handled?** `userId → Set<socketId>`; offline only when the set
    empties. *Where*: `socketManager`.
43. **Race condition risks in friend ops?** Non-transactional two-document writes can drift under
    concurrency. *Where*: `services/friendService.js`.
44. **How are turn races prevented?** Server rejects guesses when `currentTurn !== oderId`.
    *Where*: `gameHandler.submit-guess`.

**Docker / DevOps**

45. **Is there Docker?** No — deployment uses Railway NIXPACKS (backend) and static hosts (frontend).
    *Where*: `railway.json`, `render.yaml`, `vercel.json`. *(Be honest about this in interviews.)*
46. **How do you handle cold starts?** Long socket timeout (30s) + 20s client request timeouts +
    infinite reconnection. *Where*: `services/socket.js`, `useOnlineGameStore`.
47. **How is CORS configured?** Env-driven allowlist (`CLIENT_URL`), credentialed, dev allows all.
    *Where*: `app.js`, `socketManager`.

**Authentication**

48. **Why two tokens?** Short access token (low blast radius) + long refresh token (UX) kept in an
    httpOnly cookie. *Where*: `tokenGenerator`, `authController`.
49. **How is Google login verified?** `google-auth-library` `verifyIdToken` against `GOOGLE_CLIENT_ID`,
    then link/create user. *Where*: `services/authService.googleLogin`.

**Scalability / Design**

50. **What would you improve next?** Add rate limiting, Redis-backed shared game state + Socket.IO
    adapter for horizontal scaling, automated tests, ReDoS-safe search, and remove dead code
    (`routes/user.js`, `models/match.js`, `.bak` files). *Where*: gaps noted across `app.js`,
    `friendService`, repo status.

---

## 17. My Contributions

> **(Inferred)** This is a solo project (single git author: ShrikrishnaKumaran). The breakdown
> below assumes you implemented the codebase end-to-end; adjust to reflect reality.

- **Backend**: Express app + layered routes/controllers/services; JWT auth with refresh-token
  rotation/revocation; Google OAuth verification; friend system logic; room service; central error
  handling and validation. *(`Backend/` — all of it.)*
- **Real-time engine**: the entire Socket.IO layer — handshake auth, presence registry, room
  lifecycle, gameplay/turn/round/match logic, Hard-mode timer, disconnect/leave forfeits, idempotent
  match recording. *(`Backend/sockets/`.)*
- **Frontend**: React SPA, routing + protected routes, Zustand stores (auth/online/offline/bot/toast),
  axios interceptor with refresh queue, socket service, custom UI components, Tailwind theme, PWA.
  *(`Frontend/src/`.)*
- **Database**: Mongoose schema design (User/Room/RefreshToken), embedded friend graph, denormalized
  match history, TTL + uniqueness/sparse indexes. *(`Backend/models/`.)*
- **AI**: the client-side bot — combination generation, candidate filtering, minimax Hard mode, Easy
  glitch mode, optimal openers. *(`Frontend/src/utils/botLogic.js`, `hooks/useBot.js`.)*
- **Architecture/DevOps**: split deploy configs (Railway/Render/Vercel), env-driven CORS, build
  optimization, service worker, the shared bulls/cows rule logic mirrored across client and server.

---

## 18. Resume Technologies (exact list)

JavaScript • Node.js • Express.js • React • Vite • Socket.IO • MongoDB • Mongoose •
REST APIs • WebSockets • JWT • OAuth 2.0 (Google) • Zustand • Axios • Tailwind CSS •
bcrypt • PWA • Railway • Render • Vercel

---

## 19. One-Minute Interview Pitch

> "Bulls & Cows is a full-stack, real-time multiplayer number-deduction game I built end to end.
> The frontend is a React app built with Vite, using Zustand for state and Tailwind for a custom
> cyberpunk UI — it's also an installable PWA. The backend is Node and Express with Socket.IO for
> real-time play, and MongoDB with Mongoose for persistence. There are three modes: local
> pass-and-play, single-player against an AI bot I wrote using a minimax strategy, and online 1v1
> over WebSockets. The interesting part is the online engine: it's server-authoritative — secrets
> never leave the server, so there's no cheating, and the server computes every bulls-and-cows
> result, manages turns, runs a 30-second timer in hard mode, and handles best-of-N scoring. I built
> a JWT auth system with short access tokens and revocable refresh tokens in an httpOnly cookie, plus
> Google sign-in, and an axios interceptor that refreshes tokens transparently. I also handled the
> tricky real-world cases — multi-tab presence, reconnection, and awarding the win when someone
> disconnects mid-game while recording stats exactly once."

---

## 20. Three-Minute Deep Dive

> "Let me walk through the architecture and the decisions behind it.
>
> **Architecture.** It's a split deployment: a React SPA frontend and a Node/Express backend that
> also hosts a Socket.IO server on the same HTTP server. The backend is layered — routes call
> controllers, controllers call services, and services use Mongoose models. Real-time game logic is
> isolated in its own `sockets/` layer so the HTTP and WebSocket concerns stay separate. On the
> frontend, Zustand holds global state — there's an auth store and a dedicated online-game store that
> wires all the socket events to the UI.
>
> **The core technical decision** was making online play **server-authoritative**. Live game state —
> secrets, turns, scores — lives in an in-memory `activeGames` map on the server, not in the
> database. That gives low latency per move and, crucially, security: a player's secret number never
> reaches the opponent's client. The server computes every result and only broadcasts the bulls/cows
> outcome and whose turn is next. MongoDB is used for the things that should persist — users, stats,
> match history, refresh tokens — and for transient rooms, which I auto-expire with TTL indexes.
>
> **Auth.** I used a two-token JWT scheme: a 15-minute access token the client attaches to both REST
> and the socket handshake, and a 30-day refresh token that's stored in an httpOnly cookie and also
> persisted in MongoDB so it can be revoked on logout. The frontend has an axios interceptor that
> catches 401s, refreshes the token once, and queues concurrent requests behind that single refresh
> so I don't get a stampede. I also added Google OAuth by verifying the Google ID token server-side
> and linking it to existing accounts.
>
> **Hard problems.** The trickiest bugs were around identity and lifecycle. In a 1v1 game you
> constantly map between 'host', 'opponent', and 'me' across server and client, and getting that
> wrong means the wrong player gets credited with a win. I normalized everything against the
> authenticated user's ID and verify winner/loser against the DB before recording. Match recording
> can be triggered from three paths — a winning guess, a disconnect, or a leave — so I made it
> idempotent with a flag to guarantee stats are written exactly once. Presence was another one:
> I track a set of socket IDs per user so multiple tabs don't make someone look offline, and I only
> forfeit a live game on disconnect when the user has no remaining connections.
>
> **The bot** was a fun algorithmic piece. Hard mode uses a minimax 'most-informative-guess'
> strategy: it keeps a candidate set of all valid numbers, filters it after each feedback, and picks
> the guess that minimizes the worst-case bucket size. Since that's 5040 combinations for four
> digits, I cap the evaluation set to keep the browser responsive.
>
> **What I'd do next.** The honest limitation is that in-memory state ties it to a single instance,
> so to scale horizontally I'd move game state into Redis and use the Socket.IO Redis adapter. I'd
> also add rate limiting and automated tests, which the project doesn't have yet.
>
> **What I learned:** real-time systems are mostly about state consistency and edge cases —
> reconnection, race conditions, idempotency — far more than the happy path."

---

### Honesty checklist for interviews (things NOT in this project)
- No Docker / Docker Compose. No CI/CD pipeline. No automated tests.
- No Redis, no message queue (RabbitMQ/Kafka), no SQL database.
- No real ML/LLM/vector DB — the "AI" is a deterministic minimax bot.
- No rate limiting. In-memory game state is single-instance only.
- `routes/user.js` and `models/match.js` exist but are **not wired in** (dead/legacy code).
