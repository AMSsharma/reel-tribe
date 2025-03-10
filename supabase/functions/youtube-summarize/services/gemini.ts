
// Function to generate user interests based on email using Gemini
export async function generateUserInterests(userEmail: string): Promise<string[]> {
  const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
  
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
export async function generateSummaryWithGemini(videoDetails: any) {
  const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
  
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
export async function generateTimestampsWithGemini(videoDetails: any) {
  const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
  
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
