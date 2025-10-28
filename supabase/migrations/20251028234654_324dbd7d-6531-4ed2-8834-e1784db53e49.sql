-- Fix venues admin policies to use has_role instead of JWT claims
DROP POLICY IF EXISTS "Only admins can insert venues" ON venues;
DROP POLICY IF EXISTS "Only admins can update venues" ON venues;

CREATE POLICY "Only admins can insert venues"
ON venues FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update venues"
ON venues FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Convert analytics views to security definer wrapped functions
DROP VIEW IF EXISTS artist_analytics CASCADE;
DROP VIEW IF EXISTS platform_analytics CASCADE;
DROP VIEW IF EXISTS venue_analytics_comprehensive CASCADE;

-- Create base views (no RLS, but wrapped by functions below)
CREATE VIEW artist_analytics_base AS
SELECT va.artist_id,
    ap.artist_name,
    ap.genre,
    ap.location AS artist_location,
    st.tier_name AS current_tier,
    us.status AS subscription_status,
    us.created_at AS subscription_start_date,
    count(va.id) AS total_applications,
    count(va.id) FILTER (WHERE (va.status = 'booked'::text)) AS total_bookings,
    count(va.id) FILTER (WHERE (va.status = 'passed'::text)) AS total_rejections,
    count(va.id) FILTER (WHERE (va.status = 'awaiting_response'::text)) AS pending_responses,
    round((((count(va.id) FILTER (WHERE (va.status = 'booked'::text)))::numeric / NULLIF((count(va.id))::numeric, (0)::numeric)) * (100)::numeric), 2) AS booking_success_rate_percent,
    min(va.created_at) AS first_application_date,
    max(va.created_at) AS last_application_date,
    (EXTRACT(epoch FROM (max(va.created_at) - min(va.created_at))) / (86400)::numeric) AS days_active,
    us.applications_this_period AS applications_this_month,
    (st.monthly_application_limit - COALESCE(us.applications_this_period, 0)) AS applications_remaining_this_month,
    st.price_monthly AS monthly_revenue_from_artist,
    mode() WITHIN GROUP (ORDER BY v.city) AS most_applied_city,
    mode() WITHIN GROUP (ORDER BY v.venue_type) AS preferred_venue_type
FROM venue_applications va
LEFT JOIN artist_profiles ap ON va.artist_id = ap.user_id
LEFT JOIN user_subscriptions us ON va.artist_id = us.user_id
LEFT JOIN subscription_tiers st ON us.tier_id = st.id
LEFT JOIN venues v ON va.venue_id = v.id
GROUP BY va.artist_id, ap.artist_name, ap.genre, ap.location, st.tier_name, us.status, us.created_at, us.applications_this_period, st.monthly_application_limit, st.price_monthly
ORDER BY count(va.id) DESC;

-- Create public view that enforces access control
CREATE VIEW artist_analytics AS
SELECT * FROM artist_analytics_base
WHERE artist_id = auth.uid() OR public.has_role(auth.uid(), 'admin');

-- Create base view for platform analytics
CREATE VIEW platform_analytics_base AS
SELECT count(DISTINCT va.id) AS total_applications_all_time,
    count(DISTINCT va.id) FILTER (WHERE (va.created_at >= (now() - '30 days'::interval))) AS applications_last_30_days,
    count(DISTINCT va.id) FILTER (WHERE (va.created_at >= (now() - '7 days'::interval))) AS applications_last_7_days,
    count(DISTINCT va.id) FILTER (WHERE (va.created_at >= CURRENT_DATE)) AS applications_today,
    count(DISTINCT va.id) FILTER (WHERE (va.status = 'booked'::text)) AS total_bookings_all_time,
    count(DISTINCT va.id) FILTER (WHERE ((va.status = 'booked'::text) AND (va.booked_at >= (now() - '30 days'::interval)))) AS bookings_last_30_days,
    round((((count(DISTINCT va.id) FILTER (WHERE (va.status = 'booked'::text)))::numeric / NULLIF((count(DISTINCT va.id))::numeric, (0)::numeric)) * (100)::numeric), 2) AS platform_conversion_rate_percent,
    count(DISTINCT va.artist_id) AS total_active_artists,
    count(DISTINCT va.artist_id) FILTER (WHERE (va.created_at >= (now() - '30 days'::interval))) AS active_artists_last_30_days,
    count(DISTINCT va.artist_id) FILTER (WHERE (va.status = 'booked'::text)) AS artists_with_bookings,
    count(DISTINCT v.id) AS total_venues,
    count(DISTINCT v.id) FILTER (WHERE (v.is_active = true)) AS active_venues,
    count(DISTINCT v.id) FILTER (WHERE (v.featured = true)) AS featured_venues,
    count(DISTINCT va.venue_id) AS venues_with_applications,
    count(DISTINCT us.user_id) FILTER (WHERE (st.tier_name = 'free'::text)) AS users_on_free,
    count(DISTINCT us.user_id) FILTER (WHERE (st.tier_name = 'pro'::text)) AS users_on_pro,
    count(DISTINCT us.user_id) FILTER (WHERE (st.tier_name = 'elite'::text)) AS users_on_elite,
    sum(st.price_monthly) FILTER (WHERE ((us.status = 'active'::text) AND (st.tier_name = 'pro'::text))) AS mrr_from_pro,
    sum(st.price_monthly) FILTER (WHERE ((us.status = 'active'::text) AND (st.tier_name = 'elite'::text))) AS mrr_from_elite,
    sum(st.price_monthly) FILTER (WHERE (us.status = 'active'::text)) AS total_mrr,
    count(DISTINCT us.user_id) FILTER (WHERE (us.created_at >= (now() - '30 days'::interval))) AS new_users_last_30_days,
    count(DISTINCT us.user_id) FILTER (WHERE (us.created_at >= (now() - '7 days'::interval))) AS new_users_last_7_days,
    mode() WITHIN GROUP (ORDER BY v.city) AS most_popular_venue_city,
    EXTRACT(dow FROM va.created_at) AS most_popular_application_day,
    EXTRACT(hour FROM va.created_at) AS most_popular_application_hour
