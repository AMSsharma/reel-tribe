
import React, { useState, useRef, useEffect } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  isActive: boolean;
  muted?: boolean;
  loop?: boolean;
  autoPlay?: boolean;
  onClick?: () => void;
  className?: string;
  youtubeId?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  poster,
  isActive,
  muted = true,
  loop = true,
  autoPlay = true,
  onClick,
  className = '',
  youtubeId,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [containerRef, isVisible] = useIntersectionObserver<HTMLDivElement>({ threshold: 0.6 });
  
  // Handle visibility changes
  useEffect(() => {
    if (isActive && isVisible && !youtubeId) {
      playVideo();
    } else if (!youtubeId) {
      pauseVideo();
    }
  }, [isActive, isVisible, youtubeId]);
  
  // Play/Pause functions
  const playVideo = () => {
    if (videoRef.current) {
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(error => console.error('Error playing video:', error));
    }
  };

  const pauseVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Handle video click
  const handleVideoClick = () => {
    if (onClick) {
      onClick();
    } else if (!youtubeId) {
      isPlaying ? pauseVideo() : playVideo();
    }
  };

  // Handle video load event
  const handleVideoLoad = () => {
    setIsLoaded(true);
  };

  // Render YouTube embed if youtubeId is provided
  if (youtubeId) {
    return (
      <div 
        ref={containerRef}
        className={`video-container relative w-full h-full overflow-hidden ${className}`}
      >
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=${isActive && isVisible ? 1 : 0}&mute=1&loop=1&playlist=${youtubeId}`}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className={`video-container relative w-full h-full overflow-hidden ${className}`}
      onClick={handleVideoClick}
    >
      {!isLoaded && poster && (
        <div className="absolute inset-0 bg-black animate-pulse-soft">
          <img 
            src={poster} 
            alt="Video poster" 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted={muted}
        loop={loop}
        playsInline
        autoPlay={autoPlay && isActive}
        className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoadedData={handleVideoLoad}
      />
      
      {!isPlaying && isLoaded && !youtubeId && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="w-16 h-16 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
