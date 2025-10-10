import { supabase } from "@/integrations/supabase/client";

// Note: Google Client ID will be fetched from edge function
const GMAIL_SCOPES = ['https://www.googleapis.com/auth/gmail.compose'];

/**
 * Initiates Gmail OAuth flow by opening Google's consent screen
 * Note: Requires GOOGLE_CLIENT_ID to be set in Supabase secrets
 */
export const initiateGmailAuth = async () => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Call edge function to get OAuth URL (keeps client_id secure)
    const { data, error } = await supabase.functions.invoke('get-gmail-auth-url', {
      body: { user_id: user.id }
    });

    if (error || !data?.authUrl) {
      throw new Error('Failed to get Gmail auth URL');
    }

    // Redirect to Google's consent screen
    window.location.href = data.authUrl;
  } catch (error) {
    console.error('Error initiating Gmail auth:', error);
    throw error;
  }
};

/**
 * Checks if user has connected Gmail account
 */
export const isGmailConnected = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('gmail_tokens')
      .select('user_id')
      .eq('user_id', user.id)
      .single();

    return !error && !!data;
  } catch (error) {
    console.error('Error checking Gmail connection:', error);
    return false;
  }
};

/**
 * Disconnects Gmail account by deleting tokens
 */
export const disconnectGmail = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('gmail_tokens')
      .delete()
      .eq('user_id', user.id);

    if (error) throw error;
  } catch (error) {
    console.error('Error disconnecting Gmail:', error);
    throw error;
  }
};

/**
 * Creates a Gmail draft via Supabase Edge Function
 */
export const createGmailDraft = async (params: {
  to: string;
  subject: string;
  body: string;
  venue_id: string;
  proposed_dates?: string;
  proposed_bill?: string;
  additional_context?: string;
}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase.functions.invoke('create-gmail-draft', {
      body: {
        ...params,
        artist_id: user.id,
      }
    });

    if (error) {
      console.error('Error creating Gmail draft:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createGmailDraft:', error);
    throw error;
  }
};
