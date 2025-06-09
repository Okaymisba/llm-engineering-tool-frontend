import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthState } from '@/contexts/AuthStateContext';
import { Button } from '@/components/ui/button';
import { Sparkles, MessageSquare, LayoutDashboard, Key, Settings, User, History } from 'lucide-react';
import { ModelSelector } from '@/components/chat/ModelSelector';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Navbar: React.FC = () => {
  const { user } = useAuth();
  const { setAuthState } = useAuthState();
  const navigate = useNavigate();
  const location = useLocation();
  const isChatPage = location.pathname === '/chat';
  const isAuthPage = location.pathname === '/auth';
  const [selectedModel, setSelectedModel] = React.useState('gemini-2.0-flash');

  const handleLoginClick = () => {
    setAuthState('login');
    navigate('/auth');
  };

  const handleSignupClick = () => {
    setAuthState('signup');
    navigate('/auth');
  };

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-10 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
            <Sparkles className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">SwitchMinds</span>
          </div>

          {/* Center - Model Selector (only on chat page) */}
          {isChatPage && (
            <div className="hidden md:block">
              <ModelSelector 
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
              />
            </div>
          )}

          {/* Right Side - Auth Buttons or User Menu */}
          <div className="flex items-center space-x-4">
            {isAuthPage ? (
              <Button variant="ghost" onClick={() => navigate('/')}>
                Back to Home
              </Button>
            ) : !user ? (
              <>
                <Button variant="ghost" onClick={handleLoginClick}>
                  Login
                </Button>
                <Button onClick={handleSignupClick} className="bg-blue-600 hover:bg-blue-700">
                  Sign Up
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                {/* History (only on chat page) */}
                {isChatPage && (
                  <Button variant="ghost" className="hidden md:flex items-center space-x-2">
                    <History className="h-5 w-5" />
                    <span>History</span>
                  </Button>
                )}

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span className="hidden md:inline">{user.email}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/chat')}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      <span>Chat</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/api-keys')}>
                      <Key className="mr-2 h-4 w-4" />
                      <span>API Keys</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}; 