# 🌲 Frontend Component Tree

Visual representation of the Bulls & Cows React component hierarchy.

---

## 📱 Application Root

```
App.jsx
├── 🔔 ToastContainer (Global)
├── 🎮 GameInviteNotification (Global)
│
└── 🧭 Routes
    ├── /auth ─────────────► AuthPage
    ├── /home ─────────────► HomePage (Protected)
    ├── /profile ──────────► ProfilePage (Protected)
    ├── /offline/setup ────► SetupPage
    ├── /offline/game ─────► OfflineGamePage
    ├── /online/setup ─────► OnlineSetupPage (Protected)
    ├── /lobby/create ─────► CreateRoomPage (Protected)
    ├── /lobby/join ───────► JoinRoomPage (Protected)
    ├── /lobby/room/:code ─► RoomWaitingPage (Protected)
    └── /game/online/:code ► OnlineGamePage (Protected)
```

---

## 📄 Pages & Their Components

### 🔐 Auth Flow
```
AuthPage
└── AuthComponents
    ├── TabSwitcher
    ├── LoginForm
    │   └── Input (ui)
    └── RegisterForm
        └── Input (ui)
```

### 🏠 Home Page
```
HomePage
├── HomeHeader
│   └── User Avatar/Info
├── GameModeCard (×3)
│   ├── "VS FRIEND" ──────► VsFriendModal
│   ├── "VS BOT"
│   └── "OFFLINE"
├── VsFriendModal
│   └── Room Create/Join UI
└── GameRulesModal
    └── Rules Content
```

### 👤 Profile Page
```
ProfilePage
├── ProfileHeader
│   ├── Avatar
│   ├── Username/UID
│   └── Stats Display
├── Friends Section
│   ├── Search Users
│   ├── Friend Requests (Incoming/Outgoing)
│   └── Friends List
└── Modal (ui)
```

### ⚙️ Offline Setup Flow
```
SetupPage
└── SetupStepper
    ├── Step 1: ConfigStep
    │   ├── TechTile (Format Selection)
    │   ├── TechTile (Digits Selection)
    │   └── TechTile (Difficulty Selection)
    ├── Step 2: SecretEntryStep (Player 1)
    │   ├── CyberNumpad / HoloSphereInput
    │   └── SetupIcons
    ├── Step 3: HandoverStep
    │   └── Device Handover Animation
    └── Step 4: SecretEntryStep (Player 2)
        ├── CyberNumpad / HoloSphereInput
        └── SetupIcons
```

### 🌐 Online Setup Flow
```
OnlineSetupPage
└── OnlineStepper
    ├── Step 1: ConfigStep
    │   ├── TechTile (Format)
    │   ├── TechTile (Digits)
    │   └── TechTile (Difficulty)
    └── Step 2: Room Creation
        └── Navigate to RoomWaitingPage
```

### ⏳ Room Waiting Page
```
RoomWaitingPage
├── Room Code Display
├── Player Cards
│   ├── Host Info
│   └── Opponent Slot
├── InviteFriendModal
│   └── Friends List + Invite Buttons
├── Start Game Button (Host only)
└── Leave Room Button
```

### 🎮 Game Pages (Online & Offline)

```
OnlineGamePage / OfflineGamePage
└── GameArena
    ├── MatchInfoPill
    │   ├── Round Number
    │   ├── Format (Bo3/Bo5/Bo7)
    │   └── Scores
    │
    ├── PlayerCard (×2)
    │   ├── Player Avatar
    │   ├── Player Name
    │   ├── Secret Display (masked/revealed)
    │   └── Turn Indicator
    │
    ├── TimerBar
    │   └── Countdown Progress
    │
    ├── Game Logs Section
    │   └── GameLogCard (×n)
    │       ├── Guess Number
    │       ├── Bulls Count
    │       └── Cows Count
    │
    ├── GameInputDrawer
    │   ├── CyberNumpad
    │   └── Submit Button
    │
    ├── RoundOverScreen (Conditional)
    │   ├── Round Winner Display
    │   ├── Secrets Revealed
    │   └── Next Round Button
    │
    └── GameOverScreen (Conditional)
        ├── Winner Banner
        ├── Final Scores
        └── Play Again / Home Buttons
```

