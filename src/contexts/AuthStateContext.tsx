import React, { createContext, useContext, useState, ReactNode } from 'react';

type AuthState = 'login' | 'signup' | null;

interface AuthStateContextType {
  authState: AuthState;
  setAuthState: (state: AuthState) => void;
}

const AuthStateContext = createContext<AuthStateContextType | undefined>(undefined);

export const AuthStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(null);

  return (
    <AuthStateContext.Provider value={{ authState, setAuthState }}>
      {children}
    </AuthStateContext.Provider>
  );
};

export const useAuthState = () => {
  const context = useContext(AuthStateContext);
  if (context === undefined) {
    throw new Error('useAuthState must be used within an AuthStateProvider');
  }
  return context;
}; 