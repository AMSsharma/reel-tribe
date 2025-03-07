
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import VideoPlayer from '@/components/VideoPlayer';
import BottomNav from '@/components/BottomNav';
import VideoSkeleton from '@/components/video/VideoSkeleton';
import VideoNotFound from '@/components/video/VideoNotFound';
import VideoInfo from '@/components/video/VideoInfo';
import RelatedVideos from '@/components/video/RelatedVideos';
import { VideoData } from '@/types/video';
import { getVideoById, getRelatedVideos } from '@/services/videoService';

const VideoDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [video, setVideo] = useState<VideoData | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<VideoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch video data
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      
      try {
        const [videoData, relatedVideosData] = await Promise.all([
          getVideoById(id),
          getRelatedVideos(id)
        ]);
        
        setVideo(videoData);
        setRelatedVideos(relatedVideosData);
      } catch (error) {
        console.error('Error fetching video:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  // If loading, show skeleton
  if (isLoading) {
    return <VideoSkeleton />;
  }
  
  // If no video found, show error
  if (!video) {
    return <VideoNotFound />;
  }

  return (
    <div className="min-h-screen app-background">
      <div className="max-w-4xl mx-auto p-6 animate-fade-in pb-20">
        <Link to="/" className="inline-flex items-center text-primary hover:underline mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Feed
        </Link>
        
        <div className="rounded-xl overflow-hidden aspect-video mb-6 bg-black shadow-lg">
          <VideoPlayer 
            src={video.videoUrl} 
            poster={video.thumbnailUrl}
            isActive={true}
          />
        </div>
        
        <VideoInfo video={video} />
        <RelatedVideos videos={relatedVideos} />
      </div>
      <BottomNav />
    </div>
  );
};

export default VideoDetail;
