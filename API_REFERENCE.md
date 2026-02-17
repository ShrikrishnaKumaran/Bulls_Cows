# API Reference

Complete REST API documentation for Bulls, Cows & Shit backend.

## Base URL

```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication

Most endpoints require JWT authentication. Include the access token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

Refresh tokens are stored in HTTP-only cookies and automatically sent with requests.

---

## Auth Endpoints

Base path: `/api/auth`

### Register User

Create a new user account.

```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "username": "string (3-20 chars, alphanumeric + underscore)",
  "email": "string (valid email)",
  "password": "string (min 6 chars)"
}
```

**Response (201 Created):**
```json
{
  "_id": "user_id",
  "uid": "#1234",
  "username": "player1",
  "email": "player@example.com",
  "accessToken": "jwt_access_token"
}
```

**Response (400 Bad Request):**
```json
{
  "message": "An account with this email already exists"
}
```
or
```json
{
  "message": "This username is already taken"
}
```

**Notes:**
- Refresh token is set in HTTP-only cookie (`refreshToken`)
- UID is auto-generated (e.g., `#9921`)

---

### Login User

Authenticate an existing user.

```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200 OK):**
```json
{
  "_id": "user_id",
  "uid": "#1234",
  "username": "player1",
  "email": "player@example.com",
  "accessToken": "jwt_access_token"
}
```

**Response (401 Unauthorized):**
```json
{
  "message": "Invalid email or password"
}
```

---

### Refresh Token

Get a new access token using the refresh token cookie.

```http
POST /api/auth/refresh
```

**Request:** No body required. Refresh token is read from cookies.

**Response (200 OK):**
```json
{
  "accessToken": "new_jwt_access_token"
}
```

**Response (401 Unauthorized):**
```json
{
  "message": "Session expired. Please login again."
}
```

---

### Get Profile

Get the authenticated user's profile. 🔒 Requires authentication.

```http
GET /api/auth/profile
```

**Response (200 OK):**
```json
{
  "_id": "user_id",
  "uid": "#1234",
  "username": "player1",
  "email": "player@example.com",
  "stats": {
    "totalGames": 10,
    "wins": 6,
    "losses": 4
  },
  "friends": ["friend_id_1", "friend_id_2"],
  "isOnline": true,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### Logout

Logout the current user and invalidate refresh token. 🔒 Requires authentication.

```http
POST /api/auth/logout
```

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

**Notes:**
- Clears the `refreshToken` cookie
- Invalidates the refresh token in the database

---

## Friend Endpoints

Base path: `/api/friends`

All friend endpoints require authentication 🔒.

### Search Users

Search for users by username or UID.

```http
GET /api/friends/search?q={query}
```

**Query Parameters:**
| Parameter | Type   | Description                        |
|-----------|--------|------------------------------------|
| q         | string | Search term (username or UID like `#1234`) |

**Response (200 OK):**
```json
[
  {
    "_id": "user_id",
    "uid": "#1234",
    "username": "player1",
    "isOnline": true
  }
]
```

---

### Get Friends List

Get the current user's friends.

```http
GET /api/friends
```

**Response (200 OK):**
```json
[
  {
    "_id": "friend_id",
    "uid": "#5678",
    "username": "friend1",
    "isOnline": true
  },
  {
    "_id": "friend_id_2",
    "uid": "#9012",
    "username": "friend2",
    "isOnline": false
  }
]
```

---

### Get Pending Requests

Get incoming friend requests.

```http
GET /api/friends/requests
```

**Response (200 OK):**
```json
{
  "incoming": [
    {
      "from": {
        "_id": "user_id",
        "uid": "#1234",
        "username": "requester"
      },
      "status": "pending",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "outgoing": [
    {
      "to": {
        "_id": "user_id",
        "uid": "#5678",
        "username": "target"
      },
      "status": "pending",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### Get User by UID

Get a user's public profile by their UID.

```http
GET /api/friends/user/{uid}
```

**Path Parameters:**
| Parameter | Type   | Description           |
|-----------|--------|-----------------------|
| uid       | string | User UID (e.g., `#1234`) |

**Response (200 OK):**
```json
{
  "_id": "user_id",
  "uid": "#1234",
  "username": "player1",
  "isOnline": true,
  "stats": {
    "totalGames": 10,
    "wins": 6,
    "losses": 4
  }
}
```

**Response (404 Not Found):**
```json
{
  "message": "User not found"
}
```

---

### Send Friend Request

Send a friend request to another user.

```http
POST /api/friends/request
```

**Request Body:**
```json
{
  "targetUid": "#1234"
}
```

**Response (200 OK):**
```json
{
  "message": "Friend request sent",
  "targetUser": {
    "_id": "user_id",
    "username": "target"
  }
}
```

**Response (400 Bad Request):**
```json
{
  "message": "Friend request already sent"
}
```
or
```json
{
  "message": "User is already your friend"
}
```

---

### Accept Friend Request

Accept an incoming friend request.

```http
POST /api/friends/accept
```

**Request Body:**
```json
{
  "requesterId": "user_id"
}
```

**Response (200 OK):**
```json
{
  "message": "Friend request accepted",
  "friend": {
    "_id": "user_id",
    "username": "newFriend"
  }
}
```

---

### Reject Friend Request

Reject an incoming friend request.

```http
POST /api/friends/reject
```

**Request Body:**
```json
{
  "requesterId": "user_id"
}
```

**Response (200 OK):**
```json
{
  "message": "Friend request rejected"
}
```

---

### Cancel Friend Request

Cancel an outgoing friend request.

```http
POST /api/friends/cancel
```

**Request Body:**
```json
{
  "targetId": "user_id"
}
```

**Response (200 OK):**
```json
{
  "message": "Friend request cancelled"
}
```

---

### Remove Friend

Remove a user from your friends list.

```http
DELETE /api/friends/{friendId}
```

**Path Parameters:**
| Parameter | Type   | Description    |
|-----------|--------|----------------|
| friendId  | string | Friend's user ID |

**Response (200 OK):**
```json
{
  "message": "Friend removed"
}
```

---

## Match Endpoints

Base path: `/api/match`

All match endpoints require authentication 🔒.

### Create Match

Create a new match room.

```http
POST /api/match/create
```

**Request Body:**
```json
{
  "format": 3,
  "digits": 4,
  "difficulty": "easy"
}
```

| Field      | Type   | Default | Description                           |
|------------|--------|---------|---------------------------------------|
| format     | number | 3       | Best-of format (1, 3, or 5)          |
| digits     | number | 4       | Secret number length (3 or 4)        |
| difficulty | string | "easy"  | `"easy"` (no timer) or `"hard"` (30s timer) |

**Response (201 Created):**
```json
{
  "success": true,
  "roomCode": "ABCD",
  "roomId": "room_id"
}
```

---

### Join Match

Join an existing match by room code.

```http
POST /api/match/join
```

**Request Body:**
```json
{
  "roomCode": "ABCD"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "matchData": {
    "roomCode": "ABCD",
    "host": {
      "_id": "host_id",
      "username": "host_player",
      "uid": "#1234"
    },
    "opponent": {
      "_id": "opponent_id",
      "username": "opponent_player",
      "uid": "#5678"
    },
    "format": 3,
    "digits": 4,
    "difficulty": "easy"
  }
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Room not found"
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Room is full"
}
```

---

### Invite to Match

Send a match invitation to a friend via WebSocket.

```http
POST /api/match/invite
```

**Request Body:**
```json
{
  "friendId": "friend_user_id",
  "roomCode": "ABCD"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Invite sent successfully",
  "roomCode": "ABCD",
  "friendOnline": true
}
```

**Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "Only the host can send invites"
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Room is already full"
}
```

**Notes:**
- This endpoint sends a `match-invite` WebSocket event to the friend
- If friend is offline, the invite is still "sent" but they won't receive it

---

### Get Match

Get match room details by room code.

```http
GET /api/match/{roomCode}
```

**Path Parameters:**
| Parameter | Type   | Description             |
|-----------|--------|-------------------------|
| roomCode  | string | 4-character room code   |

**Response (200 OK):**
```json
{
  "success": true,
  "matchData": {
    "_id": "room_id",
    "roomCode": "ABCD",
    "host": {
      "_id": "host_id",
      "username": "host_player",
      "uid": "#1234"
    },
    "opponent": {
      "_id": "opponent_id",
      "username": "opponent_player",
      "uid": "#5678"
    },
    "format": 3,
    "digits": 4,
    "difficulty": "easy",
    "status": "waiting",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## Error Responses

All endpoints may return these common error responses:

### 401 Unauthorized
```json
{
  "message": "Not authorized, no token"
}
```
or
```json
{
  "message": "Not authorized, token failed"
}
```

### 500 Internal Server Error
```json
{
  "message": "Server error description"
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. Consider implementing rate limiting for production deployments.

---

## CORS Configuration

The API accepts requests from origins specified in the `CLIENT_URL` environment variable:

- **Development:** All origins allowed
- **Production:** Only whitelisted origins (comma-separated in `CLIENT_URL`)

Credentials (cookies) are supported for cross-origin requests.
