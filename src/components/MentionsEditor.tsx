import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import { Save, X, Plus, ExternalLink, Loader2, Quote } from "lucide-react";
import PressQuotesEditor from "@/components/PressQuotesEditor";

interface MentionsEditorProps {
  profile: any;
  user: User | null;
  onSave: () => void;
  onCancel: () => void;
}

interface PressMessage {
  url: string;
  title?: string;
  description?: string;
  publication?: string;
  favicon?: string;
  image?: string;
}

export default function MentionsEditor({ profile, user, onSave, onCancel }: MentionsEditorProps) {
  const [mentions, setMentions] = useState<PressMessage[]>([]);
  const [quotes, setQuotes] = useState<{text: string; source: string}[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingMetadata, setFetchingMetadata] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (profile?.press_mentions) {
      setMentions(profile.press_mentions);
    }
    if (profile?.press_quotes) {
      setQuotes(profile.press_quotes);
    }
  }, [profile]);

  const fetchUrlMetadata = async (url: string): Promise<Partial<PressMessage>> => {
    try {
      // Simple URL validation
      const urlObj = new URL(url);
      const domain = urlObj.hostname.replace('www.', '');
      
      // Try to fetch basic metadata
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      const html = data.contents;
      
      // Parse basic metadata
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i) ||
                       html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"[^>]*>/i);
      const imageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"[^>]*>/i);
      
      return {
        url,
        title: titleMatch ? titleMatch[1].trim() : domain,
        description: descMatch ? descMatch[1].trim() : '',
        publication: domain,
        favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=16`,
        image: imageMatch ? imageMatch[1] : undefined
      };
    } catch (error) {
      console.error('Error fetching metadata:', error);
      const domain = new URL(url).hostname.replace('www.', '');
      return {
        url,
        title: domain,
        publication: domain,
        favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=16`
      };
    }
  };

  const handleAddMention = async () => {
    if (!newUrl.trim()) return;

    try {
      setFetchingMetadata(true);
      
      // Validate URL
      new URL(newUrl);
      
      const metadata = await fetchUrlMetadata(newUrl);
      const newMention: PressMessage = {
        url: newUrl,
        title: metadata.title || 'Press Mention',
        description: metadata.description || '',
        publication: metadata.publication || new URL(newUrl).hostname,
        favicon: metadata.favicon,
        image: metadata.image
      };

      setMentions([...mentions, newMention]);
      setNewUrl('');
      
      toast({
        title: "Mention added",
        description: "Press mention has been added to your list.",
      });
    } catch (error) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL.",
        variant: "destructive",
      });
    } finally {
      setFetchingMetadata(false);
    }
  };

  const handleDeleteMention = (index: number) => {
    setMentions(mentions.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('artist_profiles')
        .update({ 
          press_mentions: mentions as any,
          press_quotes: quotes as any
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Press mentions and quotes updated successfully.",
      });

      onSave();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="pt-6 space-y-8">
        <h3 className="text-lg font-semibold">Press Coverage</h3>

        {/* Press Quotes Section */}
        <div className="space-y-4">
          <PressQuotesEditor 
            quotes={quotes}
            onUpdate={setQuotes}
          />
        </div>

        {/* Press Mentions Section */}
        <div className="space-y-4">
          <div>
            <h4 className="text-md font-medium mb-2">Press Mentions</h4>
            <p className="text-sm text-muted-foreground">Add links to articles, reviews, and media coverage</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mention-url">Add Press Mention URL</Label>
            <div className="flex gap-2">
              <Input
                id="mention-url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://example.com/article"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddMention();
                  }
                }}
              />
              <Button
                onClick={handleAddMention}
                disabled={fetchingMetadata || !newUrl.trim()}
              >
                {fetchingMetadata ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {mentions.length > 0 && (
            <div className="space-y-3">
              <Label>Current Mentions</Label>
              <div className="grid gap-3">
                {mentions.map((mention, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    {mention.favicon && (
                      <img
                        src={mention.favicon}
                        alt=""
                        className="w-4 h-4 mt-1 flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-sm truncate">
                            {mention.title || mention.publication}
                          </p>
                          {mention.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {mention.description}
                            </p>
                          )}
                          <a
                            href={mention.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                          >
                            {mention.publication}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteMention(index)}
                          className="flex-shrink-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {mention.image && (
                      <img
                        src={mention.image}
                        alt=""
                        className="w-12 h-12 object-cover rounded flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {mentions.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              <ExternalLink className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No press mentions yet. Add links to your media coverage!</p>
            </div>
          )}
        </div>

        <div className="flex justify-center pt-4 border-t border-white/10">
          <Button variant="outline" onClick={onCancel}>
            Done Editing
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}