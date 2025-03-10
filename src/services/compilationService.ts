
import { VideoCompilation } from '@/types/video';
import { supabase } from '@/integrations/supabase/client';

// Generate a compilation of top trending videos
export const generateVideoCompilation = async (userEmail?: string): Promise<{
  success: boolean;
  compilationId?: string;
  error?: string;
}> => {
  try {
    const { data, error } = await supabase.functions.invoke('youtube-summarize', {
      body: { 
        generateCompilation: true,
        userEmail // Pass the user email to get personalized recommendations
      }
    });
    
    if (error) throw error;
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to generate video compilation');
    }
    
    // Store the compilation request in our database
    const { data: compilationData, error: insertError } = await supabase
      .from('video_compilations')
      .insert({
        title: "Trending Videos Compilation",
        status: "processing",
        instructions: data.compilationInstructions
      })
      .select('id')
      .single();
      
    if (insertError) throw insertError;
    
    return {
      success: true,
      compilationId: compilationData.id
    };
  } catch (error) {
    console.error('Error generating video compilation:', error);
    return {
      success: false,
      error: error.message || 'An unknown error occurred'
    };
  }
};

// Check the status of a video compilation
export const getCompilationStatus = async (compilationId: string): Promise<{
  status: string;
  videoUrl?: string;
  error?: string;
}> => {
  try {
    const { data, error } = await supabase
      .from('video_compilations')
      .select('*')
      .eq('id', compilationId)
      .single();
      
    if (error) throw error;
    
    return {
      status: data.status,
      videoUrl: data.video_url
    };
  } catch (error) {
    console.error('Error checking compilation status:', error);
    return {
      status: 'error',
      error: error.message || 'An unknown error occurred'
    };
  }
};
