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
import { Link2, Copy, Check, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import type { SpeedTestResult } from "@/lib/speedtest";

const API_URL = import.meta.env.VITE_API_URL || "";

interface ShareReportLinkProps {
  speedResult?: SpeedTestResult | null;
  ipInfo?: {
    ip: string;
    isp: string;
    asn: string;
    city: string;
    region: string;
    country: string;
    countryCode: string;
    timezone: string;
    ipType: string;
    vpnDetected: boolean;
  } | null;
  deviceInfo?: {
    browser: { name: string; version: string; language: string; [key: string]: unknown };
    device: { os: string; type: string; screenResolution: string; cpuCores: string | number; memory: string; [key: string]: unknown };
    network: { connectionType: string; estimatedSpeed: string; [key: string]: unknown };
  } | null;
  location?: string;
}

export function ShareReportLink({ speedResult, ipInfo, deviceInfo, location }: ShareReportLinkProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  const generateLink = async () => {
    if (!speedResult && !ipInfo) {
      toast.error("No test data to share");
      return;
    }

    setLoading(true);
    try {
      const reportData = {
        timestamp: new Date().toISOString(),
        speedResult: speedResult
          ? {
              download: { speedMbps: +speedResult.download.speedMbps.toFixed(2), bytesTransferred: speedResult.download.bytesTransferred, durationMs: +speedResult.download.durationMs.toFixed(0) },
              upload: { speedMbps: +speedResult.upload.speedMbps.toFixed(2), bytesTransferred: speedResult.upload.bytesTransferred, durationMs: +speedResult.upload.durationMs.toFixed(0) },
              ping: { latencyMs: +speedResult.ping.latency.toFixed(2), jitterMs: +speedResult.ping.jitter.toFixed(2), samples: speedResult.ping.samples.length },
            }
          : null,
        connection: ipInfo
          ? { ip: ipInfo.ip, isp: ipInfo.isp, asn: ipInfo.asn, location: `${ipInfo.city}, ${ipInfo.country}`, timezone: ipInfo.timezone, ipType: ipInfo.ipType, vpnDetected: ipInfo.vpnDetected }
          : null,
        device: deviceInfo
          ? { browser: `${deviceInfo.browser.name} ${deviceInfo.browser.version}`, os: deviceInfo.device.os, type: deviceInfo.device.type, screen: deviceInfo.device.screenResolution, connectionType: deviceInfo.network.connectionType }
          : null,
      };

      const response = await fetch(`${API_URL}/share/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report_data: reportData }),
      });

      if (!response.ok) throw new Error("Failed to create share link");

      const data = await response.json();
      const url = `${window.location.origin}/report/${data.share_id}`;
      setShareUrl(url);
      setExpiresAt(data.expires_at);
    } catch (error) {
      console.error("Failed to create share link:", error);
      toast.error("Failed to create share link. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && !shareUrl) {
      generateLink();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={!speedResult && !ipInfo}>
          <Link2 className="mr-2 h-4 w-4" />
          Share Link
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Report Link</DialogTitle>
          <DialogDescription>
            Anyone with this link can view your report. Link expires in 7 days.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Generating link...</span>
            </div>
          ) : shareUrl ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm font-mono truncate border border-border"
                />
                <Button size="icon" onClick={handleCopy} variant="outline">
                  {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>

              {expiresAt && (
                <p className="text-xs text-muted-foreground text-center">
                  🔗 Expires: {new Date(expiresAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                </p>
              )}

              <div className="flex gap-2 justify-center">
                <Button onClick={handleCopy} className="flex-1">
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Link
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => window.open(shareUrl, "_blank")}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Link
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={generateLink}
                className="w-full"
                disabled={loading}
              >
                Generate New Link
              </Button>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Failed to generate link. Please try again.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
