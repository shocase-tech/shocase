import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { showData, contentType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    // Build prompts based on content type
    switch (contentType) {
      case "instagram-hype":
        systemPrompt = "You are a creative social media copywriter specializing in concert promotion. Generate engaging, energetic Instagram captions that build excitement.";
        userPrompt = `Create a hype Instagram caption for this show:
Venue: ${showData.venue}
City: ${showData.city}
Date: ${showData.date}
${showData.ticket_link ? `Tickets: ${showData.ticket_link}` : ""}

Make it exciting, use emojis, and include a call-to-action. Keep it under 150 characters.`;
        break;

      case "instagram-nostalgic":
        systemPrompt = "You are a creative social media copywriter. Generate nostalgic, heartfelt Instagram captions for past shows.";
        userPrompt = `Create a nostalgic Instagram caption for this past show:
Venue: ${showData.venue}
City: ${showData.city}
Date: ${showData.date}

Make it reflective and appreciative. Use emojis sparingly. Keep it under 150 characters.`;
        break;

      case "instagram-thankyou":
        systemPrompt = "You are a creative social media copywriter. Generate genuine thank-you captions for shows.";
        userPrompt = `Create a thank-you Instagram caption for this show:
Venue: ${showData.venue}
City: ${showData.city}
Date: ${showData.date}

Express genuine gratitude to fans and venue. Keep it warm and authentic. Keep it under 150 characters.`;
        break;

      case "instagram-funny":
        systemPrompt = "You are a witty social media copywriter. Generate funny, clever Instagram captions for shows.";
        userPrompt = `Create a funny Instagram caption for this show:
Venue: ${showData.venue}
City: ${showData.city}
Date: ${showData.date}

Make it clever and humorous without being cheesy. Use relevant emojis. Keep it under 150 characters.`;
        break;

      case "tiktok-caption":
        systemPrompt = "You are a Gen-Z social media expert. Generate short, punchy TikTok captions.";
        userPrompt = `Create a TikTok caption for this show:
Venue: ${showData.venue}
City: ${showData.city}
Date: ${showData.date}

Make it short, trendy, and engaging. Use relevant emojis. Keep it under 100 characters.`;
        break;

      case "email-newsletter":
        systemPrompt = "You are an email marketing copywriter for musicians. Generate engaging newsletter snippets.";
        userPrompt = `Create an email newsletter snippet for this show announcement:
Venue: ${showData.venue}
City: ${showData.city}
Date: ${showData.date}
${showData.ticket_link ? `Tickets: ${showData.ticket_link}` : ""}

Make it professional yet personal, building anticipation. 2-3 sentences max.`;
        break;

      case "press-blurb":
        systemPrompt = "You are a professional music publicist. Generate press-worthy blurbs for EPKs.";
        userPrompt = `Create a press blurb for an EPK about this show:
Venue: ${showData.venue}
City: ${showData.city}
Date: ${showData.date}

Make it professional and impressive. Format: "Recently played [details]". One sentence only.`;
        break;

      case "hashtags":
        systemPrompt = "You are a social media strategist. Generate relevant hashtags for music events.";
        userPrompt = `Generate 10-15 relevant hashtags for this show:
Venue: ${showData.venue}
City: ${showData.city}
Date: ${showData.date}

Mix popular music hashtags with location-specific ones. Return only hashtags, one per line.`;
        break;

      case "venue-tags":
        systemPrompt = "You are a social media strategist. Generate venue and artist tags for promotion.";
        userPrompt = `Generate Instagram/social media tags for this show:
Venue: ${showData.venue}
City: ${showData.city}

Suggest relevant venue handles, local music scene tags, and related accounts. Return only @ mentions, one per line.`;
        break;

      default:
        throw new Error("Invalid content type");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ content: generatedContent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-show-content:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
