"use server";

import { openai } from "@/lib/openai";

export interface TranscriptionResult {
  success: boolean;
  text?: string;
  error?: string;
}

export async function transcribeAudio(formData: FormData): Promise<TranscriptionResult> {
  try {
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      return {
        success: false,
        error: 'No audio file provided'
      };
    }

    // Validate file type
    if (!audioFile.type.startsWith('audio/')) {
      return {
        success: false,
        error: 'Invalid file type. Please provide an audio file.'
      };
    }

    // Validate file size (OpenAI has a 25MB limit)
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (audioFile.size > maxSize) {
      return {
        success: false,
        error: 'Audio file too large. Maximum size is 25MB.'
      };
    }

    console.log('Transcribing audio file:', {
      name: audioFile.name,
      type: audioFile.type,
      size: audioFile.size
    });

    // Use OpenAI Whisper for transcription
    const response = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "en", // Can be made configurable later
      response_format: "text"
    });

    console.log('Transcription successful:', response);

    return {
      success: true,
      text: response
    };

  } catch (error) {
    console.error('Transcription error:', error);
    
    // Handle specific OpenAI errors
    if (error && typeof error === 'object' && 'status' in error) {
      if (error.status === 401) {
        return {
          success: false,
          error: 'API key error. Please check OpenAI configuration.'
        };
      }
      if (error.status === 429) {
        return {
          success: false,
          error: 'Rate limit exceeded. Please try again in a moment.'
        };
      }
      if (error.status === 413) {
        return {
          success: false,
          error: 'Audio file too large.'
        };
      }
    }

    return {
      success: false,
      error: 'Failed to transcribe audio. Please try again.'
    };
  }
}
