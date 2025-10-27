import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import StagePlotCanvas, { STAGE_ELEMENTS } from "./StagePlotCanvas";

interface Props {
  data: any;
  onChange: (data: any) => void;
  canvasControls?: {
    onAddElement?: (element: typeof STAGE_ELEMENTS[0]) => void;
    onUndo?: () => void;
    onRedo?: () => void;
    onDeleteSelected?: () => void;
    onClear?: () => void;
    onDownload?: () => void;
    canUndo?: boolean;
    canRedo?: boolean;
  };
}

export default function StagePlotEditor({ data, onChange, canvasControls }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-semibold">Visual Stage Plot Builder</Label>
        <p className="text-sm text-muted-foreground mb-4">
          Drag and drop elements to create your stage plot diagram
        </p>
        <StagePlotCanvas data={data} onChange={onChange} {...canvasControls} />
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
}
