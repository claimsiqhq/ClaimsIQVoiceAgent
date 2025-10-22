
import React from 'react';
import type { SessionStatus } from '../types';

interface StatusIndicatorProps {
  status: SessionStatus;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  const getStatusInfo = (): { text: string; color: string } => {
    switch (status) {
      case 'idle':
        return { text: 'Idle', color: 'bg-gray-500' };
      case 'connecting':
        return { text: 'Connecting...', color: 'bg-yellow-500' };
      case 'listening':
        return { text: 'Listening', color: 'bg-green-500' };
      case 'speaking':
        return { text: 'Speaking', color: 'bg-blue-500' };
      case 'error':
        return { text: 'Error', color: 'bg-red-500' };
      case 'closing':
        return { text: 'Closing...', color: 'bg-gray-500' };
      default:
        return { text: 'Offline', color: 'bg-gray-500' };
    }
  };

  const { text, color } = getStatusInfo();

  return (
    <div className="flex items-center space-x-2">
      <span className="relative flex h-3 w-3">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-75`}></span>
        <span className={`relative inline-flex rounded-full h-3 w-3 ${color}`}></span>
      </span>
      <span className="text-sm text-gray-300 capitalize">{text}</span>
    </div>
  );
};
