import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Save } from "lucide-react";
import { VinylSpinner } from "@/components/ui/vinyl-spinner";

interface SectionSaveButtonProps {
  onSave: () => void;
  loading?: boolean;
  sectionName: string;
}

export default function SectionSaveButton({ onSave, loading = false, sectionName }: SectionSaveButtonProps) {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="pt-6">
        <Button 
          onClick={onSave} 
          disabled={loading} 
          className="w-full gap-2"
          size="lg"
        >
          {loading ? <VinylSpinner size={16} className="mr-2" /> : <Save className="w-4 h-4" />}
          {loading ? "Saving..." : `Update ${sectionName}`}
        </Button>
      </CardContent>
    </Card>
  );
}