
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { corsHeaders } from "./utils/cors.ts";
import { extractVideoId, fetchYouTubeVideoDetails } from "./services/youtube.ts";
import { 
  generateSummaryWithGemini, 
  generateTimestampsWithGemini, 
  generateUserInterests 
} from "./services/gemini.ts";
import { 
  generateProcessingInstructions,
  generateCompilationInstructions 
} from "./services/videoProcessing.ts";
import { getTrendingYouTubeShorts } from "./services/trending.ts";

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY');

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

    const requestData = await req.json();
    const { youtubeUrl, userEmail, generateCompilation } = requestData;
    
    console.log("Processing YouTube URL:", youtubeUrl || "Not provided");
    console.log("User email for personalization:", userEmail || "Not provided");
    console.log("Generate compilation:", generateCompilation ? "Yes" : "No");
    
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
    let processingInstructions = null;
    
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
      
      // Generate processing instructions for video editing
      processingInstructions = generateProcessingInstructions(videoId, videoDetails, timestamps);
    }
    
    // Fetch trending YouTube shorts based on user preferences
    console.log("Fetching trending YouTube shorts...");
    const trendingVideos = await getTrendingYouTubeShorts(userEmail);
    console.log(`Found ${trendingVideos.length} trending shorts`);
    
    // If requested to generate a compilation
    let compilationInstructions = null;
    if (generateCompilation) {
      console.log("Generating compilation instructions...");
      compilationInstructions = await generateCompilationInstructions(trendingVideos);
      console.log("Compilation instructions generated successfully");
    }
    
    // Return the response
    console.log("Returning successful response");
    return new Response(
      JSON.stringify({
        success: true,
        videoId,
        videoDetails,
        summary,
        timestamps,
        processingInstructions,
        trendingVideos,
        compilationInstructions
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
