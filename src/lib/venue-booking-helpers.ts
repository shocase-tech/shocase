import { supabase } from "@/integrations/supabase/client";

export interface CanApplyResult {
  canApply: boolean;
  reason?: string;
  daysUntilCanApply?: number;
}

export async function canApplyToVenue(
  userId: string,
  venueId: string
): Promise<CanApplyResult> {
  try {
    // 1. Fetch user's subscription tier and usage
    const { data: subData, error: subError } = await (supabase as any)
      .from('user_subscriptions')
      .select('applications_this_period, tier_id')
      .eq('user_id', userId)
      .single();

    if (subError) throw subError;

    const { data: tierData, error: tierError } = await (supabase as any)
      .from('subscription_tiers')
      .select('tier_name, monthly_application_limit, cooldown_days')
      .eq('id', subData.tier_id)
      .single();

    if (tierError) throw tierError;

    const { tier_name, monthly_application_limit, cooldown_days } = tierData;
    const { applications_this_period } = subData;

    // 2. Check tier restrictions
    if (tier_name === 'free') {
      return {
        canApply: false,
        reason: "Upgrade to Pro or Elite to apply to venues"
      };
    }

    if (tier_name === 'pro' && applications_this_period >= (monthly_application_limit || 10)) {
      return {
        canApply: false,
        reason: "Monthly limit reached. Upgrade to Elite for unlimited applications."
      };
    }

    // 3. Check venue-specific cooldown
    const { data: lastApplication, error: appError } = await (supabase as any)
      .from('venue_applications')
      .select('created_at')
      .eq('artist_id', userId)
      .eq('venue_id', venueId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (appError && appError.code !== 'PGRST116') throw appError;

    if (lastApplication) {
      const daysSinceApplication = Math.floor(
        (Date.now() - new Date(lastApplication.created_at).getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceApplication < cooldown_days) {
        const daysUntilCanApply = cooldown_days - daysSinceApplication;
        return {
          canApply: false,
          reason: "You recently applied to this venue",
          daysUntilCanApply
        };
      }
    }

    // 4. All checks passed
    return { canApply: true };
  } catch (error) {
    console.error('Error checking venue application eligibility:', error);
    throw error;
  }
}
