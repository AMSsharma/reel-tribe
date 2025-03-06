
import React, { useState, useEffect, useRef } from 'react';
import VideoCard, { VideoData } from '@/components/VideoCard';
import BottomNav from '@/components/BottomNav';

// Mock data for videos
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
    description: 'Learn the basics of Swift programming in this quick tutorial.',
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
    description: 'Discover how to use Tailwind CSS to build beautiful, responsive websites quickly.',
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
    description: 'An overview of what to expect from artificial intelligence advancements in 2023.',
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
    description: 'Learn how to effectively use React Hooks in your projects.',
  },
];

const Index = () => {
  const [videos, setVideos] = useState<VideoData[]>(MOCK_VIDEOS);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Simulate infinite scrolling by appending more videos when reaching the end
  const loadMoreVideos = () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    // In a real app, this would be an API call to fetch more videos
    setTimeout(() => {
      // Add shuffled versions of the same videos (for demo purposes)
      const newVideos = [...MOCK_VIDEOS]
        .map(video => ({ 
          ...video, 
          id: `${video.id}-${Math.random().toString(36).substring(7)}` 
        }))
        .sort(() => Math.random() - 0.5);
        
      setVideos(prevVideos => [...prevVideos, ...newVideos]);
      setIsLoading(false);
    }, 1500);
  };
  
  // Handle scroll events to implement infinite scrolling
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    
    // If we're near the bottom, load more videos
    if (scrollHeight - scrollTop - clientHeight < 500) {
      loadMoreVideos();
    }
    
    // Update active video based on scroll position
    const videoIndex = Math.floor(scrollTop / clientHeight);
    if (videoIndex !== activeVideoIndex && videoIndex < videos.length) {
      setActiveVideoIndex(videoIndex);
    }
  };
  
  // Add scroll event listener
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, [activeVideoIndex, videos.length]);

  return (
    <div className="flex flex-col min-h-screen app-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-50">
        <div className="flex justify-between items-center px-4 h-14">
          <h1 className="text-xl font-semibold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">ShortWatch</h1>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 mt-14 mb-16">
        <div 
          ref={scrollContainerRef}
          className="scroll-container max-w-md mx-auto"
        >
          {videos.map((video, index) => (
            <VideoCard 
              key={video.id} 
              video={video} 
              isActive={index === activeVideoIndex}
              onActive={() => setActiveVideoIndex(index)}
            />
          ))}
          
          {isLoading && (
            <div className="flex justify-center items-center py-8">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Index;
