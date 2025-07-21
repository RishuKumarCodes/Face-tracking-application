import { useState, useRef, useEffect, useCallback } from "react";
import { FaceTrackingState, FaceDetection, RecordedVideo } from "../types";
import { FaceDetector } from "../utils/faceDetection.ts";
import { CameraManager } from "../utils/camera.ts";
import { RecordingManager, VideoManager } from "../utils/recording.ts";
import { FaceApiLoader } from "../utils/FaceApi.tsx";

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
    error: "",
    isLoading: false,
    modelsLoaded: false,
  });

  useEffect(() => {
    setState((prev) => ({ ...prev, isClient: true }));
  }, []);

  useEffect(() => {
    if (!state.isClient) return;

    const loadModels = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: "" }));

        const faceApiLoader = FaceApiLoader.getInstance();
        await faceApiLoader.loadModels();

        setState((prev) => ({
          ...prev,
          modelsLoaded: true,
          isLoading: false,
        }));
      } catch (error) {
        console.error("Error loading face-api.js models:", error);
        setState((prev) => ({
          ...prev,
          error:
            "Failed to load face detection models. Please refresh the page.",
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

      setState((prev) => ({ ...prev, faceDetections: detections }));
    } catch (error) {
      console.error("Face detection error:", error);
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

  const startCamera = async (): Promise<void> => {
    if (!state.modelsLoaded) {
      setState((prev) => ({
        ...prev,
        error: "Face detection models are still loading. Please wait...",
      }));
      return;
    }

    try {
      const stream = await CameraManager.startCamera();

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        videoRef.current.onloadedmetadata = () => {
          setState((prev) => ({ ...prev, isDetecting: true, error: "" }));
        };

        videoRef.current.onerror = (error) => {
          console.error("Video error:", error);
          setState((prev) => ({
            ...prev,
            error: "Video playback error occurred.",
          }));
        };
      }
    } catch (error) {
      console.error("Camera start error:", error);
      setState((prev) => ({
        ...prev,
        error:
          "Failed to access camera. Please ensure camera permissions are granted.",
      }));
    }
  };

  const stopCamera = (): void => {
    CameraManager.stopCamera();

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setState((prev) => ({ ...prev, isDetecting: false }));

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (state.isRecording) {
      stopRecording();
    }
  };

  const startRecording = async (): Promise<void> => {
    try {
      if (!videoRef.current || !canvasRef.current) {
        setState((prev) => ({ ...prev, error: "Camera not ready" }));
        return;
      }

      // Check if video is properly loaded
      if (videoRef.current.readyState < 2) {
        setState((prev) => ({
          ...prev,
          error:
            "Video not ready for recording. Please wait for camera to fully load.",
        }));
        return;
      }

      // Check MediaRecorder support
      if (!window.MediaRecorder) {
        setState((prev) => ({
          ...prev,
          error: "Recording not supported in this browser.",
        }));
        return;
      }

      // console.log('Starting recording with video dimensions:', {
      //   videoWidth: videoRef.current.videoWidth,
      //   videoHeight: videoRef.current.videoHeight,
      //   canvasWidth: canvasRef.current.width,
      //   canvasHeight: canvasRef.current.height,
      // });

      await recordingManagerRef.current.startRecording(
        videoRef.current,
        canvasRef.current
      );

      setState((prev) => ({ ...prev, isRecording: true, error: "" }));
      // console.log('Recording started successfully');
    } catch (error) {
      console.error("Recording start error:", error);
      setState((prev) => ({
        ...prev,
        error: `Failed to start recording: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      }));
    }
  };

  const stopRecording = async (): Promise<void> => {
    if (!recordingManagerRef.current.isCurrentlyRecording()) {
      console.warn("No active recording to stop");
      return;
    }

    try {
      // console.log('Stopping recording...');
      const newVideo = await recordingManagerRef.current.stopRecording();

      // Test video playability
      const isPlayable = await VideoManager.testVideoPlayability(newVideo);
      if (!isPlayable) {
        console.warn("Generated video may not be playable");
      }

      // console.log('Recording stopped successfully:', {
      //   size: newVideo.size,
      //   name: newVideo.name,
      //   isPlayable
      // });

      setState((prev) => ({
        ...prev,
        isRecording: false,
        recordedVideos: [...prev.recordedVideos, newVideo],
        error: isPlayable ? "" : "Video recorded but may have playback issues.",
      }));
    } catch (error) {
      console.error("Recording stop error:", error);
      setState((prev) => ({
        ...prev,
        error: `Failed to stop recording: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        isRecording: false,
      }));
    }
  };

  const downloadVideo = (video: RecordedVideo): void => {
    try {
      VideoManager.downloadVideo(video);
    } catch (error) {
      console.error("Download error:", error);
      setState((prev) => ({
        ...prev,
        error: "Failed to download video.",
      }));
    }
  };

  const deleteVideo = (videoId: number): void => {
    setState((prev) => {
      const video = prev.recordedVideos.find((v) => v.id === videoId);
      if (video) {
        VideoManager.revokeVideoUrl(video);
      }
      return {
        ...prev,
        recordedVideos: prev.recordedVideos.filter((v) => v.id !== videoId),
      };
    });
  };

  const clearError = (): void => {
    setState((prev) => ({ ...prev, error: "" }));
  };

  useEffect(() => {
    return () => {
      stopCamera();
      state.recordedVideos.forEach((video) => {
        VideoManager.revokeVideoUrl(video);
      });
    };
  }, []);

  return {
    videoRef,
    canvasRef,
    ...state,
    startCamera,
    stopCamera,
    startRecording,
    stopRecording,
    downloadVideo,
    deleteVideo,
    clearError,
  };
};
