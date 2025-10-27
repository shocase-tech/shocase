import { forwardRef } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Undo, Redo, Trash2, Download, X } from "lucide-react";
import StagePlotCanvas, { STAGE_ELEMENTS, StagePlotCanvasRef } from "./StagePlotCanvas";

interface Props {
  data: any;
  onChange: (data: any) => void;
}

const StagePlotEditor = forwardRef<StagePlotCanvasRef, Props>(({ data, onChange }, ref) => {
  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-semibold">Visual Stage Plot Builder</Label>
        <p className="text-sm text-muted-foreground mb-2">
          Click elements in the sidebar to add them to your stage plot
        </p>
        
        {/* Canvas Controls */}
        <div className="flex items-center gap-2 mb-4">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => (ref as any)?.current?.undo()} 
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => (ref as any)?.current?.redo()} 
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => (ref as any)?.current?.deleteSelected()} 
            title="Delete Selected"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => (ref as any)?.current?.downloadCanvas()} 
            title="Export"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button 
            variant="destructive" 
            size="icon"
            onClick={() => (ref as any)?.current?.clearCanvas()} 
            title="Clear All"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <StagePlotCanvas ref={ref} data={data} onChange={onChange} />
      </div>

      <div>
        <Label>Stage Dimensions & Additional Notes</Label>
        <Textarea
          value={data?.notes || ""}
          onChange={(e) => onChange({
            ...data,
            notes: e.target.value,
          })}
          placeholder="Stage dimensions, special requirements, positioning notes..."
          rows={4}
        />
      </div>
    </div>
  );
});

StagePlotEditor.displayName = "StagePlotEditor";

export default StagePlotEditor;
