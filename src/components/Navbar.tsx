
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthState } from '@/contexts/AuthStateContext';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, LayoutDashboard, Key, Settings, User, History, LogOut, Menu, CreditCard, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { profile } = useProfile();
  const { setAuthState } = useAuthState();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const isChatPage = location.pathname === '/chat';
  const isAuthPage = location.pathname === '/auth';
  const isLandingPage = location.pathname === '/';
  const [isNavOpen, setIsNavOpen] = React.useState(false);

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

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsNavOpen(false);
  };

  const NavigationContent = () => (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold mb-4 text-foreground">Navigation</h2>
      
      <Button
        variant="ghost"
        className="w-full justify-start gap-3 text-foreground hover:bg-muted"
        onClick={() => handleNavigation('/chat')}
      >
        <History className="h-4 w-4" />
        Chat History (Coming Soon)
      </Button>
      
      <Button
        variant="ghost"
        className="w-full justify-start gap-3 text-foreground hover:bg-muted"
        onClick={() => handleNavigation('/settings')}
      >
        <Settings className="h-4 w-4" />
        Settings
      </Button>
    </div>
  );

  return (
    <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-10 py-4">
        <div className="flex items-center justify-between">
          {/* Logo or Navigation Button */}
          {isMobile && !isLandingPage && user ? (
            <Sheet open={isNavOpen} onOpenChange={setIsNavOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-4">
                <SheetHeader>
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                </SheetHeader>
                <NavigationContent />
              </SheetContent>
            </Sheet>
          ) : (
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
              <img 
                src="/lovable-uploads/c8883599-53d7-47be-aa05-ca398cdd577f.png" 
                alt="SwitchMinds" 
                className="h-8 w-8"
              />
              <span className="text-xl sm:text-2xl font-bold text-foreground">SwitchMinds</span>
            </div>
          )}

          {/* Right Side - Auth Buttons or User Menu */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {isAuthPage ? (
              <Button variant="ghost" onClick={() => navigate('/')}>
                Back to Home
              </Button>
            ) : !user ? (
              <>
                <Button variant="ghost" onClick={handleLoginClick} size="sm">
                  Login
                </Button>
                <Button onClick={handleSignupClick} className="bg-blue-600 hover:bg-blue-700" size="sm">
                  Sign Up
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-2 sm:space-x-4">
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
                    <Button variant="ghost" className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full">
                      <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                        <AvatarImage src={profile?.avatar_url} alt="Profile" />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs sm:text-sm font-medium">
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
                        <p className="font-medium">
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
                    <DropdownMenuItem onClick={() => navigate('/credits')}>
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span>Credits</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={toggleTheme}>
                      {theme === 'light' ? <Moon className="mr-2 h-4 w-4" /> : <Sun className="mr-2 h-4 w-4" />}
                      <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
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
