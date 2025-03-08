
import React, { useEffect, useState } from 'react';
import BottomNav from '@/components/BottomNav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Info } from 'lucide-react';
import { getAllVideos } from '@/services/videoService';
import { VideoData } from '@/types/video';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const SYTS = () => {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        // Pass the user's email to get personalized trending videos
        const fetchedVideos = await getAllVideos(user?.email);
        setVideos(fetchedVideos);
      } catch (error) {
        console.error('Error fetching videos:', error);
        toast.error("Failed to load videos. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [user]);

  return (
    <div className="min-h-screen app-background">
      <div className="max-w-4xl mx-auto p-6 pb-24">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
          Share YouTube Short (SYTS)
        </h1>

        <Card className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-md shadow-sm mb-8 p-6">
          <div className="flex items-center space-x-3 text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 p-4 rounded-lg mb-6">
            <Info className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">
              {user ? `Personalized trending videos for ${user.email}` : "Find AI-summarized YouTube videos that have been shared by users."}
            </p>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading personalized videos...</p>
            </div>
          ) : videos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {videos.map(video => (
                <Link 
                  key={video.id}
                  to={`/video/${video.id}`}
                  className="group rounded-lg overflow-hidden bg-white/70 dark:bg-gray-800/50 backdrop-blur-md hover:shadow-md transition-all"
                >
                  <div className="aspect-video relative overflow-hidden">
                    {video.youtubeId ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${video.youtubeId}`}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <img 
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                      />
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:via-pink-600 group-hover:to-red-600 transition-colors">
                      {video.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {video.creator.name}
                    </p>
                    {video.summary && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {video.summary}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold mb-4">No Videos Yet</h2>
              <p className="text-muted-foreground mb-6">
                Be the first to create and share a YouTube video summary!
              </p>
              <Link to="/profile">
                <Button className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white">
                  Create a Summary
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </div>
      <BottomNav />
    </div>
  );
};

export default SYTS;
