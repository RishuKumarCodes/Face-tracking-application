// types/index.ts
export interface FaceDetection {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  landmarks: Array<{ x: number; y: number }>;
}

export interface RecordedVideo {
  id: number;
  url: string;
  blob: Blob;
  timestamp: string;
  name: string;
  size: string;
}

export interface FaceTrackingState {
  isClient: boolean;
  isRecording: boolean;
  isDetecting: boolean;
  recordedVideos: RecordedVideo[];
  faceDetections: FaceDetection[];
  error: string;
  isLoading: boolean;
  modelsLoaded: boolean;
}

export interface FaceApiDetection {
  detection: {
    box: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    score: number;
  };
  landmarks: {
    positions: Array<{ x: number; y: number }>;
    getLeftEye: () => Array<{ x: number; y: number }>;
    getRightEye: () => Array<{ x: number; y: number }>;
  };
}

export interface CameraStreamOptions {
  video: {
    width: { ideal: number };
    height: { ideal: number };
    facingMode: string;
  };
  audio: boolean;
}