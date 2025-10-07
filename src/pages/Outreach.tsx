import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Search,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  Mail,
  CheckCircle,
  FileText,
  Calendar,
  Plus,
  X,
  Info,
  Loader2,
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import AppHeader from "@/components/AppHeader";
import BookShowModal from "@/components/venues/BookShowModal";
import BookVenueModal from "@/components/venues/BookVenueModal";

interface ApplicationWithVenue {
  id: string;
  artist_id: string;
  venue_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  proposed_dates: string | null;
  proposed_bill: string | null;
  additional_context: string | null;
  email_subject: string | null;
  email_body: string | null;
  show_date: string | null;
  booked_at: string | null;
  venue: {
    id: string;
    name: string;
    slug: string;
    city: string;
    state: string;
  };
}

export default function Outreach() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<ApplicationWithVenue[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<ApplicationWithVenue[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "venue-az">("newest");
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "all");
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [bookShowModal, setBookShowModal] = useState<{
    isOpen: boolean;
    application: any;
    venue: any;
  }>({ isOpen: false, application: null, venue: null });
  const [editDraftModal, setEditDraftModal] = useState<{
    isOpen: boolean;
    venue: any;
  }>({ isOpen: false, venue: null });
  const [artistProfile, setArtistProfile] = useState<any>(null);
  const [outreachComponents, setOutreachComponents] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  
  // Settings state
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | null>(null);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      await fetchArtistProfile(session.user.id);
      await fetchOutreachComponents(session.user.id);
      await fetchApplications(session.user.id);
    };

    checkAuth();

    // Set up real-time subscription
    const channel = supabase
      .channel("venue_applications_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "venue_applications",
        },
        () => {
          if (user) fetchApplications(user.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate]);

  const fetchArtistProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("artist_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;
      setArtistProfile(data);
    } catch (error) {
      console.error("Error fetching artist profile:", error);
    }
  };

  const fetchOutreachComponents = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("outreach_components")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;
      
      if (data) {
        setOutreachComponents(data);
      } else {
        // Create empty record
        const { data: newData, error: insertError } = await supabase
          .from("outreach_components")
          .insert({
            user_id: userId,
            expected_draw: "",
            social_proof: "",
            notable_achievements: [],
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setOutreachComponents(newData);
      }
    } catch (error) {
      console.error("Error fetching outreach components:", error);
    }
  };

  const fetchApplications = async (userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("venue_applications")
        .select(
          `
          *,
          venue:venues!inner (
            id,
            name,
            slug,
            city,
            state
          )
        `
        )
        .eq("artist_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedData = (data || []).map((app: any) => ({
        ...app,
        venue: Array.isArray(app.venue) ? app.venue[0] : app.venue,
      }));

      setApplications(formattedData);
      setFilteredApplications(formattedData);
    } catch (error: any) {
      console.error("Error fetching applications:", error);
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...applications];

    // Filter by tab
    if (activeTab === "drafts") {
      filtered = filtered.filter(
        (app) =>
          app.status === "draft" ||
          app.email_body?.includes("Placeholder") ||
          !app.email_body
      );
    } else if (activeTab !== "all") {
      filtered = filtered.filter((app) => app.status === activeTab);
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter((app) =>
        app.venue.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    if (sortBy === "newest") {
      filtered.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else if (sortBy === "oldest") {
      filtered.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    } else if (sortBy === "venue-az") {
      filtered.sort((a, b) => a.venue.name.localeCompare(b.venue.name));
    }

    setFilteredApplications(filtered);
  }, [applications, activeTab, searchQuery, sortBy]);

  const getStats = () => {
    const total = applications.length;
    const drafts = applications.filter(
      (app) =>
        app.status === "draft" ||
        app.email_body?.includes("Placeholder") ||
        !app.email_body
    ).length;
    const booked = applications.filter((app) => app.status === "booked").length;

    return { total, drafts, booked };
  };

  const getStatusBadge = (status: string, emailBody?: string | null) => {
    const isDraft =
      status === "draft" || emailBody?.includes("Placeholder") || !emailBody;

    if (isDraft) {
      return (
        <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
          Draft
        </Badge>
      );
    }

    const statusConfig: Record<string, { label: string; className: string }> = {
      sent: {
        label: "Sent",
        className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      },
      responded: {
        label: "Responded",
        className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      },
      booked: {
        label: "Booked",
        className: "bg-green-500/20 text-green-400 border-green-500/30",
      },
      declined: {
        label: "Declined",
        className: "bg-red-500/20 text-red-400 border-red-500/30",
      },
      passed: {
        label: "Passed",
        className: "bg-red-500/20 text-red-400 border-red-500/30",
      },
    };

    const config = statusConfig[status] || {
      label: status,
      className: "bg-muted text-muted-foreground",
    };

    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const triggerAutoSave = (updatedComponents: any) => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    setSaveStatus("saving");

    const timeout = setTimeout(() => {
      saveOutreachComponents(updatedComponents);
    }, 1000);

    setSaveTimeout(timeout);
  };

  const saveOutreachComponents = async (componentsToSave: any) => {
    if (!user) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from("outreach_components")
        .upsert({
          user_id: user.id,
          expected_draw: componentsToSave.expected_draw,
          social_proof: componentsToSave.social_proof,
          notable_achievements: componentsToSave.notable_achievements,
        }, {
          onConflict: "user_id",
        });

      if (error) throw error;

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to save: " + error.message,
        variant: "destructive",
      });
      setSaveStatus(null);
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    const updated = { ...outreachComponents, [field]: value };
    setOutreachComponents(updated);
    triggerAutoSave(updated);
  };

  const addAchievement = () => {
    if (!outreachComponents || outreachComponents.notable_achievements?.length >= 5) return;
    const updated = {
      ...outreachComponents,
      notable_achievements: [...(outreachComponents.notable_achievements || []), ""],
    };
    setOutreachComponents(updated);
  };

  const updateAchievement = (index: number, value: string) => {
    const updated = {
      ...outreachComponents,
      notable_achievements: outreachComponents.notable_achievements.map((a: string, i: number) =>
        i === index ? value : a
      ),
    };
    setOutreachComponents(updated);
    triggerAutoSave(updated);
  };

  const removeAchievement = (index: number) => {
    const updated = {
      ...outreachComponents,
      notable_achievements: outreachComponents.notable_achievements.filter((_: any, i: number) => i !== index),
    };
    setOutreachComponents(updated);
    triggerAutoSave(updated);
  };

  const getSectionBadge = (value: string | string[]) => {
    const isEmpty = Array.isArray(value) 
      ? value.length === 0 || value.every(v => !v.trim())
      : !value?.trim();

    return isEmpty ? (
      <Badge variant="secondary" className="bg-muted text-muted-foreground">
        Empty
      </Badge>
    ) : (
      <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30">
        Added ✓
      </Badge>
    );
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCards(newExpanded);
  };

  const handleUpdateStatus = async (applicationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("venue_applications")
        .update({ status: newStatus })
        .eq("id", applicationId);

      if (error) throw error;

      toast({
        title: "Status updated",
        description: `Application status changed to ${newStatus}`,
      });

      if (user) fetchApplications(user.id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update status: " + error.message,
        variant: "destructive",
      });
    }
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark">
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Outreach Tracker - Shocase</title>
        <meta name="description" content="Track your venue applications and bookings" />
      </Helmet>

      <AppHeader />

      <div className="min-h-screen bg-gradient-dark pb-20 pt-16">
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Outreach Tracker</h1>
            <p className="text-muted-foreground">
              Manage your venue applications and bookings
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-card/50 backdrop-blur border-white/10">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Applications</p>
                    <p className="text-3xl font-bold mt-1">{stats.total}</p>
                  </div>
                  <Mail className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-white/10">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Drafts in Progress</p>
                    <p className="text-3xl font-bold mt-1">{stats.drafts}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-white/10">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Shows Booked</p>
                    <p className="text-3xl font-bold mt-1">{stats.booked}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Sort */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="venue-az">Venue A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => {
            setActiveTab(value);
            setSearchParams(value !== "all" ? { tab: value } : {});
          }}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="drafts">Drafts</TabsTrigger>
              <TabsTrigger value="sent">Sent</TabsTrigger>
              <TabsTrigger value="booked">Booked</TabsTrigger>
              <TabsTrigger value="declined">Declined</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Applications Tabs */}
            {["all", "drafts", "sent", "booked", "declined"].includes(activeTab) && (
              <TabsContent value={activeTab}>
              {filteredApplications.length === 0 ? (
                <Card className="bg-card/50 backdrop-blur border-white/10">
                  <CardContent className="py-12 text-center">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {activeTab === "all" || activeTab === "drafts"
                        ? "No drafts yet"
                        : activeTab === "sent"
                        ? "No emails sent yet"
                        : activeTab === "booked"
                        ? "No bookings yet"
                        : "No declined applications"}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {activeTab === "all" || activeTab === "drafts"
                        ? "Browse venues to get started!"
                        : activeTab === "booked"
                        ? "Keep reaching out!"
                        : ""}
                    </p>
                    {(activeTab === "all" || activeTab === "drafts") && (
                      <Button onClick={() => navigate("/venues")}>
                        Browse Venues
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredApplications.map((app) => (
                    <Card
                      key={app.id}
                      className="bg-card/50 backdrop-blur border-white/10 hover:border-white/20 transition-colors"
                    >
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <button
                                onClick={() => navigate(`/venues/${app.venue.slug}`)}
                                className="font-semibold hover:text-primary transition-colors text-left"
                              >
                                {app.venue.name}
                              </button>
                              <p className="text-sm text-muted-foreground">
                                {app.venue.city}, {app.venue.state}
                              </p>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleUpdateStatus(app.id, "sent")
                                  }
                                >
                                  Mark as Sent
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleUpdateStatus(app.id, "booked")
                                  }
                                >
                                  Mark as Booked
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleUpdateStatus(app.id, "declined")
                                  }
                                >
                                  Mark as Declined
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <div className="flex items-center justify-between">
                            {getStatusBadge(app.status, app.email_body)}
                            <span className="text-xs text-muted-foreground">
                              {new Date(app.created_at).toLocaleDateString()}
                            </span>
                          </div>

                          {app.proposed_dates && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">
                                Proposed Dates
                              </p>
                              <p className="text-sm line-clamp-2">
                                {app.proposed_dates}
                              </p>
                            </div>
                          )}

                          <div className="flex flex-col gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleExpanded(app.id)}
                              className="w-full"
                            >
                              {expandedCards.has(app.id) ? (
                                <>
                                  <ChevronUp className="w-4 h-4 mr-2" />
                                  Hide Details
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-4 h-4 mr-2" />
                                  View Details
                                </>
                              )}
                            </Button>

                            {expandedCards.has(app.id) && (
                              <div className="space-y-3 pt-2 border-t border-white/10">
                                {app.proposed_bill && (
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-1">
                                      Proposed Bill
                                    </p>
                                    <p className="text-sm">{app.proposed_bill}</p>
                                  </div>
                                )}
                                {app.additional_context && (
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-1">
                                      Additional Context
                                    </p>
                                    <p className="text-sm">{app.additional_context}</p>
                                  </div>
                                )}
                                {app.email_subject && (
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-1">
                                      Email Subject
                                    </p>
                                    <p className="text-sm">{app.email_subject}</p>
                                  </div>
                                )}
                                {app.email_body &&
                                  !app.email_body.includes("Placeholder") && (
                                    <div>
                                      <p className="text-xs text-muted-foreground mb-1">
                                        Email Body
                                      </p>
                                      <p className="text-sm whitespace-pre-wrap">
                                        {app.email_body}
                                      </p>
                                    </div>
                                  )}
                              </div>
                            )}

                            {(app.status === "sent" || app.status === "responded") && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() =>
                                  setBookShowModal({
                                    isOpen: true,
                                    application: app,
                                    venue: app.venue,
                                  })
                                }
                                className="w-full"
                              >
                                Book Show
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            )}

            {/* Settings Tab */}
            <TabsContent value="settings">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Outreach Settings</h2>
                    <p className="text-muted-foreground">
                      Create reusable components to strengthen your venue applications
                    </p>
                  </div>
                  {saveStatus && (
                    <div className="flex items-center gap-2 text-sm">
                      {saveStatus === "saving" ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                          <span className="text-muted-foreground">Saving...</span>
                        </>
                      ) : (
                        <span className="text-green-400">Saved ✓</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Info Banner */}
                <Alert className="border-blue-500/30 bg-blue-500/10">
                  <Info className="w-4 h-4 text-blue-400" />
                  <AlertDescription className="text-blue-200">
                    These details strengthen your venue pitches but are optional. They'll be suggested when you apply to venues.
                  </AlertDescription>
                </Alert>

                {/* Expected Draw */}
                <Card className="bg-card/50 backdrop-blur border-white/10">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">Expected Draw</CardTitle>
                      {outreachComponents && getSectionBadge(outreachComponents.expected_draw || "")}
                    </div>
                    <CardDescription>
                      How many people typically attend your shows in this area?
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Example: 50-100 in Brooklyn venues"
                      value={outreachComponents?.expected_draw || ""}
                      onChange={(e) => {
                        if (e.target.value.length <= 200) {
                          handleFieldChange("expected_draw", e.target.value);
                        }
                      }}
                      maxLength={200}
                      rows={3}
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      {(outreachComponents?.expected_draw || "").length}/200 characters
                    </p>
                  </CardContent>
                </Card>

                {/* Social Proof */}
                <Card className="bg-card/50 backdrop-blur border-white/10">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">Social Proof</CardTitle>
                      {outreachComponents && getSectionBadge(outreachComponents.social_proof || "")}
                    </div>
                    <CardDescription>
                      Notable press mentions, blog features, or industry recognition
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Example: Featured in Brooklyn Vegan and Consequence"
                      value={outreachComponents?.social_proof || ""}
                      onChange={(e) => {
                        if (e.target.value.length <= 300) {
                          handleFieldChange("social_proof", e.target.value);
                        }
                      }}
                      maxLength={300}
                      rows={4}
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      {(outreachComponents?.social_proof || "").length}/300 characters
                    </p>
                  </CardContent>
                </Card>

                {/* Notable Achievements */}
                <Card className="bg-card/50 backdrop-blur border-white/10">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">Notable Achievements</CardTitle>
                      {outreachComponents && getSectionBadge(outreachComponents.notable_achievements || [])}
                    </div>
                    <CardDescription>
                      Sold-out shows, streaming milestones, awards (max 5)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {outreachComponents?.notable_achievements?.map((achievement: string, index: number) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder="Example: Sold out Baby's All Right (250 cap)"
                          value={achievement}
                          onChange={(e) => {
                            if (e.target.value.length <= 100) {
                              updateAchievement(index, e.target.value);
                            }
                          }}
                          maxLength={100}
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeAchievement(index)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}

                    {(!outreachComponents?.notable_achievements || outreachComponents.notable_achievements.length < 5) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addAchievement}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Achievement
                      </Button>
                    )}

                    {outreachComponents?.notable_achievements?.length >= 5 && (
                      <p className="text-xs text-muted-foreground text-center">
                        Maximum of 5 achievements reached
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Book Show Modal */}
      {bookShowModal.isOpen && (
        <BookShowModal
          isOpen={bookShowModal.isOpen}
          onClose={() =>
            setBookShowModal({ isOpen: false, application: null, venue: null })
          }
          application={bookShowModal.application}
          venue={bookShowModal.venue}
          artistProfile={artistProfile}
          onSuccess={() => {
            if (user) fetchApplications(user.id);
          }}
        />
      )}

      {/* Edit Draft Modal */}
      {editDraftModal.isOpen && (
        <BookVenueModal
          isOpen={editDraftModal.isOpen}
          onClose={() => setEditDraftModal({ isOpen: false, venue: null })}
          venue={editDraftModal.venue}
          artistProfile={artistProfile}
          outreachComponents={outreachComponents}
        />
      )}
    </>
  );
}
