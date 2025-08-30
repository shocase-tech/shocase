import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { X, Quote, Plus } from "lucide-react";

interface PressQuote {
  text: string;
  source: string;
}

interface PressQuotesEditorProps {
  quotes: PressQuote[];
  onUpdate: (quotes: PressQuote[]) => void;
}

export default function PressQuotesEditor({ quotes, onUpdate }: PressQuotesEditorProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newQuote, setNewQuote] = useState({ text: "", source: "" });

  const handleAddQuote = () => {
    if (newQuote.text.trim() && newQuote.source.trim()) {
      onUpdate([...quotes, { text: newQuote.text.trim(), source: newQuote.source.trim() }]);
      setNewQuote({ text: "", source: "" });
      setIsAdding(false);
    }
  };

  const handleRemoveQuote = (index: number) => {
    onUpdate(quotes.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent, field: 'text' | 'source') => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (field === 'source' || (field === 'text' && newQuote.text.trim())) {
        handleAddQuote();
      }
    } else if (e.key === 'Escape') {
      setNewQuote({ text: "", source: "" });
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-md font-medium">Press Quotes</h4>
          <p className="text-sm text-muted-foreground">Add professional reviews and testimonials</p>
        </div>
        {!isAdding && (
          <Button
            onClick={() => setIsAdding(true)}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Quote
          </Button>
        )}
      </div>

      {/* Existing Quotes */}
      {quotes.length > 0 && (
        <div className="space-y-4">
          {quotes.map((quote, index) => (
            <Card key={index} className="border-l-4 border-l-primary bg-muted/30">
              <CardContent className="pt-4">
                <div className="relative group">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveQuote(index)}
                    className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 hover:bg-destructive/20 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                  
                  <div className="flex items-start gap-3">
                    <Quote className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <blockquote className="text-sm italic leading-relaxed mb-2">
                        "{quote.text}"
                      </blockquote>
                      <cite className="text-sm font-medium text-muted-foreground">
                        — {quote.source}
                      </cite>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add New Quote Form */}
      {isAdding && (
        <Card className="border-dashed border-primary/50 bg-primary/5">
          <CardContent className="pt-4 space-y-4">
            <div>
              <Label htmlFor="quote-text">Quote Text</Label>
              <Textarea
                id="quote-text"
                value={newQuote.text}
                onChange={(e) => setNewQuote({ ...newQuote, text: e.target.value })}
                placeholder="Enter the press quote or review..."
                className="min-h-[80px] resize-none"
                onKeyDown={(e) => handleKeyDown(e, 'text')}
                autoFocus
              />
            </div>
            
            <div>
              <Label htmlFor="quote-source">Source</Label>
              <Input
                id="quote-source"
                value={newQuote.source}
                onChange={(e) => setNewQuote({ ...newQuote, source: e.target.value })}
                placeholder="e.g., Rolling Stone, Music Magazine, Blogger Name"
                onKeyDown={(e) => handleKeyDown(e, 'source')}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setNewQuote({ text: "", source: "" });
                  setIsAdding(false);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddQuote}
                disabled={!newQuote.text.trim() || !newQuote.source.trim()}
              >
                Add Quote
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Press Enter to add quote • Escape to cancel
            </p>
          </CardContent>
        </Card>
      )}

      {quotes.length === 0 && !isAdding && (
        <div className="text-center py-8 text-muted-foreground">
          <Quote className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No press quotes yet. Add your first professional review!</p>
        </div>
      )}
    </div>
  );
}
