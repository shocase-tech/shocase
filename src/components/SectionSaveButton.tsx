import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface SectionSaveButtonProps {
  onSave: () => void;
  loading?: boolean;
  sectionName: string;
}

export default function SectionSaveButton({ onSave, loading = false, sectionName }: SectionSaveButtonProps) {
  return (
    <div className="pt-6 flex justify-center">
      <Button 
        onClick={onSave} 
        disabled={loading} 
        variant="minimal"
        className="gap-2"
        size="lg"
      >
        <Save className="w-4 h-4" />
        {loading ? "Saving..." : `Update ${sectionName}`}
      </Button>
    </div>
  );
}