---

## 🧩 Reusable UI Components

```
components/ui/
├── Button ────────► Styled button with variants
├── Input ─────────► Form input with label
├── Modal ─────────► Overlay modal wrapper
├── Loader ────────► Loading spinner
├── ToastContainer ► Toast notifications
├── ConfigSelector ► Selection tiles
├── CyberNumpad ───► Number input keypad
├── CyberDrumInput ► Rotating drum selector
└── HoloSphereInput► 3D sphere number selector
```

---

## 🗂️ Component Categories

```
┌─────────────────────────────────────────────────────────────┐
│                        COMPONENTS                           │
├─────────────┬─────────────┬─────────────┬──────────────────┤
│    game/    │   setup/    │   lobby/    │       ui/        │
├─────────────┼─────────────┼─────────────┼──────────────────┤
│ GameArena   │ ConfigStep  │ VsFriend    │ Button           │
│ PlayerCard  │ SecretEntry │   Modal     │ Input            │
│ TimerBar    │ HandoverStep│ InviteFriend│ Modal            │
│ GameLogCard │ SetupStepper│   Modal     │ Loader           │
│ MatchInfo   │ OnlineStep  │ GameInvite  │ ToastContainer   │
│   Pill      │   per       │ Notification│ ConfigSelector   │
│ GameInput   │ TechTile    │             │ CyberNumpad      │
│  Drawer     │ SetupIcons  │             │ CyberDrumInput   │
│ RoundOver   │             │             │ HoloSphereInput  │
│  Screen     │             │             │                  │
│ GameOver    │             │             │                  │
│  Screen     │             │             │                  │
│ GameRules   │             │             │                  │
│  Modal      │             │             │                  │
└─────────────┴─────────────┴─────────────┴──────────────────┘
```

---

## 🔄 State Management

```
┌────────────────────────────────────────────────────────────┐
│                     ZUSTAND STORES                         │
├──────────────────┬──────────────────┬─────────────────────┤
│  useAuthStore    │ useOnlineGame    │ useOfflineGame      │
│                  │    Store         │    Store            │
├──────────────────┼──────────────────┼─────────────────────┤
│ • user           │ • roomCode       │ • players           │
│ • token          │ • status         │ • currentTurn       │
│ • isAuthenticated│ • players        │ • gameData          │
│ • login()        │ • gameData       │ • logs              │
│ • logout()       │ • joinRoom()     │ • makeGuess()       │
│ • register()     │ • sendGuess()    │ • checkWin()        │
└──────────────────┴──────────────────┴─────────────────────┘
                            │
                    ┌───────┴───────┐
                    │ useToastStore │
                    ├───────────────┤
                    │ • toasts      │
                    │ • addToast()  │
                    │ • removeToast │
                    └───────────────┘
```

---

## 🔌 Services Layer

```
services/
├── api.js ────► Axios instance with interceptors
│               • Token refresh logic
│               • Auth headers
│
└── socket.js ─► Socket.io client
                • initializeSocket()
                • getSocket()
                • Event handling
```

---

## 📊 Data Flow Diagram

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Pages   │────►│  Stores  │────►│ Services │
│          │◄────│ (Zustand)│◄────│ (API/WS) │
└──────────┘     └──────────┘     └──────────┘
     │                                  │
     ▼                                  ▼
┌──────────┐                     ┌──────────┐
│Components│                     │  Backend │
│   (UI)   │                     │  Server  │
└──────────┘                     └──────────┘
```

---

*Generated for Bulls & Cows Game Frontend*
