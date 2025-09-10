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
    return `Enhance and rewrite this artist bio for ${artist_name}:

"${existing_bio}"

Transform it using these elements:
${genre ? `- Musical Style: ${genre}` : ''}
${influences ? `- Key Influences: ${influences}` : ''}
${location ? `- Location: ${location}` : ''}
${notable_performances ? `- Major Performances: ${notable_performances}` : ''}
${musical_background ? `- Background: ${musical_background}` : ''}
${vibe ? `- Tone: ${vibe === 'casual' ? 'conversational and approachable' : vibe === 'professional' ? 'industry-focused and polished' : vibe}` : ''}

Create a compelling 250-300 word bio that flows as a cohesive narrative, emphasizing credibility and what makes this artist bookable to industry professionals.`;
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

  return `Write a compelling artist bio for ${artist_name}${genre ? `, a ${genre} artist` : ''}${location ? ` based in ${location}` : ''}.

${contextElements.length > 0 ? `Key Information:
${contextElements.map(element => `• ${element}`).join('\n')}` : ''}

Requirements:
• 250-300 words maximum
• Third person narrative that flows naturally
• Emphasize credibility and what makes them bookable
• Weave in achievements and background organically
• ${toneGuidance}
• Focus on impressive elements that would interest industry professionals
• No fabricated details or placeholder information

Create a bio that would make booking agents and industry professionals take notice.`;
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

    // Retry logic with exponential backoff
    const maxRetries = 3;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 1) {
          const delay = 1000 * Math.pow(2, attempt - 1);
          console.log(`Retry attempt ${attempt}/${maxRetries}, waiting ${delay}ms...`);
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
          if (attempt === maxRetries) {
            throw new Error('AI service is temporarily busy due to high demand. Please wait a moment and try again.');
          }
          continue;
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.error('OpenAI API error:', response.status, errorText);
          
          if (response.status === 401) {
            throw new Error('OpenAI API authentication failed');
          } else if (response.status === 402) {
            throw new Error('OpenAI API quota exceeded');
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
    
    if (error.message?.includes('temporarily busy') || error.message?.includes('Rate limit')) {
      errorMessage = 'AI service is temporarily busy. Please wait a moment and try again.';
      statusCode = 429;
    } else if (error.message?.includes('authentication')) {
      errorMessage = 'Authentication error with AI service';
      statusCode = 401;
    } else if (error.message?.includes('quota')) {
      errorMessage = 'AI service quota exceeded';
      statusCode = 402;
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