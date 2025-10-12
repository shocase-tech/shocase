import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface EPKViewsCardProps {
  profileId: string;
}

export function EPKViewsCard({ profileId }: EPKViewsCardProps) {
  const [viewCount, setViewCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchViewCount = async () => {
      try {
        // Get views from last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { count, error } = await supabase
          .from('profile_views')
          .select('*', { count: 'exact', head: true })
          .eq('profile_id', profileId)
          .gte('viewed_at', thirtyDaysAgo.toISOString());

        if (error) {
          console.error("Error fetching view count:", error);
          setViewCount(0);
        } else {
          setViewCount(count || 0);
        }
      } catch (err) {
        console.error("Failed to fetch view count:", err);
        setViewCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchViewCount();
  }, [profileId]);

  if (loading) {
    return (
      <Card className="bg-card/50 backdrop-blur border-white/10">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">EPK Views (30d)</p>
            </div>
          </div>
          <div className="text-3xl font-bold animate-pulse">...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur border-white/10">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            <p className="text-sm text-muted-foreground">EPK Views (30d)</p>
          </div>
          {viewCount !== null && viewCount > 0 && (
            <TrendingUp className="h-4 w-4 text-green-400" />
          )}
        </div>
        <div className="text-3xl font-bold">{viewCount?.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground mt-1">
          {viewCount === 0 ? (
            "No views yet"
          ) : viewCount === 1 ? (
            "1 view this month"
          ) : (
            "views this month"
          )}
        </p>
      </CardContent>
    </Card>
  );
}
