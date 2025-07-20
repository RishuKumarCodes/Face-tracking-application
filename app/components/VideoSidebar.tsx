import React from 'react';
import { Video } from 'lucide-react';
import { RecordedVideo } from '@/types';
import { VideoCard } from './VideoCard';

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
    <div className="bg-gray-800 rounded-xl p-6 shadow-2xl border border-gray-700">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
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
        <div className="space-y-4 max-h-96 overflow-y-auto">
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