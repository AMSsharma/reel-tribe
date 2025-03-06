
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import VideoPlayer from '@/components/VideoPlayer';
import EngagementButtons from '@/components/EngagementButtons';
import { VideoData } from '@/components/VideoCard';

// Mock data (in a real app, this would come from an API)
const MOCK_VIDEOS: VideoData[] = [
  {
    id: '1',
    title: 'How to Master Swift in 10 Minutes',
    creator: {
      id: 'creator1',
      name: 'TechMaster',
      avatar: 'https://i.pravatar.cc/150?img=1',
    },
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-typing-on-a-laptop-in-a-cafe-38958-large.mp4',
    thumbnailUrl: 'https://i.imgur.com/A8eQsll.jpg',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    description: 'Learn the basics of Swift programming in this quick tutorial. We cover the fundamentals like variables, functions, and control flow. Perfect for beginners who want to get started with iOS development.',
  },
  {
    id: '2',
    title: 'Building a Modern Website with Tailwind CSS',
    creator: {
      id: 'creator2',
      name: 'CodeArtist',
      avatar: 'https://i.pravatar.cc/150?img=2',
    },
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-working-on-her-laptop-at-home-4806-large.mp4',
    thumbnailUrl: 'https://i.imgur.com/JjkZMYR.jpg',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    description: 'Discover how to use Tailwind CSS to build beautiful, responsive websites quickly. This tutorial covers setup, basic utilities, responsive design, and advanced customization.',
  },
  {
    id: '3',
    title: 'The Future of AI in 2023',
    creator: {
      id: 'creator3',
      name: 'FutureTech',
      avatar: 'https://i.pravatar.cc/150?img=3',
    },
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-in-a-suit-working-on-a-financial-analysis-29910-large.mp4',
    thumbnailUrl: 'https://i.imgur.com/HVaYXQF.jpg',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    description: 'An overview of what to expect from artificial intelligence advancements in 2023. We discuss breakthroughs in natural language processing, computer vision, and generative AI.',
  },
  {
    id: '4',
    title: 'Mastering React Hooks',
    creator: {
      id: 'creator4',
      name: 'ReactMaster',
      avatar: 'https://i.pravatar.cc/150?img=4',
    },
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-working-on-her-laptop-4847-large.mp4',
    thumbnailUrl: 'https://i.imgur.com/JmA9vXs.jpg',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    description: 'Learn how to effectively use React Hooks in your projects. This tutorial covers useState, useEffect, useContext, useRef, and custom hooks.',
  },
];

const VideoDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [video, setVideo] = useState<VideoData | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<VideoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch video data
  useEffect(() => {
    // Simulate API request
    setIsLoading(true);
    
    setTimeout(() => {
      // Find the video with the matching ID
      const foundVideo = MOCK_VIDEOS.find(v => v.id === id) || null;
      setVideo(foundVideo);
      
      // Get related videos (exclude current video)
      const related = MOCK_VIDEOS.filter(v => v.id !== id);
      setRelatedVideos(related);
      
      setIsLoading(false);
    }, 500);
  }, [id]);
  
  // If loading, show skeleton
  if (isLoading) {
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
  }
  
  // If no video found, show error
  if (!video) {
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
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6 animate-fade-in">
        <Link to="/" className="inline-flex items-center text-primary hover:underline mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Feed
        </Link>
        
        <div className="rounded-xl overflow-hidden aspect-video mb-6 bg-black">
          <VideoPlayer 
            src={video.videoUrl} 
            poster={video.thumbnailUrl}
            isActive={true}
          />
        </div>
        
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2">{video.title}</h1>
            
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src={video.creator.avatar} 
                alt={video.creator.name}
                className="w-10 h-10 rounded-full object-cover" 
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
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md transition-colors hover:bg-primary/90"
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
        
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">More Videos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedVideos.map(related => (
              <Link 
                key={related.id}
                to={`/video/${related.id}`}
                className="group rounded-lg overflow-hidden bg-card hover:bg-card/80 transition-colors"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={related.thumbnailUrl}
                    alt={related.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
                    {related.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {related.creator.name}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDetail;
