
import React from 'react';
import { useLiveSupport } from './hooks/useLiveSupport';
import { SupportIcon } from './components/SupportIcon';
import { TranscriptionView } from './components/TranscriptionView';
import { WelcomeScreen } from './components/WelcomeScreen';
import { StatusIndicator } from './components/StatusIndicator';

const App: React.FC = () => {
  const {
    isSessionActive,
    startSession,
    stopSession,
    transcripts,
    currentAgentTranscript,
    currentUserTranscript,
    status,
    error,
  } = useLiveSupport();

  return (
    <div className="bg-gray-900 text-white w-full h-screen flex flex-col font-sans antialiased overflow-hidden">
      <header className="flex-shrink-0 bg-gray-800/50 backdrop-blur-sm p-4 border-b border-gray-700 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V7a2 2 0 012-2h4M5 8h2a2 2 0 012 2v6a2 2 0 01-2 2H5l-4 4V7a2 2 0 012-2h2" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-100">AI Inspector Support</h1>
        </div>
        <StatusIndicator status={status} />
      </header>
      
      <main className="flex-grow flex flex-col p-4 overflow-hidden relative">
        {!isSessionActive && transcripts.length === 0 && <WelcomeScreen />}
        
        <TranscriptionView 
          transcripts={transcripts} 
          currentAgentTranscript={currentAgentTranscript}
          currentUserTranscript={currentUserTranscript}
        />
        
        {error && (
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-4 py-2 rounded-lg shadow-lg">
                <p><strong>Error:</strong> {error}</p>
            </div>
        )}
      </main>

      <footer className="flex-shrink-0 flex items-center justify-center p-6 bg-gray-900/50 border-t border-gray-800">
        <SupportIcon
          status={status}
          onClick={isSessionActive ? stopSession : startSession}
        />
      </footer>
    </div>
  );
};

export default App;
