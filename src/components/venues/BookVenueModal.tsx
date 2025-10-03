import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { CheckCircle2, Loader2, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import EmailPreviewSection from "./EmailPreviewSection";

interface BookVenueModalProps {
  isOpen: boolean;
  onClose: () => void;
  venue: any;
  artistProfile: any;
}

interface SubscriptionData {
  tier_name: string;
  monthly_application_limit: number | null;
  applications_this_period: number;
  cooldown_days: number;
}

export default function BookVenueModal({ isOpen, onClose, venue, artistProfile }: BookVenueModalProps) {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [canApply, setCanApply] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [generatedEmail, setGeneratedEmail] = useState<{ subject: string; body: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      fetchSubscriptionData();
      checkApplicationStatus();
    }
  }, [isOpen]);

  const fetchSubscriptionData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: subData, error: subError } = await (supabase as any)
        .from('user_subscriptions')
        .select('applications_this_period, tier_id')
        .eq('user_id', user.id)
        .single();

      if (subError) throw subError;

      const { data: tierData, error: tierError } = await (supabase as any)
        .from('subscription_tiers')
        .select('tier_name, monthly_application_limit, cooldown_days')
        .eq('id', subData.tier_id)
        .single();

      if (tierError) throw tierError;

      setSubscription({
        tier_name: tierData.tier_name,
        monthly_application_limit: tierData.monthly_application_limit,
        applications_this_period: subData.applications_this_period,
        cooldown_days: tierData.cooldown_days,
      });
    } catch (error) {
      console.error('Error fetching subscription:', error);
      toast({
        title: "Error",
        description: "Failed to load subscription data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkApplicationStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await (supabase as any)
        .from('venue_applications')
        .select('created_at')
        .eq('artist_id', user.id)
        .eq('venue_id', venue.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        const daysSinceApplication = Math.floor(
          (Date.now() - new Date(data.created_at).getTime()) / (1000 * 60 * 60 * 24)
        );
        const cooldownDays = subscription?.cooldown_days || 60;

        if (daysSinceApplication < cooldownDays) {
          const daysRemaining = cooldownDays - daysSinceApplication;
          setApplicationStatus(`You applied to this venue ${daysSinceApplication} days ago. Try again in ${daysRemaining} days.`);
          setCanApply(false);
          return;
        }
      }

      // Check monthly limit for pro tier
      if (subscription?.tier_name === 'pro') {
        if (subscription.applications_this_period >= (subscription.monthly_application_limit || 10)) {
          setApplicationStatus('Monthly application limit reached. Upgrade to Elite for unlimited applications.');
          setCanApply(false);
          return;
        }
      }

      setCanApply(true);
      setApplicationStatus(null);
    } catch (error) {
      console.error('Error checking application status:', error);
    }
  };

  const handleGenerateEmail = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-venue-email', {
        body: {
          artist_name: artistProfile.artist_name,
          artist_bio: artistProfile.bio || '',
          artist_genre: artistProfile.genre || '',
          artist_location: artistProfile.location || '',
          performance_type: artistProfile.performance_type || '',
          past_shows: artistProfile.past_shows || [],
          venue_name: venue.name,
          venue_city: venue.city,
          venue_genres: venue.genres || [],
          venue_requirements: venue.requirements || {},
          venue_booking_guidelines: venue.booking_guidelines || '',
          artist_epk_url: `${window.location.origin}/artist/${artistProfile.url_slug}`,
        },
      });

      if (error) throw error;

      setGeneratedEmail(data);
      toast({
        title: "Email Generated!",
        description: "Your personalized pitch is ready to review.",
      });
    } catch (error) {
      console.error('Error generating email:', error);
      toast({
        title: "Error",
        description: "Failed to generate email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleMarkAsSent = async (editedEmailBody: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !generatedEmail) return;

      // Double-check monthly limit before proceeding
      if (subscription?.tier_name === 'pro') {
        if (subscription.applications_this_period >= (subscription.monthly_application_limit || 10)) {
          toast({
            title: "Monthly Limit Reached",
            description: "You've reached your monthly application limit. Upgrade to Elite for unlimited applications.",
            variant: "destructive",
          });
          throw new Error("Monthly limit reached");
        }
      }

      // 1. Create venue application record
      const { error: applicationError } = await (supabase as any)
        .from('venue_applications')
        .insert({
          artist_id: user.id,
          venue_id: venue.id,
          email_subject: generatedEmail.subject,
          email_body: editedEmailBody,
          status: 'sent',
          artist_tier_at_time: subscription?.tier_name,
        });

      if (applicationError) throw applicationError;

      // 2. Increment user's applications_this_period
      const { error: subscriptionError } = await (supabase as any)
        .from('user_subscriptions')
        .update({ 
          applications_this_period: (subscription?.applications_this_period || 0) + 1 
        })
        .eq('user_id', user.id);

      if (subscriptionError) throw subscriptionError;

      // 3. Increment venue's total_applications
      const { error: venueError } = await (supabase as any)
        .from('venues')
        .update({ 
          total_applications: (venue.total_applications || 0) + 1 
        })
        .eq('id', venue.id);

      if (venueError) throw venueError;

      // Success!
      toast({
        title: "Application Sent!",
        description: "We're tracking this in your outreach dashboard.",
      });

      toast({
        title: "Cooldown Active",
        description: `You can apply to ${venue.name} again in ${subscription?.cooldown_days || 60} days.`,
      });

      onClose();
      navigate('/venues/outreach');
    } catch (error) {
      console.error('Error marking as sent:', error);
      toast({
        title: "Error",
        description: "Failed to save application. Please try again.",
        variant: "destructive",
      });
      throw error; // Re-throw to prevent dialog from closing
    }
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 text-white border-gray-800">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Free tier upgrade prompt
  if (subscription?.tier_name === 'free') {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl bg-gray-900 text-white border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-2xl">Unlock Venue Bookings</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <p className="text-gray-400">
              Upgrade your plan to start applying to venues and getting booked.
            </p>

            <div className="grid md:grid-cols-3 gap-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg">Free</CardTitle>
                  <div className="text-2xl font-bold text-gray-400">$0</div>
                </CardHeader>
                <CardContent>
                  <div className="text-gray-400 mb-4">0 applications/month</div>
                  <Badge variant="outline" className="bg-gray-700 text-gray-400">Current Plan</Badge>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-primary">
                <CardHeader>
                  <CardTitle className="text-lg">Pro</CardTitle>
                  <div className="text-2xl font-bold">$9.99<span className="text-sm text-gray-400">/mo</span></div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">10 applications/month</div>
                  <div className="text-sm text-gray-400">30-day cooldown per venue</div>
                  <Button 
                    className="w-full" 
                    disabled
                    title="Payment integration coming soon"
                  >
                    Upgrade to Pro
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-purple-500">
                <CardHeader>
                  <CardTitle className="text-lg">Elite</CardTitle>
                  <div className="text-2xl font-bold">$29.99<span className="text-sm text-gray-400">/mo</span></div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">Unlimited applications</div>
                  <div className="text-sm text-gray-400">14-day cooldown per venue</div>
                  <Button 
                    variant="secondary"
                    className="w-full" 
                    disabled
                    title="Payment integration coming soon"
                  >
                    Upgrade to Elite
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Pro/Elite tier - show booking interface
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gray-900 text-white border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-2xl">Book {venue.name}</DialogTitle>
        </DialogHeader>

        {!generatedEmail ? (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Section 1: Your EPK Data */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Your EPK Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="font-semibold text-lg">{artistProfile.artist_name}</div>
                  <div className="text-sm text-gray-400">{artistProfile.genre}</div>
                  {artistProfile.location && (
                    <div className="text-sm text-gray-400">{artistProfile.location}</div>
                  )}
                </div>

                {artistProfile.bio && (
                  <div>
                    <div className="text-sm text-gray-300">
                      {artistProfile.bio.slice(0, 200)}
                      {artistProfile.bio.length > 200 && '...'}
                    </div>
                    {artistProfile.bio.length > 200 && (
                      <Button
                        variant="link"
                        className="p-0 h-auto text-primary"
                        onClick={() => navigate('/dashboard')}
                      >
                        Read full bio
                      </Button>
                    )}
                  </div>
                )}

                {artistProfile.past_shows && artistProfile.past_shows.length > 0 && (
                  <div>
                    <div className="text-sm font-semibold mb-2">Recent Shows:</div>
                    <ul className="space-y-1 text-sm text-gray-400">
                      {artistProfile.past_shows.slice(0, 3).map((show: any, idx: number) => (
                        <li key={idx}>
                          {show.venue_name} - {show.city}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/dashboard')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Edit EPK
                </Button>
              </CardContent>
            </Card>

            {/* Section 2: Venue Requirements */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Venue Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {venue.requirements && Object.keys(venue.requirements).length > 0 && (
                  <div>
                    <div className="text-sm font-semibold mb-2">What to include:</div>
                    <ul className="space-y-2">
                      {Object.entries(venue.requirements).map(([key, value]) => (
                        <li key={key} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300">{String(value)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {venue.booking_guidelines && (
                  <Card className="bg-gray-700 border-gray-600">
                    <CardHeader>
                      <CardTitle className="text-sm">Booking Guidelines</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-300">{venue.booking_guidelines}</p>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            {/* Section 3: Generate Your Pitch */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Generate Your Pitch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {applicationStatus && (
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm text-yellow-300">
                    {applicationStatus}
                  </div>
                )}

                {canApply && (
                  <>
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleGenerateEmail}
                      disabled={generating}
                    >
                      {generating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Crafting your personalized pitch...
                        </>
                      ) : (
                        'Generate Email'
                      )}
                    </Button>

                    <p className="text-xs text-gray-400">
                      This email will be uniquely tailored to {venue.name} based on their booking preferences and your EPK.
                    </p>
                  </>
                )}

                {subscription && (
                  <div className="pt-4 border-t border-gray-700 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Your Plan:</span>
                      <Badge variant="outline" className="capitalize">
                        {subscription.tier_name}
                      </Badge>
                    </div>
                    {subscription.monthly_application_limit && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Applications Used:</span>
                        <span>{subscription.applications_this_period} / {subscription.monthly_application_limit}</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <EmailPreviewSection
            emailSubject={generatedEmail.subject}
            emailBody={generatedEmail.body}
            venueEmail={venue.booking_contact_email}
            onRegenerate={handleGenerateEmail}
            onMarkAsSent={handleMarkAsSent}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
