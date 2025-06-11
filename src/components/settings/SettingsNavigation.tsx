
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User, Settings, CreditCard, Key, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export const SettingsNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const navigationItems = [
    { path: '/settings', label: 'Settings', icon: Settings },
    { path: '/profile', label: 'Profile', icon: User },
    { path: '/credits', label: 'Credits', icon: CreditCard },
    { path: '/api-keys', label: 'API Keys', icon: Key },
  ];

  return (
    <div className="w-64 bg-background border-r border-border min-h-screen p-4 space-y-2">
      <h2 className="text-lg font-semibold mb-4 text-foreground">Account Settings</h2>
      
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        
        return (
          <Button
            key={item.path}
            variant={isActive ? "default" : "ghost"}
            className={`w-full justify-start gap-3 ${
              isActive ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'
            }`}
            onClick={() => navigate(item.path)}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Button>
        );
      })}
      
      <div className="pt-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-foreground hover:bg-muted"
          onClick={toggleTheme}
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        </Button>
      </div>
    </div>
  );
};
