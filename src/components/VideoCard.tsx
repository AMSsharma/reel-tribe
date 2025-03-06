import React from 'react';
import { Link } from 'react-router-dom';
import VideoPlayer from './VideoPlayer';
import EngagementButtons from './EngagementButtons';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

export interface VideoData {
  id: string;
  title: string;
  creator: {
    id: string;
    name: string;
    avatar: string;
  };
  videoUrl: string;
  thumbnailUrl: string;
  youtubeUrl: string;
  description?: string;
}

interface VideoCardProps {
  video: VideoData;
  isActive: boolean;
  onActive?: () => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, isActive, onActive }) => {
  const [cardRef, isIntersecting] = useIntersectionObserver<HTMLDivElement>({ threshold: 0.7 });
  
  React.useEffect(() => {
    if (isIntersecting && onActive) {
      onActive();
    }
  }, [isIntersecting, onActive]);

  return (
    <div 
      ref={cardRef} 
      className="scroll-item bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden mb-4 mx-4"
    >
      <div className="p-3 flex items-center space-x-2">
        <Link 
          to={`/creator/${video.creator.id}`}
          className="flex items-center space-x-2"
          onClick={(e) => e.stopPropagation()}
        >
          <img 
            src={video.creator.avatar} 
            alt={video.creator.name}
            className="w-8 h-8 rounded-full object-cover" 
          />
          <span className="font-medium text-sm dark:text-white">{video.creator.name}</span>
        </Link>
      </div>

      <div className="relative aspect-square">
        <VideoPlayer 
          src={video.videoUrl} 
          poster={video.thumbnailUrl}
          isActive={isActive}
        />
      </div>

      <div className="p-3">
        <div className="flex justify-between items-start mb-2">
          <Link 
            to={`/video/${video.id}`} 
            className="text-sm font-medium dark:text-white line-clamp-2"
          >
            {video.title}
          </Link>
          <EngagementButtons 
            videoId={video.id} 
            youtubeUrl={video.youtubeUrl}
          />
        </div>
        {video.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
            {video.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default VideoCard;
