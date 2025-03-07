
import React, { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { toast as sonnerToast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import VideoPlayer from './VideoPlayer';

interface SummaryResult {
  videoId: string;
  videoDetails: {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    channel: string;
    publishedAt: string;
    duration: string;
    viewCount: string;
    likeCount: string;
  };
  summary: string;
}

const YouTubeSummarizer: React.FC = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      sonnerToast.error('Please enter a valid YouTube URL');
      return;
    }
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('youtube-summarize', {
        body: { youtubeUrl: url }
      });
      
      if (error) throw error;
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to process video');
      }
      
      setResult(data);
      setUrl('');
      
      toast({
        title: "Summary generated",
        description: "The video summary was successfully created.",
      });
    } catch (error) {
      console.error('Error summarizing video:', error);
      sonnerToast.error('Failed to generate summary: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const shareToSYTS = async () => {
    if (!result) return;
    
    sonnerToast.success('This feature will be implemented soon!');
    
    // In a real implementation, this would save the video to a database
    // and make it available in the SYTS (Share YouTube Short) feed
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
        Create Short Video Previews
      </h2>
      
      <Card className="p-6 bg-white/70 dark:bg-gray-800/50 backdrop-blur-md rounded-xl shadow-sm mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste YouTube URL here..."
              className="flex-1"
              disabled={loading}
            />
            <Button 
              type="submit" 
              disabled={loading || !url}
              className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Generate Preview'
              )}
            </Button>
          </div>
        </form>
      </Card>

      {result && (
        <Card className="overflow-hidden bg-white/70 dark:bg-gray-800/50 backdrop-blur-md rounded-xl shadow-sm">
          <div className="aspect-video relative">
            <iframe
              src={`https://www.youtube.com/embed/${result.videoId}`}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          
          <div className="p-6 space-y-4">
            <h3 className="text-xl font-semibold">{result.videoDetails.title}</h3>
            
            <div className="flex justify-between text-sm text-gray-500">
              <span>{result.videoDetails.channel}</span>
              <span>{parseInt(result.videoDetails.viewCount).toLocaleString()} views</span>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="font-medium mb-2">AI-Generated Summary:</h4>
              <p className="text-gray-700 dark:text-gray-300">{result.summary}</p>
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={shareToSYTS}
                className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white"
              >
                Share to SYTS Feed
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default YouTubeSummarizer;
