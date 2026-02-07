import { ExternalLink } from "lucide-react";

interface AdBannerProps {
  slot: string;
  size?: "banner" | "leaderboard" | "sidebar";
  className?: string;
}

export function AdBanner({ slot, size = "banner", className = "" }: AdBannerProps) {
  const sizeClasses = {
    banner: "h-[90px] max-w-[728px]",
    leaderboard: "h-[90px] max-w-full",
    sidebar: "h-[250px] max-w-[300px]",
  };

  return (
    <div
      className={`w-full flex items-center justify-center mx-auto ${className}`}
      data-ad-slot={slot}
      aria-label="Advertisement"
    >
      <div
        className={`${sizeClasses[size]} w-full border border-dashed border-border rounded-lg bg-muted/30 flex flex-col items-center justify-center gap-1 text-muted-foreground transition-colors hover:bg-muted/50`}
      >
        <ExternalLink className="w-4 h-4 opacity-50" />
        <span className="text-xs opacity-50">Ad Space — {slot}</span>
      </div>
    </div>
  );
}
