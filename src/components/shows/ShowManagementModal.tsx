import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Sparkles, Image as ImageIcon } from "lucide-react";
import { format } from "date-fns";
import { AIContentGenerator } from "./AIContentGenerator";
import { ContentPackBuilder } from "./ContentPackBuilder";

interface Show {
  venue: string;
  city: string;
  date: string;
  ticket_link?: string;
  is_highlighted?: boolean;
}

interface ShowManagementModalProps {
  show: Show;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShowManagementModal({ show, open, onOpenChange }: ShowManagementModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            <div className="space-y-2">
              <h2 className="font-bold">{show.venue}</h2>
              <div className="flex items-center gap-4 text-sm text-muted-foreground font-normal">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {show.city}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(show.date + 'T00:00:00'), 'MMMM d, yyyy')}
                </div>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="content" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="content">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Content
            </TabsTrigger>
            <TabsTrigger value="visuals">
              <ImageIcon className="w-4 h-4 mr-2" />
              Content Pack
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="mt-6">
            <AIContentGenerator show={show} />
          </TabsContent>

          <TabsContent value="visuals" className="mt-6">
            <ContentPackBuilder show={show} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
