import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VenueEmailRequest {
  artist_name: string;
  artist_bio: string;
  artist_genre: string;
  artist_location: string;
  performance_type: string;
  past_shows: any[];
  venue_name: string;
  venue_city: string;
  venue_genres: string[];
  venue_requirements: any;
  venue_booking_guidelines: string;
  artist_epk_url: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: VenueEmailRequest = await req.json();
    console.log('Generating venue email with data:', requestData);

    const prompt = `Generate a professional, personalized booking email for an artist pitching to a venue. 

ARTIST DETAILS:
- Name: ${requestData.artist_name}
- Genre: ${requestData.artist_genre}
- Location: ${requestData.artist_location}
- Performance Type: ${requestData.performance_type || 'Live performance'}
- Bio: ${requestData.artist_bio}
- Recent Shows: ${requestData.past_shows?.slice(0, 3).map(show => `${show.venue_name} in ${show.city}`).join(', ') || 'No recent shows listed'}
- EPK Link: ${requestData.artist_epk_url}

VENUE DETAILS:
- Name: ${requestData.venue_name}
- City: ${requestData.venue_city}
- Genres they book: ${requestData.venue_genres?.join(', ') || 'Various'}
- Booking Guidelines: ${requestData.venue_booking_guidelines || 'Not specified'}
- Requirements: ${JSON.stringify(requestData.venue_requirements || {})}

INSTRUCTIONS:
1. Write a compelling email subject line (max 60 characters) that mentions the artist name
2. Write a professional email body that:
   - Opens with a personalized greeting mentioning the venue name
   - Briefly introduces the artist and their sound in 2-3 sentences
   - Explains why they're a good fit for THIS SPECIFIC VENUE (reference their genres, vibe, or past shows)
   - Mentions 1-2 notable past performances if available
   - Includes a clear call-to-action (checking availability, discussing booking)
   - Ends with a professional sign-off
   - Includes the EPK link naturally in the email
3. Keep the tone professional but approachable
4. Keep the email concise (250-300 words max)
5. Address any specific requirements or guidelines the venue mentioned

Return ONLY a JSON object with this structure:
{
  "subject": "Email subject line here",
  "body": "Full email body here"
}

Do not include any markdown formatting or code blocks in your response, just the raw JSON.`;

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
            content: 'You are an expert music industry professional who writes compelling booking emails for artists. You understand venue preferences and how to craft personalized pitches. Always respond with valid JSON only.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;
    
    console.log('Generated content:', generatedContent);

    // Parse the JSON response from the AI
    let emailData;
    try {
      emailData = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', generatedContent);
      throw new Error('Invalid response format from AI');
    }

    return new Response(JSON.stringify(emailData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-venue-email function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
