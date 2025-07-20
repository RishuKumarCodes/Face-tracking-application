// components/VideoFeed.tsx
import React, { RefObject } from 'react';

interface VideoFeedProps {
  videoRef: RefObject<HTMLVideoElement>;
  canvasRef: RefObject<HTMLCanvasElement>;
  isRecording: boolean;
  isDetecting: boolean;
  modelsLoaded: boolean;
}

export const VideoFeed: React.FC<VideoFeedProps> = ({
  videoRef,
  canvasRef,
  isRecording,
  isDetecting,
  modelsLoaded,
}) => {
  return (
    <div className="relative mb-6">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-auto bg-black rounded-lg shadow-lg"
        style={{ maxHeight: '500px' }}
      />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none rounded-lg"
        style={{ maxHeight: '500px' }}
      />

      {/* Recording Indicator */}
      {isRecording && (
        <div className="absolute top-4 right-4 bg-red-600 px-4 py-2 rounded-full flex items-center animate-pulse">
          <div className="w-3 h-3 bg-white rounded-full mr-2"></div>
          <span className="font-semibold">RECORDING</span>
        </div>
      )}

      {/* AI Tracking Active Indicator */}
      {isDetecting && (
        <div className="absolute top-4 left-4 bg-green-600 px-4 py-2 rounded-full">
          <span className="font-semibold">AI TRACKING ACTIVE</span>
        </div>
      )}

      {/* Face-API Ready Indicator */}
      {modelsLoaded && (
        <div className="absolute bottom-4 left-4 bg-blue-600 px-3 py-1 rounded-full text-sm">
          <span>face-api.js Ready</span>
        </div>
      )}
    </div>
  );
};