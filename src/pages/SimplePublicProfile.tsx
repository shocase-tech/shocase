import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface SimpleProfile {
  id: string;
  artist_name: string;
  bio: string | null;
  genre: string | null;
  profile_photo_url: string | null;
  hero_photo_url: string | null;
  social_links: any;
  is_published: boolean;
}

export default function SimplePublicProfile() {
  const { identifier } = useParams<{ identifier: string }>();
  const [profile, setProfile] = useState<SimpleProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!identifier) {
        setError("No profile identifier provided");
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching profile for identifier:", identifier);
        
        const { data, error: queryError } = await supabase
          .from('artist_profiles')
          .select('*')
          .eq('is_published', true)
          .or(`url_slug.eq.${identifier},id.eq.${identifier}`)
          .maybeSingle();

        console.log("Query result:", { data, error: queryError });

        if (queryError) {
          console.error("Database error:", queryError);
          setError("Database error occurred");
          setLoading(false);
          return;
        }

        if (!data) {
          console.log("No profile found");
          setError("Profile not found or not published");
          setLoading(false);
          return;
        }

        console.log("Profile found successfully:", data);
        setProfile(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile");
        setLoading(false);
      }
    };

    fetchProfile();
  }, [identifier]);

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h1>Profile Not Available</h1>
        <p>{error || "Profile not found"}</p>
      </div>
    );
  }

  const socialLinks = profile.social_links || {};

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      {/* Header */}
      <header style={{ textAlign: "center", marginBottom: "40px" }}>
        {profile.hero_photo_url && (
          <div style={{ marginBottom: "20px" }}>
            <img 
              src={profile.hero_photo_url}
              alt="Hero"
              style={{ width: "100%", maxHeight: "300px", objectFit: "cover" }}
            />
          </div>
        )}
        
        {profile.profile_photo_url && (
          <div style={{ marginBottom: "20px" }}>
            <img 
              src={profile.profile_photo_url}
              alt={profile.artist_name}
              style={{ width: "150px", height: "150px", borderRadius: "50%", objectFit: "cover" }}
            />
          </div>
        )}
        
        <h1 style={{ fontSize: "2.5rem", marginBottom: "10px" }}>{profile.artist_name}</h1>
        
        {profile.genre && (
          <p style={{ 
            display: "inline-block", 
            background: "#f0f0f0", 
            padding: "5px 15px", 
            borderRadius: "20px",
            margin: "10px 0"
          }}>
            {profile.genre}
          </p>
        )}
      </header>

      {/* Bio Section */}
      {profile.bio && (
        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "1.8rem", marginBottom: "15px" }}>Biography</h2>
          <p style={{ lineHeight: "1.6", fontSize: "1.1rem" }}>{profile.bio}</p>
        </section>
      )}

      {/* Social Links */}
      {(socialLinks.website || socialLinks.instagram || socialLinks.spotify) && (
        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "1.8rem", marginBottom: "15px" }}>Connect</h2>
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            {socialLinks.website && (
              <a 
                href={socialLinks.website}
                target="_blank"
                rel="noopener noreferrer"
                style={{ 
                  padding: "10px 20px", 
                  background: "#007bff", 
                  color: "white", 
                  textDecoration: "none",
                  borderRadius: "5px"
                }}
              >
                Website
              </a>
            )}
            {socialLinks.instagram && (
              <a 
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                style={{ 
                  padding: "10px 20px", 
                  background: "#E4405F", 
                  color: "white", 
                  textDecoration: "none",
                  borderRadius: "5px"
                }}
              >
                Instagram
              </a>
            )}
            {socialLinks.spotify && (
              <a 
                href={socialLinks.spotify}
                target="_blank"
                rel="noopener noreferrer"
                style={{ 
                  padding: "10px 20px", 
                  background: "#1DB954", 
                  color: "white", 
                  textDecoration: "none",
                  borderRadius: "5px"
                }}
              >
                Spotify
              </a>
            )}
          </div>
        </section>
      )}

      {/* Debug Info */}
      <details style={{ marginTop: "40px", padding: "20px", background: "#f5f5f5" }}>
        <summary style={{ cursor: "pointer", marginBottom: "10px" }}>Debug Info</summary>
        <pre style={{ overflow: "auto", fontSize: "12px" }}>
          {JSON.stringify(profile, null, 2)}
        </pre>
      </details>
    </div>
  );
}