import React from "react";
import { Camera, Video, Square, Circle, VideoOff } from "lucide-react";
import { FaceDetection } from "../types";

interface ControlsProps {
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
  SetHowToUseOpen: React.Dispatch<React.SetStateAction<boolean>>;
  showRecordings: boolean;
  setShowRecordings: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Controls: React.FC<ControlsProps> = ({
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
  SetHowToUseOpen,
  showRecordings,
  setShowRecordings,
}) => {
  const getStartCameraText = () => {
    if (isLoading) return "Loading AI..";
    if (!modelsLoaded) return "Loading AI..";
    return "Camera";
  };

  return (
    <div className="my-2 py-3 px-4 w-fit mx-auto rounded-full border flex items-center justify-center bg-neutral-800 transition-all">
      <div
        onClick={() => SetHowToUseOpen(true)}
        className="bg-neutral-700 cursor-pointer rounded-full px-5 py-3 text-white hover:bg-neutral-800 absolute left-10 hidden md:block"
      >
        How to use?
      </div>

      <div className="flex flex-wrap justify-center transition-all ">
        {!isDetecting ? (
          <button
            onClick={onStartCamera}
            disabled={isLoading || !modelsLoaded}
            className="bg-[#C69B98] hover:bg-[#C69B98] disabled:opacity-40 px-5 md:px-8 py-3 rounded-full flex flex-col items-center text-sm font-semibold cursor-pointer"
          >
            <VideoOff size={30} />
            {getStartCameraText()}
          </button>
        ) : (
          <button
            onClick={onStopCamera}
            className="hover:bg-neutral-700 px-5 md:px-8 py-3 rounded-full flex flex-col items-center text-sm font-semibold text-white cursor-pointer"
          >
            <Video size={30} />
            Camera
          </button>
        )}
        {!isRecording ? (
          <button
            onClick={() => {
              isDetecting && onStartRecording();
            }}
            className={`px-4 md:px-8 py-3 rounded-full flex flex-col items-center text-sm font-semibold text-white
              ${
                isDetecting
                  ? "opacity-100 hover:bg-neutral-700 cursor-pointer"
                  : "opacity-50 cursor-not-allowed"
              }`}
          >
            <Circle fill="#00A63E" color="#00A63E" size={30} />
            Record
          </button>
        ) : (
          <button
            onClick={onStopRecording}
            className="hover:bg-neutral-700 px-5= md:px-8 py-3 rounded-full flex flex-col items-center text-sm font-semibold text-white"
          >
            <Square fill="#DC2626" color="#DC2626" size={30} />
            Stop
          </button>
        )}
        <div className="rounded-full px-4 py-2 text-center flex flex-col justify-between">
          <div className="text-2xl font-bold text-green-400 ">
            {faceDetections.length}
          </div>
          <div className="text-sm font-bold text-neutral-300">Faces</div>
        </div>

        <button
          onClick={() => setShowRecordings(!showRecordings)}
          className={` rounded-full px-4 md:px-6 py-2 text-center cursor-pointer ${
            showRecordings
              ? "bg-[#A8C7FA]"
              : "hover:bg-neutral-700 text-neutral-300"
          }`}
        >
          <div
            className={`text-2xl font-bold text-yellow-400 ${
              showRecordings && "text-yellow-700"
            }`}
          >
            {recordedVideosCount}
          </div>
          <div className="text-sm  font-bold">Recordings</div>
        </button>
      </div>
    </div>
  );
};
