
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const useAuthRedirect = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect to chat if user is on auth page and successfully logged in
    if (user && window.location.pathname === '/auth') {
      navigate('/chat');
    }
  }, [user, navigate]);
};
