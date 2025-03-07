
import React from 'react';
import { Link } from 'react-router-dom';
import { VideoData } from '@/types/video';

interface RelatedVideosProps {
  videos: VideoData[];
}

const RelatedVideos: React.FC<RelatedVideosProps> = ({ videos }) => {
  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
        More Videos
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {videos.map(video => (
          <Link 
            key={video.id}
            to={`/video/${video.id}`}
            className="group rounded-lg overflow-hidden bg-white/70 dark:bg-gray-800/50 backdrop-blur-md hover:shadow-md transition-all"
          >
            <div className="aspect-video relative overflow-hidden">
              <img 
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-full h-full object-cover transition-transform group-hover:scale-105" 
              />
            </div>
            <div className="p-3">
              <h3 className="font-medium line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:via-pink-600 group-hover:to-red-600 transition-colors">
                {video.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {video.creator.name}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedVideos;
