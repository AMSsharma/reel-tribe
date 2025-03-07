
import { VideoData, ShortVideo } from '@/types/video';
import { supabase } from '@/integrations/supabase/client';

// Mock data (in a real app, this would come from an API)
const MOCK_VIDEOS: VideoData[] = [
  {
    id: '1',
    title: 'How to Master Swift in 10 Minutes',
    creator: {
      id: 'creator1',
      name: 'TechMaster',
      avatar: 'https://i.pravatar.cc/150?img=1',
    },
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-typing-on-a-laptop-in-a-cafe-38958-large.mp4',
    thumbnailUrl: 'https://i.imgur.com/A8eQsll.jpg',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    description: 'Learn the basics of Swift programming in this quick tutorial. We cover the fundamentals like variables, functions, and control flow. Perfect for beginners who want to get started with iOS development.',
  },
  {
    id: '2',
    title: 'Building a Modern Website with Tailwind CSS',
    creator: {
      id: 'creator2',
      name: 'CodeArtist',
      avatar: 'https://i.pravatar.cc/150?img=2',
    },
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-working-on-her-laptop-at-home-4806-large.mp4',
    thumbnailUrl: 'https://i.imgur.com/JjkZMYR.jpg',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    description: 'Discover how to use Tailwind CSS to build beautiful, responsive websites quickly. This tutorial covers setup, basic utilities, responsive design, and advanced customization.',
  },
  {
    id: '3',
    title: 'The Future of AI in 2023',
    creator: {
      id: 'creator3',
      name: 'FutureTech',
      avatar: 'https://i.pravatar.cc/150?img=3',
    },
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-in-a-suit-working-on-a-financial-analysis-29910-large.mp4',
    thumbnailUrl: 'https://i.imgur.com/HVaYXQF.jpg',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    description: 'An overview of what to expect from artificial intelligence advancements in 2023. We discuss breakthroughs in natural language processing, computer vision, and generative AI.',
  },
  {
    id: '4',
    title: 'Mastering React Hooks',
    creator: {
      id: 'creator4',
      name: 'ReactMaster',
      avatar: 'https://i.pravatar.cc/150?img=4',
    },
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-working-on-her-laptop-4847-large.mp4',
    thumbnailUrl: 'https://i.imgur.com/JmA9vXs.jpg',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    description: 'Learn how to effectively use React Hooks in your projects. This tutorial covers useState, useEffect, useContext, useRef, and custom hooks.',
  },
];

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
    
    // Fall back to mock data if not found in database
    const video = MOCK_VIDEOS.find(v => v.id === id) || null;
    return video;
  } catch (error) {
    console.error('Error fetching video:', error);
    // Fall back to mock data
    const video = MOCK_VIDEOS.find(v => v.id === id) || null;
    return video;
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
      
      // If we have less than 3 videos, add some mock data
      if (videos.length < 3) {
        const mockVideos = MOCK_VIDEOS.filter(v => v.id !== currentVideoId);
        return [...videos, ...mockVideos].slice(0, 5);
      }
      
      return videos;
    }
    
    // Fall back to mock data
    const videos = MOCK_VIDEOS.filter(v => v.id !== currentVideoId);
    return videos;
  } catch (error) {
    console.error('Error fetching related videos:', error);
    // Fall back to mock data
    const videos = MOCK_VIDEOS.filter(v => v.id !== currentVideoId);
    return videos;
  }
};

export const getAllVideos = async (): Promise<VideoData[]> => {
  try {
    // Get short videos from our database
    const { data: shortVideos, error } = await supabase
      .from('short_videos')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (shortVideos && shortVideos.length > 0 && !error) {
      const videos = shortVideos.map(convertShortVideoToVideoData);
      
      // If we have less than 5 videos, add some mock data
      if (videos.length < 5) {
        return [...videos, ...MOCK_VIDEOS].slice(0, MOCK_VIDEOS.length + videos.length);
      }
      
      return videos;
    }
    
    // Fall back to mock data
    return MOCK_VIDEOS;
  } catch (error) {
    console.error('Error fetching all videos:', error);
    // Fall back to mock data
    return MOCK_VIDEOS;
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
