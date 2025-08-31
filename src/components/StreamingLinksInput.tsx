import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Import streaming service icons
import appleLight from "@/assets/streaming/apple-music-light.svg";
import appleColor from "@/assets/streaming/apple-music-color.svg";
import bandcampLight from "@/assets/streaming/bandcamp-light.png";
import bandcampColor from "@/assets/streaming/bandcamp-color.png";
import soundcloudLight from "@/assets/streaming/soundcloud-light.png";
import soundcloudColor from "@/assets/streaming/soundcloud-color.png";
import spotifyLight from "@/assets/streaming/spotify-light.png";
import spotifyColor from "@/assets/streaming/spotify-color.png";

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
      lightIcon: spotifyLight,
      colorIcon: spotifyColor,
      placeholder: "Enter Spotify URL"
    },
    {
      key: "apple_music",
      name: "Apple Music",
      lightIcon: appleLight,
      colorIcon: appleColor,
      placeholder: "Enter Apple Music URL"
    },
    {
      key: "bandcamp",
      name: "Bandcamp",
      lightIcon: bandcampLight,
      colorIcon: bandcampColor,
      placeholder: "Enter Bandcamp URL"
    },
    {
      key: "soundcloud",
      name: "SoundCloud",
      lightIcon: soundcloudLight,
      colorIcon: soundcloudColor,
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
          const hasUrl = streamingLinks[platform.key as keyof typeof streamingLinks];
          const isActive = activeInput === platform.key;
          const iconSrc = (hasUrl && isValidUrl(hasUrl)) ? platform.colorIcon : platform.lightIcon;
          
          return (
            <button
              key={platform.key}
              type="button"
              onClick={() => handleIconClick(platform.key)}
              className={cn(
                "p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 bg-background",
                isActive 
                  ? "border-primary/50 bg-primary/5"
                  : (hasUrl && isValidUrl(hasUrl))
                    ? "border-primary/30 bg-primary/5"
                    : "border-muted-foreground/30 hover:border-muted-foreground/50"
              )}
              title={platform.name}
            >
              <img 
                src={iconSrc} 
                alt={platform.name}
                className="w-6 h-6 object-contain"
              />
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