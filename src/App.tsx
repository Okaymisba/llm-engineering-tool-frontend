
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthStateProvider } from "@/contexts/AuthStateContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Navbar } from "@/components/Navbar";
import Index from "./pages/Index";
import { LandingPage } from "./pages/LandingPage";
import { AuthPage } from "./pages/AuthPage";
import { Dashboard } from "./pages/Dashboard";
import { ChatPage } from "./pages/ChatPage";
import { ApiKeysPage } from "./pages/ApiKeysPage";
import { DocumentsPage } from "./pages/DocumentsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SettingsPage } from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import React, { useState } from 'react';

const queryClient = new QueryClient();

function AppContent() {
  const location = useLocation();
  const [selectedModel, setSelectedModel] = useState('');
  
  const isChatPage = location.pathname === '/chat';

  return (
    <div className="min-h-screen">
      <Navbar 
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        showModelSelector={isChatPage}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/chat" element={
          <ProtectedRoute>
            <ChatPage 
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
            />
          </ProtectedRoute>
        } />
        <Route path="/api-keys" element={
          <ProtectedRoute>
            <ApiKeysPage />
          </ProtectedRoute>
        } />
        <Route path="/api-keys/:apiKeyId/documents" element={
          <ProtectedRoute>
            <DocumentsPage />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthStateProvider>
          <ThemeProvider>
            <TooltipProvider>
              <Toaster />
              <SonnerToaster />
              <BrowserRouter>
                <AppContent />
              </BrowserRouter>
            </TooltipProvider>
          </ThemeProvider>
        </AuthStateProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
