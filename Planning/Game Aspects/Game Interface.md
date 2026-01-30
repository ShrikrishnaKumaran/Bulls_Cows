## 7. Game Interface & Logic Specification

### 7.1 Launch & Main Menu

**Screen: Home Screen**

**Elements:**

*   **Game Title:** "Bulls, Cows & Shit" (Stylized Logo)
*   **Primary Game Modes (Vertical Stack):**
    *   [📱 **PASS & PLAY**] - Offline 1v1 on the same device.
    *   [⚔️ **VS FRIEND**] - Online 1v1 via Private Room Code.
    *   [🏆 **TOURNAMENT**] - Offline League for 3-8 players.
*   **Utility Buttons (Bottom Row):**
    *   [❓ Rules] - Tutorial overlay.
    *   [⚙️ Settings] - Sound, Haptics, Theme.

**User Action:** Selects a mode to begin setup.

* * *

### 7.2 Game Setup Flows

#### 7.2A PASS & PLAY (Offline 1v1)

**Step 1: Match Format**
*   **Best of 1:** Sudden Death (Quick).
*   **Best of 3:** First to 2 wins (Standard).
*   **Best of 5:** First to 3 wins (Marathon).
*   **user can also select no.of digits** 3 or 4.

**Step 2: Difficulty Selection**
*   **[🟢 EASY MODE]**
    *   **Validation:** Automatic (System calculates Bulls/Cows instantly).
    *   **History:** **Infinite**. Scroll back to see every guess.
*   **[🔴 HARD MODE]**
    *   **Validation:** **Manual**. The opponent must count and enter your Bulls/Cows.(the system validates the manual things to avoid cheating).
    *   **History:** **Limited (FIFO)**. Only the **last 5 guesses** are visible.

**Step 3: Player Identity**
*   Input names for Player 1 & Player 2.
*   (Optional) "Randomize" button for names like "SaltyPanda42".

**Step 4: Secret Number Setup**
*   **Player 1** sets 3 unique digits -> Locks in.
*   **Interstitial:** "Pass device to Player 2".
*   **Player 2** sets 3 unique digits -> Locks in.
*   **Game Starts.**

#### 7.2B VS FRIEND (Online Private Lobby)

**Step 1: Role Selection**
*   Button A: **[CREATE ROOM]**
*   Button B: **[JOIN ROOM]**

**Flow A: CREATE ROOM (Host)**
1.  Host selects **Format** (Best of 1/3/5) and **Difficulty** (Easy/Hard).
2.  **Lobby Screen:** Displays 4-digit Code (e.g., **"X9P2"**).
3.  Status: "Waiting for friend..." -> "Friend Joined!" -> Game Starts.

**Flow B: JOIN ROOM (Guest)**
1.  Guest enters the 4-digit code.
2.  Clicks [Join].
3.  Game loads with Host's settings.

* * *

### 7.3 Main Gameplay Screen

**Layout Elements (Universal):**

**1. Header Stats**
*   Score: "P1: 1 | P2: 0"
*   Round Info: "Round 2 | Best of 3"
*   Mode Badge: "HARD MODE" (Red) or "EASY MODE" (Green)

**2. The History Log (Central Display)**
*   **EASY MODE Behavior:**
    *   A scrollable list.
    *   Row format: `[ 1 2 3 ]` → 🎯 1 | 🐄 1
    *   Rows remain visible forever.
*   **HARD MODE Behavior:**
    *   A fixed container that fits exactly **5 rows**.
    *   **FIFO (First-In-First-Out):** When the 6th guess is added, the 1st guess slides off the top and is deleted.
    *   Players must memorize early clues before they vanish.

**3. Input Section (Bottom)**
*   Title: "PLAYER 1 - YOUR TURN"
*   Timer: "45s" (Countdown visual).
*   Inputs: `[ _ ] [ _ ] [ _ ]`
*   Keypad: 0-9 keys. Keys disable if pressed (to prevent repeats).
*   Button: **[ SUBMIT GUESS ]**

* * *

### 7.4 Mechanics: Submission & Validation

