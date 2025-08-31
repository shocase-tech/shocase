import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DragDropSectionProps {
  id: string;
  children: React.ReactNode;
  onDelete?: () => void;
  isDraggable?: boolean;
}

export default function DragDropSection({ 
  id, 
  children, 
  onDelete, 
  isDraggable = true 
}: DragDropSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative ${isDragging ? 'z-50' : ''} sortable-item`}
      data-dragging={isDragging}
    >
      {/* Drag handle and delete button */}
      {(isDraggable || onDelete) && (
        <div className="absolute -left-8 top-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {isDraggable && (
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-6 w-6 cursor-grab active:cursor-grabbing hover:bg-muted/20"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-3 w-3" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="p-1 h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}
      {children}
    </div>
  );
}