import { useState, KeyboardEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface GenreInputProps {
  genres: string[];
  onChange: (genres: string[]) => void;
  placeholder?: string;
}

export default function GenreInput({ genres, onChange, placeholder = "Add genres..." }: GenreInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addGenre();
    } else if (e.key === "Backspace" && inputValue === "" && genres.length > 0) {
      removeGenre(genres.length - 1);
    }
  };

  const addGenre = () => {
    const newGenre = inputValue.trim();
    if (newGenre && !genres.includes(newGenre)) {
      onChange([...genres, newGenre]);
      setInputValue("");
    }
  };

  const removeGenre = (index: number) => {
    const newGenres = genres.filter((_, i) => i !== index);
    onChange(newGenres);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {genres.map((genre, index) => (
          <Badge key={index} variant="secondary" className="gap-1">
            {genre}
            <button
              type="button"
              onClick={() => removeGenre(index)}
              className="ml-1 hover:bg-destructive/20 rounded-sm"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addGenre}
        placeholder={placeholder}
        className="w-full"
      />
      <p className="text-xs text-muted-foreground">
        Type and press Enter or comma to add genres
      </p>
    </div>
  );
}