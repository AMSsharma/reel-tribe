
import { VideoData, ShortVideo } from '@/types/video';
import { supabase } from '@/integrations/supabase/client';
import { convertShortVideoToVideoData } from '@/utils/videoConverter';

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

export { storeProcessedVideo } from './videoProcessingService';
