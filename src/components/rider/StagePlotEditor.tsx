import { forwardRef } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
        <p className="text-sm text-muted-foreground mb-4">
          Click elements in the sidebar to add them to your stage plot
        </p>
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
