// hooks/useFaceTracking.ts
import { useState, useRef, useEffect, useCallback } from 'react';
import { FaceTrackingState, FaceDetection, RecordedVideo } from '../types';
import { FaceApiLoader } from '../utils/faceApi';
import { FaceDetector } from '../utils/faceDetection';
import { CameraManager } from '../utils/camera';
import { RecordingManager, VideoManager } from '../utils/recording';

export const useFaceTracking = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recordingManagerRef = useRef<RecordingManager>(new RecordingManager());

  const [state, setState] = useState<FaceTrackingState>({
    isClient: false,
    isRecording: false,
    isDetecting: false,
    recordedVideos: [],
    faceDetections: [],
    error: '',
    isLoading: false,
    modelsLoaded: false,
  });

  // Ensure client-side rendering
  useEffect(() => {
    setState(prev => ({ ...prev, isClient: true }));
  }, []);

  // Load face-api.js models
  useEffect(() => {
    if (!state.isClient) return;

    const loadModels = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: '' }));
        
        const faceApiLoader = FaceApiLoader.getInstance();
        await faceApiLoader.loadModels();
        
        setState(prev => ({ 
          ...prev, 
          modelsLoaded: true, 
          isLoading: false 
        }));
      } catch (error) {
        console.error('Error loading face-api.js models:', error);
        setState(prev => ({
          ...prev,
          error: 'Failed to load face detection models. Please refresh the page.',
          isLoading: false,
        }));
      }
    };

    loadModels();
  }, [state.isClient]);

  // Face detection function
  const detectFaces = useCallback(async (): Promise<void> => {
    if (!videoRef.current || !canvasRef.current || !state.modelsLoaded) {
      return;
    }

    try {
      const detections = await FaceDetector.detectFaces(
        videoRef.current,
        canvasRef.current
      );
      
      setState(prev => ({ ...prev, faceDetections: detections }));
    } catch (error) {
      console.error('Face detection error:', error);
    }
  }, [state.modelsLoaded]);

  // Start face detection loop
  const startFaceDetection = useCallback(() => {
    const detect = async () => {
      if (
        state.isDetecting &&
        videoRef.current &&
        videoRef.current.readyState === 4
      ) {
        await detectFaces();
        animationFrameRef.current = requestAnimationFrame(detect);
      }
    };
    detect();
  }, [state.isDetecting, detectFaces]);

  // Effect to manage detection loop
  useEffect(() => {
    if (state.isDetecting && state.modelsLoaded) {
      startFaceDetection();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [state.isDetecting, state.modelsLoaded, startFaceDetection]);

  // Start camera
  const startCamera = async (): Promise<void> => {
    if (!state.modelsLoaded) {
      setState(prev => ({
        ...prev,
        error: 'Face detection models are still loading. Please wait...',
      }));
      return;
    }

    try {
      const stream = await CameraManager.startCamera();

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setState(prev => ({ ...prev, isDetecting: true, error: '' }));
        };
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to access camera. Please ensure camera permissions are granted.',
      }));
    }
  };

  // Stop camera
  const stopCamera = (): void => {
    CameraManager.stopCamera();
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setState(prev => ({ ...prev, isDetecting: false }));
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (state.isRecording) {
      stopRecording();
    }
  };

  // Start recording
  const startRecording = async (): Promise<void> => {
    try {
      if (!videoRef.current || !canvasRef.current) {
        setState(prev => ({ ...prev, error: 'Camera not ready' }));
        return;
      }

      await recordingManagerRef.current.startRecording(
        videoRef.current,
        canvasRef.current
      );
      
      setState(prev => ({ ...prev, isRecording: true, error: '' }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: `Failed to start recording: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }));
    }
  };

  // Stop recording
  const stopRecording = async (): Promise<void> => {
    if (!recordingManagerRef.current.isCurrentlyRecording()) return;

    try {
      const newVideo = await recordingManagerRef.current.stopRecording();
      
      setState(prev => ({
        ...prev,
        isRecording: false,
        recordedVideos: [...prev.recordedVideos, newVideo],
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: `Failed to stop recording: ${error instanceof Error ? error.message : 'Unknown error'}`,
        isRecording: false,
      }));
    }
  };

  // Download video
  const downloadVideo = (video: RecordedVideo): void => {
    VideoManager.downloadVideo(video);
  };

  // Delete video
  const deleteVideo = (videoId: number): void => {
    setState(prev => {
      const video = prev.recordedVideos.find(v => v.id === videoId);
      if (video) {
        VideoManager.revokeVideoUrl(video);
      }
      return {
        ...prev,
        recordedVideos: prev.recordedVideos.filter(v => v.id !== videoId),
      };
    });
  };

  // Clear error
  const clearError = (): void => {
    setState(prev => ({ ...prev, error: '' }));
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      state.recordedVideos.forEach(video => {
        VideoManager.revokeVideoUrl(video);
      });
    };
  }, []);

  return {
    // Refs
    videoRef,
    canvasRef,
    
    // State
    ...state,
    
    // Actions
    startCamera,
    stopCamera,
    startRecording,
    stopRecording,
    downloadVideo,
    deleteVideo,
    clearError,
  };
};