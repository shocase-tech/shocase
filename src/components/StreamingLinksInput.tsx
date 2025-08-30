import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Music, Music2, Disc3, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreamingLinksInputProps {
  streamingLinks: {
    spotify?: string;
    apple_music?: string;
    bandcamp?: string;
    soundcloud?: string;
  };
  onChange: (links: any) => void;
}

export default function StreamingLinksInput({ streamingLinks, onChange }: StreamingLinksInputProps) {
  const [activeInput, setActiveInput] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");

  const platforms = [
    {
      key: "spotify",
      name: "Spotify",
      icon: Music,
      color: "text-green-500",
      activeColor: "text-green-500 bg-green-500/10",
      placeholder: "Enter Spotify URL"
    },
    {
      key: "apple_music",
      name: "Apple Music",
      icon: Music2,
      color: "text-gray-900 dark:text-white",
      activeColor: "text-gray-900 dark:text-white bg-gray-900/10 dark:bg-white/10",
      placeholder: "Enter Apple Music URL"
    },
    {
      key: "bandcamp",
      name: "Bandcamp",
      icon: Disc3,
      color: "text-blue-500",
      activeColor: "text-blue-500 bg-blue-500/10",
      placeholder: "Enter Bandcamp URL"
    },
    {
      key: "soundcloud",
      name: "SoundCloud",
      icon: Volume2,
      color: "text-orange-500",
      activeColor: "text-orange-500 bg-orange-500/10",
      placeholder: "Enter SoundCloud URL"
    }
  ];

  const handleIconClick = (platformKey: string) => {
    setActiveInput(platformKey);
    setInputValue(streamingLinks[platformKey as keyof typeof streamingLinks] || "");
  };

  const handleInputSubmit = () => {
    if (activeInput && inputValue.trim()) {
      onChange({
        ...streamingLinks,
        [activeInput]: inputValue.trim()
      });
    }
    setActiveInput(null);
    setInputValue("");
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleInputSubmit();
    } else if (e.key === "Escape") {
      setActiveInput(null);
      setInputValue("");
    }
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="space-y-4">
      {/* Platform Icons */}
      <div className="flex gap-4">
        {platforms.map((platform) => {
          const Icon = platform.icon;
          const hasUrl = streamingLinks[platform.key as keyof typeof streamingLinks];
          const isActive = activeInput === platform.key;
          
          return (
            <button
              key={platform.key}
              type="button"
              onClick={() => handleIconClick(platform.key)}
              className={cn(
                "p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105",
                isActive || (hasUrl && isValidUrl(hasUrl))
                  ? `${platform.activeColor} border-current`
                  : "text-muted-foreground border-muted-foreground/30 hover:border-muted-foreground/50"
              )}
              title={platform.name}
            >
              <Icon className="w-6 h-6" />
            </button>
          );
        })}
      </div>

      {/* Active Input */}
      {activeInput && (
        <div className="space-y-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleInputKeyDown}
            onBlur={handleInputSubmit}
            placeholder={platforms.find(p => p.key === activeInput)?.placeholder}
            className="w-full"
            autoFocus
          />
          <p className="text-xs text-muted-foreground">
            Press Enter to save • Escape to cancel
          </p>
        </div>
      )}
    </div>
  );
}