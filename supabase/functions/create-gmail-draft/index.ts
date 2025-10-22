import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";

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

    const artist_id = user.id;
    const { to, subject, body, venue_id, proposed_dates, proposed_bill, additional_context } = await req.json();

    if (!to || !subject || !body || !venue_id) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: to, subject, body, venue_id' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get user's Gmail tokens
    const { data: tokenData, error: tokenError } = await supabase
      .from('gmail_tokens')
      .select('access_token, refresh_token, expires_at')
      .eq('user_id', artist_id)
      .single();

    if (tokenError || !tokenData) {
      return new Response(JSON.stringify({ 
        error: 'gmail_not_connected',
        message: 'Gmail account not connected. Please connect your Gmail account first.' 
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let accessToken = tokenData.access_token;
    const expiresAt = new Date(tokenData.expires_at);
    const now = new Date();

    // Check if token is expired and refresh if needed
    if (expiresAt <= now) {
      console.log('Access token expired, refreshing...');
      
      const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
      const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');

      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId!,
          client_secret: clientSecret!,
          refresh_token: tokenData.refresh_token,
          grant_type: 'refresh_token',
        }),
      });

      if (!refreshResponse.ok) {
        const errorText = await refreshResponse.text();
        console.error('Token refresh failed:', errorText);
        return new Response(JSON.stringify({ 
          error: 'gmail_token_expired',
          message: 'Gmail connection expired. Please reconnect your Gmail account.' 
        }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const refreshData = await refreshResponse.json();
      accessToken = refreshData.access_token;
      const newExpiresAt = new Date(Date.now() + refreshData.expires_in * 1000).toISOString();

      // Update token in database
      await supabase
        .from('gmail_tokens')
        .update({
          access_token: accessToken,
          expires_at: newExpiresAt,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', artist_id);

      console.log('Token refreshed successfully');
    }

    // Create email message in RFC 2822 format
    const emailLines = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=utf-8',
      '',
      body
    ];
    const email = emailLines.join('\r\n');

    // Proper UTF-8 to Base64URL encoding
    const encoder = new TextEncoder();
    const emailBytes = encoder.encode(email);
    const base64 = encodeBase64(emailBytes);
    
    // Convert to base64url format (Gmail API requirement)
    const encodedMessage = base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Create Gmail draft
    const draftResponse = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/drafts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          raw: encodedMessage
        }
      }),
    });

    if (!draftResponse.ok) {
      const errorText = await draftResponse.text();
      console.error('Gmail API error:', draftResponse.status, errorText);
      
      if (draftResponse.status === 401) {
        return new Response(JSON.stringify({ 
          error: 'gmail_token_invalid',
          message: 'Gmail connection is invalid. Please reconnect your Gmail account.' 
        }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (draftResponse.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'rate_limited',
          message: 'Gmail API rate limit exceeded. Please wait and try again.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      throw new Error(`Gmail API error: ${draftResponse.status}`);
    }

    const draftData = await draftResponse.json();
    const draftId = draftData.id;
    const messageId = draftData.message?.id;

    // Save application to venue_applications table
    const { error: appError } = await supabase
      .from('venue_applications')
      .insert({
        artist_id,
        venue_id,
        email_subject: subject,
        email_body: body,
        proposed_dates,
        proposed_bill,
        additional_context,
        gmail_draft_id: draftId,
        gmail_message_id: messageId,
        status: 'draft',
      });

    if (appError) {
      console.error('Error saving application:', appError);
      // Don't fail the request - draft was created successfully
    }

    // Increment applications counter (even for drafts to prevent abuse)
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('applications_this_period')
      .eq('user_id', artist_id)
      .single();

    if (subscription) {
      await supabase
        .from('user_subscriptions')
        .update({
          applications_this_period: subscription.applications_this_period + 1
        })
        .eq('user_id', artist_id);
    }

    console.log('Gmail draft created successfully:', draftId);

    const draftUrl = `https://mail.google.com/mail/u/0/#drafts?compose=${draftId}`;

    return new Response(JSON.stringify({
      success: true,
      draftId,
      draftUrl,
      messageId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Error in create-gmail-draft:', error);
    return new Response(JSON.stringify({ 
      error: 'draft_creation_failed',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
