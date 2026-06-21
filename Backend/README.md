# Bulls & Cows - Backend API

JWT-based authentication system for the Bulls & Cows game.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or connection string)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Create a `.env` file in the Backend directory with:
```env
MONGO_URI=mongodb://localhost:27017/bulls_cows_db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2026
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
```

3. Start MongoDB:
```bash
# Make sure MongoDB is running on your system
```

4. Run the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start at `http://localhost:5000`

## 📚 API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed API endpoint documentation.

## 🔑 Authentication

This backend uses JWT (JSON Web Tokens) for authentication:

1. **Register** or **Login** to receive a JWT token
2. Include the token in the `Authorization` header for protected routes:
   ```
   Authorization: Bearer <your_jwt_token>
   ```

## 📁 Project Structure

```
Backend/
├── config/
│   └── db.js                 # MongoDB connection
├── controllers/
│   └── authController.js     # Authentication logic
├── middleware/
│   └── auth.js               # JWT verification middleware
├── models/
│   └── users.js              # User schema
├── routes/
│   └── auth.js               # Authentication routes
├── .env                      # Environment variables (not in git)
├── app.js                    # Express app setup
├── package.json              # Dependencies
└── API_DOCUMENTATION.md      # API docs
```

## 🔒 Security Features

- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens with configurable expiration
- Protected routes with middleware
- Input validation
- Password field excluded from queries by default
- CORS enabled for development

## 🛠️ Available Scripts

```bash
npm start       # Start production server
npm run dev     # Start development server with nodemon
```

## 📦 Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **jsonwebtoken** - JWT implementation
- **bcryptjs** - Password hashing
- **dotenv** - Environment variables
- **nodemon** (dev) - Auto-reload server

## 🔗 API Endpoints

### Public Routes
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Protected Routes (Require JWT)
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user
- `PUT /api/auth/updatepassword` - Update password

## 🧪 Testing

You can test the API using:
- **Postman** - Import the endpoints and test
- **cURL** - See API_DOCUMENTATION.md for examples
- **Thunder Client** (VS Code extension)
- **REST Client** (VS Code extension)

### Example Test Flow:

1. **Register a user:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"test123"}'
```

2. **Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

3. **Get user profile (use token from login):**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/bulls_cows_db` |
| `JWT_SECRET` | Secret key for JWT signing | (required) |
| `JWT_EXPIRE` | JWT expiration time | `7d` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |

### User Schema

Each user has:
- Username (3-20 chars, unique)
- Email (unique, validated)
- Password (hashed, min 6 chars)
- Avatar (default provided)
- Stats (games, wins, losses, Elo rating)
- Friends list
- Online status
- Timestamps

## 🚧 Future Enhancements

- Email verification
- Password reset functionality
- Refresh tokens
- Rate limiting
- Two-factor authentication
- Social authentication (Google, Facebook)
- Profile image upload
- Admin roles

## 📝 Notes

- Make sure to change the `JWT_SECRET` in production
- Keep `.env` file secure and never commit it to version control
- The API includes CORS middleware for development; configure properly for production
- Passwords are never returned in API responses

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Make sure MongoDB is running on your system

### JWT Error
```
Not authorized to access this route
```
**Solution:** Check that you're including the Bearer token in the Authorization header

### Duplicate Key Error
```
E11000 duplicate key error collection
```
**Solution:** Username or email already exists in database
