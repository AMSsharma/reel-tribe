
import React, { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { toast as sonnerToast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Share, Clock, Code, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import VideoPlayer from './VideoPlayer';
import { storeProcessedVideo } from '@/services/videoService';

interface Timestamp {
  time: string;
  description: string;
  reason: string;
}

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
  timestamps: Timestamp[];
  processingDescription?: string;
}

const YouTubeSummarizer: React.FC = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [savingToSYTS, setSavingToSYTS] = useState(false);
  const [showCode, setShowCode] = useState(false);
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
    
    setSavingToSYTS(true);
    
    try {
      const { success, id, error } = await storeProcessedVideo({
        youtubeId: result.videoId,
        title: result.videoDetails.title,
        description: result.videoDetails.description,
        thumbnailUrl: result.videoDetails.thumbnailUrl,
        channel: result.videoDetails.channel,
        publishedAt: result.videoDetails.publishedAt,
        viewCount: parseInt(result.videoDetails.viewCount),
        likeCount: parseInt(result.videoDetails.likeCount),
        summary: result.summary
      });
      
      if (!success) throw error;
      
      sonnerToast.success('Video has been shared to SYTS feed!');
      
    } catch (error) {
      console.error('Error saving to SYTS:', error);
      sonnerToast.error('Failed to share to SYTS: ' + (error.message || 'Unknown error'));
    } finally {
      setSavingToSYTS(false);
    }
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
            
            {result.timestamps && result.timestamps.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="font-medium mb-2 flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  Key Moments:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.timestamps.map((timestamp, index) => (
                    <div 
                      key={index} 
                      className="bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{timestamp.time}</span>
                        <a 
                          href={`https://www.youtube.com/watch?v=${result.videoId}&t=${convertTimestampToSeconds(timestamp.time)}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-500 hover:underline"
                        >
                          Jump to moment
                        </a>
                      </div>
                      <p className="text-sm">{timestamp.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{timestamp.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 mb-4"
                onClick={() => setShowCode(!showCode)}
              >
                <Code size={16} />
                {showCode ? 'Hide Processing Code' : 'Show Processing Code'}
              </Button>
              
              {showCode && result.processingDescription && (
                <div className="bg-black/90 text-green-400 p-4 rounded-md font-mono text-xs overflow-x-auto">
                  <pre>{result.processingDescription}</pre>
                </div>
              )}
              
              <div className="flex items-center gap-2 mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/30 rounded-md">
                <Video className="h-5 w-5 text-yellow-500" />
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  Video processing is simulated. In a production environment, this would trigger a backend process to extract and compile the clips based on the timestamps.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={shareToSYTS}
                className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white"
                disabled={savingToSYTS}
              >
                {savingToSYTS ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sharing...
                  </>
                ) : (
                  <>
                    <Share className="mr-2 h-4 w-4" />
                    Share to SYTS Feed
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

// Helper to convert a timestamp like "01:45" to seconds
const convertTimestampToSeconds = (timestamp: string): number => {
  const parts = timestamp.split(':');
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
};

export default YouTubeSummarizer;
