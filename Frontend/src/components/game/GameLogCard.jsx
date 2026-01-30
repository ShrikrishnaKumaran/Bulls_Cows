/**
 * GameLogCard - Individual game move log entry
 * Shows guess digits and result icons
 */
import { memo } from 'react';
import { RESULT_ICONS } from '../../utils/constants';

const GameLogCard = ({ log, digits, turnNumber }) => {
  const isPlayer1 = log.player === 'me';
  const guessDigits = log.guess.split('');
  const misses = digits - log.bulls - log.cows;

  // Generate result items with type for styling
  const resultItems = [];
  for (let i = 0; i < log.bulls; i++) resultItems.push({ emoji: RESULT_ICONS.BULL, type: 'bull' });
  for (let i = 0; i < log.cows; i++) resultItems.push({ emoji: RESULT_ICONS.COW, type: 'cow' });
  for (let i = 0; i < misses; i++) resultItems.push({ emoji: RESULT_ICONS.MISS, type: 'miss' });

  return (
    <div
      className={`
        w-[77%] relative
        ${isPlayer1 ? 'mr-auto' : 'ml-auto'}
      `}
    >
      {/* Chat Bubble Card */}
      <div
        className={`
          py-2 px-3 relative transition-all backdrop-blur-md rounded-2xl
          shadow-xl hover:shadow-2xl transform hover:scale-[1.01] transition-all duration-200
          flex flex-col gap-1
          ${isPlayer1
            ? 'bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border-l-[3px] border-primary rounded-tl-sm shadow-primary/15 items-start'
            : 'bg-gradient-to-bl from-blue-500/20 via-blue-500/10 to-transparent border-r-[3px] border-blue-500 rounded-tr-sm shadow-blue-500/15 items-end'
          }
        `}
      >
        {/* Row 1: Guess Digits */}
        <div className="flex gap-2">
          {guessDigits.map((digit, i) => (
            <span
              key={i}
              className={`
                w-7 h-7 flex items-center justify-center
                text-lg font-bold font-mono rounded-lg shadow-inner
                ${isPlayer1
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }
              `}
            >
              {digit}
            </span>
          ))}
        </div>

        {/* Row 2: Result Icons */}
        <div className="flex items-center gap-1.5">
          {resultItems.map((item, i) => (
            <span
              key={i}
              className="text-base"
            >
              {item.emoji}
            </span>
          ))}
        </div>

        {/* Turn Number Badge - Moved Inside */}
        {turnNumber && (
          <span
            className={`
              text-[10px] font-mono font-semibold absolute bottom-1
              ${isPlayer1 ? 'right-2 text-primary/70' : 'left-2 text-blue-300/70'}
            `}
          >
            #{String(turnNumber).padStart(2, '0')}
          </span>
        )}
      </div>
    </div>
  );
};

export default memo(GameLogCard);
