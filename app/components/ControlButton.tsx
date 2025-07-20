// components/ControlButtons.tsx
import React from "react";
import { Camera, Video, Square } from "lucide-react";
import { FaceDetection } from "@/types";

interface ControlButtonsProps {
  isDetecting: boolean;
  isRecording: boolean;
  isLoading: boolean;
  modelsLoaded: boolean;
  onStartCamera: () => void;
  onStopCamera: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  faceDetections: FaceDetection[];
  recordedVideosCount: number;
}

export const ControlButtons: React.FC<ControlButtonsProps> = ({
  isDetecting,
  isRecording,
  isLoading,
  modelsLoaded,
  onStartCamera,
  onStopCamera,
  onStartRecording,
  onStopRecording,
  faceDetections,
  recordedVideosCount,
}) => {
  const getStartCameraText = () => {
    if (isLoading) return "Loading AI Models...";
    if (!modelsLoaded) return "AI Models Loading...";
    return "Start AI Face Tracking";
  };
  interface DetectionStatsProps {
    faceDetections: FaceDetection[];
    modelsLoaded: boolean;
    isDetecting: boolean;
    isRecording: boolean;
    recordedVideosCount: number;
  }
  return (
    <>
      <div className="flex flex-wrap gap-4 justify-center">
        {!isDetecting ? (
          <button
            onClick={onStartCamera}
            disabled={isLoading || !modelsLoaded}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 px-8 py-3 rounded-lg flex items-center gap-3 text-lg font-semibold transition-all transform hover:scale-105 disabled:transform-none"
          >
            <Camera size={24} />
            {getStartCameraText()}
          </button>
        ) : (
          <button
            onClick={onStopCamera}
            className="bg-red-600 hover:bg-red-700 px-8 py-3 rounded-lg flex items-center gap-3 text-lg font-semibold transition-all transform hover:scale-105"
          >
            <Square size={24} />
            Stop Camera
          </button>
        )}

        {isDetecting && !isRecording && (
          <button
            onClick={onStartRecording}
            className="bg-green-600 hover:bg-green-700 px-8 py-3 rounded-lg flex items-center gap-3 text-lg font-semibold transition-all transform hover:scale-105"
          >
            <Video size={24} />
            Start Recording
          </button>
        )}

        {isRecording && (
          <button
            onClick={onStopRecording}
            className="bg-red-600 hover:bg-red-700 px-8 py-3 rounded-lg flex items-center gap-3 text-lg font-semibold transition-all transform hover:scale-105"
          >
            <Square size={24} />
            Stop Recording
          </button>
        )}
      </div>
      <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">
            {faceDetections.length}
          </div>
          <div className="text-sm text-gray-300">Faces Detected</div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">
            {modelsLoaded ? "🟢" : "🟡"}
          </div>
          <div className="text-sm text-gray-300">AI Models</div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">
            {isDetecting ? "🟢" : "🔴"}
          </div>
          <div className="text-sm text-gray-300">Camera Status</div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-400">
            {isRecording ? "🔴" : "⚪"}
          </div>
          <div className="text-sm text-gray-300">Recording</div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {recordedVideosCount}
          </div>
          <div className="text-sm text-gray-300">Videos Saved</div>
        </div>
      </div>
    </>
  );
};
