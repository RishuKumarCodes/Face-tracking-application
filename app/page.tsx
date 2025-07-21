"use client";
import { ErrorMessage } from "./components/ui/ErrorMessage.tsx";
import { VideoSidebar } from "./components/VideoSidebar.tsx";
import { LoadingSpinner } from "./components/ui/LoadingSpinner.tsx";
import { useFaceTracking } from "./hooks/useFaceTracking.ts";
import HowToUse from "./components/HowToUse.tsx";
import { useState } from "react";
import { VideoFeed } from "./components/VideoFeed";
import { Controls } from "./components/Controls";

export default function Home() {
  const [howToUseOpen, setHowToUseOpen] = useState(false);
  const [showRecordings, setShowRecordings] = useState(false);
  const {
    videoRef,
    canvasRef,
    isDetecting,
    isRecording,
    isLoading,
    modelsLoaded,
    faceDetections,
    recordedVideos,
    isClient,
    error,
    downloadVideo,
    deleteVideo,
    clearError,
    startCamera,
    stopCamera,
    startRecording,
    stopRecording,
  } = useFaceTracking();

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading Face Tracking App..." />
      </div>
    );
  }

  // console.log(faceDetections);
  return (
    <div className="min-h-screen bg-black">
      <div className=" min-h-screen flex flex-col">
        <ErrorMessage error={error} onDismiss={clearError} />
        <div className="flex flex-1 items-center justify-center">
          <VideoFeed
            isLoading={isLoading}
            videoRef={videoRef}
            canvasRef={canvasRef}
            isRecording={isRecording}
            modelsLoaded={modelsLoaded}
            faceDetections={faceDetections}
          />
          {showRecordings && (
            <VideoSidebar
              recordedVideos={recordedVideos}
              onDownloadVideo={downloadVideo}
              onDeleteVideo={deleteVideo}
            />
          )}
        </div>

        <Controls
          showRecordings={showRecordings}
          setShowRecordings={setShowRecordings}
          SetHowToUseOpen={setHowToUseOpen}
          isDetecting={isDetecting}
          isRecording={isRecording}
          isLoading={isLoading}
          modelsLoaded={modelsLoaded}
          onStartCamera={startCamera}
          onStopCamera={stopCamera}
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
          faceDetections={faceDetections}
          recordedVideosCount={recordedVideos.length}
        />
      </div>
      <HowToUse open={howToUseOpen} setOpen={setHowToUseOpen} />
    </div>
  );
}
