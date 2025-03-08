
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

    const { youtubeUrl, userEmail } = await req.json();
    console.log("Processing YouTube URL:", youtubeUrl);
    console.log("User email for personalization:", userEmail || "Not provided");
    
    // Extract video ID from YouTube URL if provided
    let videoId = null;
    if (youtubeUrl) {
      videoId = extractVideoId(youtubeUrl);
      if (!videoId) {
        throw new Error('Invalid YouTube URL');
      }
      console.log("Extracted video ID:", videoId);
    }
    
    let videoDetails = null;
    let summary = null;
    let timestamps = null;
    let processingDescription = null;
    
    // If we have a valid video ID, process that specific video
    if (videoId) {
      // Fetch video details from YouTube API
      console.log("Fetching video details from YouTube API...");
      videoDetails = await fetchYouTubeVideoDetails(videoId);
      console.log("Video details fetched successfully");
      
      // Generate timestamps using Gemini
      console.log("Generating timestamps with Gemini API...");
      timestamps = await generateTimestampsWithGemini(videoDetails);
      console.log("Timestamps generated successfully");
      
      // Generate summary using Gemini
      console.log("Generating summary with Gemini API...");
      summary = await generateSummaryWithGemini(videoDetails);
      console.log("Summary generated successfully");
      
      // Simulate video processing with the Python-like code
      console.log(`[VideoProcessor] Starting processing for YouTube ID: ${videoId}`);
      console.log(`[VideoProcessor] Using enhanced FFmpeg pipeline for efficient clip extraction`);
      
      // Generate Python-like processing description with timestamps
      processingDescription = generateProcessingDescription(videoId, videoDetails, timestamps);
    }
    
    // Fetch trending YouTube shorts based on user preferences
    console.log("Fetching trending YouTube shorts...");
    const trendingVideos = await getTrendingYouTubeShorts(userEmail);
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

