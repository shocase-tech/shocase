import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { AutoSaveInput } from "@/components/ui/auto-save-input";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import { Save, X, Plus, Calendar as CalendarIcon, MapPin, Ticket, GripVertical, ArrowUpDown, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useClickOutside } from "@/hooks/useClickOutside";

interface ShowsEditorProps {
  profile: any;
  user: User | null;
  onSave: (updatedData?: any) => void;
  onCancel: () => void;
}

interface Show {
  venue: string;
  city: string;
  date: string;
  ticket_link?: string;
}

interface SortableShowProps {
  show: Show;
  index: number;
  onDelete: (index: number) => void;
  onEdit: (index: number, show: Show) => void;
}

function SortableShow({ show, index, onDelete, onEdit }: SortableShowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(show);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    show.date ? new Date(show.date) : undefined
  );

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `show-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSave = () => {
    onEdit(index, {
      ...editData,
      date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : editData.date
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Card className="border-primary/20" style={style} ref={setNodeRef}>
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label htmlFor={`venue-${index}`}>Venue</Label>
              <Input
                id={`venue-${index}`}
                value={editData.venue}
                onChange={(e) => setEditData({ ...editData, venue: e.target.value })}
                placeholder="Venue name"
              />
            </div>
            
            <div>
              <Label htmlFor={`city-${index}`}>City</Label>
              <Input
                id={`city-${index}`}
                value={editData.city}
                onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                placeholder="City, State"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor={`ticket-${index}`}>Ticket Link (Optional)</Label>
              <Input
                id={`ticket-${index}`}
                value={editData.ticket_link || ''}
                onChange={(e) => setEditData({ ...editData, ticket_link: e.target.value })}
                placeholder="https://tickets.com/..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center justify-between p-3 bg-white/5 rounded-md border border-white/10"
    >
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4" />
        </Button>
        
        <CalendarIcon className="w-5 h-5 text-primary" />
        <div>
          <p className="font-medium">{show.venue}</p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {show.city} • {format(new Date(show.date), 'MMM d, yyyy')}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {show.ticket_link && (
          <a
            href={show.ticket_link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <Ticket className="w-4 h-4" />
            Tickets
          </a>
        )}
        
        <div className="opacity-0 group-hover:opacity-100 flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(index)}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ShowsEditor({ profile, user, onSave, onCancel }: ShowsEditorProps) {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (profile?.upcoming_shows) {
      setShows(profile.upcoming_shows);
    }
  }, [profile]);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setShows((items) => {
        const activeIndex = items.findIndex((_, index) => `show-${index}` === active.id);
        const overIndex = items.findIndex((_, index) => `show-${index}` === over.id);

        return arrayMove(items, activeIndex, overIndex);
      });
    }
  };

  const handleAddShow = () => {
    const newShow: Show = {
      venue: '',
      city: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      ticket_link: ''
    };
    setShows([...shows, newShow]);
  };

  const handleDeleteShow = (index: number) => {
    setShows(shows.filter((_, i) => i !== index));
  };

  const handleEditShow = (index: number, updatedShow: Show) => {
    const updatedShows = [...shows];
    updatedShows[index] = updatedShow;
    setShows(updatedShows);
  };

  const handleSortByDate = () => {
    const sortedShows = [...shows].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setShows(sortedShows);
    toast({
      title: "Shows sorted",
      description: "Shows have been sorted by date.",
    });
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('artist_profiles')
        .update({
          upcoming_shows: shows.filter(show => new Date(show.date) >= new Date()) as any,
          past_shows: shows.filter(show => new Date(show.date) < new Date()) as any,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Shows updated",
        description: "Your shows have been saved successfully.",
      });

      // Update parent component with new data
      onSave({ 
        upcoming_shows: shows.filter(show => new Date(show.date) >= new Date()),
        past_shows: shows.filter(show => new Date(show.date) < new Date()) 
      });
    } catch (error: any) {
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
    console.log("🔍 ShowsEditor: Click-outside detected, handleAutoSaveAndClose called");
    if (isSaving || loading) return;
    
    console.log("🔍 ShowsEditor: Current shows data before save:", shows);
    
    try {
      setIsSaving(true);
      console.log("🔍 ShowsEditor: Calling handleSave()");
      await handleSave();
      console.log("🔍 ShowsEditor: handleSave() completed, closing editor");
      onCancel();
    } catch (error) {
      console.error("🔍 ShowsEditor: handleSave() failed:", error);
      // Error already handled in handleSave
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, loading, onCancel, shows]);
  
  // Click outside detection
  const editorRef = useClickOutside<HTMLDivElement>(handleAutoSaveAndClose);

  return (
    <Card ref={editorRef} className="border-primary/20 bg-primary/5">
      <CardContent className="pt-6 space-y-6">
        {isSaving && (
          <div className="flex items-center justify-center gap-2 p-2 bg-muted/30 rounded-lg">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Saving shows...</span>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Upcoming Shows</h3>
          <div className="flex gap-2">
            {shows.length > 1 && (
              <Button variant="outline" size="sm" onClick={handleSortByDate}>
                <ArrowUpDown className="w-4 h-4 mr-2" />
                Sort by Date
              </Button>
            )}
            <Button onClick={handleAddShow} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Show
            </Button>
          </div>
        </div>

        {shows.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={shows.map((_, index) => `show-${index}`)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {shows.map((show, index) => (
                  <SortableShow
                    key={`show-${index}`}
                    show={show}
                    index={index}
                    onDelete={handleDeleteShow}
                    onEdit={handleEditShow}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {shows.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No shows added yet. Click "Add Show" to get started.
          </div>
        )}
      </CardContent>
    </Card>
  );
}