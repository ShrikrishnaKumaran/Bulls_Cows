# Bulls, Cows & Shit 🎯

A real-time multiplayer number guessing game with cyberpunk aesthetics.

## 🎮 What is it?

A classic pen-and-paper game reimagined for the web! Two players pick secret numbers and take turns guessing each other's secrets through logical deduction.

**How it works:**
- Pick a secret number with **unique digits** (3 or 4 digits)
- Take turns guessing your opponent's secret
- Get feedback after each guess:
  - 🟢 **Bulls** - Right digit, right position
  - 🟡 **Cows** - Right digit, wrong position
  - ⚫ **Shit** - Wrong digit
- First to crack the code wins!

## ✨ Features

- 🔐 **Secure Auth** - JWT authentication with refresh tokens
- 📱 **Pass & Play** - Offline mode for 2 players on 1 device
- 🌐 **Online 1v1** - Real-time battles via WebSockets
- 🏠 **Room Codes** - Easy 4-character codes to invite friends
- 👥 **Friend System** - Add friends & see who's online
- ⏱️ **Hard Mode** - 30-second turn timer for intense gameplay
- 🎨 **Cyber UI** - Sleek neon-themed responsive design

## 🛠️ Tech Stack

| Backend | Frontend |
|---------|----------|
| Node.js + Express | React 18 + Vite |
| MongoDB + Mongoose | Zustand (State) |
| Socket.io | Tailwind CSS |
| JWT Auth | React Router v6 |

## 🚀 Quick Start

```bash
# Clone & install
git clone https://github.com/yourusername/Bulls_Cows.git
cd Bulls_Cows && npm install

# Start Backend (Terminal 1)
cd Backend && npm run dev

# Start Frontend (Terminal 2)
cd Frontend && npm run dev
```

**Environment Setup:**
```bash
# Backend/.env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
CLIENT_URL=http://localhost:5173

# Frontend/.env (leave empty for local dev)
VITE_API_URL=
VITE_SOCKET_URL=
```

## 📚 Documentation

- [Technical Documentation](TECHNICAL_DOCUMENTATION.md) - Detailed file-by-file code explanations
- [Deployment Guide](DEPLOYMENT.md) - Production deployment on Render

## 📄 License

MIT License

---

Made with ❤️ and ☕
