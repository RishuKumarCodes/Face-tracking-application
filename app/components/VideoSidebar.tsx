import React from "react";
import { Video } from "lucide-react";
import { VideoCard } from "./VideoCard";
import { RecordedVideo } from "../types";

interface VideoSidebarProps {
  recordedVideos: RecordedVideo[];
  onDownloadVideo: (video: RecordedVideo) => void;
  onDeleteVideo: (videoId: number) => void;
}

export const VideoSidebar: React.FC<VideoSidebarProps> = ({
  recordedVideos,
  onDownloadVideo,
  onDeleteVideo,
}) => {
  return (
    <div className="bg-neutral-800 rounded-3xl mt-4 mr-4 h-[calc(100vh-135px)] overflow-auto w-[360px]">
      <h2 className="text-lg font-semibold mb-6 p-6 flex items-center gap-2 text-white">
        <Video size={24} />
        Recorded Videos
      </h2>

      {recordedVideos.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎬</div>
          <p className="text-gray-400">No videos recorded yet</p>
          <p className="text-sm text-gray-500 mt-2">
            Start recording to capture AI face tracking videos
          </p>
        </div>
      ) : (
        <div className="">
          {recordedVideos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onDownload={onDownloadVideo}
              onDelete={onDeleteVideo}
            />
          ))}
        </div>
      )}
    </div>
  );
};
