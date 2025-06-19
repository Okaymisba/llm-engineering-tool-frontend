
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';

interface ResponsiveModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  loading?: boolean;
  children?: React.ReactNode;
}

export const ResponsiveModelSelector: React.FC<ResponsiveModelSelectorProps> = ({
  selectedModel,
  onModelChange,
  loading = false,
  children
}) => {
  const location = useLocation();
  const isChatPage = location.pathname === '/chat';

  return (
    <>
      <Navbar
        selectedModel={selectedModel}
        onModelChange={onModelChange}
        showModelSelector={isChatPage}
      />
      {children}
    </>
  );
};
