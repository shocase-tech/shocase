import React from 'react';
import { Music } from 'lucide-react';

interface FeaturedTrackEmbedProps {
  trackUrl: string;
  className?: string;
}

export const FeaturedTrackEmbed: React.FC<FeaturedTrackEmbedProps> = ({ trackUrl, className = "" }) => {
  const getStreamingService = (url: string) => {
    if (url.includes('spotify.com')) return 'spotify';
    if (url.includes('music.apple.com')) return 'apple';
    if (url.includes('soundcloud.com')) return 'soundcloud';
    return null;
  };

  const getEmbedUrl = (url: string) => {
    const service = getStreamingService(url);
    
    switch (service) {
      case 'spotify':
        return url.replace('open.spotify.com/track/', 'open.spotify.com/embed/track/');
      case 'apple':
        // Apple Music embed format
        return url.replace('music.apple.com', 'embed.music.apple.com');
      case 'soundcloud':
        // SoundCloud oEmbed would be more complex, using iframe for now
        return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&visual=true`;
      default:
        return url;
    }
  };

  const getServiceInfo = (url: string) => {
    const service = getStreamingService(url);
    
    switch (service) {
      case 'spotify':
        return { name: 'Spotify Track', color: 'text-green-500', height: '152' };
      case 'apple':
        return { name: 'Apple Music', color: 'text-red-500', height: '175' };
      case 'soundcloud':
        return { name: 'SoundCloud Track', color: 'text-orange-500', height: '166' };
      default:
        return { name: 'Featured Track', color: 'text-primary', height: '152' };
    }
  };

  if (!trackUrl) return null;

  const service = getServiceInfo(trackUrl);
  const embedUrl = getEmbedUrl(trackUrl);

  return (
    <div className={`w-full ${className}`}>
      <iframe
        src={embedUrl}
        width="100%"
        height={service.height}
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        className="rounded w-full"
      />
    </div>
  );
};