// components/ui/StatusIndicator.tsx
import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface StatusIndicatorProps {
  isLoading: boolean;
  loadingText?: string;
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  isLoading,
  loadingText = 'Loading AI face detection models...',
  className = '',
}) => {
  if (!isLoading) return null;

  return (
    <div className={`bg-blue-600 text-white p-4 rounded-lg mb-6 border-l-4 border-blue-400 ${className}`}>
      <div className="flex items-center">
        <LoadingSpinner size="sm" className="mr-3" />
        <span>{loadingText}</span>
      </div>
    </div>
  );
};