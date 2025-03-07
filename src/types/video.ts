
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
}
