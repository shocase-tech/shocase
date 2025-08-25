import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface FileUploadProps {
  label: string;
  accept: string;
  onUpload: (file: File) => void;
}

export default function FileUpload({ label, accept, onUpload }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div className="text-center">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        onClick={handleClick}
        className="w-full h-20 flex flex-col items-center justify-center gap-2"
      >
        <Upload className="w-5 h-5" />
        <span className="text-sm">{label}</span>
      </Button>
    </div>
  );
}