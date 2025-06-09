
import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { ModelsShowcase } from '@/components/ModelsShowcase';

export const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Monitor your AI model usage and analytics</p>
        </div>
        <ModelsShowcase />
      </div>
    </div>
  );
};
