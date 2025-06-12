
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User, Settings, Key, Menu, History } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export const SettingsNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = React.useState(false);

  const navigationItems = [
    { path: '/chat', label: 'Chat History (Coming Soon)', icon: History },
    { path: '/settings', label: 'Settings', icon: Settings },
    { path: '/profile', label: 'Profile', icon: User },
    { path: '/api-keys', label: 'API Keys', icon: Key },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const NavigationContent = () => (
    <>
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
            onClick={() => handleNavigation(item.path)}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Button>
        );
      })}
    </>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="fixed top-20 left-4 z-50 lg:hidden">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-4 space-y-2">
          <SheetHeader>
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          </SheetHeader>
          <NavigationContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="w-64 bg-background border-r border-border min-h-screen p-4 space-y-2">
      <NavigationContent />
    </div>
  );
};
