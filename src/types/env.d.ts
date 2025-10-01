declare namespace NodeJS {
  interface ProcessEnv {
    APP_ENV?:
      | "LOCAL"
      | "DEPLOY_PREVIEW"
      | "BRANCH_PREVIEW"
      | "PREVIEW_SERVER"
      | "PRODUCTION"
      | "E2E"
      | "CI";
    PORT?: string;
    DB_URL?: string;
    MIGRATIONS_PATH?: string;
    RESEND_API_KEY?: string;
    HIGHLIGHT_API_KEY?: string;
    VOICEFLOW_VERSION_ID?: string;
    VOICEFLOW_API_KEY?: string;
    E2E_URL?: string;
    DEBUG?: string;
    LOG_LEVEL?: "trace" | "debug" | "info" | "warn" | "error" | "fatal";
  }
}

// Speech Recognition API types
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (_event: SpeechRecognitionEvent) => void;
  onerror: (_event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  onstart: () => void;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(_index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(_index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare const SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

declare const webkitSpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

// Speech Synthesis API types
interface SpeechSynthesisUtterance {
  text: string;
  lang: string;
  voice: SpeechSynthesisVoice | null;
  volume: number;
  rate: number;
  pitch: number;
  onstart:
    | ((_event: SpeechSynthesisEvent) => void)
    | null;
  onend:
    | ((_event: SpeechSynthesisEvent) => void)
    | null;
  onerror:
    | ((_event: SpeechSynthesisErrorEvent) => void)
    | null;
  onpause:
    | ((_event: SpeechSynthesisEvent) => void)
    | null;
  onresume:
    | ((_event: SpeechSynthesisEvent) => void)
    | null;
  onmark:
    | ((_event: SpeechSynthesisEvent) => void)
    | null;
  onboundary:
    | ((_event: SpeechSynthesisEvent) => void)
    | null;
}

declare const SpeechSynthesisUtterance: {
  prototype: SpeechSynthesisUtterance;
  new (text?: string): SpeechSynthesisUtterance;
};

interface SpeechSynthesisEvent extends Event {
  readonly utterance: SpeechSynthesisUtterance;
  readonly charIndex: number;
  readonly charLength: number;
  readonly elapsedTime: number;
  readonly name: string;
}

interface SpeechSynthesisErrorEvent extends SpeechSynthesisEvent {
  readonly error: string;
}

interface SpeechSynthesisVoice {
  readonly voiceURI: string;
  readonly name: string;
  readonly lang: string;
  readonly localService: boolean;
  readonly default: boolean;
}

interface SpeechSynthesis extends EventTarget {
  readonly pending: boolean;
  readonly speaking: boolean;
  readonly paused: boolean;
  speak(utterance: SpeechSynthesisUtterance): void;
  cancel(): void;
  pause(): void;
  resume(): void;
  getVoices(): SpeechSynthesisVoice[];
  onvoiceschanged: ((_event: Event) => void) | null;
}

interface Window {
  SpeechRecognition: typeof SpeechRecognition;
  webkitSpeechRecognition: typeof webkitSpeechRecognition;
  speechSynthesis: SpeechSynthesis;
}
