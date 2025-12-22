import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import Tts from 'react-native-tts';

export interface UseTextToSpeechReturn {
  isSpeaking: boolean;
  isPaused: boolean;
  speak: (text: string, options?: { language?: string; rate?: number }) => Promise<void>;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  testTts: () => Promise<void>;
}

/**
 * Hook to manage text-to-speech functionality
 */
export function useTextToSpeech(): UseTextToSpeechReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const currentUtteranceId = useRef<string | null>(null);

  // Initialize TTS on mount
  useEffect(() => {
    const initializeTts = async () => {
      try {
        // Check TTS initialization status
        const status = await Tts.getInitStatus();
        console.log('TTS initialization status:', status);
        
        // iOS: Ignore silent mode so TTS can play even when device is silent
        if (Platform.OS === 'ios') {
          try {
            // @ts-ignore - this method exists but may not be in types
            await Tts.setIgnoreSilentSwitch('ignore');
            console.log('TTS: iOS silent mode ignored');
          } catch (e) {
            console.warn('TTS: Could not set ignoreSilentSwitch:', e);
          }
        }
        
        // Android: Check available TTS engines
        if (Platform.OS === 'android') {
          try {
            // @ts-ignore - engines() method exists
            const engines = await Tts.engines();
            console.log('TTS: Available engines:', engines);
            if (engines && engines.length > 0) {
              // @ts-ignore
              await Tts.setDefaultEngine(engines[0]);
              console.log('TTS: Set default engine to:', engines[0]);
            }
          } catch (e) {
            console.warn('TTS: Could not get/set engines:', e);
          }
        }
        
        // Set default options
        await Tts.setDefaultRate(0.5); // Moderate speaking rate
        await Tts.setDefaultPitch(1.0); // Normal pitch
        // Set default language to English (for transliteration)
        await Tts.setDefaultLanguage('en-US');
      } catch (error) {
        console.error('Error initializing TTS:', error);
      }
    };

    initializeTts();
    
    // Set up event listeners
    const finishListener = Tts.addEventListener('tts-finish', (event) => {
      console.log('TTS: Speech finished event:', event);
      setIsSpeaking(false);
      setIsPaused(false);
      currentUtteranceId.current = null;
    });

    const startListener = Tts.addEventListener('tts-start', (event) => {
      console.log('TTS: Speech started event:', event);
      setIsSpeaking(true);
      setIsPaused(false);
    });

    const cancelListener = Tts.addEventListener('tts-cancel', () => {
      setIsSpeaking(false);
      setIsPaused(false);
      currentUtteranceId.current = null;
    });

    const errorListener = Tts.addEventListener('tts-error', (event: any) => {
      console.error('TTS error event:', event);
      setIsSpeaking(false);
      setIsPaused(false);
      currentUtteranceId.current = null;
    });

    // Cleanup
    return () => {
      finishListener.remove();
      startListener.remove();
      cancelListener.remove();
      errorListener.remove();
      // Stop any ongoing speech on unmount
      Tts.stop();
    };
  }, []);

  const speak = useCallback(async (text: string, options?: { language?: string; rate?: number }) => {
    try {
      // First, verify TTS is available
      const status = await Tts.getInitStatus();
      console.log('TTS: Init status before speak:', status);
      
      if (status !== 'success') {
        throw new Error(`TTS not initialized. Status: ${status}`);
      }

      // Stop any current speech
      if (isSpeaking || isPaused) {
        await Tts.stop();
        // Wait a bit for stop to complete
        await new Promise<void>(resolve => setTimeout(() => resolve(), 100));
      }

      // Configure TTS options
      if (options?.rate !== undefined) {
        await Tts.setDefaultRate(options.rate);
      }
      
      if (options?.language) {
        try {
          await Tts.setDefaultLanguage(options.language);
        } catch (langError) {
          console.warn('TTS: Failed to set language, using default:', langError);
        }
      }

      // Log for debugging
      console.log('TTS: Speaking text:', text.substring(0, 50) + (text.length > 50 ? '...' : ''));
      console.log('TTS: Full text length:', text.length);
      console.log('TTS: Language:', options?.language || 'default');
      console.log('TTS: Rate:', options?.rate || 'default');

      // Speak the text with a small delay to ensure previous operations complete
      await new Promise<void>(resolve => setTimeout(() => resolve(), 50));
      
      // Try speaking without any options first (uses defaults)
      // This is more reliable across different devices
      console.log('TTS: Attempting to speak without custom options first...');
      let utteranceId: string;
      
      try {
        // First try: Simple speak without options
        utteranceId = await Tts.speak(text);
        console.log('TTS: Simple speak succeeded');
      } catch (simpleError) {
        console.warn('TTS: Simple speak failed, trying with options:', simpleError);
        // Fallback: Try with platform-specific options
        const speakOptions: any = {};
        
        if (Platform.OS === 'android') {
          // Android: Just set volume, let system handle stream
          speakOptions.androidParams = {
            KEY_PARAM_VOLUME: 1.0,
          };
        } else {
          // iOS: Use default voice
          speakOptions.iosVoiceId = 'com.apple.ttsbundle.Samantha-compact';
        }
        
        console.log('TTS: Speak options:', JSON.stringify(speakOptions));
        utteranceId = await Tts.speak(text, speakOptions);
        console.log('TTS: Speak with options succeeded');
      }
      
      console.log('TTS: Utterance ID:', utteranceId);
      currentUtteranceId.current = utteranceId;
      setIsSpeaking(true);
      setIsPaused(false);
    } catch (error) {
      console.error('TTS: Error speaking text:', error);
      console.error('TTS: Error details:', JSON.stringify(error, null, 2));
      setIsSpeaking(false);
      setIsPaused(false);
      throw error; // Re-throw so caller can handle it
    }
  }, [isSpeaking, isPaused]);

  const stop = useCallback(async () => {
    try {
      await Tts.stop();
      setIsSpeaking(false);
      setIsPaused(false);
      currentUtteranceId.current = null;
    } catch (error) {
      console.error('Error stopping speech:', error);
    }
  }, []);

  const pause = useCallback(async () => {
    try {
      if (isSpeaking && !isPaused) {
        await Tts.pause();
        setIsPaused(true);
      }
    } catch (error) {
      console.error('Error pausing speech:', error);
    }
  }, [isSpeaking, isPaused]);

  const resume = useCallback(async () => {
    try {
      if (isPaused) {
        await Tts.resume();
        setIsPaused(false);
      }
    } catch (error) {
      console.error('Error resuming speech:', error);
    }
  }, [isPaused]);

  // Test function to verify TTS is working
  const testTts = useCallback(async () => {
    try {
      console.log('TTS: Running test...');
      const status = await Tts.getInitStatus();
      console.log('TTS: Test - Init status:', status);
      
      if (status === 'success') {
        console.log('TTS: Test - Speaking "Hello, this is a test"');
        const testOptions: any = {
          iosVoiceId: 'com.apple.ttsbundle.Samantha-compact',
        };
        
        if (Platform.OS === 'android') {
          testOptions.androidParams = {
            KEY_PARAM_STREAM: 'STREAM_MUSIC',
            KEY_PARAM_VOLUME: 1.0,
            KEY_PARAM_PAN: 0.0,
          };
        }
        
        await Tts.speak('Hello, this is a test', testOptions);
        console.log('TTS: Test - Speech started');
      } else {
        console.error('TTS: Test - TTS not initialized. Status:', status);
        throw new Error(`TTS not initialized. Status: ${status}`);
      }
    } catch (error) {
      console.error('TTS: Test - Error:', error);
      throw error;
    }
  }, []);

  return {
    isSpeaking,
    isPaused,
    speak,
    stop,
    pause,
    resume,
    testTts,
  };
}