#### 7.4A EASY MODE FLOW (Automatic)
1.  **Submission:** Player enters 3 digits and clicks [Submit].
2.  **Calculation:** System calculates results instantly.
3.  **Feedback:** Icons pop up (🎯/🐄/💩).
4.  **Turn Switch:**
    *   *Offline:* "Pass Device" screen appears.
    *   *Online:* Turn passes to opponent immediately.

#### 7.4B HARD MODE FLOW (Manual Validation)

**Phase 1: The Guess**
*   Player 1 enters `1 2 3` and clicks [Submit].
*   **Screen:** "Pass Device to Player 2 to Validate!" (Offline) or "Waiting for Opponent Validation..." (Online).

**Phase 2: The Validation (Opponent's Screen)**
*   **Header:** "VALIDATE THE GUESS"
*   **Display:**
    *   "They Guessed: **1 2 3**"
    *   "Your Secret: **1 8 5**" (Shielded/Small)
*   **Input Controls:**
    *   Bulls (🎯): `[-] 1 [+]`
    *   Cows (🐄): `[-] 0 [+]`
*   **Action:** Click **[ CONFIRM ]**.

**Phase 3: System Verification (Anti-Cheat)**
*   **If Correct:** Game proceeds. History updates.
*   **If Incorrect (Lying/Math Error):**
    *   Visual: Screen shakes red. Sound: Error Buzz.
    *   Message: "❌ INCORRECT! System detected 1 Bull, 0 Cows." 
    *   Action: The system forces the *correct* result onto the history board.
    *   *Penalty:* "Liar" icon appears next to the validating player's name for the round. and reduce some points 

* * *

### 7.5 & 7.6 Round Results

**Win Sequence (3 Bulls Found)**
*   **Visual:** Confetti, Green Background.
*   **Text:** "🎉 ROUND WON!"
*   **Details:** "Player 1 found [573] in 6 attempts."
*   **Points:** Base Win (1000) + Speed Bonus.
*   **Action:** Auto-advance to next round setup after 5 seconds.

**Loss Sequence**
*   **Visual:** Grey Background.
*   **Text:** "ROUND LOST"
*   **Details:** "Opponent won. Their number was [824]."
*   **Action:** Auto-advance.

* * *

### 7.7 Match End Sequence

**Trigger:** One player wins the majority of rounds (e.g., 2 wins in Best of 3).

**Screen: Match Summary**
*   **Winner:** Big Avatar/Name display.
*   **Final Score:** "3 - 1"
*   **Stats:**
    *   Fastest Win (Seconds).
    *   Fewest Attempts Win.
    *   "Logic Master" (Fewest errors).
*   **Buttons:**
    *   [🔄 Rematch] (Same Settings).
    *   [🏠 Main Menu].

* * *

### 7.8 Special Cases

**A. Timeout (45s Limit)**
*   If timer hits 0: Player loses turn. No guess recorded. Turn passes to opponent.

**B. Online Disconnection**
*   **< 30s:** Game pauses with "Reconnecting..."
*   **> 30s:** Match ends. Remaining player gets "Win by Forfeit".

**C. Tie / Draw (Online Simultaneous)**
*   If both players solve in the same turn number:
    *   The Round is a **DRAW**.
    *   Points split equally.
    *   Round replay required (Does not count towards match score).

**D. Maximum Attempts (Deadlock)**
*   **Limit:** 15 Attempts per player.
*   **Resolution:** If no winner by attempt 15, the player with the most **Bulls** currently on the board wins. If tied, the round is a Draw.

* * *

### 7.9 Tournament Mode (Offline League)

**Concept:** A manager for local group play.

**Step 1: Setup**
*   **Players:** Select count (3 to 8).
*   **Difficulty:** Easy or Hard.
*   **Input:** Enter names for all players.

**Step 2: The Dashboard**
*   **Leaderboard:** Ranks players by Points (Win=3, Draw=1, Loss=0).
*   **Fixture List:** Shows who plays whom (e.g., "Match 1: Alex vs Sam").
*   **Action:** [🔴 START MATCH 1].

**Step 3: Gameplay Loop**
*   The device prompts: "Pass device to Alex & Sam".
*   They play a **Best of 1** match (Standard rules apply).
*   Winner is declared.
*   Device returns to Dashboard. Leaderboard updates automatically.

**Step 4: League End**
*   Podium screen for Gold, Silver, Bronze.
*   "Wooden Spoon" for last place.