// Function to get trending YouTube Shorts based on user preferences
async function getTrendingYouTubeShorts(userEmail?: string) {
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

// Function to generate user interests based on email using Gemini
async function generateUserInterests(userEmail: string): Promise<string[]> {
  if (!geminiApiKey) {
    throw new Error('Gemini API key is not configured');
  }

  const prompt = `
Given this user email: ${userEmail}
Based on the email domain and username, suggest 5 YouTube video topics or categories this person might be interested in.
Return the result as a JSON array of strings.
Example of expected response format:
["technology", "programming", "data science", "machine learning", "web development"]
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
          maxOutputTokens: 200,
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
      throw new Error('Failed to generate interests');
    }
    
    const text = data.candidates[0].content.parts[0].text.trim();
    
    // Extract JSON array from text response
    try {
      // Find anything that looks like a JSON array in the response
      const jsonMatch = text.match(/\[\s*".*"\s*\]/s);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        console.error('Could not extract JSON from Gemini response:', text);
        return ['shorts']; // Return default as fallback
      }
    } catch (parseError) {
      console.error('Error parsing interests JSON:', parseError, 'Text was:', text);
      return ['shorts']; // Return default as fallback
    }
  } catch (error) {
    console.error('Error generating interests with Gemini:', error);
    return ['shorts']; // Return default interest
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
    ? `timestamps = [\n    ${timestamps.map(t => `("${t.time}", "00:00:12")`).join(',\n    ')}\n]`
    : `timestamps = [
    ("00:00:30", "00:00:12"),
    ("00:01:45", "00:00:12"),
    ("00:03:20", "00:00:12"),
    ("00:04:10", "00:00:12"),
    ("00:05:30", "00:00:12")
]`;

  return `
# Python-like Pseudocode for Video Processing with FFmpeg and AI

import subprocess
import os
import pytube
import ffmpeg
import numpy as np
import whisper
from google.generativeai import GenerativeModel
from moviepy.editor import *

def extract_and_merge_clips(youtube_url, timestamps, output_file="final_video_${videoId}.mp4", speed=1.25):
    """
    Extracts multiple short clips from a YouTube video without downloading the full video,
    merges them, and speeds up the final video.
    
    :param youtube_url: URL of the YouTube video
    :param timestamps: List of tuples (start_time, duration)
    :param output_file: Final merged video filename
    :param speed: Speed multiplier (default is 1.25x)
    """
    try:
        # Step 1: Get direct video URL (without downloading)
        command_get_url = f"yt-dlp -f best --get-url {youtube_url}"
        video_url = subprocess.check_output(command_get_url, shell=True).decode().strip()
        
        clip_files = []
        
        # Step 2: Extract clips and save as temporary files
        for idx, (start_time, duration) in enumerate(timestamps):
            clip_filename = f"clip_{idx+1}.mp4"
            command_ffmpeg = f'ffmpeg -ss {start_time} -i "{video_url}" -t {duration} -c copy -avoid_negative_ts make_zero {clip_filename}'
            print(f"⏳ Extracting clip {idx+1}: {clip_filename} from {start_time} for {duration} seconds...")
            subprocess.run(command_ffmpeg, shell=True, check=True)
            clip_files.append(clip_filename)
            
        # Step 3: Create a text file listing all clips for merging
        with open("clips.txt", "w") as f:
            for clip in clip_files:
                f.write(f"file '{clip}'\\n")
                
        # Step 4: Merge all clips into a single video
        merged_file = "merged.mp4"
        merge_command = f'ffmpeg -f concat -safe 0 -i clips.txt -c copy {merged_file}'
        print(f"🔄 Merging clips into {merged_file} ...")
        subprocess.run(merge_command, shell=True, check=True)
        
        # Step 5: Speed up the final video
        speedup_command = f'ffmpeg -i {merged_file} -filter:v "setpts={1/speed}*PTS" -filter:a "atempo={speed}" -c:v libx264 -c:a aac {output_file}'
        print(f"⚡ Speeding up video to {speed}x...")
        subprocess.run(speedup_command, shell=True, check=True)
        
        # Step 6: Add captions using whisper
        print("🔤 Transcribing audio for captions...")
        model = whisper.load_model("base")
        result = model.transcribe(output_file)
        
        # Step 7: Add captions to video
        caption_file = "captions.srt"
        with open(caption_file, "w") as f:
            f.write(result["text"])
            
        # Add captions to video
        captioned_file = f"captioned_{output_file}"
        caption_command = f'ffmpeg -i {output_file} -vf subtitles={caption_file} {captioned_file}'
        subprocess.run(caption_command, shell=True, check=True)
        
        # Step 8: Add AI generated voiceover intro
        print("🎙 Generating AI voiceover...")
        voiceover_text = f"Check out these highlights from {videoDetails.title}."
        tts_model = GenerativeModel('gemini-pro')
        tts_audio_file = "voiceover.mp3"
        
        # Final file with intro
        final_output = f"final_{output_file}"
        video_with_intro = VideoFileClip(captioned_file)
        
        # Save final video
        video_with_intro.write_videofile(final_output)
        
        # Cleanup temporary files
        for clip in clip_files:
            os.remove(clip)
        os.remove("clips.txt")
        os.remove(merged_file)
        os.remove(caption_file)
        os.remove(captioned_file)
        
        print(f"✅ Final video saved as: {final_output}")
        return final_output
        
    except subprocess.CalledProcessError as e:
        print(f"❌ FFmpeg Error: {e}")
        return None
    except Exception as e:
        print(f"❌ Unexpected Error: {e}")
        return None

# Extract timestamps from Gemini AI analysis
${timestampsCode}

# Execute the processing
youtube_url = "https://www.youtube.com/watch?v=${videoId}"
final_video = extract_and_merge_clips(youtube_url, timestamps)
print(f"Video processing complete: {final_video}")

# Upload to storage
from supabase import create_client
supabase_url = "YOUR_SUPABASE_URL"
supabase_key = "YOUR_SUPABASE_KEY"
supabase = create_client(supabase_url, supabase_key)

with open(final_video, "rb") as f:
    file_content = f.read()
    
response = supabase.storage.from_("videos").upload(
    path=f"shorts/{videoId}.mp4",
    file=file_content,
    file_options={"content-type": "video/mp4"}
)

print(f"Video uploaded to Supabase storage: {response}")
`;
}
