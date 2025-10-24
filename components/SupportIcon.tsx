import React from 'react';
import type { SessionStatus } from '../types';

interface SupportIconProps {
  status: SessionStatus;
  onClick: () => void;
}

const MicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
        <line x1="12" y1="19" x2="12" y2="22"></line>
    </svg>
);

const HeadphoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a9 9 0 0 0-9 9v4.5a2.5 2.5 0 0 0 2.5 2.5h2a2.5 2.5 0 0 0 2.5-2.5V11a9 9 0 0 0-9-9zM12 2a9 9 0 0 1 9 9v4.5a2.5 2.5 0 0 1-2.5 2.5h-2a2.5 2.5 0 0 1-2.5-2.5V11a9 9 0 0 1 9-9z"></path>
    </svg>
);


const PhoneOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 3h4a2 2 0 0 1 2 2v2M22 6a2 2 0 0 0-2-2h-1.39a2 2 0 0 0-1.41.59l-.82.82a2 2 0 0 1-2.82 0l-2-2a2 2 0 0 0-2.82 0L8.22 5.18a2 2 0 0 0 0 2.82l2 2a2 2 0 0 0 2.82 0l.82-.82a2 2 0 0 1 1.41-.59H20a2 2 0 0 0 2-2Z"></path>
        <path d="M14 18V5a2 2 0 0 0-2-2h-1.39a2 2 0 0 0-1.41.59l-.82.82a2 2 0 0 1-2.82 0l-2-2a2 2 0 0 0-2.82 0L2.18 5.18a2 2 0 0 0 0 2.82l2 2a2 2 0 0 0 2.82 0l.82-.82a2 2 0 0 1 1.41-.59H10a2 2 0 0 1 2 2v1"></path>
        <path d="m2 2 20 20"></path>
    </svg>
);

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);


export const SupportIcon: React.FC<SupportIconProps> = ({ status, onClick }) => {
  const isSessionActive = status !== 'idle' && status !== 'error';

  const getIcon = () => {
    switch (status) {
      case 'listening':
      case 'connecting':
        return <MicIcon />;
      case 'speaking':
        return <HeadphoneIcon />;
      case 'searching':
        return <SearchIcon />;
      case 'idle':
      case 'error':
        return <MicIcon />;
      case 'closing':
      default:
        return <PhoneOffIcon />;
    }
  };

  const baseClasses = "relative w-20 h-20 rounded-full flex items-center justify-center text-white transition-all duration-300 ease-in-out shadow-lg focus:outline-none focus:ring-4";
  const colorClasses = isSessionActive 
    ? "bg-red-600 hover:bg-red-700 focus:ring-red-400" 
    : "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-400";

  const pulseClass = (status === 'listening' || status === 'speaking') ? 'animate-pulse' : '';
  const spinClass = status === 'searching' ? 'animate-spin' : '';

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${colorClasses}`}
      aria-label={isSessionActive ? 'End Support Session' : 'Start Support Session'}
      disabled={status === 'searching' || status === 'connecting' || status === 'closing'}
    >
      <span className={`absolute inline-flex h-full w-full rounded-full bg-opacity-75 ${pulseClass} ${isSessionActive ? 'bg-red-500' : 'bg-indigo-500'}`}></span>
      <span className={`relative z-10 text-3xl ${spinClass}`}>{getIcon()}</span>
    </button>
  );
};