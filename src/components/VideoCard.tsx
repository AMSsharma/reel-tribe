
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
  
  // Trigger onActive callback when card becomes visible
  React.useEffect(() => {
    if (isIntersecting && onActive) {
      onActive();
    }
  }, [isIntersecting, onActive]);

  return (
    <div 
      ref={cardRef} 
      className="scroll-item w-full h-full flex items-center justify-center"
    >
      <div className="video-card max-w-md w-full mx-auto animate-fade-in">
        <VideoPlayer 
          src={video.videoUrl} 
          poster={video.thumbnailUrl}
          isActive={isActive}
        />
        
        <div className="video-controls-overlay">
          <div className="flex items-start justify-between">
            <Link 
              to={`/creator/${video.creator.id}`}
              className="flex items-center space-x-2 p-2 rounded-full bg-black/20 backdrop-blur-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={video.creator.avatar} 
                alt={video.creator.name}
                className="w-8 h-8 rounded-full object-cover border border-white/30" 
              />
              <span className="text-white font-medium text-sm">{video.creator.name}</span>
            </Link>
          </div>
          
          <div className="flex justify-between items-end">
            <div className="max-w-[70%]">
              <Link to={`/video/${video.id}`} className="block" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-white text-lg font-semibold mb-2 line-clamp-2">{video.title}</h3>
              </Link>
              <Link 
                to={`/video/${video.id}`}
                className="text-white/80 text-xs underline underline-offset-2"
                onClick={(e) => e.stopPropagation()}
              >
                View Details
              </Link>
            </div>
            
            <EngagementButtons 
              videoId={video.id} 
              youtubeUrl={video.youtubeUrl}
              className="mr-2"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
