import React, { RefObject, useEffect, useCallback } from "react";

interface VideoFeedProps {
  videoRef: RefObject<HTMLVideoElement | null>; 
  canvasRef: RefObject<HTMLCanvasElement | null>; 
  isRecording: boolean;
  modelsLoaded: boolean;
  faceDetections: Array<{
    id: number;
    x: number;
    y: number;
    width: number;
    height: number;
    confidence: number;
    landmarks: Array<{ x: number; y: number }>;
  }>;
  isLoading: boolean;
}

export const VideoFeed: React.FC<VideoFeedProps> = ({
  videoRef,
  canvasRef,
  isRecording,
  modelsLoaded,
  faceDetections,
  isLoading,
}) => {
  // Enhanced canvas size synchronization
  const syncCanvasSize = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Wait for video to have dimensions
      if (video.videoWidth && video.videoHeight) {
        const rect = video.getBoundingClientRect();
        
        // Set canvas dimensions to match the displayed video size
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        // Set CSS dimensions to match exactly
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        
        // Ensure canvas is positioned correctly
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '10';
        
        console.log('Canvas synced:', {
          width: rect.width, 
          height: rect.height,
          videoNatural: { w: video.videoWidth, h: video.videoHeight }
        });
        
        return true;
      }
    }
    return false;
  }, [videoRef, canvasRef]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const initialSync = () => {
      setTimeout(syncCanvasSize, 100);
    };

    video.addEventListener('loadedmetadata', syncCanvasSize);
    video.addEventListener('loadeddata', syncCanvasSize);
    video.addEventListener('playing', syncCanvasSize);
    video.addEventListener('resize', syncCanvasSize);
    
    if (video.readyState >= 2) {
      initialSync();
    }
    
    const interval = setInterval(syncCanvasSize, 2000);
    
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        setTimeout(syncCanvasSize, 50);
      });
      resizeObserver.observe(video);
    }
    
    return () => {
      video.removeEventListener('loadedmetadata', syncCanvasSize);
      video.removeEventListener('loadeddata', syncCanvasSize);
      video.removeEventListener('playing', syncCanvasSize);
      video.removeEventListener('resize', syncCanvasSize);
      clearInterval(interval);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [syncCanvasSize]);

  useEffect(() => {
    if (faceDetections.length > 0 && canvasRef.current) {
      syncCanvasSize();
    }
  }, [faceDetections, syncCanvasSize]);

  return (
    <div className="flex-1 shrink m-4 overflow-hidden relative">
      {isLoading && (
        <div className="bg-blue-600 text-white px-4 py-1 rounded-full absolute z-50 bottom-4 left-4">
          <div className="flex items-center">
            <span>Loading face detection models...</span>
          </div>
        </div>
      )}
      
      <div className="relative w-full" style={{ maxHeight: "calc(100vh - 150px)" }}>
        {/* Video element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full bg-neutral-800 rounded-3xl aspect-square md:aspect-video object-cover"
          style={{ display: 'block' }}
        />
        
        {/* Canvas overlay - positioned absolutely over video */}
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 pointer-events-none rounded-3xl"
          style={{
            zIndex: 10,
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        />
      </div>

      {/* Recording Indicator */}
      {isRecording && (
        <div className="absolute top-4 right-4 bg-red-600 px-4 py-2 rounded-full flex items-center animate-pulse z-20">
          <div className="w-3 h-3 bg-white rounded-full mr-2"></div>
          <span className="font-semibold text-white">RECORDING</span>
        </div>
      )}

      {/* Face-API Ready Indicator */}
      {modelsLoaded && (
        <div className="absolute bottom-4 left-4 bg-blue-600 px-3 py-1 rounded-full text-sm text-white z-20">
          <span>Face API Ready</span>
        </div>
      )}
      
      {/* Face detection details */}
      {faceDetections.length > 0 && (
        <div className="absolute right-4 bottom-4 bg-gray-700/90 rounded-lg p-4 z-20 max-w-xs">
          <h3 className="text-lg font-bold mb-3 text-white">
            Live Detection Data
          </h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {faceDetections.map((face, index) => (
              <div
                key={index}
                className="text-sm text-white bg-gray-600 rounded p-2"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">Face {index + 1}</span>
                  <span className="text-green-400 font-medium">
                    {(face.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="text-blue-400 text-xs mt-1">
                  Position: {Math.round(face.x)}, {Math.round(face.y)}
                </div>
                <div className="text-blue-400 text-xs">
                  Size: {Math.round(face.width)}×{Math.round(face.height)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};