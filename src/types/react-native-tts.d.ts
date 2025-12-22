declare module 'react-native-tts' {
  interface TtsOptions {
    androidParams?: {
      KEY_PARAM_PAN?: number;
      KEY_PARAM_VOLUME?: number;
      KEY_PARAM_STREAM?: string;
    };
    iosVoiceId?: string;
    rate?: number;
    pitch?: number;
  }

  interface TtsEvents {
    'tts-start': (event: { utteranceId: string }) => void;
    'tts-finish': (event: { utteranceId: string }) => void;
    'tts-cancel': (event: { utteranceId: string }) => void;
    'tts-pause': (event: { utteranceId: string }) => void;
    'tts-resume': (event: { utteranceId: string }) => void;
    'tts-progress': (event: { utteranceId: string; location: number; length: number }) => void;
    'tts-error': (event: { utteranceId: string; code?: string; message?: string }) => void;
  }

  class Tts {
    static speak(utterance: string, options?: TtsOptions): Promise<string>;
    static stop(): Promise<void>;
    static pause(): Promise<void>;
    static resume(): Promise<void>;
    static requestInstallEngine(): Promise<void>;
    static requestInstallData(): Promise<void>;
    static setDefaultRate(rate: number): Promise<void>;
    static setDefaultPitch(pitch: number): Promise<void>;
    static setDefaultLanguage(language: string): Promise<void>;
    static getInitStatus(): Promise<string>;
    static addEventListener<K extends keyof TtsEvents>(
      event: K,
      handler: TtsEvents[K]
    ): { remove: () => void };
    static removeEventListener(event: string, handler: Function): void;
    static removeAllListeners(event?: string): void;
  }

  export default Tts;
}

