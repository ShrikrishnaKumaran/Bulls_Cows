/**
 * HomeHeader - Top navigation bar for the home screen
 * 
 * Contains:
 * - Logout button (left)
 * - Profile button (right)
 */
import { useNavigate } from 'react-router-dom';

// Logout Icon
const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path fillRule="evenodd" d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm10.72 4.72a.75.75 0 011.06 0l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H9a.75.75 0 010-1.5h10.94l-1.72-1.72a.75.75 0 010-1.06z" clipRule="evenodd" />
  </svg>
);

// Profile Icon
const ProfileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
  </svg>
);

const HomeHeader = ({ onLogout }) => {
  const navigate = useNavigate();

  return (
    <header className="w-full px-4 sm:px-6 py-4 pt-10">
      <div className="flex items-center justify-between">
        {/* Logout - Top Left */}
        <button
          onClick={onLogout}
          className="bg-white/5 p-3 rounded-full backdrop-blur-sm hover:bg-white/10 transition-all text-red-400/80 hover:text-red-400"
          title="Logout"
        >
          <LogoutIcon />
        </button>
        
        {/* Profile - Top Right */}
        <button
          onClick={() => navigate('/profile')}
          className="bg-white/5 p-3 rounded-full backdrop-blur-sm hover:bg-white/10 transition-all text-slate-300 hover:text-white"
          title="Profile"
        >
          <ProfileIcon />
        </button>
      </div>
    </header>
  );
};

export default HomeHeader;
