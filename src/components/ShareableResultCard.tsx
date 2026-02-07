import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { generateShareCard, downloadCard, shareCard } from "@/lib/cardGenerator";
import { Download, Share2, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";


interface ShareableResultCardProps {
  downloadMbps: number;
  uploadMbps: number;
  ping: number;
  jitter: number;
  qualityScore: number;
  grade: string;
  isp: string;
  location: string;
  serverRegion: string;
}

export function ShareableResultCard({
  downloadMbps,
  uploadMbps,
  ping,
  jitter,
  qualityScore,
  grade,
  isp,
  location,
  serverRegion,
}: ShareableResultCardProps) {
  const [open, setOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [cardData, setCardData] = useState<{
    blob: Blob;
    dataUrl: string;
    filename: string;
  } | null>(null);
  const theme = document.documentElement.classList.contains("dark") ? "dark" : "light";

  const generateCard = async () => {
    setGenerating(true);
    try {
      const timestamp = new Date().toLocaleString();
      const result = await generateShareCard({
        downloadMbps,
        uploadMbps,
        ping,
        jitter,
        qualityScore,
        grade,
        isp: isp || "Unknown ISP",
        location: location || "Unknown Location",
        serverRegion: serverRegion || "Auto",
        timestamp,
        theme: (theme as "dark" | "light") || "dark",
      });
      setCardData(result);
    } catch (error) {
      console.error("Failed to generate card:", error);
      toast.error("Failed to generate share card");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (cardData) {
      downloadCard(cardData.blob, cardData.filename);
      toast.success("Card downloaded!");
    }
  };

  const handleShare = async () => {
    if (cardData) {
      const shared = await shareCard(cardData.blob, cardData.filename);
      if (!shared) {
        // Fallback to download if share not available
        downloadCard(cardData.blob, cardData.filename);
        toast.success("Card downloaded (share not available)");
      }
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && !cardData) {
      generateCard();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg">
          <ImageIcon className="mr-2 h-5 w-5" />
          Share Card
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Share Your Results</DialogTitle>
          <DialogDescription>
            Download or share a beautiful card with your speed test results.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {generating ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Generating card...</span>
            </div>
          ) : cardData ? (
            <div className="space-y-4">
              {/* Preview */}
              <div className="relative rounded-lg overflow-hidden border border-border">
                <img
                  src={cardData.dataUrl}
                  alt="Speed Test Result Card"
                  className="w-full h-auto"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-center">
                <Button onClick={handleDownload} className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button onClick={handleShare} variant="secondary" className="flex-1">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              Click Generate to create your share card
            </div>
          )}
        </div>

        {/* Regenerate button */}
        {cardData && (
          <div className="flex justify-center">
            <Button variant="ghost" size="sm" onClick={generateCard} disabled={generating}>
              {generating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Regenerate Card
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
