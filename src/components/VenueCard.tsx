import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Users } from "lucide-react";

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

  const displayGenres = venue.genres?.slice(0, 3) || [];
  const remainingGenres = (venue.genres?.length || 0) - 3;

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
          onClick={() => navigate(`/venues/${venue.slug}`)}
          className="w-full"
          variant="secondary"
        >
          View Details
        </Button>
      </div>
    </Card>
  );
};

export default VenueCard;
