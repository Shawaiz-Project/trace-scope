import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, X, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    const dismissed = sessionStorage.getItem("pwa-install-dismissed");
    if (dismissed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Listen for successful install
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem("pwa-install-dismissed", "true");
  };

  if (isInstalled || !showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md animate-in slide-in-from-bottom duration-500">
      <div className="bg-card border border-border rounded-xl p-4 shadow-lg flex items-center gap-3">
        <div className="bg-primary/10 p-2 rounded-lg shrink-0">
          <Smartphone className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">Install SpeedTest Pro</p>
          <p className="text-xs text-muted-foreground">Fast access from your home screen</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button size="sm" onClick={handleInstall} className="gap-1">
            <Download className="w-3.5 h-3.5" />
            Install
          </Button>
          <Button size="icon" variant="ghost" onClick={handleDismiss} className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
