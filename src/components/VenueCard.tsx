import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface VenueCardProps {
  venue: {
    id: string;
    name: string;
    slug: string;
    city: string;
    state: string;
    capacity: number | null;
    genres: string[] | null;
    hero_image_url: string | null;
    venue_type: string | null;
    neighbourhood: string | null;
  };
}

const VenueCard = ({ venue }: VenueCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userTier, setUserTier] = useState<string | null>(null);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  const displayGenres = venue.genres?.slice(0, 3) || [];
  const remainingGenres = (venue.genres?.length || 0) - 3;

  useEffect(() => {
    checkUserTier();
  }, []);

  const checkUserTier = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setUserTier("none");
        setLoading(false);
        return;
      }

      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('tier_id, subscription_tiers(tier_name)')
        .eq('user_id', user.id)
        .single();

      if (subscription?.subscription_tiers) {
        const tierName = (subscription.subscription_tiers as any).tier_name;
        setUserTier(tierName);
      }
    } catch (error) {
      console.error("Error checking user tier:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = () => {
    if (loading) return;
    
    if (!userTier || userTier === "none" || userTier === "free") {
      setShowUpgradeDialog(true);
      return;
    }

    navigate(`/venues/${venue.slug}`);
  };

  return (
    <Card className="bg-gray-900 border-gray-800 overflow-hidden hover:border-gray-700 transition-all group">
      {/* Hero Image */}
      <div className="relative aspect-video overflow-hidden">
        {venue.hero_image_url ? (
          <img
            src={venue.hero_image_url}
            alt={venue.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <MapPin className="h-12 w-12 text-gray-600" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
        
        {/* Venue Type Badge */}
        {venue.venue_type && (
          <Badge className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white">
            {venue.venue_type}
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Name */}
        <h3 className="text-xl font-bold text-white line-clamp-1">
          {venue.name}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1 text-gray-400 text-sm">
          <MapPin className="h-4 w-4" />
          <span>
            {venue.neighbourhood ? `${venue.neighbourhood}, ` : ""}
            {venue.city}, {venue.state}
          </span>
        </div>

        {/* Capacity */}
        {venue.capacity && (
          <div className="flex items-center gap-1 text-gray-400 text-sm">
            <Users className="h-4 w-4" />
            <span>Capacity: {venue.capacity}</span>
          </div>
        )}

        {/* Genres */}
        {displayGenres.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {displayGenres.map(genre => (
              <Badge key={genre} variant="outline" className="text-xs border-gray-700">
                {genre}
              </Badge>
            ))}
            {remainingGenres > 0 && (
              <Badge variant="outline" className="text-xs border-gray-700">
                +{remainingGenres} more
              </Badge>
            )}
          </div>
        )}

        {/* View Details Button */}
        <Button
          onClick={handleViewDetails}
          className="w-full"
          variant="secondary"
          disabled={loading}
        >
          {(!userTier || userTier === "none" || userTier === "free") ? (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Upgrade to View
            </>
          ) : (
            "View Details"
          )}
        </Button>
      </div>

      {/* Upgrade Dialog */}
      <AlertDialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Upgrade Required</AlertDialogTitle>
            <AlertDialogDescription>
              You need a Pro or Elite subscription to view venue details and apply to venues.
              Upgrade now to unlock full access to all venues and features.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => navigate("/account-settings")}>
              View Subscription Plans
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default VenueCard;
