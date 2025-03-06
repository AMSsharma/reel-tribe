
import React, { useState } from 'react';
import { Heart, Share2, Bookmark, ExternalLink } from 'lucide-react';

interface EngagementButtonsProps {
  videoId: string;
  youtubeUrl: string;
  vertical?: boolean;
  showExternalLink?: boolean;
  className?: string;
}

const EngagementButtons: React.FC<EngagementButtonsProps> = ({
  videoId,
  youtubeUrl,
  vertical = true,
  showExternalLink = true,
  className = '',
}) => {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Handle like button click
  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(!liked);
    // Analytics or API call could be added here
  };
  
  // Handle share button click
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Use Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: 'Check out this video',
        text: 'I found this amazing video you should watch!',
        url: youtubeUrl,
      }).catch(error => {
        console.error('Error sharing:', error);
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(youtubeUrl).then(() => {
        alert('Link copied to clipboard!');
      }).catch(err => {
        console.error('Failed to copy:', err);
      });
    }
  };
  
  // Handle save button click
  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSaved(!saved);
    // Analytics or API call could be added here
  };
  
  // Handle watch on YouTube click
  const handleWatchYouTube = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(youtubeUrl, '_blank');
  };

  return (
    <div className={`engagement-buttons ${vertical ? 'flex flex-col space-y-6' : 'flex flex-row space-x-6'} ${className}`}>
      <button 
        onClick={handleLike} 
        className="engagement-button group"
        aria-label="Like video"
      >
        <Heart 
          className={`w-7 h-7 ${liked ? 'fill-red-500 text-red-500' : 'text-white'} transition-colors duration-300`} 
        />
        <span className="text-xs mt-1.5 text-white/90 group-hover:text-white">
          Like
        </span>
      </button>
      
      <button 
        onClick={handleShare} 
        className="engagement-button group"
        aria-label="Share video"
      >
        <Share2 className="w-7 h-7 text-white" />
        <span className="text-xs mt-1.5 text-white/90 group-hover:text-white">
          Share
        </span>
      </button>
      
      <button 
        onClick={handleSave} 
        className="engagement-button group"
        aria-label="Save video"
      >
        <Bookmark 
          className={`w-7 h-7 ${saved ? 'fill-white text-white' : 'text-white'} transition-colors duration-300`} 
        />
        <span className="text-xs mt-1.5 text-white/90 group-hover:text-white">
          Save
        </span>
      </button>
      
      {showExternalLink && (
        <button 
          onClick={handleWatchYouTube} 
          className="mt-8 action-button flex items-center justify-center space-x-2"
          aria-label="Watch on YouTube"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Watch Full Video</span>
        </button>
      )}
    </div>
  );
};

export default EngagementButtons;
