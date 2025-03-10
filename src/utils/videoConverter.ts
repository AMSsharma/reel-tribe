
import { VideoData, ShortVideo } from '@/types/video';

// Helper function to convert ShortVideo from Supabase to VideoData format
export const convertShortVideoToVideoData = (shortVideo: ShortVideo): VideoData => {
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
