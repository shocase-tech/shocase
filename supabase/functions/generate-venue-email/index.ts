import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user from JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ 
        error: 'Missing authorization header' 
      }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ 
        error: 'Unauthorized' 
      }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const user_id = user.id;
    
    // Validate input with zod
    const requestSchema = z.object({
      venue_id: z.string().uuid({ message: "Invalid venue_id format" }),
      artist_name: z.string().min(1).max(200, { message: "Artist name must be between 1-200 characters" }).optional(),
      artist_genre: z.string().max(200).optional(),
      artist_bio: z.string().max(5000).optional(),
      artist_location: z.string().max(200).optional(),
      performance_type: z.string().max(200).optional(),
      expected_draw: z.string().max(500).optional(),
      social_proof: z.string().max(1000).optional(),
      notable_achievements: z.array(z.string().max(500)).max(20).optional(),
      past_shows: z.array(z.any()).max(50).optional(),
      proposed_dates: z.string().max(500).optional(),
      proposed_bill: z.string().max(1000).optional(),
      additional_context: z.string().max(2000).optional()
    });

    let requestData;
    try {
      const rawData = await req.json();
      requestData = requestSchema.parse(rawData);
    } catch (validationError) {
      console.error('Validation error:', validationError);
      return new Response(JSON.stringify({ 
        error: 'Invalid input data',
        details: validationError instanceof z.ZodError ? validationError.errors : 'Validation failed'
      }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    const { venue_id, artist_name, ...rest } = requestData;

    // Check subscription tier and usage
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('tier_id, applications_this_period, current_period_start')
      .eq('user_id', user_id)
      .single();

    if (subError || !subscription) {
      return new Response(JSON.stringify({ 
        error: 'Subscription not found. Please refresh and try again.' 
      }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Check tier from subscription_tiers table
    const { data: tier } = await supabase
      .from('subscription_tiers')
      .select('tier_name, monthly_application_limit, cooldown_days')
      .eq('id', subscription.tier_id)
      .single();

    if (!tier) {
      return new Response(JSON.stringify({ 
        error: 'Subscription tier not found.' 
      }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (tier.tier_name === 'free') {
      return new Response(JSON.stringify({ 
        error: 'upgrade_required',
        message: 'Email generation requires a Pro or Elite subscription.'
      }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (tier.monthly_application_limit && subscription.applications_this_period >= tier.monthly_application_limit) {
      return new Response(JSON.stringify({ 
        error: 'limit_reached',
        message: `You've reached your monthly limit of ${tier.monthly_application_limit} applications. Upgrade to Elite for unlimited applications.`
      }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Check cooldown period for this venue
    const cooldownDays = tier.cooldown_days || 60;
    
    const { data: recentApplications } = await supabase
      .from('venue_applications')
      .select('created_at')
      .eq('artist_id', user_id)
      .eq('venue_id', venue_id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (recentApplications && recentApplications.length > 0) {
      const lastApplicationDate = new Date(recentApplications[0].created_at);
      const daysSinceLastApplication = Math.floor(
        (Date.now() - lastApplicationDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastApplication < cooldownDays) {
        const daysRemaining = cooldownDays - daysSinceLastApplication;
        const nextAvailableDate = new Date(lastApplicationDate);
        nextAvailableDate.setDate(nextAvailableDate.getDate() + cooldownDays);

        return new Response(JSON.stringify({ 
          error: 'cooldown_active',
          message: `You applied to this venue ${daysSinceLastApplication} days ago. You can apply again in ${daysRemaining} days (${nextAvailableDate.toLocaleDateString()}).`,
          daysRemaining,
          nextAvailableDate: nextAvailableDate.toISOString()
        }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    // Fetch outreach components
    const { data: outreachComponents } = await supabase
      .from('outreach_components')
      .select('expected_draw, social_proof, notable_achievements')
      .eq('user_id', user_id)
      .single();

    // Fetch venue data
    const { data: venueData } = await supabase
      .from('venues')
      .select('booking_contact_email')
      .eq('id', venue_id)
      .single();

    // Generate the email using OpenAI
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      return new Response(JSON.stringify({
        error: 'api_key_invalid',
        message: 'Email generation is temporarily unavailable. Please contact support.'
      }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const prompt = `Generate a professional, personalized booking email for an artist pitching to a venue. 

ARTIST DETAILS:
- Name: ${requestData.artist_name}
- Genre: ${requestData.artist_genre}
- Location: ${requestData.artist_location}
- Performance Type: ${requestData.performance_type || 'Live performance'}
- Bio: ${requestData.artist_bio}
- Recent Shows: ${requestData.past_shows?.slice(0, 3).map((show: any) => 
    `${show.venue_name} in ${show.city}`
  ).join(', ') || 'No recent shows listed'}
- EPK Link: ${requestData.artist_epk_url}

${outreachComponents ? `
ADDITIONAL PITCH COMPONENTS (use these naturally in the email):
- Expected Draw: ${outreachComponents.expected_draw || 'Not specified'}
- Social Proof: ${outreachComponents.social_proof || 'Not specified'}
- Notable Achievements: ${outreachComponents.notable_achievements?.slice(0, 3).join('; ') || 'Not specified'}
` : ''}

VENUE DETAILS:
- Name: ${requestData.venue_name}
- City: ${requestData.venue_city}
- Booking Contact: ${venueData?.booking_contact_email || 'Booking team'}
- Genres they book: ${requestData.venue_genres?.join(', ') || 'Various'}
- Booking Guidelines: ${requestData.venue_booking_guidelines || 'Not specified'}
- Requirements: ${JSON.stringify(requestData.venue_requirements || {})}

${requestData.proposed_dates ? `
PROPOSED DATES: ${requestData.proposed_dates}
` : ''}

${requestData.proposed_bill ? `
PROPOSED BILL/DETAILS: ${requestData.proposed_bill}
` : ''}

${requestData.additional_context ? `
ADDITIONAL CONTEXT FROM ARTIST: ${requestData.additional_context}
` : ''}

INSTRUCTIONS:
1. Write a compelling email subject line (max 60 characters) that mentions the artist name and date range if provided
2. Write a professional email body that:
   - Opens with a personalized greeting (use "Hi [Booking Team]" or "Hi there" - keep it simple and professional)
   - Briefly introduces the artist and their sound in 2-3 sentences
   - Explains why they're a good fit for THIS SPECIFIC VENUE (reference their genres, vibe, or location)
   - Naturally incorporates the additional pitch components (expected draw, social proof, achievements) if provided
   - Mentions 1-2 notable past performances if available
   - States the proposed dates and any booking details clearly
   - Includes a clear call-to-action (checking availability, discussing details)
   - Ends with a professional sign-off
   - Includes the EPK link naturally in the email
3. Keep the tone professional but approachable and authentic
4. Keep the email concise (250-350 words max)
5. Address any specific requirements or guidelines the venue mentioned
6. If additional_context is provided, incorporate it naturally
7. DO NOT make up information - only use what's provided
8. DO NOT address the email to a specific person's name unless explicitly provided

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
          { role: 'system', content: 'You are an expert at writing professional booking emails for musicians. You always return valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({
          error: 'rate_limited',
          message: 'AI service is busy. Please wait 30 seconds and try again.'
        }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      
      if (response.status === 401) {
        return new Response(JSON.stringify({
          error: 'api_key_invalid',
          message: 'Email generation is temporarily unavailable. Please contact support.'
        }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    let emailData: any;
    try {
      emailData = JSON.parse(generatedContent);
      
      // Validate required fields
      if (!emailData.subject || !emailData.body) {
        throw new Error('Missing required fields in AI response');
      }
      
    } catch (parseError) {
      console.error('Failed to parse AI response:', generatedContent, parseError);
      
      // Fallback: Try to extract content manually
      const subjectMatch = generatedContent.match(/"subject":\s*"([^"]+)"/);
      const bodyMatch = generatedContent.match(/"body":\s*"([^"]+)"/s);
      
      if (subjectMatch && bodyMatch) {
        emailData = {
          subject: subjectMatch[1],
          body: bodyMatch[1].replace(/\\n/g, '\n')
        };
      } else {
        return new Response(JSON.stringify({
          error: 'generation_failed',
          message: 'Failed to generate email. Please try again or contact support.'
        }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    // Log successful generation for analytics
    console.log('Email generated successfully for user:', user_id, 'venue:', venue_id);

    return new Response(JSON.stringify({
      ...emailData,
      to: venueData?.booking_contact_email || requestData.venue_booking_email || 'booking@venue.com'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in generate-venue-email function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An unexpected error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
