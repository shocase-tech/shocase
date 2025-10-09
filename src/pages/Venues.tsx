import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Users, X, Navigation } from "lucide-react";
import VenueCard from "@/components/VenueCard";
import AppHeader from "@/components/AppHeader";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
interface Venue {
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
  latitude: number | null;
  longitude: number | null;
}
const Venues = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [capacityRange, setCapacityRange] = useState<number[]>([0, 1000]);
  const [sortBy, setSortBy] = useState<string>("name-asc");
  const [genreDropdownOpen, setGenreDropdownOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [sortByProximity, setSortByProximity] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    fetchVenues();
  }, []);
  const fetchVenues = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from("venues" as any).select("id, name, slug, city, state, capacity, genres, hero_image_url, venue_type, neighbourhood, latitude, longitude").eq("is_active", true).order("name");
      if (error) throw error;
      setVenues((data || []) as unknown as Venue[]);
    } catch (error) {
      console.error("Error fetching venues:", error);
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support location services",
        variant: "destructive",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setSortByProximity(true);
        setSortBy("proximity");
        toast({
          title: "Location found",
          description: "Showing venues sorted by distance",
        });
      },
      (error) => {
        toast({
          title: "Location access denied",
          description: "Please enable location access to use this feature",
          variant: "destructive",
        });
      }
    );
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };
  const allCities = useMemo(() => {
    const cities = new Set(venues.map(v => v.city));
    return Array.from(cities).sort();
  }, [venues]);
  const allGenres = useMemo(() => {
    const genres = new Set<string>();
    venues.forEach(v => v.genres?.forEach(g => genres.add(g)));
    return Array.from(genres).sort();
  }, [venues]);
  const filteredAndSortedVenues = useMemo(() => {
    let filtered = venues.filter(venue => {
      const matchesSearch = venue.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCity = selectedCity === "all" || venue.city === selectedCity;
      const matchesGenres = selectedGenres.length === 0 || venue.genres && venue.genres.some(g => selectedGenres.includes(g));
      const matchesCapacity = !venue.capacity || venue.capacity >= capacityRange[0] && venue.capacity <= capacityRange[1];
      return matchesSearch && matchesCity && matchesGenres && matchesCapacity;
    });
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "capacity-asc":
          return (a.capacity || 0) - (b.capacity || 0);
        case "capacity-desc":
          return (b.capacity || 0) - (a.capacity || 0);
        case "proximity":
          if (!userLocation) return 0;
          const distA = a.latitude && a.longitude 
            ? calculateDistance(userLocation.lat, userLocation.lng, a.latitude, a.longitude)
            : Infinity;
          const distB = b.latitude && b.longitude
            ? calculateDistance(userLocation.lat, userLocation.lng, b.latitude, b.longitude)
            : Infinity;
          return distA - distB;
        default:
          return 0;
      }
    });
    return filtered;
  }, [venues, searchQuery, selectedCity, selectedGenres, capacityRange, sortBy, userLocation]);
  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]);
  };
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCity("all");
    setSelectedGenres([]);
    setCapacityRange([0, 1000]);
    setSortBy("name-asc");
    setSortByProximity(false);
    setUserLocation(null);
  };
  return <>
      <Helmet>
        <title>Find Venues - SHOCASE</title>
        <meta name="description" content="Discover and connect with live music venues. Browse by location, capacity, and genre." />
      </Helmet>
      
      <AppHeader />

      <div className="min-h-screen bg-gray-950 pt-16">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-white mb-2">Find Your Next Venue</h1>
            <p className="text-gray-400">Discover the perfect New York City stage for your music</p>
          </div>

          {/* Filters */}
          <div className="bg-gray-900 rounded-lg p-6 mb-8 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search venues..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 bg-gray-800 border-gray-700 text-white" />
            </div>

            {/* Filter Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* City */}
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <MapPin className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Boroughs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Boroughs</SelectItem>
                  {allCities.map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                </SelectContent>
              </Select>

              {/* Genre */}
              <div className="relative">
                <Button variant="outline" className="w-full justify-start bg-gray-800 border-gray-700 text-white hover:bg-gray-700" onClick={() => setGenreDropdownOpen(!genreDropdownOpen)}>
                  Genres {selectedGenres.length > 0 && `(${selectedGenres.length})`}
                </Button>
                {genreDropdownOpen && allGenres.length > 0 && <div className="absolute top-full mt-2 w-full bg-gray-800 border border-gray-700 rounded-lg p-3 z-10 max-h-64 overflow-y-auto">
                    <div className="flex flex-wrap gap-2">
                      {allGenres.map(genre => <Badge key={genre} variant={selectedGenres.includes(genre) ? "default" : "outline"} className="cursor-pointer" onClick={() => toggleGenre(genre)}>
                          {genre}
                        </Badge>)}
                    </div>
                  </div>}
              </div>

              {/* Proximity */}
              <Button 
                variant="outline" 
                className={`w-full justify-start ${sortByProximity ? 'bg-primary/20 border-primary' : 'bg-gray-800 border-gray-700'} text-white hover:bg-gray-700`}
                onClick={getUserLocation}
              >
                <Navigation className="h-4 w-4 mr-2" />
                Near Me {sortByProximity && '✓'}
              </Button>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="capacity-asc">Capacity (Low-High)</SelectItem>
                  <SelectItem value="capacity-desc">Capacity (High-Low)</SelectItem>
                  {userLocation && <SelectItem value="proximity">Distance</SelectItem>}
                </SelectContent>
              </Select>
            </div>

            {/* Capacity Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Capacity Range
                </span>
                <span>{capacityRange[0]} - {capacityRange[1]}</span>
              </div>
              <Slider min={0} max={1000} step={50} value={capacityRange} onValueChange={setCapacityRange} className="w-full" />
            </div>

            {/* Selected Genres */}
            {selectedGenres.length > 0 && <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-800">
                {selectedGenres.map(genre => <Badge key={genre} variant="secondary" className="gap-1">
                    {genre}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => toggleGenre(genre)} />
                  </Badge>)}
              </div>}

            {/* Reset Button */}
            {(searchQuery || selectedCity !== "all" || selectedGenres.length > 0) && <Button variant="ghost" size="sm" onClick={resetFilters} className="text-gray-400 hover:text-white">
                Reset Filters
              </Button>}
          </div>

          {/* Results */}
          {loading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="space-y-3">
                  <Skeleton className="w-full aspect-video rounded-lg" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>)}
            </div> : filteredAndSortedVenues.length === 0 ? <div className="text-center py-16">
              <p className="text-gray-400 text-lg mb-4">No venues match your filters</p>
              <Button onClick={resetFilters} variant="outline">
                Reset Filters
              </Button>
            </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedVenues.map(venue => <VenueCard key={venue.id} venue={venue} />)}
            </div>}
        </div>
      </div>
    </>;
};
export default Venues;