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
  const mimeTypeRef = useRef<string>('');

  // Check if browser supports audio recording (client-side only)
  useEffect(() => {
    const checkSupport = () => {
      const supported = typeof navigator !== 'undefined' && 
        !!navigator.mediaDevices && 
        !!navigator.mediaDevices.getUserMedia &&
        typeof MediaRecorder !== 'undefined';
      setIsSupported(supported);
    };
    
    checkSupport();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const startRecording = useCallback(async () => {
    if (!isSupported) {
      setError('Audio recording is not supported in this browser');
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

      // Create MediaRecorder with Safari-compatible options
      let mediaRecorder: MediaRecorder;
      
      // Try different MIME types for browser compatibility
      const mimeTypes = [
        'audio/webm;codecs=opus',  // Chrome, Firefox
        'audio/webm',              // Fallback webm
        'audio/mp4',               // Safari
        'audio/aac',               // Safari fallback
        ''                         // Let browser choose
      ];
      
      let selectedMimeType = '';
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          break;
        }
      }
      
      if (selectedMimeType) {
        mediaRecorder = new MediaRecorder(stream, { mimeType: selectedMimeType });
        mimeTypeRef.current = selectedMimeType;
      } else {
        mediaRecorder = new MediaRecorder(stream);
        mimeTypeRef.current = 'audio/webm'; // Default fallback
      }
      
      console.log('Using MIME type:', mimeTypeRef.current);

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
          setError('Microphone access denied. Please allow microphone access and try again.');
        } else if (err.name === 'NotFoundError') {
          setError('No microphone found. Please connect a microphone and try again.');
        } else if (err.name === 'NotSupportedError') {
          setError('Audio recording not supported in this browser. Please try a different browser.');
        } else if (err.message.includes('MediaRecorder')) {
          setError('Recording format not supported. Please try a different browser or update your browser.');
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
        const audioBlob = new Blob(chunksRef.current, { type: mimeTypeRef.current });
        
        // Clean up
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
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
