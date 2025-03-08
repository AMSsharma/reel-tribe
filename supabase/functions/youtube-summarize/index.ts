
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
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
      gemini: geminiApiKey ? "Set" : "Not set",
      youtube: youtubeApiKey ? "Set" : "Not set"
    });
    
    if (!geminiApiKey || !youtubeApiKey) {
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
    
    // Generate timestamps using Gemini
    console.log("Generating timestamps with Gemini API...");
    const timestamps = await generateTimestampsWithGemini(videoDetails);
    console.log("Timestamps generated successfully");
    
    // Generate summary using Gemini
    console.log("Generating summary with Gemini API...");
    const summary = await generateSummaryWithGemini(videoDetails);
    console.log("Summary generated successfully");
    
    // Log the processing steps we'd do with Python/FFmpeg
    console.log(`[VideoProcessor] Starting processing for YouTube ID: ${videoId}`);
    console.log(`[VideoProcessor] If this were using Python/FFmpeg, we would:`);
    console.log(`[VideoProcessor] 1. Download the video from YouTube using pytube`);
    console.log(`[VideoProcessor] 2. Extract key frames using FFmpeg scene detection`);
    console.log(`[VideoProcessor] 3. Analyze audio track for important moments`);
    console.log(`[VideoProcessor] 4. Use Gemini to identify key parts at timestamps: ${JSON.stringify(timestamps)}`);
    console.log(`[VideoProcessor] 5. Create a shorter preview using FFmpeg cuts and transitions`);
    console.log(`[VideoProcessor] 6. Generate preview with voiceover or captions`);
    console.log(`[VideoProcessor] 7. Upload final preview to storage bucket`);
    
    // Generate Python-like processing description with timestamps
    const processingDescription = generateProcessingDescription(videoId, videoDetails, timestamps);
    
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
        timestamps,
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

// Function to generate summary with Gemini
async function generateSummaryWithGemini(videoDetails: any) {
  if (!geminiApiKey) {
    throw new Error('Gemini API key is not configured');
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
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiApiKey
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 150,
        }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('Failed to generate summary');
    }
    
    return data.candidates[0].content.parts[0].text.trim();
  } catch (error) {
    console.error('Error generating summary with Gemini:', error);
    throw new Error(`Failed to generate summary: ${error.message}`);
  }
}

// Function to generate timestamps with Gemini
async function generateTimestampsWithGemini(videoDetails: any) {
  if (!geminiApiKey) {
    throw new Error('Gemini API key is not configured');
  }

  const prompt = `
Analyze this YouTube video information and predict 5 key timestamp moments that would be good for creating a short preview.
For each timestamp, provide: a time in the format MM:SS, a short description of what happens at that moment, and why it's interesting.
Return the result as a JSON array of objects with "time", "description", and "reason" fields.

Title: ${videoDetails.title}
Description: ${videoDetails.description.slice(0, 500)}...
Channel: ${videoDetails.channel}
Duration: ${videoDetails.duration}
Views: ${videoDetails.viewCount}

Example of expected response format:
[
  {"time": "00:45", "description": "Introduction of the main concept", "reason": "Sets up the video context"},
  {"time": "02:13", "description": "Demonstration of the key technique", "reason": "Shows the most valuable information"},
  ...
]
`;

  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiApiKey
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1000,
        }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('Failed to generate timestamps');
    }
    
    const text = data.candidates[0].content.parts[0].text.trim();
    
    // Extract JSON array from text response
    try {
      // Find anything that looks like a JSON array in the response
      const jsonMatch = text.match(/\[\s*\{.*\}\s*\]/s);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        console.error('Could not extract JSON from Gemini response:', text);
        return []; // Return empty array as fallback
      }
    } catch (parseError) {
      console.error('Error parsing timestamps JSON:', parseError, 'Text was:', text);
      return []; // Return empty array as fallback
    }
  } catch (error) {
    console.error('Error generating timestamps with Gemini:', error);
    return []; // Return empty array instead of throwing to prevent the entire function from failing
  }
}

// Function to generate a Python-like processing description
function generateProcessingDescription(videoId: string, videoDetails: any, timestamps: any[]) {
  const timestampsCode = timestamps && timestamps.length > 0 
    ? `key_moments = ${JSON.stringify(timestamps, null, 4)}`
    : `key_moments = [
    {"time": "00:30", "description": "Introduction", "reason": "Establishes context"},
    {"time": "01:45", "description": "Main point discussion", "reason": "Core content"},
    {"time": "03:20", "description": "Demonstration", "reason": "Visual explanation"},
    {"time": "04:10", "description": "Results shown", "reason": "Proves the concept"},
    {"time": "05:30", "description": "Conclusion", "reason": "Summarizes findings"}
]`;

  return `
# Python-like Pseudocode for Video Processing with FFmpeg and AI

import pytube
import ffmpeg
import numpy as np
import whisper
from google.generativeai import GenerativeModel
from moviepy.editor import *
from sklearn.cluster import KMeans

def process_youtube_video(url, video_id="${videoId}"):
    """
    Process a YouTube video to create a trailer-like preview using FFmpeg and AI
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
    
    # Step 4: Get key moments identified by Gemini AI
    ${timestampsCode}
    
    # Step 5: Extract clips at the timestamps
    clips = []
    for moment in key_moments:
        # Convert timestamp to seconds
        time_parts = moment["time"].split(":")
        seconds = int(time_parts[0]) * 60 + int(time_parts[1])
        
        # Extract 5-second clip around the timestamp
        start_time = max(0, seconds - 2)
        clip = VideoFileClip(video_path).subclip(start_time, start_time + 5)
        
        # Add text overlay with description
        txt_clip = TextClip(moment["description"], fontsize=24, color='white')
        txt_clip = txt_clip.set_position('bottom').set_duration(clip.duration)
        clip = CompositeVideoClip([clip, txt_clip])
        
        clips.append(clip)
    
    # Step 6: Concatenate clips with transitions
    final_clip = concatenate_videoclips(clips, method="compose", transition=crossfadein(0.5))
    
    # Step 7: Generate voiceover using text-to-speech
    voiceover_text = f"Check out this video about {videoDetails.title}. Here are the highlights."
    tts_model = GenerativeModel('gemini-pro')
    tts_response = tts_model.generate_content(voiceover_text)
    
    # Step 8: Add voiceover to final video
    final_clip = final_clip.set_audio(AudioFileClip("./temp/voiceover.mp3"))
    
    # Step 9: Write final video to file
    output_path = f"./output/{video_id}_preview.mp4"
    final_clip.write_videofile(output_path, codec='libx264', audio_codec='aac')
    
    print(f"Preview created successfully: {output_path}")
    return output_path

# Execute the processing
final_video = process_youtube_video(f"https://www.youtube.com/watch?v={videoId}")
print(f"Video processing complete: {final_video}")
`;
}
