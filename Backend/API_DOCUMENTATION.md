# Bulls & Cows - Authentication API Documentation

## Base URL
```
http://localhost:5000/api/auth
```

## Authentication
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Endpoints

### 1. Register User
**POST** `/register`

Create a new user account.

**Request Body:**
```json
{
  "username": "player123",
  "email": "player@example.com",
  "password": "password123"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "player123",
    "email": "player@example.com",
    "avatar": "default-avatar.png",
    "stats": {
      "totalGames": 0,
      "wins": 0,
      "losses": 0,
      "draws": 0,
      "eloRating": 1000
    }
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Email already registered" // or "Username already taken"
}
```

---

### 2. Login User
**POST** `/login`

Authenticate a user and get access token.

**Request Body:**
```json
{
  "email": "player@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "player123",
    "email": "player@example.com",
    "avatar": "default-avatar.png",
    "stats": {
      "totalGames": 0,
      "wins": 0,
      "losses": 0,
      "draws": 0,
      "eloRating": 1000
    },
    "isOnline": true
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

### 3. Get Current User
**GET** `/me`

Get current authenticated user's profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "player123",
    "email": "player@example.com",
    "avatar": "default-avatar.png",
    "stats": {
      "totalGames": 5,
      "wins": 3,
      "losses": 2,
      "draws": 0,
      "eloRating": 1050
    },
    "isOnline": true,
    "friends": []
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

---

### 4. Logout User
**POST** `/logout`

Logout current user and update online status.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 5. Update Password
**PUT** `/updatepassword`

Change user's password.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password updated successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Current password is incorrect"
}
```

---

## Validation Rules

### Username
- Required
- Length: 3-20 characters
- Must be unique

### Email
- Required
- Must be valid email format
- Must be unique
- Converted to lowercase

### Password
- Required
- Minimum length: 6 characters

---

## User Schema

```javascript
{
  username: String,        // Unique, 3-20 chars
  email: String,          // Unique, valid email
  password: String,       // Hashed, min 6 chars
  avatar: String,         // Default: "default-avatar.png"
  stats: {
    totalGames: Number,   // Default: 0
    wins: Number,         // Default: 0
    losses: Number,       // Default: 0
    draws: Number,        // Default: 0
    eloRating: Number     // Default: 1000
  },
  friends: [ObjectId],    // Array of User IDs
  isOnline: Boolean,      // Default: false
  createdAt: Date,        // Auto-generated
  lastLogin: Date         // Updated on login
}
```

---

## Error Handling

All errors follow this format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (only in development mode)"
}
```

### Common HTTP Status Codes
- **200**: Success
- **201**: Created (registration)
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (invalid credentials/token)
- **404**: Not Found
- **500**: Internal Server Error

---

## Environment Variables

Required in `.env` file:
```env
MONGO_URI=mongodb://localhost:27017/bulls_cows_db
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
```

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "test123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

### Get Current User
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Logout
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Notes

- JWT tokens expire after 7 days (configurable)
- Passwords are hashed using bcrypt with salt rounds of 10
- User's online status is automatically updated on login/logout
- Last login timestamp is recorded on each login
- Password field is excluded from queries by default for security
