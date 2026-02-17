# WebSocket Events

Complete WebSocket (Socket.io) event documentation for Bulls, Cows & Shit.

## Connection

### Server URLs

```
Development: http://localhost:5000
Production:  https://bulls-cows-backend.onrender.com
```

### Connecting to the Server

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: 'jwt_access_token' // Required for authentication
  }
});
```

### Authentication

All socket connections require a valid JWT access token. The server validates the token before allowing connection.

**Connection Error Events:**
```javascript
socket.on('connect_error', (error) => {
  // error.message will be one of:
  // - "Authentication error: No token provided"
  // - "Authentication error: User not found"
  // - "Authentication error: Invalid token"
});
```

---

## Event Categories

| Category | Description |
|----------|-------------|
| [Lobby Events](#lobby-events) | Room creation, joining, and management |
| [Game Events](#game-events) | Gameplay, turns, and scoring |
| [Timer Events](#timer-events) | Hard mode turn timers |
| [Invite Events](#invite-events) | Game invitations between friends |

---

## Lobby Events

### create-room

Create a new game room.

**Client → Server**
```javascript
socket.emit('create-room', settings, callback);
```

**Parameters:**
```json
{
  "format": 3,        // Best-of format: 1, 3, or 5
  "digits": 4,        // Secret number length: 3 or 4
  "difficulty": "easy" // "easy" or "hard"
}
```

**Callback Response (Success):**
```json
{
  "success": true,
  "room": {
    "roomCode": "ABCD",
    "host": { "_id": "user_id", "username": "player1" },
    "opponent": null,
    "format": 3,
    "digits": 4,
    "difficulty": "easy",
    "status": "waiting"
  }
}
```

**Callback Response (Error):**
```json
{
  "success": false,
  "message": "Error description"
}
```

---

### join-room

Join an existing room as the opponent.

**Client → Server**
```javascript
socket.emit('join-room', roomCode, callback);
```

**Parameters:** `roomCode` (string) - 4-character room code

**Callback Response (Success):**
```json
{
  "success": true,
  "room": {
    "roomCode": "ABCD",
    "host": { "_id": "host_id", "username": "host_player" },
    "opponent": { "_id": "user_id", "username": "joining_player" },
    "format": 3,
    "digits": 4,
    "difficulty": "easy"
  }
}
```

**Callback Response (Error):**
```json
{
  "success": false,
  "message": "Room not found"
}
```
or
```json
{
  "success": false,
  "message": "Room is full"
}
```

---

### player-joined

Emitted to the host when an opponent joins the room.

**Server → Client (Host Only)**
```json
{
  "opponent": {
    "_id": "opponent_id",
    "username": "opponent_name"
  }
}
```

---

### start-game

Host initiates game start after opponent has joined.

**Client → Server (Host Only)**
```javascript
socket.emit('start-game', roomCode, callback);
```

**Callback Response (Success):**
```json
{
  "success": true
}
```

**Callback Response (Error):**
```json
{
  "success": false,
  "message": "Only the host can start the game"
}
```
or
```json
{
  "success": false,
  "message": "Waiting for opponent to join"
}
```

---

### game-start

Emitted to both players when the host starts the game.

**Server → Client (Both Players)**
```json
{
  "roomId": "room_id",
  "roomCode": "ABCD",
  "format": 3,
  "digits": 4,
  "difficulty": "easy",
  "host": {
    "_id": "host_id",
    "username": "host_player"
  },
  "opponent": {
    "_id": "opponent_id",
    "username": "opponent_player"
  }
}
```

---

### leave-room

Leave the current room. If game is active, opponent wins.

**Client → Server**
```javascript
socket.emit('leave-room', roomCode, callback);
```

**Callback Response:**
```json
{
  "success": true
}
```

**Side Effects:**
- If game status is `SETUP` or `PLAYING`, triggers `game-over` for opponent (they win by forfeit)
- `room-closed` is always triggered when host leaves (any game state)

---

### room-closed

Emitted when the host leaves the room (any state). In active games, this is sent in addition to `game-over`.

**Server → Client (Opponent Only)**
```json
{
  "reason": "host_left",
  "message": "Host has left the room"
}
```

**Frontend Handling:**
- Store sets `status: 'ROOM_CLOSED'`
- UI shows notification and redirects user to home

---

### player-left

Emitted when opponent leaves in lobby state.

**Server → Client (Host Only)**
```json
{
  "oderId": "opponent_user_id"
}
```

---

### get-room

Get room information (also ensures socket joins the room for reconnection).

**Client → Server**
```javascript
socket.emit('get-room', roomCode, callback);
```

**Callback Response (Success):**
```json
{
  "success": true,
  "room": {
    "roomCode": "ABCD",
    "host": { "_id": "host_id", "username": "host" },
    "opponent": { "_id": "opp_id", "username": "opponent" },
    "format": 3,
    "digits": 4,
    "difficulty": "easy",
    "status": "waiting"
  }
}
```

---

### room-message

Send a chat message to all players in the room.

**Client → Server**
```javascript
socket.emit('room-message', { roomCode, message });
```

**Server → Client (Broadcast)**
```json
{
  "sender": {
    "_id": "sender_id",
    "username": "sender_name"
  },
  "message": "Hello!",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### player-ready

Signal that player is ready (UI feedback only, before secret submission).

**Client → Server**
```javascript
socket.emit('player-ready', roomCode);
```

**Server → Client (Opponent Only)**
```json
{
  "oderId": "ready_player_id"
}
```

---

## Game Events

### game-init

Initialize/sync game state (useful for reconnection).

**Client → Server**
```javascript
socket.emit('game-init', { roomCode }, callback);
```

**Callback Response (Success):**
```json
{
  "success": true,
  "gameState": {
    "status": "SETUP",
    "currentTurn": null,
    "logs": [],
    "format": 3,
    "digits": 4,
    "hostReady": false,
    "opponentReady": false,
    "roundNumber": 1,
    "scores": { "host_id": 0, "opponent_id": 0 }
  }
}
```

**Game Status Values:**
| Status     | Description                        |
|------------|------------------------------------|
| `SETUP`    | Waiting for players to submit secrets |
| `PLAYING`  | Game in progress                   |
| `GAME_OVER`| Match complete                     |

---

### submit-secret

Submit your secret number for the round.

**Client → Server**
```javascript
socket.emit('submit-secret', { roomCode, secret }, callback);
```

**Parameters:**
| Field    | Type   | Description                    |
|----------|--------|--------------------------------|
| roomCode | string | Room code                      |
| secret   | string | Secret number (unique digits)  |

**Callback Response (Success):**
```json
{
  "success": true,
  "message": "Secret submitted successfully"
}
```

**Callback Response (Error):**
```json
{
  "success": false,
  "message": "Secret must have unique digits"
}
```

**Validation Rules:**
- Must have exactly `digits` characters (3 or 4)
- All digits must be unique
- Only numeric characters (0-9)

---

### opponent-ready

Emitted when your opponent has submitted their secret.

**Server → Client**
```json
{
  "oderId": "opponent_id"
}
```

---

### match-start

Emitted when both players have submitted secrets and the round begins.

**Server → Client (Both Players)**
```json
{
  "currentTurn": "first_player_id",
  "roundNumber": 1,
  "timerDuration": 30
}
```

**Notes:**
- `timerDuration` is `null` for easy mode, `30` for hard mode
- First round: Random first player
- Subsequent rounds: Previous round's loser starts

---

### submit-guess

Submit a guess during your turn.

**Client → Server**
```javascript
socket.emit('submit-guess', { roomCode, guess }, callback);
```

**Callback Response (Success):**
```json
{
  "success": true,
  "result": {
    "player": "your_id",
    "playerName": "your_username",
    "guess": "1234",
    "bulls": 1,
    "cows": 2,
    "shit": 1,
    "guessNumber": 1,
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

**Callback Response (Error):**
```json
{
  "success": false,
  "message": "It is not your turn"
}
```

**Result Meanings:**
| Field | Description                          |
|-------|--------------------------------------|
| bulls | Right digit in right position 🟢     |
| cows  | Right digit in wrong position 🟡     |
| shit  | Digit not in secret ⚫               |

---

### turn-result

Emitted to both players after a guess is made.

**Server → Client (Both Players)**
```json
{
  "player": "guesser_id",
  "playerName": "guesser_name",
  "guess": "1234",
  "bulls": 1,
  "cows": 2,
  "shit": 1,
  "guessNumber": 3,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "nextTurn": "next_player_id"
}
```

---

### round-over

Emitted when a player wins a round (but not the match).

**Server → Client (Both Players)**
```json
{
  "roundWinner": "winner_id",
  "roundWinnerName": "winner_username",
  "roundLoser": "loser_id",
  "scores": {
    "host_id": 1,
    "opponent_id": 0
  },
  "nextRound": 2
}
```

**Notes:**
- After receiving this event, players must submit new secrets for the next round
- The round loser gets to go first in the next round

---

### game-over

Emitted when the match ends (player wins or opponent disconnects/quits).

**Server → Client (Both Players)**
```json
{
  "winner": "winner_id",
  "winnerName": "winner_username",
  "reason": "won",
  "message": "Player1 wins!",
  "finalScores": {
    "host_id": 2,
    "opponent_id": 1
  },
  "hostId": "host_id",
  "opponentId": "opponent_id"
}
```

**Reason Values:**
| Reason        | Description                     |
|---------------|---------------------------------|
| `won`         | Player won enough rounds        |
| `disconnect`  | Opponent disconnected           |
| `opponent_quit` | Opponent left the game        |

---

## Timer Events

These events only occur in **Hard Mode** (`difficulty: "hard"`).

**Hard Mode Features:**
- 30-second turn timer with auto-skip on timeout
- Only last 5 guesses visible per player (FIFO queue on client)

### timer-tick

Emitted every second with remaining turn time.

**Server → Client (Both Players)**
```json
{
  "timeLeft": 25
}
```

**Notes:**
- Timer starts at 30 seconds
- Emitted every second while counting down

---

### turn-skipped

Emitted when a player's turn is skipped due to timeout.

**Server → Client (Both Players)**
```json
{
  "skippedPlayer": "timed_out_player_id",
  "nextTurn": "other_player_id",
  "message": "Turn skipped due to timeout"
}
```

---

## Invite Events

### send-game-invite

Send a game invitation to a friend.

**Client → Server**
```javascript
socket.emit('send-game-invite', { friendId, roomCode }, callback);
```

**Callback Response (Success):**
```json
{
  "success": true,
  "message": "Invite sent"
}
```

**Callback Response (Error):**
```json
{
  "success": false,
  "message": "Friend is offline"
}
```

---

### game-invite

Received when someone invites you to a game.

**Server → Client**
```json
{
  "from": {
    "_id": "inviter_id",
    "username": "inviter_name"
  },
  "roomCode": "ABCD",
  "format": 3,
  "digits": 4,
  "difficulty": "easy",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### match-invite

Alternative invite event (sent via REST API).

**Server → Client**
```json
{
  "roomCode": "ABCD",
  "host": {
    "_id": "host_id",
    "username": "host_name"
  },
  "format": 3,
  "digits": 4,
  "difficulty": "easy"
}
```

---

### decline-game-invite

Notify the inviter that you declined their invite.

**Client → Server**
```javascript
socket.emit('decline-game-invite', { inviterId });
```

---

### invite-declined

Received when someone declines your game invite.

**Server → Client**
```json
{
  "by": {
    "_id": "decliner_id",
    "username": "decliner_name"
  }
}
```

---

## Connection Events

### Disconnect Handling

When a player disconnects during an active game:

1. Their online status is updated in the database
2. If game is in `SETUP` or `PLAYING` state:
   - Remaining player receives `game-over` event
   - Reason will be `"disconnect"`
   - Remaining player wins automatically

**Server → Client (Remaining Player)**
```json
{
  "winner": "remaining_player_id",
  "winnerName": "You",
  "reason": "disconnect",
  "message": "PlayerName disconnected. You win!",
  "finalScores": {
    "host_id": 0,
    "opponent_id": 0
  },
  "hostId": "host_id",
  "opponentId": "opponent_id"
}
```

---

## Event Flow Examples

### Typical Game Flow

```
1. Host: emit('create-room', settings)
2. Host: receives room code in callback
3. Opponent: emit('join-room', roomCode)
4. Host: receives 'player-joined' event
5. Host: emit('start-game', roomCode)
6. Both: receive 'game-start' event

--- Setup Phase ---
7. Both: emit('submit-secret', { roomCode, secret })
8. Both: receive 'opponent-ready' when other submits
9. Both: receive 'match-start' when both ready

--- Playing Phase ---
10. Current player: emit('submit-guess', { roomCode, guess })
11. Both: receive 'turn-result' event
12. Repeat 10-11 until win

--- Round/Match End ---
13. Both: receive 'round-over' or 'game-over' event
```

### Hard Mode Timer Flow

```
1. Player's turn starts
2. Server: emit('timer-tick', { timeLeft: 30 })
3. Server: emit('timer-tick', { timeLeft: 29 })
   ... (continues every second)
4a. Player submits guess → timer resets for next player
4b. Timer reaches 0 → emit('turn-skipped'), turn passes
```

---

## Error Handling

All callback-based events follow this pattern for errors:

```json
{
  "success": false,
  "message": "Descriptive error message"
}
```

**Common Errors:**
| Message | Cause |
|---------|-------|
| `"Game not found"` | Invalid or expired room code |
| `"You are not part of this game"` | User not in this room |
| `"It is not your turn"` | Trying to guess out of turn |
| `"Game is not in playing state"` | Trying to guess during setup |
| `"Only the host can start the game"` | Non-host trying to start |
| `"Secret must have unique digits"` | Invalid secret format |
