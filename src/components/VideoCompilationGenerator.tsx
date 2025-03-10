
import React, { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { toast as sonnerToast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Video, Film } from "lucide-react";
import VideoPlayer from './VideoPlayer';
import { generateVideoCompilation, getCompilationStatus } from '@/services/videoService';
import { useAuth } from '@/contexts/AuthContext';

const VideoCompilationGenerator: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [compilationId, setCompilationId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Check compilation status at regular intervals
  useEffect(() => {
    let statusInterval: NodeJS.Timeout;

    if (compilationId && status && status !== 'completed' && status !== 'error') {
      statusInterval = setInterval(async () => {
        try {
          const result = await getCompilationStatus(compilationId);
          setStatus(result.status);
          
          if (result.videoUrl) {
            setVideoUrl(result.videoUrl);
            clearInterval(statusInterval);
            toast({
              title: "Compilation ready",
              description: "Your trending videos compilation is ready to view.",
            });
          }
          
          if (result.status === 'error') {
            clearInterval(statusInterval);
            sonnerToast.error('Compilation failed: ' + (result.error || 'Unknown error'));
          }
        } catch (error) {
          console.error('Error checking compilation status:', error);
        }
      }, 5000); // Check every 5 seconds
    }

    return () => {
      if (statusInterval) clearInterval(statusInterval);
    };
  }, [compilationId, status, toast]);

  const handleGenerateCompilation = async () => {
    setLoading(true);
    try {
      const result = await generateVideoCompilation(user?.email);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to generate compilation');
      }
      
      setCompilationId(result.compilationId!);
      setStatus('processing');
      
      toast({
        title: "Compilation started",
        description: "Your trending videos compilation is being processed. This may take a few minutes.",
      });
    } catch (error) {
      console.error('Error generating compilation:', error);
      sonnerToast.error('Failed to generate compilation: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto my-8">
      <Card className="p-6 bg-white/70 dark:bg-gray-800/50 backdrop-blur-md rounded-xl shadow-sm mb-8">
        <div className="flex items-center mb-4">
          <Film className="h-6 w-6 text-purple-600 mr-2" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
            Create Trending Videos Compilation
          </h2>
        </div>
        
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Generate a 1-minute compilation of the most interesting moments from trending YouTube videos.
          Our AI analyzes trending content and creates a highlight reel of the most engaging moments.
        </p>
        
        {!compilationId && (
          <Button 
            onClick={handleGenerateCompilation} 
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting Compilation...
              </>
            ) : (
              <>
                <Video className="mr-2 h-4 w-4" />
                Generate Trending Compilation
              </>
            )}
          </Button>
        )}
        
        {compilationId && !videoUrl && (
          <div className="flex items-center justify-center p-8 text-center">
            <div className="flex flex-col items-center">
              <Loader2 className="h-12 w-12 text-purple-600 animate-spin mb-4" />
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                Processing your compilation...
              </p>
              <p className="text-sm text-gray-500 mt-2">
                This typically takes 3-5 minutes. The page will automatically update when ready.
              </p>
            </div>
          </div>
        )}
        
        {videoUrl && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Your Trending Videos Compilation</h3>
            
            <div className="aspect-video relative rounded-lg overflow-hidden">
              <VideoPlayer
                src={videoUrl}
                isActive={true}
                autoPlay={false}
              />
            </div>
            
            <p className="text-sm text-gray-500 mt-2">
              This compilation features highlights from trending videos, powered by AI analysis to identify the most engaging moments.
            </p>
          </div>
        )}
        
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/30 rounded-md">
          <p className="text-sm text-yellow-700 dark:text-yellow-400">
            <strong>Note:</strong> In this demo, video processing is simulated. In a production environment, 
            this would trigger a process on a dedicated backend server with FFmpeg to create the actual compilation video.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default VideoCompilationGenerator;
