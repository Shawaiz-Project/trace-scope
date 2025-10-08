import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/SectionCard";
import { InfoCard } from "@/components/InfoCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getDeviceInfo } from "@/lib/deviceInfo";
import { 
  Network, 
  Monitor, 
  Gauge, 
  MapPin, 
  Loader2,
  Download,
  Globe
} from "lucide-react";
import { toast } from "sonner";

interface IPInfo {
  ip: string;
  isp: string;
  asn: string;
  vpnDetected: boolean;
  reverseDns: string;
  city: string;
  country: string;
  ipType: string;
}

const Index = () => {
  const [loading, setLoading] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<ReturnType<typeof getDeviceInfo> | null>(null);
  const [ipInfo, setIpInfo] = useState<IPInfo | null>(null);

  const checkInfo = async () => {
    setLoading(true);
    try {
      // Get device info
      const info = getDeviceInfo();
      setDeviceInfo(info);

      // TODO: Get IP info from backend
      // For now, using placeholder data
      setIpInfo({
        ip: "203.0.113.45",
        isp: "Example ISP",
        asn: "AS12345",
        vpnDetected: false,
        reverseDns: "ipv4-203-0-113-45.example.com",
        city: "San Francisco",
        country: "United States",
        ipType: "IPv4"
      });

      toast.success("Information loaded successfully!");
    } catch (error) {
      toast.error("Failed to load information");
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!deviceInfo || !ipInfo) {
      toast.error("No data to download");
      return;
    }

    const report = {
      timestamp: new Date().toISOString(),
      ip: ipInfo,
      device: deviceInfo,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `device-info-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Report downloaded!");
  };

  return (
    <div className="min-h-screen bg-bg-gradient">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">IP & Device Info</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Check Your Device & Network Info
          </h2>
          <p className="text-muted-foreground text-lg mb-6">
            Get detailed information about your IP address, browser, device, and network connection
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              onClick={checkInfo}
              disabled={loading}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Loading...
                </>
              ) : (
                "Check My Info"
              )}
            </Button>
            {deviceInfo && (
              <Button
                onClick={downloadReport}
                variant="outline"
                size="lg"
              >
                <Download className="mr-2 h-5 w-5" />
                Download Report
              </Button>
            )}
          </div>
        </div>

        {/* Information Cards */}
        {deviceInfo && ipInfo && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* IP & Network Information */}
            <SectionCard
              title="IP & Network Information"
              action={
                <Button variant="outline" size="sm">
                  <Network className="mr-2 h-4 w-4" />
                  Trace Route
                </Button>
              }
            >
              <InfoCard label="IP Address" value={ipInfo.ip} monospace copyable />
              <InfoCard label="ISP" value={ipInfo.isp} />
              <InfoCard label="ASN" value={ipInfo.asn} monospace />
              <InfoCard label="VPN / Proxy" value={ipInfo.vpnDetected ? "Detected" : "Not Detected"} />
              <InfoCard label="Reverse DNS" value={ipInfo.reverseDns} monospace copyable />
              <InfoCard label="IP Type" value={ipInfo.ipType} />
              <InfoCard label="Location" value={`${ipInfo.city}, ${ipInfo.country}`} />
            </SectionCard>

            {/* Browser & Device Information */}
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

            {/* Network Performance */}
            <SectionCard title="Network Performance">
              <InfoCard 
                label="Connection Type" 
                value={deviceInfo.network.connectionType} 
              />
              <InfoCard 
                label="Estimated Speed" 
                value={deviceInfo.network.estimatedSpeed} 
              />
              <InfoCard label="Ping Latency" value="—" />
              <InfoCard label="Download Speed" value="—" />
            </SectionCard>
          </div>
        )}

        {/* Privacy Notice */}
        {!deviceInfo && (
          <div className="mt-12 p-6 bg-card rounded-lg border border-border">
            <h3 className="font-semibold mb-2">Privacy First</h3>
            <p className="text-sm text-muted-foreground">
              All information is collected locally in your browser. No data is stored on our servers 
              without your explicit consent. You can download your report and no tracking is performed.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Privacy-first diagnostic tool • No data stored • Open source</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
