
// Function to generate processing instructions for a cloud-based video editing service
export function generateProcessingInstructions(videoId: string, videoDetails: any, timestamps: any[]) {
  // Create a JSON structure with the processing instructions
  const timestampEntries = timestamps && timestamps.length > 0 
    ? timestamps.map(t => ({
        startTime: t.time,
        duration: "00:00:12",
        description: t.description
      }))
    : [
        { startTime: "00:00:30", duration: "00:00:12", description: "Intro segment" },
        { startTime: "00:01:45", duration: "00:00:12", description: "Key point 1" },
        { startTime: "00:03:20", duration: "00:00:12", description: "Key point 2" },
        { startTime: "00:04:10", duration: "00:00:12", description: "Key point 3" },
        { startTime: "00:05:30", duration: "00:00:12", description: "Conclusion" }
      ];

  return {
    videoId: videoId,
    videoTitle: videoDetails.title,
    videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
    outputFormat: "mp4",
    clipSpeed: 1.25,
    addCaptions: true,
    segments: timestampEntries,
    processingSteps: [
      "Extract the specified segments from the YouTube video",
      "Apply caption generation to each segment",
      "Merge the segments into a coherent preview",
      "Speed up the final video to 1.25x",
      "Add an AI-generated intro voiceover",
      "Apply engagement-optimized transitions between segments"
    ],
    processingCode: `
# This is the Python code that would run on a Django backend with FFmpeg
# This is for reference only and shows how the processing would work

import subprocess
import os
from moviepy.editor import *

def extract_and_merge_clips(youtube_url, timestamps, output_file="final_video_${videoId}.mp4", speed=1.25):
    """
    Extracts multiple short clips from a YouTube video without downloading the full video,
    merges them, and speeds up the final video.
    """
    # Step 1: Download video segments using yt-dlp
    clips = []
    for i, segment in enumerate(timestamps):
        start_time = segment['startTime']
        duration = segment['duration']
        output_segment = f"segment_{i+1}.mp4"
        
        # Convert MM:SS to seconds for yt-dlp
        start_seconds = sum(int(x) * 60 ** i for i, x in enumerate(reversed(start_time.split(':'))))
        duration_seconds = sum(int(x) * 60 ** i for i, x in enumerate(reversed(duration.split(':'))))
        
        # Download the segment
        download_cmd = [
            'yt-dlp', 
            '-f', 'best', 
            '--external-downloader', 'ffmpeg',
            '--external-downloader-args', f'ffmpeg:-ss {start_seconds} -t {duration_seconds}',
            '-o', output_segment,
            youtube_url
        ]
        subprocess.run(download_cmd, check=True)
        clips.append(VideoFileClip(output_segment))
    
    # Step 2: Concatenate clips
    final_clip = concatenate_videoclips(clips)
    
    # Step 3: Speed up the video
    final_clip = final_clip.speedx(speed)
    
    # Step 4: Add captions using external service or library
    # (In a real implementation, this would use a speech recognition service)
    
    # Step 5: Save the final video
    final_clip.write_videofile(output_file, codec='libx264')
    
    # Clean up temporary files
    for i in range(len(timestamps)):
        os.remove(f"segment_{i+1}.mp4")
    
    return output_file

# Example usage:
timestamps = ${JSON.stringify(timestampEntries)}
youtube_url = "${videoDetails.videoUrl || `https://www.youtube.com/watch?v=${videoId}`}"
extract_and_merge_clips(youtube_url, timestamps)
`
  };
}

// New function to generate compilation instructions for multiple videos
export async function generateCompilationInstructions(trendingVideos: any[]) {
  // Select top 10 videos with highest view counts
  const topVideos = trendingVideos
    .sort((a, b) => b.view_count - a.view_count)
    .slice(0, 10);
  
  console.log(`Selected top ${topVideos.length} videos for compilation`);
  
  // For each video, generate timestamps
  const videosWithTimestamps = [];
  
  for (const video of topVideos) {
    try {
      console.log(`Generating timestamps for video ${video.id}: ${video.title}`);
      const videoDetails = {
        id: video.id,
        title: video.title,
        description: video.description,
        thumbnailUrl: video.thumbnail_url,
        channel: video.channel,
        viewCount: video.view_count.toString(),
        likeCount: video.like_count.toString(),
        duration: "PT5M" // Placeholder duration
      };
      
      // Get timestamps for this video
      const timestamps = await generateTimestampsWithGemini(videoDetails);
      
      if (timestamps && timestamps.length > 0) {
        // Add only the best 1-2 timestamps per video
        const bestTimestamps = timestamps.slice(0, Math.min(2, timestamps.length));
        
        videosWithTimestamps.push({
          youtube_id: video.id,
          title: video.title,
          channel: video.channel,
          timestamps: bestTimestamps
        });
        
        console.log(`Added ${bestTimestamps.length} timestamps for video ${video.id}`);
      }
    } catch (error) {
      console.error(`Error processing video ${video.id}:`, error);
      // Continue with other videos even if one fails
    }
  }
  
  // Create compilation instructions
  return {
    title: "Trending Videos Compilation",
    videos: videosWithTimestamps,
    targetDuration: 60, // 1 minute target duration
    processingSteps: [
      "Extract the specified segments from each YouTube video",
      "Add a short intro voice clip before each video segment",
      "Apply caption generation to all segments",
      "Speed up segments to fit within the target duration",
      "Add transitions between segments",
      "Add background music (optional)"
    ],
    ffmpegInstructions: `
# This is the Python pseudo-code that would run on the backend server
# This is for reference only

import subprocess
import os
from moviepy.editor import *
from gtts import gTTS

def create_compilation(videos_with_timestamps, output_file="trending_compilation.mp4"):
    """
    Creates a compilation of trending YouTube video highlights
    """
    all_clips = []
    
    for video in videos_with_timestamps:
        youtube_id = video['youtube_id']
        title = video['title']
        timestamps = video['timestamps']
        
        # Generate intro voice clip
        intro_text = f"From {title}"
        intro_audio = gTTS(text=intro_text, lang='en')
        intro_audio_file = f"intro_{youtube_id}.mp3"
        intro_audio.save(intro_audio_file)
        
        # Process each timestamp
        for timestamp in timestamps:
            clip_file = f"clip_{youtube_id}_{timestamp['time'].replace(':', '_')}.mp4"
            
            # Download clip at timestamp
            youtube_url = f"https://www.youtube.com/watch?v={youtube_id}"
            start_time = timestamp['time']
            download_cmd = [
                'yt-dlp', 
                '-f', 'best[height<=720]', 
                '--external-downloader', 'ffmpeg',
                '--external-downloader-args', f'ffmpeg:-ss {start_time} -t 10',
                '-o', clip_file,
                youtube_url
            ]
            subprocess.run(download_cmd, check=True)
            
            # Create clip with intro
            video_clip = VideoFileClip(clip_file)
            intro_audio_clip = AudioFileClip(intro_audio_file)
            
            # Add text overlay with timestamp description
            txt_clip = TextClip(
                timestamp['description'], 
                fontsize=24, color='white',
                bg_color='rgba(0,0,0,0.5)',
                size=video_clip.size
            )
            txt_clip = txt_clip.set_position(('center', 'bottom')).set_duration(video_clip.duration)
            
            # Composite the video
            final_clip = CompositeVideoClip([video_clip, txt_clip])
            
            # Add intro audio at the beginning
            final_clip = final_clip.set_audio(
                CompositeAudioClip([
                    intro_audio_clip.set_start(0),
                    video_clip.audio.set_start(intro_audio_clip.duration)
                ])
            )
            
            all_clips.append(final_clip)
    
    # Concatenate all clips
    final_compilation = concatenate_videoclips(all_clips, method="compose")
    
    # Add fade transitions between clips
    # This would require more complex MoviePy code
    
    # Speed up if necessary to meet target duration
    if final_compilation.duration > 60:
        speed_factor = final_compilation.duration / 60
        final_compilation = final_compilation.speedx(speed_factor)
    
    # Write final video
    final_compilation.write_videofile(output_file, codec='libx264')
    
    # Clean up temporary files
    for clip in all_clips:
        clip.close()
    
    return output_file
`
  };
}
