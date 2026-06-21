import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, token } = useAuthStore();
  const localToken = localStorage.getItem('token');
  
  if (!isAuthenticated && !localToken && !token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
