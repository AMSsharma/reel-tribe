
import React, { useState, useEffect, useRef } from 'react';
import VideoCard from '@/components/VideoCard';
import BottomNav from '@/components/BottomNav';
import { VideoData } from '@/types/video';
import { getAllVideos } from '@/services/videoService';

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
        setVideos(fetchedVideos);
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVideos();
  }, []);
  
  // Simulate infinite scrolling by appending more videos when reaching the end
  const loadMoreVideos = () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    // In a real app, this would be an API call to fetch more videos with pagination
    setTimeout(async () => {
      try {
        // Try to get more real videos first
        const existingIds = videos.map(v => v.id);
        const moreVideos = await getAllVideos();
        const newVideos = moreVideos.filter(v => !existingIds.includes(v.id));
        
        if (newVideos.length > 0) {
          setVideos(prevVideos => [...prevVideos, ...newVideos]);
        } else {
          // Fall back to shuffled versions of the same videos (for demo purposes)
          const shuffledVideos = [...videos]
            .sort(() => Math.random() - 0.5)
            .slice(0, 5)
            .map(video => ({ 
              ...video, 
              id: `${video.id}-${Math.random().toString(36).substring(7)}` 
            }));
            
          setVideos(prevVideos => [...prevVideos, ...shuffledVideos]);
        }
      } catch (error) {
        console.error('Error loading more videos:', error);
      } finally {
        setIsLoading(false);
      }
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
        {videos.length === 0 && isLoading ? (
          <div className="flex justify-center items-center h-[70vh]">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
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
