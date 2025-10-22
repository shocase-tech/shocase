-- Fix function search path security issue by adding SET search_path = public
-- This prevents search path manipulation attacks on SECURITY DEFINER functions

-- Update create_default_subscription function
CREATE OR REPLACE FUNCTION public.create_default_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO user_subscriptions (user_id, tier_id, status, period_reset_date)
  VALUES (
    NEW.id,
    (SELECT id FROM subscription_tiers WHERE tier_name = 'free'),
    'active',
    NOW() + INTERVAL '30 days'
  );
  RETURN NEW;
END;
$function$;

-- Update can_apply_to_venue function
CREATE OR REPLACE FUNCTION public.can_apply_to_venue(p_artist_id uuid, p_venue_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_tier_name TEXT;
  v_cooldown_days INTEGER;
  v_last_application TIMESTAMP WITH TIME ZONE;
  v_applications_this_period INTEGER;
  v_monthly_limit INTEGER;
BEGIN
  -- Get user's tier and cooldown period
  SELECT st.tier_name, st.cooldown_days, st.monthly_application_limit, us.applications_this_period
  INTO v_tier_name, v_cooldown_days, v_monthly_limit, v_applications_this_period
  FROM user_subscriptions us
  JOIN subscription_tiers st ON us.tier_id = st.id
  WHERE us.user_id = p_artist_id;
  
  -- Free tier can't apply at all
  IF v_tier_name = 'free' THEN
    RETURN FALSE;
  END IF;
  
  -- Check monthly limit (if not unlimited)
  IF v_monthly_limit IS NOT NULL AND v_applications_this_period >= v_monthly_limit THEN
    RETURN FALSE;
  END IF;
  
  -- Check cooldown period for this specific venue
  SELECT MAX(created_at) INTO v_last_application
  FROM venue_applications
  WHERE artist_id = p_artist_id AND venue_id = p_venue_id;
  
  IF v_last_application IS NOT NULL THEN
    IF NOW() - v_last_application < (v_cooldown_days || ' days')::INTERVAL THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  RETURN TRUE;
END;
$function$;

-- Update update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;