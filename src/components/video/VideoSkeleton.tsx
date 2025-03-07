
import React from 'react';

const VideoSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-background animate-pulse-soft p-6">
      <div className="max-w-4xl mx-auto">
        <div className="w-8 h-8 rounded-full bg-gray-200 mb-6"></div>
        <div className="aspect-video rounded-xl bg-gray-200 mb-6"></div>
        <div className="h-8 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded mb-6 w-2/3"></div>
      </div>
    </div>
  );
};

export default VideoSkeleton;
