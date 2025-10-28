import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { venue } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    if (!venue) {
      throw new Error('Venue data is required');
    }

    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const todayStr = today.toISOString().split('T')[0];
    const nextWeekStr = nextWeek.toISOString().split('T')[0];

    // Fetch website content to provide to AI
    let websiteContent = '';
    const urlToFetch = venue.event_calendar_url || venue.website_url;
    
    if (urlToFetch) {
      try {
        console.log(`Fetching content from: ${urlToFetch}`);
        const websiteResponse = await fetch(urlToFetch, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        if (websiteResponse.ok) {
          const html = await websiteResponse.text();
          // Extract text content and limit size
          const textContent = html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          
          websiteContent = textContent.substring(0, 8000); // Limit to avoid token limits
          console.log(`Fetched ${websiteContent.length} characters from website`);
        } else {
          console.log(`Failed to fetch website: ${websiteResponse.status}`);
        }
      } catch (fetchError) {
        console.error(`Error fetching website content:`, fetchError);
      }
    }

    const systemPrompt = `You are an event extraction assistant. Extract upcoming music events from the provided website content.
Return ONLY valid JSON, no additional text or explanation.
Return an array of events with this exact structure:
[
  {
    "date": "YYYY-MM-DD",
    "artists": "Artist Name 1, Artist Name 2",
    "time": "8:00 PM" or null
  }
]
If no events are found, return an empty array: []`;

    const userPrompt = `Extract upcoming shows at this venue between ${todayStr} and ${nextWeekStr}:

Venue Name: ${venue.name}
Address: ${venue.address}, ${venue.city}, ${venue.state || ''}

${websiteContent ? `WEBSITE CONTENT:\n${websiteContent}\n\n` : 'No website content available. '}

Extract show information including:
- Date (must be between ${todayStr} and ${nextWeekStr})
- Artist names (comma-separated if multiple artists)
- Time (if available)

Return ONLY the JSON array, no other text.`;

    console.log(`Fetching events for venue: ${venue.name}`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error('Rate limit exceeded');
        return new Response(JSON.stringify({ error: 'Rate limit exceeded', events: [] }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        console.error('Payment required');
        return new Response(JSON.stringify({ error: 'Payment required', events: [] }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(JSON.stringify({ error: 'AI gateway error', events: [] }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || '[]';
    
    console.log(`AI Response for ${venue.name}:`, aiResponse);

    // Parse the AI response, handling potential JSON formatting issues
    let events = [];
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        events = JSON.parse(jsonMatch[0]);
      } else {
        events = JSON.parse(aiResponse);
      }
    } catch (parseError) {
      console.error(`Failed to parse AI response for ${venue.name}:`, parseError);
      events = [];
    }

    console.log(`Found ${events.length} events for ${venue.name}`);

    return new Response(JSON.stringify({ events }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in fetch-venue-events:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        events: []
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
