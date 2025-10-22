
import React, { useEffect, useRef } from 'react';
import type { TranscriptEntry } from '../types';
import { TranscriptSpeaker } from '../types';

interface TranscriptionViewProps {
  transcripts: TranscriptEntry[];
  currentUserTranscript: string;
  currentAgentTranscript: string;
}

const TranscriptMessage: React.FC<{ entry: TranscriptEntry }> = ({ entry }) => {
  const isUser = entry.speaker === TranscriptSpeaker.User;
  return (
    <div className={`flex items-start gap-3 my-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center text-sm font-bold">AI</div>
      )}
      <div className={`max-w-md md:max-w-lg p-3 rounded-2xl ${isUser ? 'bg-blue-600 rounded-br-none' : 'bg-gray-700 rounded-bl-none'}`}>
        <p className="text-base leading-relaxed">{entry.text}</p>
      </div>
       {isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center text-sm font-bold">You</div>
      )}
    </div>
  );
};


export const TranscriptionView: React.FC<TranscriptionViewProps> = ({
  transcripts,
  currentUserTranscript,
  currentAgentTranscript,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcripts, currentUserTranscript, currentAgentTranscript]);

  return (
    <div ref={scrollRef} className="flex-grow overflow-y-auto pr-2 -mr-2 custom-scrollbar">
      <div className="flex flex-col">
        {transcripts.map((entry, index) => (
          <TranscriptMessage key={index} entry={entry} />
        ))}
        {currentUserTranscript && (
          <TranscriptMessage entry={{ speaker: TranscriptSpeaker.User, text: currentUserTranscript }} />
        )}
        {currentAgentTranscript && (
          <TranscriptMessage entry={{ speaker: TranscriptSpeaker.Agent, text: currentAgentTranscript }} />
        )}
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(107, 114, 128, 0.5);
          border-radius: 20px;
          border: 3px solid transparent;
          background-clip: content-box;
        }
      `}</style>
    </div>
  );
};
