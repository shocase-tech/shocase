import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Loader2, RefreshCw, Instagram, Hash, Mail, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Show {
  venue: string;
  city: string;
  date: string;
  ticket_link?: string;
}

interface ContentCard {
  id: string;
  title: string;
  description: string;
  icon: any;
  contentType: string;
}

const contentCards: ContentCard[] = [
  {
    id: "instagram-hype",
    title: "Hype Caption",
    description: "Energetic and exciting Instagram post",
    icon: Instagram,
    contentType: "instagram-hype"
  },
  {
    id: "instagram-nostalgic",
    title: "Nostalgic Caption",
    description: "Reflective and heartfelt Instagram post",
    icon: Instagram,
    contentType: "instagram-nostalgic"
  },
  {
    id: "instagram-thankyou",
    title: "Thank You Caption",
    description: "Grateful appreciation post",
    icon: Instagram,
    contentType: "instagram-thankyou"
  },
  {
    id: "instagram-funny",
    title: "Funny Caption",
    description: "Witty and clever Instagram post",
    icon: Instagram,
    contentType: "instagram-funny"
  },
  {
    id: "tiktok-caption",
    title: "TikTok Caption",
    description: "Short, punchy TikTok caption",
    icon: Instagram,
    contentType: "tiktok-caption"
  },
  {
    id: "email-newsletter",
    title: "Email Newsletter",
    description: "Professional fan update snippet",
    icon: Mail,
    contentType: "email-newsletter"
  },
  {
    id: "press-blurb",
    title: "Press Blurb",
    description: "EPK-worthy show mention",
    icon: FileText,
    contentType: "press-blurb"
  },
  {
    id: "hashtags",
    title: "Hashtags",
    description: "Relevant show hashtags",
    icon: Hash,
    contentType: "hashtags"
  },
  {
    id: "venue-tags",
    title: "Venue Tags",
    description: "Social media mentions and tags",
    icon: Hash,
    contentType: "venue-tags"
  }
];

export function AIContentGenerator({ show }: { show: Show }) {
  const [generatedContent, setGeneratedContent] = useState<Record<string, string>>({});
  const [loadingCards, setLoadingCards] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const generateContent = async (card: ContentCard) => {
    setLoadingCards(prev => new Set(prev).add(card.id));

    try {
      const { data, error } = await supabase.functions.invoke("generate-show-content", {
        body: {
          showData: show,
          contentType: card.contentType
        }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setGeneratedContent(prev => ({
        ...prev,
        [card.id]: data.content
      }));

      toast({
        title: "Content generated!",
        description: `${card.title} is ready to use.`
      });
    } catch (error: any) {
      console.error("Error generating content:", error);
      toast({
        title: "Generation failed",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingCards(prev => {
        const newSet = new Set(prev);
        newSet.delete(card.id);
        return newSet;
      });
    }
  };

  const copyToClipboard = async (text: string, title: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${title} copied to clipboard.`
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please try selecting and copying manually.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">AI Content Generator</h3>
        <p className="text-sm text-muted-foreground">
          Generate marketing content tailored to your show. Click generate to create AI-powered captions, hashtags, and more.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {contentCards.map((card) => {
          const Icon = card.icon;
          const isLoading = loadingCards.has(card.id);
          const content = generatedContent[card.id];

          return (
            <Card key={card.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-primary" />
                    <CardTitle className="text-base">{card.title}</CardTitle>
                  </div>
                  {content && <Badge variant="secondary">Generated</Badge>}
                </div>
                <CardDescription className="text-xs">{card.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {content ? (
                  <>
                    <Textarea
                      value={content}
                      onChange={(e) => setGeneratedContent(prev => ({
                        ...prev,
                        [card.id]: e.target.value
                      }))}
                      className="min-h-[120px] text-sm"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(content, card.title)}
                        className="flex-1"
                      >
                        <Copy className="w-3 h-3 mr-2" />
                        Copy
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => generateContent(card)}
                        disabled={isLoading}
                      >
                        <RefreshCw className="w-3 h-3" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <Button
                    onClick={() => generateContent(card)}
                    disabled={isLoading}
                    className="w-full"
                    size="sm"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3 h-3 mr-2" />
                        Generate
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
