import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function buildBioPrompt(inputs: any) {
  const { 
    artist_name, 
    genre, 
    influences, 
    location, 
    vibe, 
    existing_bio, 
    is_remix, 
    notable_performances, 
    musical_background,
    is_blurb,
    word_limit
  } = inputs;

// Handle blurb generation request
  if (is_blurb && existing_bio) {
    return `Create a catchy, exciting blurb (maximum ${word_limit || 20} words) from this artist bio for ${artist_name}:

"${existing_bio}"

Requirements:
• Maximum ${word_limit || 20} words
• Catchy and exciting tone
• Summarize the most compelling aspect
• Make it sound intriguing and memorable
• Focus on what makes them unique
• No quotation marks in the output

Generate just the blurb text, nothing else.`;
  }

  if (is_remix && existing_bio) {
    return `Rewrite and enhance this artist bio for ${artist_name} to tell a more complete and informative story:

"${existing_bio}"

Transform it using these elements:
${genre ? `- Musical Style: ${genre}` : ''}
${influences ? `- Key Influences: ${influences}` : ''}
${location ? `- Location: ${location}` : ''}
${notable_performances ? `- Major Performances: ${notable_performances}` : ''}
${musical_background ? `- Background: ${musical_background}` : ''}
${vibe ? `- Tone: ${vibe === 'casual' ? 'conversational and approachable' : vibe === 'professional' ? 'industry-focused and polished' : vibe}` : ''}

Create an informative 250-300 word bio that:
• Tells the artist's authentic story and artistic journey
• Focuses on their creative evolution and what drives their music
• Presents achievements naturally within the narrative context
• Helps readers understand their unique artistic perspective
• Avoids hyperbolic language or excessive promotional tone
• Shows both where they've been and where they're heading artistically`;
  }

  // Build comprehensive new bio prompt
  let contextElements = [];
  
  if (notable_performances) {
    contextElements.push(`Notable achievements include: ${notable_performances}`);
  }
  
  if (musical_background) {
    contextElements.push(`Musical foundation: ${musical_background}`);
  }
  
  if (influences) {
    contextElements.push(`Drawing inspiration from: ${influences}`);
  }
  
  const toneGuidance = vibe === 'casual' 
    ? 'Write in a conversational, approachable tone that feels authentic and relatable.'
    : vibe === 'professional' 
    ? 'Write in a polished, industry-focused tone that impresses booking agents and music professionals.'
    : vibe 
    ? `Write with a ${vibe} tone.`
    : 'Write in a professional yet engaging tone.';

  return `Write an informative artist biography for ${artist_name}${genre ? `, a ${genre} artist` : ''}${location ? ` based in ${location}` : ''} that tells their story and gives readers a complete picture of who they are as an artist.

${contextElements.length > 0 ? `Key Information:
${contextElements.map(element => `• ${element}`).join('\n')}` : ''}

Requirements:
• 250-300 words maximum
• Third person narrative that tells their artistic journey and story
• Focus on their musical evolution, creative process, and authentic artistic identity
• Provide context about their background, influences, and what drives their creativity
• Include achievements naturally within the story rather than as a list
• Show where they've been and where they're heading artistically
• ${toneGuidance}
• Avoid hyperbolic language or excessive praise
• Present facts and story in an engaging but grounded way
• Help readers understand the artist's unique perspective and artistic vision

Create a bio that tells the artist's authentic story and helps readers connect with their artistic journey.`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const inputs = await req.json();
    console.log('Bio generation request:', JSON.stringify(inputs, null, 2));
    
    if (!inputs.artist_name?.trim()) {
      throw new Error('Artist name is required');
    }
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      throw new Error('OpenAI API key not configured');
    }

    const prompt = buildBioPrompt(inputs);
    console.log('Generated prompt:', prompt);

    // Retry logic with exponential backoff and jitter
    const maxRetries = 5;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 1) {
          const delay = 2000 * Math.pow(2, attempt - 1);
          const jitter = Math.random() * 1000;
          console.log(`Retry attempt ${attempt}/${maxRetries}, waiting ${delay + jitter}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay + jitter));
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
                content: 'You are a professional music industry bio writer. Create compelling, concise artist bios that impress booking agents and industry professionals. Focus on credibility, achievements, and what makes artists bookable.'
              },
              { role: 'user', content: prompt }
            ],
            max_tokens: 400,
            temperature: 0.7,
          }),
        });

        console.log(`OpenAI API response status: ${response.status}`);

        if (response.status === 429) {
          const errorText = await response.text();
          console.log(`Rate limited (attempt ${attempt}):`, errorText);
          
          // Check for quota vs rate limit errors
          if (errorText.includes('insufficient_quota') || errorText.includes('quota_exceeded')) {
            throw new Error('Daily AI quota reached. Try again tomorrow.');
          }
          
          if (attempt === maxRetries) {
            throw new Error('AI service is busy. Please wait 30 seconds and try again.');
          }
          continue;
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.error('OpenAI API error:', response.status, errorText);
          
          // Additional rate limit detection in error messages
          if (errorText.includes('rate_limit_exceeded') || errorText.includes('insufficient_quota')) {
            if (errorText.includes('insufficient_quota')) {
              throw new Error('Daily AI quota reached. Try again tomorrow.');
            }
            throw new Error('AI service is busy. Please wait 30 seconds and try again.');
          }
          
          if (response.status === 401) {
            throw new Error('OpenAI API authentication failed');
          } else if (response.status === 402) {
            throw new Error('Daily AI quota reached. Try again tomorrow.');
          } else {
            throw new Error(`OpenAI API error (${response.status})`);
          }
        }

        const data = await response.json();
        const generatedBio = data.choices?.[0]?.message?.content?.trim();

        if (!generatedBio) {
          console.error('No bio content in response:', data);
          throw new Error('Failed to generate bio content');
        }

        console.log(`Bio generated successfully (${generatedBio.length} chars)`);

        return new Response(JSON.stringify({ bio: generatedBio }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      } catch (error) {
        lastError = error;
        if (attempt === maxRetries || !error.message?.includes('Rate limit')) {
          break;
        }
      }
    }

    throw lastError;

  } catch (error) {
    console.error('Bio generation error:', error);
    
    let errorMessage = 'Failed to generate bio';
    let statusCode = 500;
    
    if (error.message?.includes('Daily AI quota reached')) {
      errorMessage = 'Daily AI quota reached. Try again tomorrow.';
      statusCode = 402;
    } else if (error.message?.includes('AI service is busy') || error.message?.includes('rate_limit')) {
      errorMessage = 'AI service is busy. Please wait 30 seconds and try again.';
      statusCode = 429;
    } else if (error.message?.includes('authentication')) {
      errorMessage = 'Authentication error with AI service';
      statusCode = 401;
    } else if (error.message?.includes('Artist name is required')) {
      errorMessage = error.message;
      statusCode = 400;
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