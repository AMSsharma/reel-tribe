
import { VideoData, ShortVideo } from '@/types/video';
import { supabase } from '@/integrations/supabase/client';

// Fetch trending videos from YouTube (via our Edge Function) based on user preferences
const fetchTrendingVideos = async (userEmail?: string): Promise<ShortVideo[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('youtube-summarize', {
      body: { 
        youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Any valid URL to trigger the function
        userEmail // Pass the user email to get personalized recommendations
      }
    });
    
    if (error) throw error;
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch trending videos');
    }
    
    // Store the trending videos in our database
    const trendingVideos = data.trendingVideos || [];
    
    for (const video of trendingVideos) {
      await storeProcessedVideo({
        youtubeId: video.id,
        title: video.title,
        description: video.description,
        thumbnailUrl: video.thumbnail_url,
        channel: video.channel,
        publishedAt: video.published_at,
        viewCount: video.view_count,
        likeCount: video.like_count,
        summary: null // We don't have summaries for all trending videos
      });
    }
    
    // Return the trending videos
    return trendingVideos;
  } catch (error) {
    console.error('Error fetching trending videos:', error);
    return [];
  }
};

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

export const getVideoById = async (id: string): Promise<VideoData | null> => {
  try {
    // First check if this is a processed short video from our database
    const { data: shortVideo, error } = await supabase
      .from('short_videos')
      .select('*')
      .eq('id', id)
      .single();
    
    if (shortVideo && !error) {
      return convertShortVideoToVideoData(shortVideo);
    }
    
    console.error('Video not found in database, using mock data');
    // Fall back to mock data if not found in database
    return null;
  } catch (error) {
    console.error('Error fetching video:', error);
    return null;
  }
};

export const getRelatedVideos = async (currentVideoId: string): Promise<VideoData[]> => {
  try {
    // Get short videos from our database
    const { data: shortVideos, error } = await supabase
      .from('short_videos')
      .select('*')
      .limit(10);
    
    if (shortVideos && shortVideos.length > 0 && !error) {
      const videos = shortVideos
        .filter(video => video.id !== currentVideoId)
        .map(convertShortVideoToVideoData);
      
      return videos;
    }
    
    console.error('No related videos found in database');
    return [];
  } catch (error) {
    console.error('Error fetching related videos:', error);
    return [];
  }
};

export const getAllVideos = async (userEmail?: string): Promise<VideoData[]> => {
  try {
    // Try to get videos from database
    const { data: shortVideos, error } = await supabase
      .from('short_videos')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (shortVideos && shortVideos.length > 0 && !error) {
      return shortVideos.map(convertShortVideoToVideoData);
    }
    
    // If no videos in database, fetch personalized trending videos
    const trendingVideos = await fetchTrendingVideos(userEmail);
    
    if (trendingVideos && trendingVideos.length > 0) {
      // Get the stored videos after fetching trends
      const { data: refreshedVideos } = await supabase
        .from('short_videos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
        
      if (refreshedVideos && refreshedVideos.length > 0) {
        return refreshedVideos.map(convertShortVideoToVideoData);
      }
    }
    
    console.error('No videos found in database and failed to fetch trending videos');
    return [];
  } catch (error) {
    console.error('Error fetching all videos:', error);
    return [];
  }
};

// Helper function to convert ShortVideo from Supabase to VideoData format
const convertShortVideoToVideoData = (shortVideo: ShortVideo): VideoData => {
  return {
    id: shortVideo.id,
    title: shortVideo.title,
    creator: {
      id: `creator-${shortVideo.youtube_id}`,
      name: shortVideo.channel,
      avatar: `https://i.pravatar.cc/150?u=${shortVideo.youtube_id}`,
    },
    videoUrl: shortVideo.preview_url || `https://www.youtube.com/embed/${shortVideo.youtube_id}`,
    thumbnailUrl: shortVideo.thumbnail_url || 'https://i.imgur.com/A8eQsll.jpg',
    youtubeUrl: `https://www.youtube.com/watch?v=${shortVideo.youtube_id}`,
    description: shortVideo.description || undefined,
    youtubeId: shortVideo.youtube_id,
    viewCount: shortVideo.view_count || undefined,
    likeCount: shortVideo.like_count || undefined,
    publishedAt: shortVideo.published_at || undefined,
    summary: shortVideo.summary || undefined,
  };
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
