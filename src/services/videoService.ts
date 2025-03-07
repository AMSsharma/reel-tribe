
import { VideoData } from '@/types/video';

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

export const getVideoById = (id: string): Promise<VideoData | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const video = MOCK_VIDEOS.find(v => v.id === id) || null;
      resolve(video);
    }, 500);
  });
};

export const getRelatedVideos = (currentVideoId: string): Promise<VideoData[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const videos = MOCK_VIDEOS.filter(v => v.id !== currentVideoId);
      resolve(videos);
    }, 500);
  });
};
