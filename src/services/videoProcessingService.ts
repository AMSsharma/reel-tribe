
import { supabase } from '@/integrations/supabase/client';

// Process a video to create a summary and short clips
export const processYouTubeVideo = async (youtubeUrl: string, userEmail?: string): Promise<{
  success: boolean;
  videoId?: string;
  videoDetails?: any;
  summary?: string;
  timestamps?: any[];
  processingInstructions?: any;
  error?: string;
}> => {
  try {
    const { data, error } = await supabase.functions.invoke('youtube-summarize', {
      body: { 
        youtubeUrl,
        userEmail
      }
    });
    
    if (error) throw error;
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to process video');
    }
    
    // If we have video details, store the processed video in our database
    if (data.videoDetails) {
      await storeProcessedVideo({
        youtubeId: data.videoId,
        title: data.videoDetails.title,
        description: data.videoDetails.description,
        thumbnailUrl: data.videoDetails.thumbnailUrl,
        channel: data.videoDetails.channel,
        publishedAt: data.videoDetails.publishedAt,
        viewCount: parseInt(data.videoDetails.viewCount),
        likeCount: parseInt(data.videoDetails.likeCount),
        summary: data.summary
      });
    }
    
    return {
      success: true,
      videoId: data.videoId,
      videoDetails: data.videoDetails,
      summary: data.summary,
      timestamps: data.timestamps,
      processingInstructions: data.processingInstructions
    };
  } catch (error) {
    console.error('Error processing YouTube video:', error);
    return {
      success: false,
      error: error.message || 'An unknown error occurred'
    };
  }
};

// Store processed videos in our database
export const storeProcessedVideo = async (videoData: {
  youtubeId: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  channel: string;
  previewUrl?: string;
  publishedAt?: string;
  viewCount?: number;
  likeCount?: number;
  summary?: string;
}): Promise<{ success: boolean; id?: string; error?: any }> => {
  try {
    const { data, error } = await supabase
      .from('short_videos')
      .upsert({
        youtube_id: videoData.youtubeId,
        title: videoData.title,
        description: videoData.description || null,
        thumbnail_url: videoData.thumbnailUrl || null,
        channel: videoData.channel,
        preview_url: videoData.previewUrl || null,
        published_at: videoData.publishedAt || null,
        view_count: videoData.viewCount || null,
        like_count: videoData.likeCount || null,
        summary: videoData.summary || null,
      }, {
        onConflict: 'youtube_id'
      })
      .select('id')
      .single();
    
    if (error) throw error;
    
    return { success: true, id: data?.id };
  } catch (error) {
    console.error('Error storing processed video:', error);
    return { success: false, error };
  }
};
