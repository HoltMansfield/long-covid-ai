"use client";

import { useState, useRef, useCallback, useEffect } from 'react';

export interface AudioRecordingState {
  isRecording: boolean;
  isSupported: boolean;
  error: string | null;
}

export interface UseAudioRecordingReturn extends AudioRecordingState {
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  clearError: () => void;
}

export function useAudioRecording(): UseAudioRecordingReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Check if browser supports audio recording (Chrome-first approach)
  useEffect(() => {
    const checkSupport = () => {
      const hasBasicSupport = typeof navigator !== 'undefined' && 
        !!navigator.mediaDevices && 
        !!navigator.mediaDevices.getUserMedia &&
        typeof MediaRecorder !== 'undefined';
      
      // For MVP, prioritize Chrome compatibility
      const isChrome = navigator.userAgent.includes('Chrome') && !navigator.userAgent.includes('Edg');
      const hasWebMSupport = MediaRecorder.isTypeSupported('audio/webm;codecs=opus');
      
      // Support Chrome and browsers that support our preferred format
      const supported = hasBasicSupport && (isChrome || hasWebMSupport);
      setIsSupported(supported);
      
      if (hasBasicSupport && !supported) {
        console.log('ℹ️ Voice input optimized for Chrome. Other browsers coming soon!');
      }
    };
    
    checkSupport();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const startRecording = useCallback(async () => {
    if (!isSupported) {
      setError('Voice input is optimized for Chrome. Please use Chrome browser for voice features.');
      return;
    }

    try {
      setError(null);
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        } 
      });

      // Create MediaRecorder optimized for Chrome
      const mimeType = 'audio/webm;codecs=opus';
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      
      console.log('🎤 Recording with Chrome-optimized format:', mimeType);

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);

    } catch (err) {
      console.error('Error starting recording:', err);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Microphone access denied. Click the 🔒 icon in your address bar and allow microphone access, then try again.');
        } else if (err.name === 'NotFoundError') {
          setError('No microphone found. Please connect a microphone and try again.');
        } else if (err.name === 'NotSupportedError') {
          setError('Voice input requires Chrome browser. Please switch to Chrome for voice features.');
        } else {
          setError('Failed to start recording. Please try again.');
        }
      } else {
        setError('Failed to start recording. Please try again.');
      }
    }
  }, [isSupported]);

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    if (!mediaRecorderRef.current || !isRecording) {
      return null;
    }

    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current!;
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });
        
        // Clean up
        mediaRecorder.stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
        mediaRecorderRef.current = null;
        chunksRef.current = [];
        setIsRecording(false);
        
        resolve(audioBlob);
      };

      mediaRecorder.stop();
    });
  }, [isRecording]);

  return {
    isRecording,
    isSupported,
    error,
    startRecording,
    stopRecording,
    clearError
  };
}
