
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const VideoNotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <h1 className="text-2xl font-bold mb-4">Video Not Found</h1>
      <p className="text-muted-foreground mb-6">The video you're looking for doesn't exist or has been removed.</p>
      <Link to="/" className="text-primary hover:underline flex items-center">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Home
      </Link>
    </div>
  );
};

export default VideoNotFound;
