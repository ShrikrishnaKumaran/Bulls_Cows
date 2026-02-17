# Bulls & Cows  🎯

A real-time multiplayer number guessing game with cyberpunk aesthetics.

🌐 **[Play Now](https://bulls-cows-pied.vercel.app/)** | [API Docs](API_REFERENCE.md) | [WebSocket Docs](WEBSOCKET_EVENTS.md)

## 🎮 What is it?

A classic pen-and-paper game reimagined for the web! Two players pick secret numbers and take turns guessing each other's secrets through logical deduction.

**How it works:**
- Pick a secret number with **unique digits** (3 or 4 digits)
- Take turns guessing your opponent's secret
- Get feedback after each guess:
  - 🟢 **Bulls** - Right digit, right position
  - 🟡 **Cows** - Right digit, wrong position
  - ⚫ **Miss** - Wrong digit
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
## 📚 Documentation

- [Technical Documentation](TECHNICAL_DOCUMENTATION.md) - Detailed file-by-file code explanations
- [API Reference](API_REFERENCE.md) - Endpoints, request/response formats
- [WebSocket Events](WEBSOCKET_EVENTS.md) - Real-time communication protocols
```