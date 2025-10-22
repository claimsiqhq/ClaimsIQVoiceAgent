
import React from 'react';

export const WelcomeScreen: React.FC = () => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
      <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V7a2 2 0 012-2h4M5 8h2a2 2 0 012 2v6a2 2 0 01-2 2H5l-4 4V7a2 2 0 012-2h2" />
        </svg>
      </div>
      <h2 className="text-3xl font-bold text-gray-100 mb-2">Live AI Support is Ready</h2>
      <p className="text-lg text-gray-400 max-w-lg">
        Tap the icon below to start a conversation with your AI assistant for property claims. Ask about RAG implementation, technical documents, or inspection procedures.
      </p>
    </div>
  );
};
