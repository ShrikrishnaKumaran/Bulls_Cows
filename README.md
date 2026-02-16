# Bulls, Cows & Shit 🎯

A real-time multiplayer number guessing game with cyberpunk aesthetics.

![Version](https://img.shields.io/badge/version-3.0.0-blue)
![Status](https://img.shields.io/badge/status-production-green)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)

## 🎮 Live Demo

- **Frontend:** [https://bulls-cows-frontend.onrender.com](https://bulls-cows-frontend.onrender.com)
- **Backend:** [https://bulls-cows-backend.onrender.com](https://bulls-cows-backend.onrender.com)

## 📖 About

Bulls, Cows & Shit is a classic number guessing game reimagined with modern web technologies. Players choose secret numbers and take turns trying to guess each other's secrets through logical deduction.

### Game Rules

1. Each player selects a secret number with **unique digits** (3 or 4 digits)
2. Players take turns guessing the opponent's secret
3. After each guess, feedback is provided:
   - 🟢 **Bulls** - Correct digit in correct position
   - 🟡 **Cows** - Correct digit in wrong position  
   - ⚫ **Shit** - Digit not in the secret
4. First to guess correctly wins the round!

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **Authentication** | JWT with secure refresh tokens |
| 👤 **User Profiles** | Stats tracking & match history |
| 📱 **Pass & Play** | Offline mode for 2 players, 1 device |
| 🌐 **Online 1v1** | Real-time multiplayer via WebSockets |
| 🏠 **Room System** | Create/join with 4-character codes |
| 👥 **Friend System** | Add friends, track online status |
| ⏱️ **Timer Mode** | 30-second turn limit (Hard difficulty) |
| 🎨 **Cyber UI** | Responsive design with neon aesthetics |

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js ≥18
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Real-time:** Socket.io
- **Auth:** JWT (jsonwebtoken)

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **State:** Zustand
- **Styling:** Tailwind CSS
- **Routing:** React Router v6

## 🚀 Quick Start

### Prerequisites
- Node.js ≥18.0.0
- MongoDB (local or Atlas)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/Bulls_Cows.git
cd Bulls_Cows

# Install dependencies
npm install

# Set up environment variables
cp .env.example Backend/.env
# Edit Backend/.env with your values

# Start development servers
# Terminal 1 - Backend
cd Backend && npm run dev

# Terminal 2 - Frontend  
cd Frontend && npm run dev
```

### Environment Variables

**Backend (.env)**
```bash
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/bulls_cows
JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_secret
CLIENT_URL=http://localhost:5173
```

**Frontend (.env)**
```bash
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

## 📁 Project Structure

```
Bulls_Cows/
├── Backend/
│   ├── controllers/      # Request handlers
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── sockets/          # Socket.io handlers
│   └── utils/            # Helper functions
│
├── Frontend/
│   └── src/
│       ├── components/   # React components
│       ├── pages/        # Page components
│       ├── store/        # Zustand stores
│       ├── services/     # API & Socket clients
│       └── utils/        # Utility functions
│
└── Planning/             # Design documents
```

## 📚 Documentation

- [Technical Documentation](TECHNICAL_DOCUMENTATION.md) - Detailed architecture and API docs
- [Deployment Guide](DEPLOYMENT.md) - Production deployment instructions

## 🎯 Game Modes

### Pass & Play (Offline)
Perfect for playing with a friend on the same device. Features handover screens to keep secrets safe!

### Online Duel
Real-time 1v1 matches with:
- Room codes for easy friend invites
- Best of 1, 3, or 5 round formats
- Easy or Hard (timed) difficulty
- 3 or 4 digit modes

## 🔌 API Overview

### REST Endpoints
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get user profile
- `GET /api/friends` - Get friends list
- `POST /api/friends/request` - Send friend request

### Socket Events
- `create-room` - Create game room
- `join-room` - Join existing room
- `submit-secret` - Submit secret number
- `submit-guess` - Make a guess

## 🚢 Deployment

The app is deployed on [Render](https://render.com):

- **Backend:** Web Service with auto-deploy from `main` branch
- **Frontend:** Static Site with SPA routing support

See [DEPLOYMENT.md](DEPLOYMENT.md) for full deployment instructions.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Inspired by the classic Bulls and Cows pen-and-paper game
- UI inspired by cyberpunk aesthetics

---

Made with ❤️ and ☕
