
// Helper function to extract YouTube video ID from URL
export function extractVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  
  return (match && match[2].length === 11) ? match[2] : null;
}

// Function to fetch video details from YouTube API
export async function fetchYouTubeVideoDetails(videoId: string) {
  const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY');
  
  if (!youtubeApiKey) {
    throw new Error('YouTube API key is not configured');
  }
  
  const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails,statistics&key=${youtubeApiKey}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('YouTube API error:', errorText);
      throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      throw new Error('Video not found');
    }
    
    const video = data.items[0];
    return {
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnailUrl: video.snippet.thumbnails.high.url,
      channel: video.snippet.channelTitle,
      publishedAt: video.snippet.publishedAt,
      duration: video.contentDetails.duration,
      viewCount: video.statistics.viewCount,
      likeCount: video.statistics.likeCount || '0'
    };
  } catch (error) {
    console.error('Error fetching YouTube video details:', error);
    throw new Error(`Failed to fetch video details: ${error.message}`);
  }
}
