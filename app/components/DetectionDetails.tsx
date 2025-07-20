// components/DetectionDetails.tsx
import React from "react";
import { FaceDetection } from "@/types";

interface DetectionDetailsProps {
  faceDetections: FaceDetection[];
}

export const DetectionDetails: React.FC<DetectionDetailsProps> = ({
  faceDetections,
}) => {
  if (faceDetections.length === 0) return null;

  return (
    <div className="mt-6 bg-gray-700 rounded-lg p-4">
      <h3 className="text-lg font-bold mb-3">Live Detection Data</h3>
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {faceDetections.map((face, index) => (
          <div
            key={index}
            className="text-sm bg-gray-600 rounded p-2 flex justify-between items-center"
          >
            <span className="font-medium">Face {index + 1}</span>
            <span className="text-green-400 font-medium">
              {(face.confidence * 100).toFixed(1)}% confidence
            </span>
            <span className="text-blue-400 text-xs">
              {face.landmarks?.length || 0} landmarks
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
