import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Loader2, AlertTriangle, ArrowLeft, Download, Upload, Activity, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/SEOHead";

const API_URL = import.meta.env.VITE_API_URL || "";

interface SharedReportData {
  share_id: string;
  report_data: {
    timestamp: string;
    speedResult?: {
      download: { speedMbps: number; bytesTransferred: number; durationMs: number };
      upload: { speedMbps: number; bytesTransferred: number; durationMs: number };
      ping: { latencyMs: number; jitterMs: number; samples: number };
    };
    connection?: {
      ip: string;
      isp: string;
      asn: string;
      location: string;
      timezone: string;
      ipType: string;
      vpnDetected: boolean;
    };
    device?: {
      browser: string;
      os: string;
      type: string;
      screen: string;
      connectionType: string;
    };
  };
  expires_at: string;
  created_at: string;
}

export default function SharedReport() {
  const { shareId } = useParams<{ shareId: string }>();
  const [report, setReport] = useState<SharedReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shareId) return;

    const fetchReport = async () => {
      try {
        const response = await fetch(`${API_URL}/share/${shareId}`);
        if (response.status === 404) {
          setError("expired");
          return;
        }
        if (!response.ok) throw new Error("Failed to fetch report");
        const data = await response.json();
        setReport(data);
      } catch (err) {
        console.error("Failed to fetch shared report:", err);
        setError("error");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [shareId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-gradient flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error === "expired") {
    return (
      <div className="min-h-screen bg-bg-gradient flex items-center justify-center px-4">
        <SEOHead title="Report Expired — SpeedTest Pro" description="This shared report link has expired." />
        <div className="bg-card border border-border rounded-xl p-8 max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Report Expired</h1>
          <p className="text-muted-foreground mb-6">
            This shared report link has expired. Report links are valid for 7 days after creation.
          </p>
          <Link to="/">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Run Your Own Test
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-bg-gradient flex items-center justify-center px-4">
        <div className="bg-card border border-border rounded-xl p-8 max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Report Not Found</h1>
          <p className="text-muted-foreground mb-6">
            This report could not be loaded. It may have been removed or the backend is unavailable.
          </p>
          <Link to="/">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go to SpeedTest Pro
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const { report_data: data } = report;
  const speed = data.speedResult;
  const conn = data.connection;
  const device = data.device;

  return (
    <div className="min-h-screen bg-bg-gradient">
      <SEOHead
        title={`Speed Test Report — ${speed ? `${speed.download.speedMbps} Mbps` : "Network Diagnostics"}`}
        description={`Shared speed test results: ${speed ? `Download ${speed.download.speedMbps} Mbps, Upload ${speed.upload.speedMbps} Mbps, Ping ${speed.ping.latencyMs}ms` : "View network details"}`}
      />

      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">SpeedTest Pro</span>
          </Link>
          <span className="text-xs text-muted-foreground">
            Shared {new Date(data.timestamp).toLocaleDateString()}
          </span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-2xl font-bold mb-6">Shared Speed Test Report</h1>

        {/* Speed Results */}
        {speed && (
          <section className="bg-card border border-border rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Speed Test Results
            </h2>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <Activity className="w-5 h-5 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{speed.ping.latencyMs}</div>
                <div className="text-xs text-muted-foreground">Ping (ms)</div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <Download className="w-5 h-5 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{speed.download.speedMbps}</div>
                <div className="text-xs text-muted-foreground">Download (Mbps)</div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <Upload className="w-5 h-5 mx-auto mb-2 text-success" />
                <div className="text-2xl font-bold">{speed.upload.speedMbps}</div>
                <div className="text-xs text-muted-foreground">Upload (Mbps)</div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground text-center">
              Jitter: {speed.ping.jitterMs}ms • {speed.ping.samples} ping samples
            </div>
          </section>
        )}

        {/* Connection Info */}
        {conn && (
          <section className="bg-card border border-border rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Connection Details</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["ISP", conn.isp],
                ["Location", conn.location],
                ["IP Type", conn.ipType],
                ["Timezone", conn.timezone],
                ["VPN", conn.vpnDetected ? "Detected" : "Not Detected"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between p-2 bg-muted/20 rounded">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Device Info */}
        {device && (
          <section className="bg-card border border-border rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Device Information</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["Browser", device.browser],
                ["OS", device.os],
                ["Device Type", device.type],
                ["Screen", device.screen],
                ["Connection", device.connectionType],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between p-2 bg-muted/20 rounded">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="text-center mt-8">
          <Link to="/">
            <Button size="lg">Run Your Own Speed Test</Button>
          </Link>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Report expires: {new Date(report.expires_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
        </p>
      </main>

      <footer className="border-t border-border mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>SpeedTest Pro • Privacy-first speed testing</p>
        </div>
      </footer>
    </div>
  );
}
