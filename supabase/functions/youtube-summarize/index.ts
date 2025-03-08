
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
    console.log("Starting YouTube summarize function");
    console.log("API Keys available:", {
      openAI: openAIApiKey ? "Set" : "Not set",
      youtube: youtubeApiKey ? "Set" : "Not set"
    });
    
    if (!openAIApiKey || !youtubeApiKey) {
      throw new Error('API keys are not properly configured');
    }

    const { youtubeUrl } = await req.json();
    console.log("Processing YouTube URL:", youtubeUrl);
    
    // Extract video ID from YouTube URL
    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }
    
    console.log("Extracted video ID:", videoId);

    // Fetch video details from YouTube API
    console.log("Fetching video details from YouTube API...");
    const videoDetails = await fetchYouTubeVideoDetails(videoId);
    console.log("Video details fetched successfully");
    
    // Generate summary using OpenAI
    console.log("Generating summary with OpenAI...");
    const summary = await generateSummaryWithOpenAI(videoDetails);
    console.log("Summary generated successfully");
    
    // Log the processing steps we'd do with Python/FFmpeg
    console.log(`[VideoProcessor] Starting processing for YouTube ID: ${videoId}`);
    console.log(`[VideoProcessor] If this were using Python/FFmpeg, we would:`);
    console.log(`[VideoProcessor] 1. Download the video from YouTube using pytube`);
    console.log(`[VideoProcessor] 2. Extract key frames using FFmpeg scene detection`);
    console.log(`[VideoProcessor] 3. Analyze audio track for important moments`);
    console.log(`[VideoProcessor] 4. Use OpenAI to identify key parts of the video`);
    console.log(`[VideoProcessor] 5. Create a shorter preview using FFmpeg cuts and transitions`);
    console.log(`[VideoProcessor] 6. Generate preview with voiceover or captions`);
    console.log(`[VideoProcessor] 7. Upload final preview to storage bucket`);
    
    // Generate Python-like processing description
    const processingDescription = generateProcessingDescription(videoId, videoDetails);
    
    // Simulate getting videos for feed
    console.log("Fetching trending YouTube shorts...");
    const trendingVideos = await getTrendingYouTubeShorts();
    console.log(`Found ${trendingVideos.length} trending shorts`);
    
    // Return the response
    console.log("Returning successful response");
    return new Response(
      JSON.stringify({
        success: true,
        videoId,
        videoDetails,
        summary,
        processingDescription,
        trendingVideos
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
        error: error.message || 'Unknown error occurred'
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

// Function to generate summary with OpenAI
async function generateSummaryWithOpenAI(videoDetails: any) {
  if (!openAIApiKey) {
    throw new Error('OpenAI API key is not configured');
  }

  const prompt = `
Create a short, engaging summary of this YouTube video. Make it informative and concise in 2-3 sentences.

Title: ${videoDetails.title}
Description: ${videoDetails.description.slice(0, 500)}...
Channel: ${videoDetails.channel}
Duration: ${videoDetails.duration}
Views: ${videoDetails.viewCount}

Summary:`;

  try {
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
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('Failed to generate summary');
    }
    
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating summary with OpenAI:', error);
    throw new Error(`Failed to generate summary: ${error.message}`);
  }
}

// Function to get trending YouTube Shorts
async function getTrendingYouTubeShorts() {
  if (!youtubeApiKey) {
    throw new Error('YouTube API key is not configured');
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=30&q=shorts&type=video&videoDuration=short&order=viewCount&key=${youtubeApiKey}`;
    
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

// Function to generate a Python-like processing description
function generateProcessingDescription(videoId: string, videoDetails: any) {
  return `
# Python-like Pseudocode for Video Processing

import pytube
import ffmpeg
import numpy as np
import whisper
import openai
from moviepy.editor import *
from sklearn.cluster import KMeans

def process_youtube_video(url, video_id="${videoId}"):
    """
    Process a YouTube video to create a trailer-like preview
    """
    print(f"Processing video: {url}")
    
    # Step 1: Download video
    yt = pytube.YouTube(url)
    video_stream = yt.streams.filter(progressive=True, file_extension='mp4').get_highest_resolution()
    video_path = video_stream.download(output_path='./temp', filename=f"{video_id}")
    
    # Step 2: Extract audio
    audio_path = f"./temp/{video_id}_audio.wav"
    ffmpeg.input(video_path).output(audio_path).run()
    
    # Step 3: Transcribe audio
    model = whisper.load_model("base")
    transcription = model.transcribe(audio_path)
    
    # Step 4: Find key moments using GPT
    response = openai.ChatCompletion.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are an assistant that identifies the most engaging moments from video transcripts."},
            {"role": "user", "content": f"Find the 3-5 most engaging moments from this transcript: {transcription['text']}"}
        ]
    )
    key_moments = parse_key_moments(response.choices[0].message['content'])
    
    # Step 5: Extract scenes and detect transitions
    scene_changes = detect_scenes(video_path)
    
    # Step 6: Create the preview
    create_preview(video_path, audio_path, key_moments, scene_changes, f"./output/{video_id}_preview.mp4")
    
    # Step 7: Generate caption and voiceover
    create_voiceover(key_moments, f"./output/{video_id}_voiceover.mp3")
    
    # Step 8: Combine preview with voiceover
    final_preview = combine_video_audio(
        f"./output/{video_id}_preview.mp4",
        f"./output/{video_id}_voiceover.mp3",
        f"./output/{video_id}_final.mp4"
    )
    
    return final_preview

# Helper functions
def detect_scenes(video_path):
    """Use FFmpeg to detect scene changes"""
    # Implementation details...
    return [...]

def create_preview(video_path, audio_path, key_moments, scene_changes, output_path):
    """Create the preview video from key moments"""
    # Implementation details...
    pass

def create_voiceover(key_moments, output_path):
    """Generate a voiceover for the preview"""
    # Implementation details...
    pass

def combine_video_audio(video_path, audio_path, output_path):
    """Combine video and audio into final preview"""
    # Implementation details...
    return output_path

# Execute the processing
final_video = process_youtube_video(f"https://www.youtube.com/watch?v={videoId}")
print(f"Video processing complete: {final_video}")
`;
}
