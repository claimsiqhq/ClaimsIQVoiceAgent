
export enum TranscriptSpeaker {
  User = 'USER',
  Agent = 'AGENT',
}

export interface TranscriptEntry {
  speaker: TranscriptSpeaker;
  text: string;
}

export type SessionStatus = 'idle' | 'connecting' | 'listening' | 'speaking' | 'error' | 'closing';
