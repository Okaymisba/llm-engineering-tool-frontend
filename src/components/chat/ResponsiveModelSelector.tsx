
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ResponsiveModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  loading?: boolean;
  children?: React.ReactNode;
  sidebarOpen?: boolean;
  onSidebarToggle?: () => void;
}

export const ResponsiveModelSelector: React.FC<ResponsiveModelSelectorProps> = ({
  selectedModel,
  onModelChange,
  loading = false,
  children,
  sidebarOpen,
  onSidebarToggle
}) => {
  const location = useLocation();
  const isChatPage = location.pathname === '/chat';

  return (
    <>
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Sidebar toggle for chat page */}
            {isChatPage && onSidebarToggle && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onSidebarToggle}
                className="text-gray-600 hover:text-gray-900 md:block"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            
            {/* Logo - hidden on mobile for chat page */}
            <h1 className={`text-xl font-semibold text-gray-900 ${isChatPage ? 'hidden md:block' : ''}`}>
              Syncmind
            </h1>
          </div>
          
          <Navbar
            selectedModel={selectedModel}
            onModelChange={onModelChange}
            showModelSelector={isChatPage}
            hideUserMenu={false}
          />
        </div>
      </div>
      {children}
    </>
  );
};
