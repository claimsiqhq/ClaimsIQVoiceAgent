import { GoogleGenAI, Modality, LiveSession, FunctionDeclaration, Type } from "@google/genai";
import type { LiveCallbacks } from "@google/genai";

const SYSTEM_INSTRUCTION = `You are a live support agent for property claims inspectors. You are an expert in building systems that use Retrieval-Augmented Generation (RAG). Your primary goal is to provide concise, clear, and highly responsive assistance. You have access to a tool called 'lookupInspectionManual' that can search a technical property inspection manual. Use this tool whenever a user asks a specific question about inspection procedures, standards, or definitions (e.g., "what is category 3 water?", "how do I check for structural integrity?"). Do not guess; use the tool to find the correct information and base your answer on the retrieved text. When you use the tool, inform the user you are looking it up.`;

let inputAudioContext: AudioContext | null = null;
let scriptProcessor: ScriptProcessorNode | null = null;
let mediaStream: MediaStream | null = null;

const lookupInspectionManual: FunctionDeclaration = {
  name: 'lookupInspectionManual',
  description: 'Searches the property inspection technical manual for specific information about procedures, definitions, or standards.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description: 'The specific topic or question to look up in the manual. For example, "mold identification" or "structural integrity checks".',
      },
    },
    required: ['query'],
  },
};

export const connectToLiveSession = async (callbacks: LiveCallbacks): Promise<LiveSession> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
  }
  if (inputAudioContext && inputAudioContext.state !== 'closed') {
    await inputAudioContext.close();
  }
  
  mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

  const customOnOpen = (sessionPromise: Promise<LiveSession>) => {
    inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    const source = inputAudioContext.createMediaStreamSource(mediaStream!);
    scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
    
    scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
      const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
      const pcmBlob = createBlob(inputData);
      sessionPromise.then((session) => {
        session.sendRealtimeInput({ media: pcmBlob });
      });
    };
    source.connect(scriptProcessor);
    scriptProcessor.connect(inputAudioContext.destination);
    callbacks.onopen?.();
  };

  const customOnClose = () => {
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
    }
    if (scriptProcessor) {
        scriptProcessor.disconnect();
        scriptProcessor = null;
    }
    if (inputAudioContext && inputAudioContext.state !== 'closed') {
        inputAudioContext.close();
        inputAudioContext = null;
    }
    callbacks.onclose?.();
  };

  const sessionPromise = ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
    callbacks: {
      ...callbacks,
      onopen: () => customOnOpen(sessionPromise),
      onclose: customOnClose
    },
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
      },
      tools: [{ functionDeclarations: [lookupInspectionManual] }],
      systemInstruction: SYSTEM_INSTRUCTION,
      inputAudioTranscription: {},
      outputAudioTranscription: {},
    },
  });

  return sessionPromise;
};

// --- Audio Helper Functions ---

function createBlob(data: Float32Array) {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}