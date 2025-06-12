
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthState } from '@/contexts/AuthStateContext';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, LayoutDashboard, Key, Settings, User, History, LogOut } from 'lucide-react';
import { ModelSelector } from '@/components/chat/ModelSelector';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { profile } = useProfile();
  const { setAuthState } = useAuthState();
  const navigate = useNavigate();
  const location = useLocation();
  const isChatPage = location.pathname === '/chat';
  const isAuthPage = location.pathname === '/auth';
  const isLandingPage = location.pathname === '/';
  const [selectedModel, setSelectedModel] = React.useState('gemini-2.0-flash');

  const handleLoginClick = () => {
    setAuthState('login');
    navigate('/auth');
  };

  const handleSignupClick = () => {
    setAuthState('signup');
    navigate('/auth');
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-10 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
            <img 
              src="/lovable-uploads/7d859877-109a-4d32-b1c0-0707e4176c00.png" 
              alt="SwitchMinds Logo" 
              className="h-8 w-8"
            />
            <span className="text-xl md:text-2xl font-bold text-foreground">SwitchMinds</span>
          </div>

          {/* Center - Model Selector (only on chat page and only if user is authenticated) */}
          {isChatPage && user && (
            <div className="hidden md:block">
              <ModelSelector 
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
              />
            </div>
          )}

          {/* Right Side - Auth Buttons or User Menu */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {isAuthPage ? (
              <Button variant="ghost" onClick={() => navigate('/')} className="text-sm md:text-base">
                Back to Home
              </Button>
            ) : !user ? (
              <>
                <Button variant="ghost" onClick={handleLoginClick} className="text-sm md:text-base">
                  Login
                </Button>
                <Button onClick={handleSignupClick} className="bg-blue-600 hover:bg-blue-700 text-sm md:text-base">
                  Sign Up
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-2 md:space-x-4">
                {/* History (only on chat page) */}
                {isChatPage && (
                  <Button variant="ghost" className="hidden md:flex items-center space-x-2">
                    <History className="h-5 w-5" />
                    <span>History</span>
                  </Button>
                )}

                {/* Quick Action Buttons for Landing Page */}
                {isLandingPage && (
                  <div className="hidden md:flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate('/chat')}
                      className="flex items-center space-x-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Chat</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate('/dashboard')}
                      className="flex items-center space-x-2"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Button>
                  </div>
                )}

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 md:h-10 md:w-10 rounded-full">
                      <Avatar className="h-8 w-8 md:h-10 md:w-10">
                        <AvatarImage src={profile?.avatar_url} alt="Profile" />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs md:text-sm font-medium">
                          {profile?.first_name?.charAt(0).toUpperCase() || 
                           profile?.username?.charAt(0).toUpperCase() || 
                           user.email?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium text-sm">
                          {profile?.first_name && profile?.last_name 
                            ? `${profile.first_name} ${profile.last_name}`
                            : profile?.username || user.username
                          }
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
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
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
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
