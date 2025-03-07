
import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { VideoData } from '@/types/video';
import EngagementButtons from '@/components/EngagementButtons';

interface VideoInfoProps {
  video: VideoData;
}

const VideoInfo: React.FC<VideoInfoProps> = ({ video }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
      <div className="flex-1 bg-white/70 dark:bg-gray-800/50 backdrop-blur-md rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
          {video.title}
        </h1>
        
        <div className="flex items-center space-x-3 mb-4">
          <img 
            src={video.creator.avatar} 
            alt={video.creator.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-pink-500" 
          />
          <Link to={`/creator/${video.creator.id}`} className="font-medium hover:underline">
            {video.creator.name}
          </Link>
        </div>
        
        <p className="text-muted-foreground mb-4">{video.description}</p>
        
        <a 
          href={video.youtubeUrl}
          target="_blank"
          rel="noopener noreferrer" 
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white rounded-md transition-all hover:shadow-lg"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Watch Full Video on YouTube
        </a>
      </div>
      
      <div className="flex md:flex-col space-x-6 md:space-x-0 md:space-y-6">
        <EngagementButtons 
          videoId={video.id} 
          youtubeUrl={video.youtubeUrl}
          vertical={false}
          showExternalLink={false}
        />
      </div>
    </div>
  );
};

export default VideoInfo;
