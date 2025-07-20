"use client";
import { ErrorMessage } from "./components/ui/ErrorMessage";
import { StatusIndicator } from "./components/ui/StatusIndicator";
// import { MainContent } from "./components/MainContent";
import { VideoSidebar } from "./components/VideoSidebar";
import { LoadingSpinner } from "./components/ui/LoadingSpinner";
import { useFaceTracking } from "./hooks/useFaceTracking";
import HowToUse from "./components/HowToUse";
import { useState } from "react";
import { VideoFeed } from "./components/VideoFeed";
import { ControlButtons } from "./components/ControlButton";
import { DetectionDetails } from "./components/DetectionDetails";

export default function Home() {
  const [HowToUseOpen, SetHowToUseOpen] = useState(false);
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
  return (
    <div className="min-h-screen bg-black">
      <ErrorMessage error={error} onDismiss={clearError} />
      <StatusIndicator isLoading={isLoading} />
      <div className=" min-h-screen flex flex-col">
        <div className="flex gap-6 flex-1">
          {/* video side */}
          <div className="flex-1 shrink p-6 pr-0 bg-amber-900">
            {/* Video Feed Component */}
            <VideoFeed
              videoRef={videoRef}
              canvasRef={canvasRef}
              isRecording={isRecording}
              isDetecting={isDetecting}
              modelsLoaded={modelsLoaded}
            />
            {/* Detection Details Component */}
            <DetectionDetails faceDetections={faceDetections} />
          </div>
          <VideoSidebar
            recordedVideos={recordedVideos}
            onDownloadVideo={downloadVideo}
            onDeleteVideo={deleteVideo}
          />
        </div>
        <div className="h-40 bg-gray-500 flex items-center justify-between w-[100vw]">
          <div
            onClick={() => SetHowToUseOpen(true)}
            className="bg-white cursor-pointer rounded-full px-5 py-3"
          >
            How to use?
          </div>
          <ControlButtons
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
      </div>
      <HowToUse open={HowToUseOpen} setOpen={SetHowToUseOpen} />
    </div>
  );
}
