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
      <Card className="glass-card border-glass">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">EPK Views (Last 30 Days)</CardTitle>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold animate-pulse">...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-glass">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">EPK Views (Last 30 Days)</CardTitle>
        <Eye className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{viewCount?.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground mt-1">
          {viewCount === 0 ? (
            "No views yet"
          ) : viewCount === 1 ? (
            "1 view in the last month"
          ) : (
            `${viewCount} views in the last month`
          )}
        </p>
        {viewCount !== null && viewCount > 0 && (
          <div className="flex items-center gap-1 mt-2 text-xs text-green-400">
            <TrendingUp className="h-3 w-3" />
            <span>Tracking active</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
