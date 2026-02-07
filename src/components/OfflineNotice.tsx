import { useState, useEffect } from "react";
import { WifiOff, Wifi } from "lucide-react";

export function OfflineNotice() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 3000);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!isOffline && !showReconnected) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[100] text-center py-2 text-sm font-medium transition-colors ${
        isOffline
          ? "bg-destructive text-destructive-foreground"
          : "bg-success text-success-foreground"
      }`}
    >
      {isOffline ? (
        <span className="flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4" />
          You're offline — speed tests require an internet connection
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          <Wifi className="w-4 h-4" />
          Back online!
        </span>
      )}
    </div>
  );
}
