import React from "react";
import { X, Eye, Video, Download, Zap, Settings } from "lucide-react";

function HowToUse({ open, setOpen }) {
  if (!open) return null;

  const handleClose = () => setOpen(false);

  const handleBackdropClick = (e) => {
    if (e.target.id === "popup-backdrop") {
      handleClose();
    }
  };

  return (
    <div
      id="popup-backdrop"
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 "
    >
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-700 px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-6">
          <h2 className="text-2xl font-semibold text-white">
            AI Face Tracking System
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Quick Start Guide */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Zap className="mr-2 text-orange-500" size={20} />
              Quick Start
            </h3>
            <div className="space-y-4 ">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white text-xs font-semibold rounded-full flex items-center justify-center mt-0.5 mr-3">
                  1
                </div>
                <div className="text-sm text-neutral-300">
                  Click "Start Camera" to access your device's camera
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white text-xs font-semibold rounded-full flex items-center justify-center mt-0.5 mr-3">
                  2
                </div>
                <div className="text-sm text-neutral-300">
                  Center your face in the camera view for optimal detection
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white text-xs font-semibold rounded-full flex items-center justify-center mt-0.5 mr-3">
                  3
                </div>
                <div className="text-sm text-neutral-300">
                  Begin recording with real-time face tracking overlay
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white text-xs font-semibold rounded-full flex items-center justify-center mt-0.5 mr-3">
                  4
                </div>
                <div className="text-sm text-neutral-300">
                  Download your recorded video with tracking data
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Settings className="mr-2 text-neutral-500" size={20} />
              Best Practices
            </h3>
            <div>
              <ul className="space-y-5 text-sm text-neutral-300">
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Ensure adequate lighting for optimal face detection accuracy
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Maintain appropriate distance from camera (2-3 feet
                  recommended)
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  System supports multiple simultaneous face tracking
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Compatible with desktop and mobile devices
                </li>
              </ul>
            </div>
          </div>
        </div>
        {/* Key Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="p-6 bg-gradient-to-br from-blue-900/20 to-indigo-900/20 rounded-xl border border-blue-800">
            <div className="flex items-center mb-4">
              <Eye className="text-blue-400 mr-3" size={24} />
              <h3 className="font-semibold text-white">Real-time Detection</h3>
            </div>
            <ul className="text-sm text-neutral-300 space-y-2">
              <li>68-point facial landmark detection</li>
              <li>Multi-face tracking with unique IDs</li>
              <li>Confidence scoring system</li>
              <li>Advanced bounding box visualization</li>
            </ul>
          </div>

          <div className="p-6 bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-xl border border-green-800">
            <div className="flex items-center mb-4">
              <Video className="text-green-400 mr-3" size={24} />
              <h3 className="font-semibold text-white">HD Recording</h3>
            </div>
            <ul className="text-sm text-neutral-300 space-y-2">
              <li>High-definition video capture</li>
              <li>Synchronized audio recording</li>
              <li>Live overlay visualization</li>
              <li>Professional corner brackets</li>
            </ul>
          </div>

          <div className="p-6 bg-gradient-to-br from-purple-900/20 to-violet-900/20 rounded-xl border border-purple-800">
            <div className="flex items-center mb-4">
              <Download className="text-purple-400 mr-3" size={24} />
              <h3 className="font-semibold text-white">Smart Export</h3>
            </div>
            <ul className="text-sm text-neutral-300 space-y-2">
              <li>Automatic timestamped naming</li>
              <li>Optimized file compression</li>
              <li>Preview thumbnails</li>
              <li>One-click download</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HowToUse;
