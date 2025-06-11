
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const useAuthRedirect = () => {
  const { user, isInitialized } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if auth is initialized and user is authenticated
    if (isInitialized && user && window.location.pathname === '/auth') {
      navigate('/chat');
    }
  }, [user, isInitialized, navigate]);
};
