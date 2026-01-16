

* * *

## 9. POINTS TABLE & CALCULATIONS

### 9.1 Complete Points Formula

Since both players always play on the same settings (same difficulty and same digit count), we do not need multipliers to normalize the score. The score is a direct reflection of performance.

**FOR WINNER OF A ROUND:**
*   **Base Win:** 1000 points
*   **Attempt Efficiency:** Points based on how few guesses were used (See Table 9.3).
*   **Time Bonus:** Sum of all time bonuses earned during the round.

**Formula:**
`TOTAL = 1000 + Efficiency + Time Bonus`

**FOR LOSER OF A ROUND:**
*   **Consolation:** 200 - (attempts × 10) points.
*   *Minimum score is 0.*

**Formula:**
`TOTAL = 200 - (Attempts × 10)`

**FOR TIE ROUND (Online Simultaneous Solve):**
*   **Base Tie Bonus:** 500 points (Both players).
*   **Efficiency & Time:** Calculated normally for both.

* * *

### 9.2 Time Bonus Per Guess (Based on 45s Timer)

| Time Taken | Tier | Bonus Earned |
| :--- | :--- | :--- |
| **0 - 10s** | ⚡⚡⚡ Lightning | **+100 pts** |
| **10.1 - 25s** | ⚡⚡ Fast | **+75 pts** |
| **25.1 - 45s** | ⚡ Standard | **+50 pts** |
| **Timeout** | 🐢 Slow | **0 pts** |

*Note: Time bonus is calculated for every individual guess submitted.*

* * *

### 9.3 Attempt Efficiency Table

*Points awarded based on how few guesses it took to solve. Solving a 4-Digit code grants higher points per attempt because it is statistically harder.*

| Attempts | 3-Digit Game | 4-Digit Game |
| :--- | :--- | :--- |
| **1** | +1000 (Lucky!) | +2000 (Insane!) |
| **2** | +600 | +900 |
| **3** | +500 | +800 |
| **4** | +400 | +700 |
| **5** | +350 | +600 |
| **6** | +300 | +500 |
| **7** | +250 | +400 |
| **8** | +200 | +350 |
| **9** | +150 | +300 |
| **10** | +100 | +250 |
| **11-15** | +50 | +150 |
| **16-20** | N/A | +50 |

* * *

### 9.4 Worked Example: Complete Round

**Scenario:**
*   **Mode:** 3-Digit Game
*   **Winner:** Alex (Solved in 4 attempts)
*   **Loser:** Jordan (Made 5 attempts)

**PLAYER A (ALEX) - WINNER**

**1. Gameplay Breakdown:**
*   Guess 1: 8s (⚡⚡⚡) → +100
*   Guess 2: 12s (⚡⚡) → +75
*   Guess 3: 30s (⚡) → +50
*   Guess 4: 9s (⚡⚡⚡) → +100 (Winning Guess)
*   **Total Time Bonus:** +325

**2. Calculation:**
*   Base Win: **1000**
*   Efficiency (4 Attempts): **+400**
*   Time Bonus: **+325**

**🏆 ALEX TOTAL: 1,725 Points**

**PLAYER B (JORDAN) - LOSER**

**1. Calculation:**
*   Consolation Base: 200
*   Deduction: 5 attempts × 10 = -50

**💀 JORDAN TOTAL: 150 Points**

* * *

### 9.5 Tournament League Scoring (Offline Party Mode)

*In Tournament Mode, we track "League Points" to determine the ranking. The "Game Score" is used only as a tie-breaker.*

**A. LEAGUE POINTS (Aggressive Scoring)**
*   **Win:** +2 Points
*   **Draw:** +1 Point
*   **Loss:** -2 Points
*   *Note: Negative scores are possible in the league table.*

**B. TIE-BREAKER LOGIC**
If two players have the same League Points, the winner is decided by:
1.  **Head-to-Head:** Who won the match between them?
2.  **Total Game Score:** Sum of points earned in all matches (using formula 9.1).

**C. LEADERBOARD DISPLAY EXAMPLE**

| Rank | Player | W | L | D | League Pts | Total Score (Tiebreaker) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 🥇 | **Sarah** | 4 | 0 | 0 | **8** | 6,250 |
| 🥈 | **Mike** | 3 | 1 | 0 | **4** | 5,850 |
| 🥉 | **Alex** | 3 | 1 | 0 | **4** | 5,100 |
| 4 | **Jen** | 0 | 4 | 0 | **-8** | 1,400 |

*Math check for Alex/Mike: (3 Wins × 2) + (1 Loss × -2) = 6 - 2 = 4 Points.*

* * *

### 9.6 Visual Display Formats

**During Gameplay (HUD):**
*   **Current Score:** "Score: 225" (Updates live as Time Bonuses are earned).

**Round End Screen (Animation):**
1.  **Base Win:** "1000" (Slams onto screen)
2.  **Efficiency:** "+400" (Slides in)
3.  **Time Bonus:** "+325" (Counts up rapidly)
4.  **Final Total:** "1,725" (Pulses/Glows)

**Match Summary (Statistics):**
*   **Total Score:** 5,175
*   **Avg. Time:** 14.2s
*   **Logic Rating:** S / A / B / C (Based on Efficiency)