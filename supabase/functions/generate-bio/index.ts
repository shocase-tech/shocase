import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const requestBody = await req.json();
    console.log('Received request body:', JSON.stringify(requestBody, null, 2));
    
    const { 
      artist_name, 
      genre, 
      influences, 
      location, 
      vibe, 
      existing_bio, 
      is_remix, 
      notable_performances, 
      musical_background 
    } = requestBody;
    
    // Validate required fields
    if (!artist_name?.trim()) {
      throw new Error('Artist name is required');
    }
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OpenAI API key not found in environment');
      throw new Error('OpenAI API key not configured');
    }

    let prompt;
    
    if (is_remix && existing_bio) {
      prompt = `Remix and improve this existing artist bio for ${artist_name}:

"${existing_bio}"

Rework it using these style guidelines:
- Genre: ${genre || 'Not specified'}
- Influences: ${influences || 'Not specified'}
- Location: ${location || 'Not specified'}
- Writing Style: ${vibe || 'Not specified'}
- Notable Performances: ${notable_performances || 'Not specified'}
- Musical Background: ${musical_background || 'Not specified'}

Keep the core information but improve the writing, flow, and style. Make it more engaging while maintaining authenticity. Keep it 150-200 words and written in third person.`;
    } else {
      prompt = `Write a compelling, professional artist bio for ${artist_name}, a ${genre || 'music'} artist${location ? ` based in ${location}` : ''}. 

Context:
- Genre: ${genre || 'Not specified'}
- Influences: ${influences || 'Not specified'}
- Location: ${location || 'Not specified'}
- Writing Style: ${vibe || 'Not specified'}
- Notable Performances: ${notable_performances || 'Not specified'}
- Musical Background: ${musical_background || 'Not specified'}

The bio should be:
- 150-200 words long
- Professional yet engaging
- Include their musical style and influences if provided
- Incorporate notable performances and musical background to establish credibility
- Highlight what makes them unique
- Suitable for press kits and promotional materials
- Written in third person

Do not include placeholders or make up specific achievements, releases, or dates.`;
    }

    console.log('Generating bio for:', artist_name);
    console.log('Using prompt:', prompt);

    // Retry logic for rate limiting
    let lastError;
    const maxRetries = 3;
    const baseDelay = 1000; // 1 second

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 1) {
          // Exponential backoff: 1s, 2s, 4s
          const delay = baseDelay * Math.pow(2, attempt - 1);
          console.log(`Attempt ${attempt}/${maxRetries}, waiting ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system', 
                content: 'You are a professional music journalist and PR specialist who writes compelling artist bios. Write engaging, authentic bios that capture the essence of the artist.'
              },
              { role: 'user', content: prompt }
            ],
            max_tokens: 300,
            temperature: 0.7,
          }),
        });

        console.log(`OpenAI response status (attempt ${attempt}):`, response.status);

        if (response.status === 429) {
          const errorText = await response.text();
          console.log(`Rate limited on attempt ${attempt}:`, errorText);
          lastError = new Error('Rate limit exceeded');
          
          if (attempt === maxRetries) {
            throw new Error('AI service is temporarily busy due to high demand. Please wait a moment and try again.');
          }
          continue; // Try again with backoff
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.error('OpenAI API error details:', errorText);
          
          if (response.status === 401) {
            throw new Error('OpenAI API authentication failed. Please check your API key.');
          } else if (response.status === 403) {
            throw new Error('OpenAI API access forbidden. Please check your API key permissions.');
          } else if (response.status === 402) {
            throw new Error('OpenAI API quota exceeded. Please check your billing and usage limits.');
          } else {
            throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
          }
        }

        // Success! Process the response
        const data = await response.json();
        console.log('OpenAI response data received successfully');
        
        const generatedBio = data.choices?.[0]?.message?.content?.trim();

        if (!generatedBio) {
          console.error('No bio content in response:', data);
          throw new Error('Failed to generate bio content. Please try again.');
        }

        console.log('Bio generated successfully, length:', generatedBio.length);

        return new Response(JSON.stringify({ bio: generatedBio }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      } catch (error) {
        lastError = error;
        if (attempt === maxRetries || !error.message?.includes('Rate limit')) {
          throw error;
        }
      }
    }

    // If we get here, all retries failed
    throw lastError;
  } catch (error) {
    console.error('Error in generate-bio function:', error);
    
    // Return user-friendly error messages
    let errorMessage = 'An unexpected error occurred while generating the bio';
    let statusCode = 500;
    
    if (error.message?.includes('Rate limit') || error.message?.includes('temporarily busy')) {
      errorMessage = 'AI service is temporarily busy due to high demand. Please wait a moment and try again.';
      statusCode = 429;
    } else if (error.message?.includes('authentication')) {
      errorMessage = 'Authentication error with AI service. Please contact support.';
      statusCode = 401;
    } else if (error.message?.includes('quota')) {
      errorMessage = 'AI service quota exceeded. Please contact support.';
      statusCode = 402;
    } else if (error.message?.includes('Artist name is required')) {
      errorMessage = error.message;
      statusCode = 400;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      retryable: statusCode === 429 || statusCode >= 500
    }), {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});