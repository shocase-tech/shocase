-- Ensure subscription tiers exist
INSERT INTO public.subscription_tiers (tier_name, price_monthly, monthly_application_limit, cooldown_days)
VALUES 
  ('free', 0.00, 0, 999),
  ('pro', 9.99, 10, 60),
  ('elite', 29.99, NULL, 30)
ON CONFLICT (tier_name) DO NOTHING;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  free_tier_id UUID;
BEGIN
  -- Get the free tier ID
  SELECT id INTO free_tier_id
  FROM public.subscription_tiers
  WHERE tier_name = 'free'
  LIMIT 1;

  -- Create user subscription with free tier
  INSERT INTO public.user_subscriptions (
    user_id,
    tier_id,
    status,
    applications_this_period,
    current_period_start,
    period_reset_date
  ) VALUES (
    NEW.id,
    free_tier_id,
    'active',
    0,
    NOW(),
    NOW() + INTERVAL '30 days'
  );

  -- Create a placeholder artist profile
  INSERT INTO public.artist_profiles (
    user_id,
    artist_name
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'artist_name', 'New Artist')
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();