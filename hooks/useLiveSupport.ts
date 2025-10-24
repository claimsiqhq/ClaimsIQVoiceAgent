import { useState, useRef, useCallback, useEffect } from 'react';
import type { TranscriptEntry, SessionStatus } from '../types';
import { TranscriptSpeaker } from '../types';
import { connectToLiveSession, decode, decodeAudioData } from '../services/geminiService';
import { search } from '../services/ragService';
import type { LiveSession, LiveServerMessage } from '@google/genai';

export const useLiveSupport = () => {
  const [status, setStatus] = useState<SessionStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const [currentUserTranscript, setCurrentUserTranscript] = useState('');
  const [currentAgentTranscript, setCurrentAgentTranscript] = useState('');

  const sessionPromise = useRef<Promise<LiveSession> | null>(null);
  const isSessionActive = status !== 'idle' && status !== 'error';

  const outputAudioContext = useRef<AudioContext | null>(null);
  const nextStartTime = useRef(0);
  const audioSources = useRef<Set<AudioBufferSourceNode>>(new Set());

  const userTranscriptRef = useRef('');
  const agentTranscriptRef = useRef('');

  useEffect(() => {
    userTranscriptRef.current = currentUserTranscript;
    agentTranscriptRef.current = currentAgentTranscript;
  }, [currentUserTranscript, currentAgentTranscript]);

  const handleMessage = useCallback(async (message: LiveServerMessage) => {
    if (message.toolCall) {
      console.log('Tool call received:', message.toolCall);
      for (const fc of message.toolCall.functionCalls) {
        if (fc.name === 'lookupInspectionManual') {
          setStatus('searching');
          const context = search(fc.args.query as string);
          
          sessionPromise.current?.then((session) => {
            session.sendToolResponse({
              functionResponses: [{
                id: fc.id,
                name: fc.name,
                response: { result: context },
              }]
            });
          });
        }
      }
    }
    
    if (message.serverContent) {
      if (message.serverContent.inputTranscription) {
        setStatus('listening');
        setCurrentUserTranscript(prev => prev + message.serverContent.inputTranscription.text);
      }
      
      if (message.serverContent.outputTranscription) {
        setStatus('speaking');
        setCurrentAgentTranscript(prev => prev + message.serverContent.outputTranscription.text);
      }
      
      const audioData = message.serverContent.modelTurn?.parts[0]?.inlineData?.data;
      if (audioData && outputAudioContext.current) {
        setStatus('speaking');
        nextStartTime.current = Math.max(nextStartTime.current, outputAudioContext.current.currentTime);
        const audioBuffer = await decodeAudioData(decode(audioData), outputAudioContext.current, 24000, 1);
        
        const source = outputAudioContext.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(outputAudioContext.current.destination);
        
        source.addEventListener('ended', () => {
          audioSources.current.delete(source);
          if (audioSources.current.size === 0 && status !== 'searching') {
            setStatus('listening');
          }
        });
        
        source.start(nextStartTime.current);
        nextStartTime.current += audioBuffer.duration;
        audioSources.current.add(source);
      }
      
      if (message.serverContent.turnComplete) {
        const fullUserTranscript = userTranscriptRef.current;
        const fullAgentTranscript = agentTranscriptRef.current;
        
        setTranscripts(prev => {
          const newTranscripts: TranscriptEntry[] = [...prev];
          if (fullUserTranscript.trim()) newTranscripts.push({ speaker: TranscriptSpeaker.User, text: fullUserTranscript });
          if (fullAgentTranscript.trim()) newTranscripts.push({ speaker: TranscriptSpeaker.Agent, text: fullAgentTranscript });
          return newTranscripts;
        });
        
        setCurrentUserTranscript('');
        setCurrentAgentTranscript('');
      }

      if (message.serverContent.interrupted) {
        for (const source of audioSources.current.values()) {
            source.stop();
        }
        audioSources.current.clear();
        nextStartTime.current = 0;
        setStatus('listening');
      }
    }
  }, [status]);

  const stopSession = useCallback(async () => {
    setStatus('closing');
    if (sessionPromise.current) {
      try {
        const session = await sessionPromise.current;
        session.close();
      } catch (e) {
        console.error("Error closing session:", e);
      }
    }
    sessionPromise.current = null;
    // Cleanup will be handled by onclose
  }, []);
  
  const startSession = useCallback(async () => {
    setError(null);
    setStatus('connecting');
    setTranscripts([]);
    setCurrentUserTranscript('');
    setCurrentAgentTranscript('');

    try {
      if (!outputAudioContext.current || outputAudioContext.current.state === 'closed') {
        outputAudioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      sessionPromise.current = connectToLiveSession({
        onmessage: handleMessage,
        onerror: (e) => {
          console.error("Session error:", e);
          setError("Connection failed. Please try again.");
          setStatus('error');
        },
        onclose: () => {
          setStatus('idle');
          if (outputAudioContext.current) {
            outputAudioContext.current.close().catch(console.error);
            outputAudioContext.current = null;
          }
          for (const source of audioSources.current.values()) {
            source.disconnect();
          }
          audioSources.current.clear();
        }
      });
      await sessionPromise.current;
      setStatus('listening');
    } catch (e) {
      console.error("Failed to start session:", e);
      setError(e instanceof Error ? e.message : "An unknown error occurred.");
      setStatus('error');
    }
  }, [handleMessage]);

  return {
    status,
    isSessionActive,
    startSession,
    stopSession,
    transcripts,
    currentUserTranscript,
    currentAgentTranscript,
    error,
  };
};