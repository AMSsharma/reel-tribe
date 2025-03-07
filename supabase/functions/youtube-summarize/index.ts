
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { youtubeUrl } = await req.json();
    
    // Extract video ID from YouTube URL
    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    // Fetch video details from YouTube API
    const videoDetails = await fetchYouTubeVideoDetails(videoId);
    
    // Generate summary using OpenAI
    const summary = await generateSummaryWithOpenAI(videoDetails);
    
    // Return the response
    return new Response(
      JSON.stringify({
        success: true,
        videoId,
        videoDetails,
        summary
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});

// Helper function to extract YouTube video ID from URL
function extractVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  
  return (match && match[2].length === 11) ? match[2] : null;
}

// Function to fetch video details from YouTube API
async function fetchYouTubeVideoDetails(videoId: string) {
  const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails,statistics&key=${youtubeApiKey}`;
  
  const response = await fetch(url);
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
    likeCount: video.statistics.likeCount
  };
}

// Function to generate summary with OpenAI
async function generateSummaryWithOpenAI(videoDetails: any) {
  const prompt = `
Create a short, engaging summary of this YouTube video. Make it informative and concise in 2-3 sentences.

Title: ${videoDetails.title}
Description: ${videoDetails.description.slice(0, 500)}...
Channel: ${videoDetails.channel}
Duration: ${videoDetails.duration}
Views: ${videoDetails.viewCount}

Summary:`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that creates concise and engaging video summaries.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 150
    })
  });

  const data = await response.json();
  
  if (!data.choices || data.choices.length === 0) {
    throw new Error('Failed to generate summary');
  }
  
  return data.choices[0].message.content.trim();
}
