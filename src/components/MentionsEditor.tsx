import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { AutoSaveInput } from "@/components/ui/auto-save-input";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import { Save, X, Plus, ExternalLink, Loader2, Quote } from "lucide-react";
import PressQuotesEditor from "@/components/PressQuotesEditor";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useDashboardStateManager } from "@/hooks/useDashboardStateManager";

interface MentionsEditorProps {
  profile: any;
  user: User | null;
  onSave: (updatedData?: any) => void;
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
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  // Enhanced state management
  const { registerEditor, unregisterEditor, updateEditorActiveState } = useDashboardStateManager();
  const editorId = 'mentions-editor';

  // Register this editor with the state manager
  useEffect(() => {
    const registration = {
      editorId,
      getState: () => ({ mentions, quotes, newUrl }),
      setState: (state: any) => {
        console.log('🔄 MentionsEditor: Restoring state:', state);
        if (state.mentions) setMentions(state.mentions);
        if (state.quotes) setQuotes(state.quotes);
        if (state.newUrl) setNewUrl(state.newUrl);
      },
      isActive: true
    };
    
    registerEditor(registration);
    updateEditorActiveState(editorId, true);
    
    return () => {
      console.log('🗑️ MentionsEditor: Unregistering');
      updateEditorActiveState(editorId, false);
      unregisterEditor(editorId);
    };
  }, [registerEditor, unregisterEditor, updateEditorActiveState, mentions, quotes, newUrl]);

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
    console.log("🔍 TEST OPTION 3: handleSave() called");
    if (!user) return;

    console.log("🔍 TEST OPTION 4: Data being saved to database:", {
      press_mentions: mentions,
      press_quotes: quotes,
      user_id: user.id
    });

    try {
      setLoading(true);

      const { error } = await supabase
        .from('artist_profiles')
        .update({
          press_mentions: mentions as any,
          press_quotes: quotes as any,
        })
        .eq('user_id', user.id);

      if (error) {
        console.error("🔍 TEST OPTION 3: Supabase update failed:", error);
        throw error;
      }

      console.log("🔍 TEST OPTION 3: Supabase update successful");

      toast({
        title: "Press mentions updated",
        description: "Your press mentions and quotes have been saved.",
      });

      // Update parent component with new data instead of refetching
      console.log("🔍 TEST OPTION 5: Calling onSave() to update parent state");
      onSave({ press_mentions: mentions, press_quotes: quotes });
    } catch (error: any) {
      console.error("🔍 TEST OPTION 3: Save operation failed:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error; // Re-throw for handleAutoSaveAndClose error handling
    } finally {
      setLoading(false);
    }
  };

  // Auto-save and close handler
  const handleAutoSaveAndClose = useCallback(async () => {
    console.log("🔍 TEST OPTION 1 & 2: Click-outside detected, handleAutoSaveAndClose called");
    if (isSaving || loading || fetchingMetadata) return;
    
    console.log("🔍 TEST OPTION 4: Current form data before save:", { mentions, quotes });
    
    try {
      setIsSaving(true);
      console.log("🔍 TEST OPTION 2: Calling handleSave()");
      await handleSave();
      console.log("🔍 TEST OPTION 3: handleSave() completed successfully, closing editor");
      onCancel();
    } catch (error) {
      console.error("🔍 TEST OPTION 3: handleSave() failed:", error);
      // Error already handled in handleSave
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, loading, fetchingMetadata, onCancel, mentions, quotes]);
  
  // Click outside detection with enhanced drag operation handling
  const editorRef = useClickOutside<HTMLDivElement>(handleAutoSaveAndClose);

  return (
    <Card ref={editorRef} className="border-primary/20 bg-primary/5">
      <CardContent className="pt-6 space-y-8">
        {isSaving && (
          <div className="flex items-center justify-center gap-2 p-2 bg-muted/30 rounded-lg">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Saving press mentions...</span>
          </div>
        )}
        
        <h3 className="text-lg font-semibold">Press Coverage</h3>


        {/* Press Mentions Section */}
        <div className="space-y-4">
          <div>
            <h4 className="text-md font-medium mb-2">Press Mentions</h4>
            <p className="text-sm text-muted-foreground">Add links to articles, reviews, and media coverage</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mention-url">Add Press Mention URL</Label>
            <div className="flex gap-2">
              <AutoSaveInput
                id="mention-url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                onAutoSave={async (url) => {
                  if (url.trim()) {
                    await handleAddMention();
                  }
                }}
                placeholder="https://example.com/article"
                disabled={fetchingMetadata}
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
                    className="relative flex items-start gap-3 p-3 pr-10 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    {mention.favicon && (
                      <img src={mention.favicon} alt="" className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm break-words leading-relaxed">
                        {mention.title || mention.publication}
                      </p>
                      {mention.description && (
                        <p className="text-xs text-muted-foreground mt-1 break-words line-clamp-2">
                          {mention.description}
                        </p>
                      )}
                    </div>
                    <ExternalLink className="w-3 h-3 opacity-50 flex-shrink-0 mt-0.5" />
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteMention(index)}
                      className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm"
                    >
                      <X className="w-3 h-3" />
                    </Button>
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
      </CardContent>
    </Card>
  );
}