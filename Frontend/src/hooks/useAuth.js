import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const useAuth = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, loading } = useAuthStore();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  return {
    isAuthenticated,
    user,
    loading,
  };
};

export default useAuth;
