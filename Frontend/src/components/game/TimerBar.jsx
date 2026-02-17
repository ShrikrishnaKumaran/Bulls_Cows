/**
 * TimerBar - Countdown timer with progress bar
 * Only shown in Hard mode
 */
import { memo } from 'react';
import { TIMER } from '../../utils/constants';

const TimerIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
  </svg>
);

const TimerBar = ({ timer, maxTime = TIMER.MAX_TIME_HARD }) => {
  const percentage = (timer / maxTime) * 100;
  const isLowTime = timer <= 10;

  return (
    <div className="mb-6">
      {/* Labels */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-slate-400 text-sm font-medium">TIME REMAINING</span>
        <div className="flex items-center gap-1">
          <TimerIcon className={`w-4 h-4 ${isLowTime ? 'text-red-400' : 'text-primary'}`} />
          <span className={`font-mono font-bold ${isLowTime ? 'text-red-400' : 'text-white'}`}>
            {timer.toFixed(1)}
          </span>
          <span className="text-slate-500 text-sm">/ {maxTime}.0s</span>
        </div>
      </div>

      {/* Bar */}
      <div className="w-full h-2.5 bg-slate-700/80 rounded-full overflow-hidden shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 transition-all duration-1000 ease-linear rounded-full shadow-lg"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default memo(TimerBar);
