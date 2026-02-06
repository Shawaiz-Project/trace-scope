import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/SectionCard";
import { InfoCard } from "@/components/InfoCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SpeedTestPanel } from "@/components/SpeedTestPanel";
import { TestHistory } from "@/components/TestHistory";
import { ReportDownload } from "@/components/ReportDownload";
import { getDeviceInfo } from "@/lib/deviceInfo";
import { fetchIPInfo, type SpeedTestResult } from "@/lib/speedtest";
import {
  Network,
  Monitor,
  Gauge,
  MapPin,
  Loader2,
  Download,
  Globe,
  Zap,
  RefreshCw,
  History,
} from "lucide-react";
import { toast } from "sonner";

interface IPInfo {
  ip: string;
  isp: string;
  asn: string;
  vpnDetected: boolean;
  reverseDns: string;
  city: string;
  region: string;
  country: string;
  countryCode: string;
  timezone: string;
  ipType: string;
  userAgent?: string;
}

const Index = () => {
  const [loading, setLoading] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<ReturnType<typeof getDeviceInfo> | null>(null);
  const [ipInfo, setIpInfo] = useState<IPInfo | null>(null);
  const [speedResult, setSpeedResult] = useState<SpeedTestResult | null>(null);
  const [activeTab, setActiveTab] = useState<"speedtest" | "info" | "history">("speedtest");

  const checkInfo = async () => {
    setLoading(true);
    try {
      // Get device info (client-side)
      const info = getDeviceInfo();
      setDeviceInfo(info);

      // Get IP info from backend
      try {
        const ipData = await fetchIPInfo();
        setIpInfo({
          ip: ipData.ip,
          isp: ipData.isp || "Unknown ISP",
          asn: ipData.asn || "Unknown",
          vpnDetected: ipData.vpnDetected || false,
          reverseDns: ipData.reverseDns || "",
          city: ipData.city || "Unknown",
          region: ipData.region || "Unknown",
          country: ipData.country || "Unknown",
          countryCode: ipData.countryCode || "XX",
          timezone: ipData.timezone || "Unknown",
          ipType: ipData.ipType || "IPv4",
          userAgent: ipData.userAgent,
        });
      } catch (err) {
        console.error("Failed to fetch IP info:", err);
        setIpInfo({
          ip: "Unavailable",
          isp: "Unknown",
          asn: "Unknown",
          vpnDetected: false,
          reverseDns: "",
          city: "Unknown",
          region: "Unknown",
          country: "Unknown",
          countryCode: "XX",
          timezone: "Unknown",
          ipType: "Unknown",
        });
      }

      toast.success("Information loaded successfully!");
    } catch (error) {
      console.error("Error loading info:", error);
      toast.error("Failed to load information");
    } finally {
      setLoading(false);
    }
  };

  // Auto-load device info on mount
  useEffect(() => {
    checkInfo();
  }, []);

  const locationString = ipInfo ? `${ipInfo.city}, ${ipInfo.country}` : undefined;

  return (
    <div className="min-h-screen bg-bg-gradient">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">SpeedTest Pro</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={checkInfo} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit mx-auto">
          <button
            onClick={() => setActiveTab("speedtest")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === "speedtest"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Gauge className="w-4 h-4" />
            <span className="hidden sm:inline">Speed Test</span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === "history"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">History</span>
          </button>
          <button
            onClick={() => setActiveTab("info")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === "info"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">Device Info</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 max-w-4xl">
        {/* Speed Test Tab */}
        {activeTab === "speedtest" && (
          <div className="space-y-6">
            {/* Speed Test Panel */}
            <div className="bg-card border border-border rounded-xl p-6 md:p-8">
              <SpeedTestPanel
                onComplete={setSpeedResult}
                ipAddress={ipInfo?.ip}
                isp={ipInfo?.isp}
                location={locationString}
              />
            </div>

            {/* Quick IP Info */}
            {ipInfo && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card border border-border rounded-lg p-4 text-center">
                  <div className="text-xs text-muted-foreground mb-1">IP Address</div>
                  <div className="font-mono text-sm truncate">{ipInfo.ip}</div>
                </div>
                <div className="bg-card border border-border rounded-lg p-4 text-center">
                  <div className="text-xs text-muted-foreground mb-1">ISP</div>
                  <div className="text-sm truncate">{ipInfo.isp}</div>
                </div>
                <div className="bg-card border border-border rounded-lg p-4 text-center">
                  <div className="text-xs text-muted-foreground mb-1">Location</div>
                  <div className="text-sm truncate">
                    {ipInfo.city}, {ipInfo.country}
                  </div>
                </div>
                <div className="bg-card border border-border rounded-lg p-4 text-center">
                  <div className="text-xs text-muted-foreground mb-1">Connection</div>
                  <div className="text-sm">{deviceInfo?.network.connectionType || "Unknown"}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <History className="w-5 h-5" />
              Test History
            </h2>
            <TestHistory />
          </div>
        )}

        {/* Device Info Tab */}
        {activeTab === "info" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Download Report Button */}
            {deviceInfo && (
              <div className="flex justify-end">
                <ReportDownload
                  speedResult={speedResult}
                  ipInfo={ipInfo}
                  deviceInfo={deviceInfo}
                  location={locationString}
                />
              </div>
            )}

            {/* IP & Network Information */}
            {ipInfo && (
              <SectionCard title="IP & Network Information">
                <InfoCard label="IP Address" value={ipInfo.ip} monospace copyable />
                <InfoCard label="ISP" value={ipInfo.isp} />
                <InfoCard label="ASN" value={ipInfo.asn} monospace />
                <InfoCard label="VPN / Proxy" value={ipInfo.vpnDetected ? "Detected" : "Not Detected"} />
                <InfoCard label="IP Type" value={ipInfo.ipType} />
                <InfoCard label="City" value={ipInfo.city} />
                <InfoCard label="Region" value={ipInfo.region} />
                <InfoCard label="Country" value={`${ipInfo.country} (${ipInfo.countryCode})`} />
                <InfoCard label="Timezone" value={ipInfo.timezone} />
              </SectionCard>
            )}

            {/* Browser & Device Information */}
            {deviceInfo && (
              <SectionCard title="Browser & Device Information">
                <InfoCard label="Browser" value={`${deviceInfo.browser.name} ${deviceInfo.browser.version}`} />
                <InfoCard label="Operating System" value={deviceInfo.device.os} />
                <InfoCard label="Device Type" value={deviceInfo.device.type} />
                <InfoCard label="Screen Resolution" value={deviceInfo.device.screenResolution} monospace />
                <InfoCard label="Color Depth" value={deviceInfo.device.colorDepth} />
                <InfoCard label="CPU Cores" value={deviceInfo.device.cpuCores} />
                <InfoCard label="Device Memory" value={deviceInfo.device.memory} />
                <InfoCard label="GPU Renderer" value={deviceInfo.device.gpuRenderer} />
                <InfoCard label="Timezone" value={deviceInfo.device.timezone} />
                <InfoCard label="Language" value={deviceInfo.browser.language} />
                <InfoCard label="Cookies" value={deviceInfo.browser.cookiesEnabled} />
                <InfoCard label="Do Not Track" value={deviceInfo.browser.dnt} />
              </SectionCard>
            )}

            {/* Network Performance */}
            {deviceInfo && (
              <SectionCard title="Network Performance">
                <InfoCard label="Connection Type" value={deviceInfo.network.connectionType} />
                <InfoCard label="Estimated Speed" value={deviceInfo.network.estimatedSpeed} />
                {speedResult && (
                  <>
                    <InfoCard label="Ping Latency" value={`${speedResult.ping.latency.toFixed(1)} ms`} />
                    <InfoCard label="Jitter" value={`${speedResult.ping.jitter.toFixed(2)} ms`} />
                    <InfoCard label="Download Speed" value={`${speedResult.download.speedMbps.toFixed(2)} Mbps`} />
                    <InfoCard label="Upload Speed" value={`${speedResult.upload.speedMbps.toFixed(2)} Mbps`} />
                  </>
                )}
              </SectionCard>
            )}

            {/* Loading State */}
            {loading && !deviceInfo && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}
          </div>
        )}

        {/* Privacy Notice */}
        <div className="mt-8 p-4 bg-card/50 rounded-lg border border-border">
          <p className="text-xs text-muted-foreground text-center">
            🔒 Privacy First: All tests run directly from your browser. No data is stored on our servers without your
            consent. History is stored locally on your device.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Privacy-first speed test & diagnostics • No tracking • Open source</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
