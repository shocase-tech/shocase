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
import { useIsMobile } from "@/hooks/use-mobile";
import { User } from "@supabase/supabase-js";
import { Save, X, Plus, Calendar as CalendarIcon, MapPin, Ticket, GripVertical, ArrowUpDown, Loader2, Star } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useClickOutside } from "@/hooks/useClickOutside";
import { ValidationAlertModal } from "@/components/ValidationAlertModal";

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
  is_highlighted?: boolean;
}

interface SortableShowProps {
  show: Show;
  index: number;
  onDelete: (index: number) => void;
  onEdit: (index: number, show: Show) => void;
  onToggleHighlight: (index: number) => void;
}

function SortableShow({ show, index, onDelete, onEdit, onToggleHighlight, initiallyEditing = false, isMobile = false }: SortableShowProps & { initiallyEditing?: boolean; isMobile?: boolean }) {
  const [isEditing, setIsEditing] = useState(initiallyEditing);
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
  } = useSortable({ 
    id: `show-${index}`,
    disabled: isMobile // Disable sorting on mobile
  });

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
        <CardContent className={cn("space-y-4", isMobile ? "p-4" : "p-4")}>
          <div className={cn("grid gap-4", isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2")}>
            <div>
              <Label htmlFor={`venue-${index}`} className="text-sm font-medium">Venue</Label>
              <Input
                id={`venue-${index}`}
                value={editData.venue}
                onChange={(e) => setEditData({ ...editData, venue: e.target.value })}
                placeholder="Venue name"
                className={cn(isMobile && "h-12 text-base")}
              />
            </div>
            
            <div>
              <Label htmlFor={`city-${index}`} className="text-sm font-medium">City</Label>
              <Input
                id={`city-${index}`}
                value={editData.city}
                onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                placeholder="City, State"
                className={cn(isMobile && "h-12 text-base")}
              />
            </div>
          </div>

          <div className={cn("grid gap-4", isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2")}>
            <div>
              <Label className="text-sm font-medium">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground",
                      isMobile && "h-12 text-base"
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
              <Label htmlFor={`ticket-${index}`} className="text-sm font-medium">Ticket Link (Optional)</Label>
              <Input
                id={`ticket-${index}`}
                value={editData.ticket_link || ''}
                onChange={(e) => setEditData({ ...editData, ticket_link: e.target.value })}
                placeholder="https://tickets.com/..."
                className={cn(isMobile && "h-12 text-base")}
              />
            </div>
          </div>

          <div className={cn("flex gap-3", isMobile ? "flex-col" : "justify-end")}>
            <Button 
              variant="outline" 
              size={isMobile ? "lg" : "sm"} 
              onClick={() => setIsEditing(false)}
              className={cn(isMobile && "h-12")}
            >
              Cancel
            </Button>
            <Button 
              size={isMobile ? "lg" : "sm"} 
              onClick={handleSave}
              className={cn(isMobile && "h-12")}
            >
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
      className={cn(
        "group flex items-center justify-between rounded-md border transition-all",
        show.is_highlighted 
          ? "bg-primary/10 border-primary/50 shadow-lg" 
          : "bg-white/5 border-white/10",
        isMobile ? "p-4 flex-col items-start gap-3" : "p-3"
      )}
    >
      <div className={cn("flex items-center gap-3", isMobile && "w-full")}>
        {/* Hide drag handle on mobile */}
        {!isMobile && (
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-4 h-4" />
          </Button>
        )}
        
        {show.is_highlighted && (
          <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />
        )}
        <CalendarIcon className={cn("text-primary flex-shrink-0", isMobile ? "w-6 h-6" : "w-5 h-5")} />
        <div className="min-w-0 flex-1">
          <p className={cn("font-medium flex items-center gap-2", isMobile ? "text-base" : "text-sm")}>
            <span className="truncate">{show.venue}</span>
            {show.is_highlighted && (
              <Badge variant="secondary" className="text-xs flex-shrink-0">Featured</Badge>
            )}
          </p>
          <p className={cn("text-muted-foreground flex items-center gap-1", isMobile ? "text-sm" : "text-xs")}>
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{show.city} • {format(new Date(show.date), 'MMM d, yyyy')}</span>
          </p>
        </div>
      </div>
      
      <div className={cn("flex items-center gap-2", isMobile && "w-full justify-between")}>
        {show.ticket_link && (
          <a
            href={show.ticket_link}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors",
              isMobile ? "text-sm h-10 flex-1 justify-center" : "text-xs"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <Ticket className="w-4 h-4" />
            <span>Tickets</span>
          </a>
        )}
        
        <div className={cn(
          "flex gap-2",
          isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}>
          <Button
            variant="outline"
            size={isMobile ? "default" : "sm"}
            onClick={() => onToggleHighlight(index)}
            className={cn(
              show.is_highlighted 
                ? "bg-yellow-500/20 text-yellow-600 border-yellow-500/50" 
                : "hover:bg-yellow-500/10",
              isMobile && "h-10 px-3"
            )}
          >
            <Star className={cn("w-3 h-3", show.is_highlighted && "fill-current")} />
          </Button>
          <Button
            variant="outline"
            size={isMobile ? "default" : "sm"}
            onClick={() => setIsEditing(true)}
            className={cn(isMobile && "h-10")}
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size={isMobile ? "default" : "sm"}
            onClick={() => onDelete(index)}
            className={cn(isMobile && "h-10 px-3")}
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
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Array<{ showIndex: number; missingFields: string[] }>>([]);
  const [newlyAddedShowIndex, setNewlyAddedShowIndex] = useState<number | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const allShows = [
      ...(profile?.upcoming_shows || []),
      ...(profile?.past_shows || [])
    ];
    
    // Auto-sort by date (latest first) - no manual sorting needed on mobile
    const sortedShows = allShows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setShows(sortedShows);
  }, [profile]);

  const handleDragEnd = (event: any) => {
    // Skip drag handling on mobile
    if (isMobile) return;
    
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
      ticket_link: '',
      is_highlighted: false
    };
    setShows([newShow, ...shows]); // Add to top of list
    setNewlyAddedShowIndex(0); // Mark the first show as newly added
    
    // Scroll to the new show for immediate editing
    setTimeout(() => {
      const newShowElement = document.querySelector(`[data-show-index="0"]`);
      if (newShowElement) {
        newShowElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleDeleteShow = (index: number) => {
    setShows(shows.filter((_, i) => i !== index));
    // Reset newly added show index if it was deleted
    if (newlyAddedShowIndex === index) {
      setNewlyAddedShowIndex(null);
    } else if (newlyAddedShowIndex !== null && index < newlyAddedShowIndex) {
      setNewlyAddedShowIndex(newlyAddedShowIndex - 1);
    }
  };

  const handleEditShow = (index: number, updatedShow: Show) => {
    const updatedShows = [...shows];
    updatedShows[index] = updatedShow;
    setShows(updatedShows);
    // Clear newly added flag once edited
    if (newlyAddedShowIndex === index) {
      setNewlyAddedShowIndex(null);
    }
  };

  const handleToggleHighlight = (index: number) => {
    const updatedShows = [...shows];
    updatedShows[index] = { 
      ...updatedShows[index], 
      is_highlighted: !updatedShows[index].is_highlighted 
    };
    setShows(updatedShows);
  };

  const handleSortByDate = () => {
    const sortedShows = [...shows].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Latest date first
    setShows(sortedShows);
    setNewlyAddedShowIndex(null); // Clear newly added flag after sorting
    toast({
      title: "Shows sorted",
      description: "Shows have been sorted by date (latest first).",
    });
  };

  const validateShows = () => {
    const errors: Array<{ showIndex: number; missingFields: string[] }> = [];
    
    shows.forEach((show, index) => {
      const missingFields: string[] = [];
      
      if (!show.venue.trim()) missingFields.push("venue");
      if (!show.city.trim()) missingFields.push("city");
      if (!show.date) missingFields.push("date");
      
      if (missingFields.length > 0) {
        errors.push({ showIndex: index, missingFields });
      }
    });
    
    return errors;
  };

  const handleSave = async () => {
    if (!user) return;

    // Validate shows data before saving
    const errors = validateShows();
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      setShowValidationModal(true);
      return;
    }

    try {
      setLoading(true);
      
      console.log("💾 ShowsEditor: Saving shows:", shows);

      const { error } = await supabase
        .from('artist_profiles')
        .update({
          upcoming_shows: shows.filter(show => new Date(show.date) >= new Date()) as any,
          past_shows: shows.filter(show => new Date(show.date) < new Date()) as any,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Shows updated",
        description: "Your shows have been saved successfully.",
      });

      // Update parent component with new data
      const updatedProfile = {
        ...profile,
        upcoming_shows: shows.filter(show => new Date(show.date) >= new Date()),
        past_shows: shows.filter(show => new Date(show.date) < new Date())
      };
      
      console.log("📤 ShowsEditor: Calling onSave with updated profile:", updatedProfile);
      onSave(updatedProfile);
    } catch (error: any) {
      console.error("❌ ShowsEditor: Save error:", error);
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
    
    // Check validation before attempting save
    const errors = validateShows();
    if (errors.length > 0) {
      console.log("🔍 ShowsEditor: Validation failed, showing modal instead of saving");
      setValidationErrors(errors);
      setShowValidationModal(true);
      return; // Don't save or close editor
    }
    
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
        
        <div className={cn("flex items-center justify-between", isMobile && "flex-col gap-4")}>
          <h3 className={cn("font-semibold", isMobile ? "text-xl w-full text-center" : "text-lg")}>Shows Management</h3>
          <div className={cn("flex gap-2", isMobile && "w-full justify-center")}>
            {/* Hide sort button on mobile since we auto-sort */}
            {!isMobile && shows.length > 1 && (
              <Button variant="outline" size="sm" onClick={handleSortByDate}>
                <ArrowUpDown className="w-4 h-4 mr-2" />
                Sort by Date
              </Button>
            )}
            <Button 
              onClick={handleAddShow} 
              size={isMobile ? "lg" : "sm"}
              className={cn(isMobile && "h-12 px-6 text-base")}
            >
              <Plus className={cn("mr-2", isMobile ? "w-5 h-5" : "w-4 h-4")} />
              Add Show
            </Button>
          </div>
        </div>

        {shows.length > 0 && (
          isMobile ? (
            // Mobile: Simple list without drag and drop
            <div className="space-y-4">
              {shows.map((show, index) => (
                <div key={`show-${index}`} data-show-index={index}>
                  <SortableShow
                    show={show}
                    index={index}
                    onDelete={handleDeleteShow}
                    onEdit={handleEditShow}
                    onToggleHighlight={handleToggleHighlight}
                    initiallyEditing={newlyAddedShowIndex === index}
                    isMobile={true}
                  />
                </div>
              ))}
            </div>
          ) : (
            // Desktop: Full drag and drop functionality
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
                    <div key={`show-${index}`} data-show-index={index}>
                      <SortableShow
                        show={show}
                        index={index}
                        onDelete={handleDeleteShow}
                        onEdit={handleEditShow}
                        onToggleHighlight={handleToggleHighlight}
                        initiallyEditing={newlyAddedShowIndex === index}
                        isMobile={false}
                      />
                    </div>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )
        )}

        {shows.length === 0 && (
          <div className={cn("text-center text-muted-foreground", isMobile ? "py-12" : "py-8")}>
            <p className={cn(isMobile ? "text-base" : "text-sm")}>
              No shows added yet. Click "Add Show" to get started.
            </p>
          </div>
        )}
      </CardContent>
      
      <ValidationAlertModal
        open={showValidationModal}
        onOpenChange={setShowValidationModal}
        validationErrors={validationErrors}
      />
    </Card>
  );
}