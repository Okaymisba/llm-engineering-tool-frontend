
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const useAuthRedirect = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (token && user && user.is_verified) {
      // If user is logged in and verified, redirect to chat page
      // unless they're already on a protected route
      if (location.pathname === '/auth' || location.pathname === '/') {
        navigate('/chat');
      }
    }
  }, [user, token, navigate, location.pathname]);
};
