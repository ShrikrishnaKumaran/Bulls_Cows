Here is the updated **Section 10: Tutorial & How to Play**, rewritten to match your specific game features (Easy vs. Hard Mode, Manual Validation, FIFO History, and the 45s Timer).

* * *

## 10. TUTORIAL & HOW TO PLAY

### 10.1 Tutorial Flow (First-Time Users)

**Step 1: Welcome Screen**
*   **Headline:** "Welcome to Bulls, Cows & Shit!"
*   **Body:** "The ultimate test of logic and memory. Guess your opponent's number before they guess yours."
*   **Actions:** [Start Tutorial] [Skip]

**Step 2: The Golden Rules**
*   **THE GOAL:** Find the secret **3/4-digit code**.
*   **THE RULES:**
    *   ✓ Uses digits **0-9**.
    *   ✓ **No repeating digits** (e.g., `121` is forbidden).
    *   ✓ **Sequence Matters!** `123` is different from `321`.
*   **Action:** [Next]

**Step 3: Decoding the Clues**
*   After every guess, you get feedback icons. Here is what they mean:
    *   🎯 **BULL:** Correct digit in the **Correct** spot. (Perfect!)
    *   🐄 **COW:** Correct digit, but in the **Wrong** spot. (Move it!)
    *   💩 **SHIT:** That digit is **Not** in the secret number. (Forget it!)
*   **Action:** [Next]

**Step 4: Interactive Practice**
*   **Scenario:** The Secret Number is **8 2 4**.
*   **Instruction:** "Try guessing **8 4 2** to see what happens."
*   **User Action:** Inputs `8` `4` `2` and taps Submit.
*   **Feedback Animation:**
    *   **8:** Correct spot → 🎯 **1 Bull**
    *   **4:** Wrong spot → 🐄 **1 Cow**
    *   **2:** Wrong spot → 🐄 **1 Cow**
*   **Result Display:** "Result: 🎯 1 | 🐄 2"
*   **Action:** [Got it!]

**Step 5: Choose Your Challenge (Difficulty)**
*   **🟢 EASY MODE:**
    *   **History:** Infinite. You can scroll back to see all your guesses.
    *   **Scoring:** Automatic.
*   **🔴 HARD MODE (Pro Rules):**
    *   **History:** **FIFO (First-In, First-Out).** Only your **last 5 guesses** remain visible. Old clues disappear!
    *   **Validation:** You must **Manually Validate** your opponent's guess. If you lie, the system punishes you!
*   **Action:** [Next]

**Step 6: Game Modes**
*   **📱 PASS & PLAY:** Face-to-face on one phone.
*   **⚔️ VS FRIEND:** Play online via Room Code.
*   **🏆 TOURNAMENT:** A league for 3-8 friends (Party Mode).
*   **Action:** [Start Playing!]

* * *

### 10.2 In-Game Help (Always Accessible)

**Help Button (❓ icon in top corner):**

Clicking opens a semi-transparent overlay:

┌─────────────────────────────────┐
│        QUICK REFERENCE          │
│                                 │
│  🎯 BULL: Right number,         │
│           Right spot.           │
│                                 │
│  🐄 COW:  Right number,         │
│           Wrong spot.           │
│                                 │
│  💩 SHIT: Wrong number.         │
│                                 │
│  🔴 HARD MODE RULES:            │
│  - History deletes after 5.     │
│  - Don't lie during validation! │
│                                 │
│  ⏱️ TIMER: 45s per turn.        │
│                                 │
│            [CLOSE]              │
└─────────────────────────────────┘

* * *

### 10.3 Tooltips & Contextual Help

**On Hover / Long-Press Elements:**

*   **History Rows (Hard Mode):** "Warning: This clue will vanish after 5 more guesses."
*   **Validation Screen (Hard Mode):** "Count carefully! The system will check your math."
*   **Timer:** "If time hits 0, you skip your turn."

**First-Time Events (Toast Notifications):**

*   **First Hard Mode Match:** "⚠️ Remember: Only your last 5 guesses are saved here!"
*   **First Manual Validation:** "Look at the opponent's guess and input the Bulls/Cows accurately."
*   **Inputting Duplicate Digit:** "❌ You already used that number!"