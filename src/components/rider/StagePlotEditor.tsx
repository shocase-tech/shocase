import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import StagePlotCanvas from "./StagePlotCanvas";

interface Props {
  data: any;
  onChange: (data: any) => void;
}

export default function StagePlotEditor({ data, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-semibold">Visual Stage Plot Builder</Label>
        <p className="text-sm text-muted-foreground mb-4">
          Drag and drop elements to create your stage plot diagram
        </p>
        <StagePlotCanvas data={data} onChange={onChange} />
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
