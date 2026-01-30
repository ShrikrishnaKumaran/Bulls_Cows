import { Link } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuthStore();

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          Bulls & Cows
        </Link>
        <nav className="nav">
          {isAuthenticated ? (
            <>
              <Link to="/profile">Profile</Link>
              <span>Welcome, {user?.username}</span>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
