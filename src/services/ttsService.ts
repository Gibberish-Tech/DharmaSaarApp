/**
 * Text-to-Speech Service
 * Uses backend API for TTS - Google TTS (free, no API key needed)
 * Works great for Sanskrit transliteration!
 * 
 * Uses react-native-nitro-sound for audio playback (compatible with RN 0.82+)
 */
import { apiService } from './api';
import { Platform } from 'react-native';
import Sound from 'react-native-nitro-sound';
import RNFS from 'react-native-fs';

export interface TTSOptions {
  language?: string;
  rate?: number;
  voice?: string;
}

class TTSService {
  private currentFilePath: string | null = null;
  private isPlaying = false;
  private isPaused = false;

  /**
   * Convert text to speech using backend API
   * Backend uses Google TTS (free) which works great for transliteration
   */
  async speak(text: string, options?: TTSOptions): Promise<void> {
    try {
      // Stop any current playback
      await this.stop();

      console.log('TTS: Requesting audio from backend...');
      
      // Call backend TTS endpoint
      const baseUrl = apiService.getBaseUrl();
      const response = await fetch(`${baseUrl}/api/tts/speak`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          language: options?.language || 'en-US',
          rate: options?.rate || 0.45,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`TTS API error: ${response.status} - ${errorText}`);
      }

      // Get audio blob and convert to base64
      const blob = await response.blob();
      console.log('TTS: Received audio blob, size:', blob.size);
      
      // Convert blob to base64 using FileReader
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          // Remove data URL prefix if present
          const base64Data = result.includes(',') ? result.split(',')[1] : result;
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      
      console.log('TTS: Converting to file...');
      
      // Save to temporary file
      const tempFilePath = `${RNFS.CachesDirectoryPath}/tts_${Date.now()}.mp3`;
      await RNFS.writeFile(tempFilePath, base64, 'base64');
      console.log('TTS: Audio saved to:', tempFilePath);
      
      this.currentFilePath = tempFilePath;
      
      // Convert file path to URI format for Android
      const fileUri = Platform.OS === 'android' 
        ? `file://${tempFilePath}`
        : tempFilePath;

      // Remove any existing listeners first to avoid duplicates
      Sound.removePlayBackListener();
      Sound.removePlaybackEndListener();
      
      this.isPlaying = true;
      this.isPaused = false;
      console.log('TTS: Playing audio...');
      
      // Set up listener for playback end (more reliable than checking position)
      Sound.addPlaybackEndListener((playbackEndMeta) => {
        console.log('TTS: Playback finished', playbackEndMeta);
        this.isPlaying = false;
        this.isPaused = false;
        this.cleanup();
      });
      
      // Play the audio file
      const msg = await Sound.startPlayer(fileUri);
      console.log('TTS: Playback started, path:', msg);
      
    } catch (error) {
      console.error('TTS Service error:', error);
      this.isPlaying = false;
      this.isPaused = false;
      await this.cleanup();
      throw error;
    }
  }

  async stop(): Promise<void> {
    try {
      await Sound.stopPlayer();
      Sound.removePlayBackListener();
      Sound.removePlaybackEndListener();
      await this.cleanup();
    } catch (error) {
      console.error('Error stopping TTS:', error);
    }
    this.isPlaying = false;
    this.isPaused = false;
  }

  async pause(): Promise<void> {
    try {
      await Sound.pausePlayer();
      this.isPaused = true;
      this.isPlaying = false;
    } catch (error) {
      console.error('Error pausing TTS:', error);
    }
  }

  async resume(): Promise<void> {
    try {
      await Sound.resumePlayer();
      this.isPaused = false;
      this.isPlaying = true;
    } catch (error) {
      console.error('Error resuming TTS:', error);
    }
  }

  private async cleanup(): Promise<void> {
    if (this.currentFilePath) {
      try {
        await RNFS.unlink(this.currentFilePath);
        console.log('TTS: Cleaned up temp file:', this.currentFilePath);
      } catch (error) {
        console.error('Error cleaning up temp file:', error);
      }
      this.currentFilePath = null;
    }
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  getIsPaused(): boolean {
    return this.isPaused;
  }
}

export const ttsService = new TTSService();

