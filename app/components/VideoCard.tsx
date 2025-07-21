import React from "react";
import { Download, Trash2, Play } from "lucide-react";
import { RecordedVideo } from "../types";

interface VideoCardProps {
  video: RecordedVideo;
  onDownload: (video: RecordedVideo) => void;
  onDelete: (videoId: number) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  onDownload,
  onDelete,
}) => {
  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="p-6 transition-colors border-b border-b-neutral-600 ">
      <div className="relative group mb-3">
        <video
          src={video.url}
          className="w-full bg-black object-cover rounded-xl aspect-video px-25"
          poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23666' d='M8 5v14l11-7z'/%3E%3C/svg%3E"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
          <Play className="text-white" size={32} />
        </div>
        <video
          src={video.url}
          controls
          className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity rounded"
        />
      </div>

      <div className="space-y-2">
        <p
          className="text-sm font-semibold truncate text-gray-200"
          title={video.name}
        >
          {video.name}
        </p>
        <div className="flex justify-between text-xs text-gray-400">
          <span>{video.size}</span>
          <span>{formatTimestamp(video.timestamp)}</span>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={() => onDownload(video)}
            className="text-white flex-1 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-full text-sm flex items-center justify-center gap-2 transition-colors font-medium cursor-pointer"
            title="Download video"
          >
            <Download size={16} />
            Download
          </button>
          <button
            onClick={() => onDelete(video.id)}
            className="text-red-400 hover:bg-red-700 hover:text-white px-3 py-2 rounded-full text-sm flex items-center justify-center transition-colors"
            title="Delete video"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
