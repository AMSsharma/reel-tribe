
import { generateUserInterests } from "./gemini.ts";

// Function to get trending YouTube Shorts based on user preferences
export async function getTrendingYouTubeShorts(userEmail?: string) {
  const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY');
  
  if (!youtubeApiKey) {
    throw new Error('YouTube API key is not configured');
  }

  try {
    // Generate search query based on user email if available
    let searchQuery = 'shorts';
    
    if (userEmail) {
      console.log(`Personalizing recommendations for ${userEmail}`);
      
      // Extract domain from email to get potential interests
      const domain = userEmail.split('@')[1];
      
      // Use Gemini to generate personalized interest categories
      const interests = await generateUserInterests(userEmail);
      
      if (interests && interests.length > 0) {
        // Use the first interest to personalize search
        searchQuery = `shorts ${interests[0]}`;
        console.log(`Using personalized search query: ${searchQuery}`);
      }
    }

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=30&q=${encodeURIComponent(searchQuery)}&type=video&videoDuration=short&order=viewCount&key=${youtubeApiKey}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('YouTube API error when fetching trending shorts:', errorText);
      throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      throw new Error('No trending shorts found');
    }
    
    const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
    
    // Get more details for these videos
    const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoIds}&part=snippet,contentDetails,statistics&key=${youtubeApiKey}`;
    const detailsResponse = await fetch(detailsUrl);
    
    if (!detailsResponse.ok) {
      const errorText = await detailsResponse.text();
      console.error('YouTube API error when fetching video details:', errorText);
      throw new Error(`YouTube API error: ${detailsResponse.status} ${detailsResponse.statusText}`);
    }
    
    const detailsData = await detailsResponse.json();
    
    if (!detailsData.items) {
      throw new Error('Could not fetch video details');
    }
    
    // Format the response in our expected structure
    return detailsData.items.map((video: any) => ({
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnail_url: video.snippet.thumbnails.high.url,
      channel: video.snippet.channelTitle,
      published_at: video.snippet.publishedAt,
      view_count: parseInt(video.statistics.viewCount || '0'),
      like_count: parseInt(video.statistics.likeCount || '0'),
      youtube_id: video.id
    }));
  } catch (error) {
    console.error('Error fetching trending shorts:', error);
    // Return empty array instead of throwing to prevent the entire function from failing
    return [];
  }
}
