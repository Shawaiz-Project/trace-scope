import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileJson, FileSpreadsheet, FileText } from "lucide-react";
import { downloadReport, type ReportFormat } from "@/lib/reportGenerator";
import type { SpeedTestResult } from "@/lib/speedtest";
import { toast } from "sonner";

interface ReportDownloadProps {
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
  serverName?: string;
  location?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function ReportDownload({
  speedResult,
  ipInfo,
  deviceInfo,
  serverName,
  location,
  variant = "outline",
  size = "sm",
}: ReportDownloadProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = (format: ReportFormat) => {
    if (!deviceInfo && !ipInfo && !speedResult) {
      toast.error("No data available to download");
      return;
    }

    setDownloading(true);
    try {
      downloadReport(
        {
          timestamp: new Date().toISOString(),
          ip: ipInfo?.ip,
          isp: ipInfo?.isp,
          location,
          serverName,
          speedResult,
          deviceInfo: deviceInfo
            ? {
                browser: {
                  name: deviceInfo.browser.name,
                  version: deviceInfo.browser.version,
                  language: deviceInfo.browser.language,
                },
                device: {
                  os: deviceInfo.device.os,
                  type: deviceInfo.device.type,
                  screenResolution: deviceInfo.device.screenResolution,
                  cpuCores: deviceInfo.device.cpuCores,
                  memory: deviceInfo.device.memory,
                },
                network: {
                  connectionType: deviceInfo.network.connectionType,
                  estimatedSpeed: deviceInfo.network.estimatedSpeed,
                },
              }
            : null,
          ipInfo: ipInfo || null,
        },
        format
      );
      toast.success(`Report downloaded as ${format.toUpperCase()}`);
    } catch {
      toast.error("Failed to generate report");
    } finally {
      setDownloading(false);
    }
  };

  const formats: { format: ReportFormat; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      format: "html",
      label: "HTML Report",
      icon: <FileText className="w-4 h-4 mr-2" />,
      desc: "Styled report viewable in browser",
    },
    {
      format: "csv",
      label: "CSV Spreadsheet",
      icon: <FileSpreadsheet className="w-4 h-4 mr-2" />,
      desc: "For Excel, Google Sheets",
    },
    {
      format: "json",
      label: "JSON Data",
      icon: <FileJson className="w-4 h-4 mr-2" />,
      desc: "Machine-readable format",
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={downloading}>
          <Download className="mr-2 h-4 w-4" />
          Download Report
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {formats.map(({ format, label, icon, desc }) => (
          <DropdownMenuItem
            key={format}
            onClick={() => handleDownload(format)}
            className="flex flex-col items-start gap-0.5 py-2.5 cursor-pointer"
          >
            <div className="flex items-center font-medium">
              {icon}
              {label}
            </div>
            <span className="text-xs text-muted-foreground ml-6">{desc}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
