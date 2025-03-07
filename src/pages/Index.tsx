
import React, { useState, useEffect, useRef } from 'react';
import VideoCard from '@/components/VideoCard';
import BottomNav from '@/components/BottomNav';
import { VideoData } from '@/types/video';
import { getAllVideos } from '@/services/videoService';
import { toast } from 'sonner';

const Index = () => {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Fetch initial videos
  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoading(true);
      try {
        const fetchedVideos = await getAllVideos();
        if (fetchedVideos.length === 0) {
          toast.error("No videos found. Please try again later.");
        }
        setVideos(fetchedVideos);
      } catch (error) {
        console.error('Error fetching videos:', error);
        toast.error("Failed to load videos. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVideos();
  }, []);
  
  // Handle scroll events to implement infinite scrolling
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    
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
        {videos.length === 0 && isLoading ? (
          <div className="flex justify-center items-center h-[70vh]">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : videos.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-[70vh] p-4 text-center">
            <h2 className="text-xl font-semibold mb-2">No Videos Available</h2>
            <p className="text-muted-foreground">
              We couldn't find any videos to display at the moment.
              Please check back later or try the SYTS tab to see shared videos.
            </p>
          </div>
        ) : (
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
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Index;
