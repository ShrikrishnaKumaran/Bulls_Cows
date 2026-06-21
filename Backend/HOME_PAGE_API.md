# Home Page API Documentation

## Match Management APIs

### 1. Create Match Room
**Endpoint:** `POST /api/match/create`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "format": "bestOf3",
  "difficulty": "easy"
}
```

**Response:**
```json
{
  "success": true,
  "roomId": "X9P2",
  "status": "waiting",
  "matchId": "match_123"
}
```

---

### 2. Join Match Room
**Endpoint:** `POST /api/match/join`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "roomId": "X9P2"
}
```

**Response:**
```json
{
  "success": true,
  "matchData": {
    "roomId": "X9P2",
    "host": { "_id": "user_id", "username": "player1" },
    "guest": { "_id": "user_id", "username": "player2" },
    "status": "active",
    "format": "bestOf3",
    "difficulty": "easy"
  }
}
```

---

### 3. Invite Friend to Match
**Endpoint:** `POST /api/match/invite`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "friendId": "user_456",
  "roomId": "X9P2"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Invite sent successfully",
  "roomId": "X9P2"
}
```

---

### 4. Get Match Details
**Endpoint:** `GET /api/match/:roomId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "matchData": {
    "roomId": "X9P2",
    "host": { "_id": "user_id", "username": "player1" },
    "guest": null,
    "status": "waiting",
    "format": "bestOf3",
    "difficulty": "easy"
  }
}
```

---

## Tournament Management APIs

### 1. Create Tournament
**Endpoint:** `POST /api/tournament/create`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "My League",
  "maxParticipants": 8
}
```

**Response:**
```json
{
  "success": true,
  "tournamentCode": "LEAGUE1",
  "id": "tourn_123",
  "name": "My League"
}
```

---

### 2. Join Tournament
**Endpoint:** `POST /api/tournament/join`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "tournamentCode": "LEAGUE1"
}
```

**Response:**
```json
{
  "success": true,
  "tournamentData": {
    "code": "LEAGUE1",
    "name": "My League",
    "host": { "_id": "user_id", "username": "host" },
    "participants": [
      { "_id": "user_id", "username": "player1" },
      { "_id": "user_id", "username": "player2" }
    ],
    "status": "lobby",
    "maxParticipants": 8
  }
}
```

---

### 3. Get Tournament Details
**Endpoint:** `GET /api/tournament/:code`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "tournamentData": {
    "code": "LEAGUE1",
    "name": "My League",
    "host": { "_id": "user_id", "username": "host" },
    "participants": [...],
    "status": "lobby",
    "maxParticipants": 8
  }
}
```

---

## Error Responses

All endpoints may return error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common error status codes:
- `400` - Bad request (invalid input)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found
- `500` - Server error
