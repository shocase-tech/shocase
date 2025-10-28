export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      artist_profiles: {
        Row: {
          artist_name: string
          bio: string | null
          blurb: string | null
          contact_info: Json | null
          created_at: string
          featured_track_url: string | null
          gallery_photos: Json[] | null
          genre: string | null
          hero_photo_url: string | null
          id: string
          is_published: boolean | null
          location: string | null
          past_shows: Json | null
          pdf_urls: string[] | null
          performance_type: string | null
          playlists: string[] | null
          press_mentions: Json | null
          press_photos: string[] | null
          press_quotes: Json | null
          profile_photo_url: string | null
          show_videos: string[] | null
          social_links: Json | null
          streaming_links: Json | null
          upcoming_shows: Json | null
          updated_at: string
          url_slug: string | null
          user_id: string
        }
        Insert: {
          artist_name: string
          bio?: string | null
          blurb?: string | null
          contact_info?: Json | null
          created_at?: string
          featured_track_url?: string | null
          gallery_photos?: Json[] | null
          genre?: string | null
          hero_photo_url?: string | null
          id?: string
          is_published?: boolean | null
          location?: string | null
          past_shows?: Json | null
          pdf_urls?: string[] | null
          performance_type?: string | null
          playlists?: string[] | null
          press_mentions?: Json | null
          press_photos?: string[] | null
          press_quotes?: Json | null
          profile_photo_url?: string | null
          show_videos?: string[] | null
          social_links?: Json | null
          streaming_links?: Json | null
          upcoming_shows?: Json | null
          updated_at?: string
          url_slug?: string | null
          user_id: string
        }
        Update: {
          artist_name?: string
          bio?: string | null
          blurb?: string | null
          contact_info?: Json | null
          created_at?: string
          featured_track_url?: string | null
          gallery_photos?: Json[] | null
          genre?: string | null
          hero_photo_url?: string | null
          id?: string
          is_published?: boolean | null
          location?: string | null
          past_shows?: Json | null
          pdf_urls?: string[] | null
          performance_type?: string | null
          playlists?: string[] | null
          press_mentions?: Json | null
          press_photos?: string[] | null
          press_quotes?: Json | null
          profile_photo_url?: string | null
          show_videos?: string[] | null
          social_links?: Json | null
          streaming_links?: Json | null
          upcoming_shows?: Json | null
          updated_at?: string
          url_slug?: string | null
          user_id?: string
        }
        Relationships: []
      }
      gmail_tokens: {
        Row: {
          access_token: string
          created_at: string | null
          expires_at: string
          refresh_token: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string | null
          expires_at: string
          refresh_token: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string | null
          expires_at?: string
          refresh_token?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      outreach_components: {
        Row: {
          created_at: string | null
          expected_draw: string | null
          id: string
          notable_achievements: string[] | null
          social_proof: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expected_draw?: string | null
          id?: string
          notable_achievements?: string[] | null
          social_proof?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expected_draw?: string | null
          id?: string
          notable_achievements?: string[] | null
          social_proof?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profile_views: {
        Row: {
          id: string
          profile_id: string
          viewed_at: string
          viewer_ip: string | null
          viewer_user_agent: string | null
        }
        Insert: {
          id?: string
          profile_id: string
          viewed_at?: string
          viewer_ip?: string | null
          viewer_user_agent?: string | null
        }
        Update: {
          id?: string
          profile_id?: string
          viewed_at?: string
          viewer_ip?: string | null
          viewer_user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_views_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "artist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      riders: {
        Row: {
          created_at: string
          id: string
          is_template: boolean
          name: string
          sections: Json
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_template?: boolean
          name?: string
          sections?: Json
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_template?: boolean
          name?: string
          sections?: Json
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscription_tiers: {
        Row: {
          cooldown_days: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          monthly_application_limit: number | null
          price_monthly: number
          stripe_price_id: string | null
          tier_name: string
        }
        Insert: {
          cooldown_days?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          monthly_application_limit?: number | null
          price_monthly: number
          stripe_price_id?: string | null
          tier_name: string
        }
        Update: {
          cooldown_days?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          monthly_application_limit?: number | null
          price_monthly?: number
          stripe_price_id?: string | null
          tier_name?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          applications_this_period: number | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          period_reset_date: string | null
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          applications_this_period?: number | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          period_reset_date?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          applications_this_period?: number | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          period_reset_date?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "subscription_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      venue_applications: {
        Row: {
          additional_context: string | null
          artist_id: string
          artist_tier_at_time: string | null
          booked_at: string | null
          created_at: string | null
          email_body: string
          email_subject: string
          gmail_draft_id: string | null
          gmail_message_id: string | null
          id: string
          proposed_bill: string | null
          proposed_dates: string | null
          responded_at: string | null
          show_date: string | null
          status: string | null
          updated_at: string | null
          venue_id: string
        }
        Insert: {
          additional_context?: string | null
          artist_id: string
          artist_tier_at_time?: string | null
          booked_at?: string | null
          created_at?: string | null
          email_body: string
          email_subject: string
          gmail_draft_id?: string | null
          gmail_message_id?: string | null
          id?: string
          proposed_bill?: string | null
          proposed_dates?: string | null
          responded_at?: string | null
          show_date?: string | null
          status?: string | null
          updated_at?: string | null
          venue_id: string
        }
        Update: {
          additional_context?: string | null
          artist_id?: string
          artist_tier_at_time?: string | null
          booked_at?: string | null
          created_at?: string | null
          email_body?: string
          email_subject?: string
          gmail_draft_id?: string | null
          gmail_message_id?: string | null
          id?: string
          proposed_bill?: string | null
          proposed_dates?: string | null
          responded_at?: string | null
          show_date?: string | null
          status?: string | null
          updated_at?: string | null
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venue_applications_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venue_analytics_comprehensive"
            referencedColumns: ["venue_id"]
          },
          {
            foreignKeyName: "venue_applications_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      venue_likes: {
        Row: {
          created_at: string
          id: string
          user_id: string
          venue_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          venue_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venue_likes_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venue_analytics_comprehensive"
            referencedColumns: ["venue_id"]
          },
          {
            foreignKeyName: "venue_likes_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      venues: {
        Row: {
          address: string
          backline_details: string | null
          booking_contact_email: string
          booking_guidelines: string | null
          borough: string | null
          capacity: number | null
          city: string
          country: string | null
          created_at: string | null
          description: string | null
          dice_venue_url: string | null
          events_last_updated: string | null
          facebook_url: string | null
          featured: boolean | null
          gallery_images: string[] | null
          genres: string[] | null
          hero_image_url: string | null
          id: string
          instagram_handle: string | null
          is_active: boolean | null
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          name: string
          neighbourhood: string | null
          outreach_type: string | null
          requirements: Json | null
          slug: string
          spotify_venue_id: string | null
          state: string | null
          total_applications: number | null
          total_bookings_claimed: number | null
          typical_door_split: string | null
          typical_guarantee: string | null
          updated_at: string | null
          venue_notes: string | null
          venue_type: string | null
          website_url: string | null
          weekly_events: Json | null
          zip_code: string | null
        }
        Insert: {
          address: string
          backline_details?: string | null
          booking_contact_email: string
          booking_guidelines?: string | null
          borough?: string | null
          capacity?: number | null
          city: string
          country?: string | null
          created_at?: string | null
          description?: string | null
          dice_venue_url?: string | null
          events_last_updated?: string | null
          facebook_url?: string | null
          featured?: boolean | null
          gallery_images?: string[] | null
          genres?: string[] | null
          hero_image_url?: string | null
          id?: string
          instagram_handle?: string | null
          is_active?: boolean | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name: string
          neighbourhood?: string | null
          outreach_type?: string | null
          requirements?: Json | null
          slug: string
          spotify_venue_id?: string | null
          state?: string | null
          total_applications?: number | null
          total_bookings_claimed?: number | null
          typical_door_split?: string | null
          typical_guarantee?: string | null
          updated_at?: string | null
          venue_notes?: string | null
          venue_type?: string | null
          website_url?: string | null
          weekly_events?: Json | null
          zip_code?: string | null
        }
        Update: {
          address?: string
          backline_details?: string | null
          booking_contact_email?: string
          booking_guidelines?: string | null
          borough?: string | null
          capacity?: number | null
          city?: string
          country?: string | null
          created_at?: string | null
          description?: string | null
          dice_venue_url?: string | null
          events_last_updated?: string | null
          facebook_url?: string | null
          featured?: boolean | null
          gallery_images?: string[] | null
          genres?: string[] | null
          hero_image_url?: string | null
          id?: string
          instagram_handle?: string | null
          is_active?: boolean | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name?: string
          neighbourhood?: string | null
          outreach_type?: string | null
          requirements?: Json | null
          slug?: string
          spotify_venue_id?: string | null
          state?: string | null
          total_applications?: number | null
          total_bookings_claimed?: number | null
          typical_door_split?: string | null
          typical_guarantee?: string | null
          updated_at?: string | null
          venue_notes?: string | null
          venue_type?: string | null
          website_url?: string | null
          weekly_events?: Json | null
          zip_code?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      artist_analytics: {
        Row: {
          applications_remaining_this_month: number | null
          applications_this_month: number | null
          artist_id: string | null
          artist_location: string | null
          artist_name: string | null
          booking_success_rate_percent: number | null
          current_tier: string | null
          days_active: number | null
          first_application_date: string | null
          genre: string | null
          last_application_date: string | null
          monthly_revenue_from_artist: number | null
          most_applied_city: string | null
          pending_responses: number | null
          preferred_venue_type: string | null
          subscription_start_date: string | null
          subscription_status: string | null
          total_applications: number | null
          total_bookings: number | null
          total_rejections: number | null
        }
        Relationships: []
      }
      platform_analytics: {
        Row: {
          active_artists_last_30_days: number | null
          active_venues: number | null
          applications_last_30_days: number | null
          applications_last_7_days: number | null
          applications_today: number | null
          artists_with_bookings: number | null
          avg_applications_per_artist: number | null
          bookings_last_30_days: number | null
          featured_venues: number | null
          max_applications_by_single_artist: number | null
          most_popular_application_day: number | null
          most_popular_application_hour: number | null
          most_popular_venue_city: string | null
          mrr_from_elite: number | null
          mrr_from_pro: number | null
          new_users_last_30_days: number | null
          new_users_last_7_days: number | null
          platform_conversion_rate_percent: number | null
          total_active_artists: number | null
          total_applications_all_time: number | null
          total_bookings_all_time: number | null
          total_mrr: number | null
          total_venues: number | null
          users_on_elite: number | null
          users_on_free: number | null
          users_on_pro: number | null
          venues_with_applications: number | null
        }
        Relationships: []
      }
      venue_analytics_comprehensive: {
        Row: {
          applications_awaiting: number | null
          applications_booked: number | null
          applications_from_elite_tier: number | null
          applications_from_free_tier: number | null
          applications_from_pro_tier: number | null
          applications_last_30_days: number | null
          applications_last_90_days: number | null
          applications_passed: number | null
          applications_sent: number | null
          avg_booking_lead_time_days: number | null
          avg_response_time_days: number | null
          booking_conversion_rate_percent: number | null
          bookings_last_30_days: number | null
          bookings_last_90_days: number | null
          borough: string | null
          capacity: number | null
          city: string | null
          featured: boolean | null
          first_application_date: string | null
          first_booking_date: string | null
          genres: string[] | null
          is_active: boolean | null
          last_application_date: string | null
          last_booking_date: string | null
          neighbourhood: string | null
          popularity_score: number | null
          state: string | null
          total_applications: number | null
          unique_artists_applied: number | null
          unique_artists_booked: number | null
          upcoming_shows_count: number | null
          venue_added_date: string | null
          venue_id: string | null
          venue_name: string | null
          venue_type: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_apply_to_venue: {
        Args: { p_artist_id: string; p_venue_id: string }
        Returns: boolean
      }
      generate_url_slug: { Args: { artist_name: string }; Returns: string }
      get_public_artist_profile:
        | {
            Args: { profile_id: string }
            Returns: {
              artist_name: string
              bio: string
              created_at: string
              gallery_photos: string[]
              genre: string
              hero_photo_url: string
              id: string
              past_shows: Json
              playlists: string[]
              press_mentions: Json
              press_photos: string[]
              press_quotes: Json
              profile_photo_url: string
              show_videos: string[]
              social_links: Json
              streaming_links: Json
              upcoming_shows: Json
              updated_at: string
            }[]
          }
        | {
            Args: { profile_identifier: string }
            Returns: {
              artist_name: string
              bio: string
              contact_info: Json
              created_at: string
              gallery_photos: string[]
              genre: string
              hero_photo_url: string
              id: string
              is_published: boolean
              past_shows: Json
              playlists: string[]
              press_mentions: Json
              press_photos: string[]
              press_quotes: Json
              profile_photo_url: string
              show_videos: string[]
              social_links: Json
              streaming_links: Json
              upcoming_shows: Json
              updated_at: string
              url_slug: string
            }[]
          }
      is_profile_published_by_user_id: {
        Args: { profile_user_id: string }
        Returns: boolean
      }
      trigger_venue_events_update: { Args: never; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
