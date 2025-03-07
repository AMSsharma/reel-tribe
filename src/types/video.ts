
export interface Creator {
  id: string;
  name: string;
  avatar: string;
}

export interface VideoData {
  id: string;
  title: string;
  creator: Creator;
  videoUrl: string;
  thumbnailUrl: string;
  youtubeUrl: string;
  description?: string;
  youtubeId?: string;
  viewCount?: number;
  likeCount?: number;
  publishedAt?: string;
  summary?: string;
}

export interface ShortVideo {
  id: string;
  youtube_id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  channel: string;
  preview_url: string | null;
  published_at: string | null;
  view_count: number | null;
  like_count: number | null;
  summary: string | null;
  created_at: string;
  updated_at: string;
}