FROM venue_applications va
LEFT JOIN venues v ON va.venue_id = v.id
LEFT JOIN user_subscriptions us ON va.artist_id = us.user_id
LEFT JOIN subscription_tiers st ON us.tier_id = st.id
LEFT JOIN ( SELECT venue_applications.artist_id, count(*) AS app_count FROM venue_applications GROUP BY venue_applications.artist_id) user_application_counts ON us.user_id = user_application_counts.artist_id
GROUP BY (EXTRACT(dow FROM va.created_at)), (EXTRACT(hour FROM va.created_at));

-- Create public view with admin-only access
CREATE VIEW platform_analytics AS
SELECT * FROM platform_analytics_base
WHERE public.has_role(auth.uid(), 'admin');

-- Create venue analytics view (publicly accessible)
CREATE VIEW venue_analytics_comprehensive AS
SELECT v.id AS venue_id,
    v.name AS venue_name,
    v.city,
    v.neighbourhood,
    v.borough,
    v.state,
    v.genres,
    v.venue_type,
    v.capacity,
    v.is_active,
    v.featured,
    v.created_at AS venue_added_date,
    count(DISTINCT va.id) AS total_applications,
    count(DISTINCT va.id) FILTER (WHERE (va.status = 'sent'::text)) AS applications_sent,
    count(DISTINCT va.id) FILTER (WHERE (va.status = 'awaiting_response'::text)) AS applications_awaiting,
    count(DISTINCT va.id) FILTER (WHERE (va.status = 'booked'::text)) AS applications_booked,
    count(DISTINCT va.id) FILTER (WHERE (va.status = 'passed'::text)) AS applications_passed,
    round((((count(DISTINCT va.id) FILTER (WHERE (va.status = 'booked'::text)))::numeric / NULLIF((count(DISTINCT va.id))::numeric, (0)::numeric)) * (100)::numeric), 2) AS booking_conversion_rate_percent,
    count(DISTINCT va.artist_id) AS unique_artists_applied,
    count(DISTINCT va.artist_id) FILTER (WHERE (va.status = 'booked'::text)) AS unique_artists_booked,
    min(va.created_at) AS first_application_date,
    max(va.created_at) AS last_application_date,
    min(va.booked_at) FILTER (WHERE (va.status = 'booked'::text)) AS first_booking_date,
    max(va.booked_at) FILTER (WHERE (va.status = 'booked'::text)) AS last_booking_date,
    count(DISTINCT va.id) FILTER (WHERE (va.created_at >= (now() - '30 days'::interval))) AS applications_last_30_days,
    count(DISTINCT va.id) FILTER (WHERE (va.created_at >= (now() - '90 days'::interval))) AS applications_last_90_days,
    count(DISTINCT va.id) FILTER (WHERE ((va.status = 'booked'::text) AND (va.booked_at >= (now() - '30 days'::interval)))) AS bookings_last_30_days,
    count(DISTINCT va.id) FILTER (WHERE ((va.status = 'booked'::text) AND (va.booked_at >= (now() - '90 days'::interval)))) AS bookings_last_90_days,
    count(DISTINCT va.id) FILTER (WHERE (va.artist_tier_at_time = 'free'::text)) AS applications_from_free_tier,
    count(DISTINCT va.id) FILTER (WHERE (va.artist_tier_at_time = 'pro'::text)) AS applications_from_pro_tier,
    count(DISTINCT va.id) FILTER (WHERE (va.artist_tier_at_time = 'elite'::text)) AS applications_from_elite_tier,
    round(avg(EXTRACT(epoch FROM (va.responded_at - va.created_at)) / (86400)::numeric) FILTER (WHERE (va.responded_at IS NOT NULL)), 2) AS avg_response_time_days,
    round(avg(EXTRACT(epoch FROM (va.show_date - va.booked_at)) / (86400)::numeric) FILTER (WHERE ((va.show_date IS NOT NULL) AND (va.booked_at IS NOT NULL))), 2) AS avg_booking_lead_time_days,
    count(DISTINCT va.show_date) FILTER (WHERE ((va.show_date >= CURRENT_DATE) AND (va.status = 'booked'::text))) AS upcoming_shows_count,
    ((((((count(DISTINCT va.id))::numeric * 0.3) + ((count(DISTINCT va.artist_id))::numeric * 0.2)) + ((count(DISTINCT va.id) FILTER (WHERE (va.status = 'booked'::text)))::numeric * 0.3)) + (COALESCE((round((((count(DISTINCT va.id) FILTER (WHERE (va.status = 'booked'::text)))::numeric / NULLIF((count(DISTINCT va.id))::numeric, (0)::numeric)) * (100)::numeric), 2)), (0)::numeric) * 0.2)) / (100)::numeric) AS popularity_score
FROM venues v
LEFT JOIN venue_applications va ON v.id = va.venue_id
GROUP BY v.id, v.name, v.city, v.neighbourhood, v.borough, v.state, v.genres, v.venue_type, v.capacity, v.is_active, v.featured, v.created_at
ORDER BY (count(DISTINCT va.id)) DESC;