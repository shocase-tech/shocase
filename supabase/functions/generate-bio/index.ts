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
    const { artist_name, genre, influences, location, vibe, existing_bio, is_remix, notable_performances, musical_background } = await req.json();
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedBio = data.choices[0]?.message?.content;

    if (!generatedBio) {
      throw new Error('No bio generated');
    }

    console.log('Bio generated successfully');

    return new Response(JSON.stringify({ bio: generatedBio }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-bio function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});