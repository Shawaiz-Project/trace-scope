import type { SpeedTestResult } from "@/lib/speedtest";
import { calculateNetworkQuality } from "@/lib/networkScoring";

export type ReportFormat = "json" | "csv" | "html";

interface ReportData {
  timestamp: string;
  ip?: string;
  isp?: string;
  location?: string;
  serverName?: string;
  speedResult?: SpeedTestResult | null;
  deviceInfo?: {
    browser: { name: string; version: string; language: string; [key: string]: unknown };
    device: { os: string; type: string; screenResolution: string; cpuCores: string | number; memory: string; [key: string]: unknown };
    network: { connectionType: string; estimatedSpeed: string; [key: string]: unknown };
  } | null;
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
}

function buildReportObject(data: ReportData) {
  const quality =
    data.speedResult
      ? calculateNetworkQuality(
          data.speedResult.ping.latency,
          data.speedResult.ping.jitter,
          data.speedResult.download.speedMbps,
          data.speedResult.upload.speedMbps
        )
      : null;

  return {
    reportGenerated: data.timestamp,
    connection: {
      ipAddress: data.ipInfo?.ip || data.ip || "N/A",
      isp: data.ipInfo?.isp || data.isp || "N/A",
      asn: data.ipInfo?.asn || "N/A",
      location: data.ipInfo
        ? `${data.ipInfo.city}, ${data.ipInfo.region}, ${data.ipInfo.country}`
        : data.location || "N/A",
      timezone: data.ipInfo?.timezone || "N/A",
      ipType: data.ipInfo?.ipType || "N/A",
      vpnDetected: data.ipInfo?.vpnDetected ?? false,
    },
    speedTest: data.speedResult
      ? {
          server: data.serverName || "Auto",
          download: {
            speedMbps: +data.speedResult.download.speedMbps.toFixed(2),
            bytesTransferred: data.speedResult.download.bytesTransferred,
            durationMs: +data.speedResult.download.durationMs.toFixed(0),
          },
          upload: {
            speedMbps: +data.speedResult.upload.speedMbps.toFixed(2),
            bytesTransferred: data.speedResult.upload.bytesTransferred,
            durationMs: +data.speedResult.upload.durationMs.toFixed(0),
          },
          ping: {
            latencyMs: +data.speedResult.ping.latency.toFixed(2),
            jitterMs: +data.speedResult.ping.jitter.toFixed(2),
            samples: data.speedResult.ping.samples.length,
          },
        }
      : null,
    qualityScore: quality
      ? {
          grade: quality.grade,
          overall: quality.overallScore,
          gaming: quality.recommendations.find((r) => r.category === "gaming")?.suitable ? "Suitable" : "Not Ideal",
          streaming4k: quality.recommendations.find((r) => r.category === "streaming_4k")?.suitable ? "Suitable" : "Not Ideal",
          videoCall: quality.recommendations.find((r) => r.category === "video_calls")?.suitable ? "Suitable" : "Not Ideal",
        }
      : null,
    device: data.deviceInfo
      ? {
          browser: `${data.deviceInfo.browser.name} ${data.deviceInfo.browser.version}`,
          os: data.deviceInfo.device.os,
          type: data.deviceInfo.device.type,
          screen: data.deviceInfo.device.screenResolution,
          cpuCores: String(data.deviceInfo.device.cpuCores),
          memory: data.deviceInfo.device.memory,
          connectionType: data.deviceInfo.network.connectionType,
          language: data.deviceInfo.browser.language,
        }
      : null,
  };
}

function generateJSON(data: ReportData): string {
  return JSON.stringify(buildReportObject(data), null, 2);
}

function generateCSV(data: ReportData): string {
  const report = buildReportObject(data);
  const rows: string[][] = [["Field", "Value"]];

  rows.push(["Report Generated", report.reportGenerated]);

  // Connection
  rows.push(["IP Address", report.connection.ipAddress]);
  rows.push(["ISP", report.connection.isp]);
  rows.push(["ASN", report.connection.asn]);
  rows.push(["Location", report.connection.location]);
  rows.push(["Timezone", report.connection.timezone]);
  rows.push(["IP Type", report.connection.ipType]);
  rows.push(["VPN Detected", String(report.connection.vpnDetected)]);

  // Speed Test
  if (report.speedTest) {
    rows.push(["Server", report.speedTest.server]);
    rows.push(["Download (Mbps)", String(report.speedTest.download.speedMbps)]);
    rows.push(["Upload (Mbps)", String(report.speedTest.upload.speedMbps)]);
    rows.push(["Ping (ms)", String(report.speedTest.ping.latencyMs)]);
    rows.push(["Jitter (ms)", String(report.speedTest.ping.jitterMs)]);
    rows.push(["Download Data (bytes)", String(report.speedTest.download.bytesTransferred)]);
    rows.push(["Upload Data (bytes)", String(report.speedTest.upload.bytesTransferred)]);
  }

  // Quality Score
  if (report.qualityScore) {
    rows.push(["Quality Grade", report.qualityScore.grade]);
    rows.push(["Quality Score", String(report.qualityScore.overall)]);
    rows.push(["Gaming Suitability", report.qualityScore.gaming]);
    rows.push(["4K Streaming", report.qualityScore.streaming4k]);
    rows.push(["Video Calls", report.qualityScore.videoCall]);
  }

  // Device
  if (report.device) {
    rows.push(["Browser", report.device.browser]);
    rows.push(["OS", report.device.os]);
    rows.push(["Device Type", report.device.type]);
    rows.push(["Screen", report.device.screen]);
    rows.push(["CPU Cores", report.device.cpuCores]);
    rows.push(["Memory", report.device.memory]);
    rows.push(["Connection Type", report.device.connectionType]);
  }

  return rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
}

function generateHTML(data: ReportData): string {
  const report = buildReportObject(data);

  const section = (title: string, items: [string, string][]) => `
    <div class="section">
      <h2>${title}</h2>
      <table>
        <tbody>
          ${items.map(([k, v]) => `<tr><td class="label">${k}</td><td>${v}</td></tr>`).join("")}
        </tbody>
      </table>
    </div>`;

  const speedSection = report.speedTest
    ? section("Speed Test Results", [
        ["Server", report.speedTest.server],
        ["Download", `${report.speedTest.download.speedMbps} Mbps`],
        ["Upload", `${report.speedTest.upload.speedMbps} Mbps`],
        ["Ping", `${report.speedTest.ping.latencyMs} ms`],
        ["Jitter", `${report.speedTest.ping.jitterMs} ms`],
      ])
    : "";

  const qualitySection = report.qualityScore
    ? section("Network Quality", [
        ["Grade", `<span class="grade grade-${report.qualityScore.grade.replace("+", "plus")}">${report.qualityScore.grade}</span>`],
        ["Overall Score", `${report.qualityScore.overall}/100`],
        ["Gaming", report.qualityScore.gaming],
        ["4K Streaming", report.qualityScore.streaming4k],
        ["Video Calls", report.qualityScore.videoCall],
      ])
    : "";

  const deviceSection = report.device
    ? section("Device Information", [
        ["Browser", report.device.browser],
        ["OS", report.device.os],
        ["Device Type", report.device.type],
        ["Screen", report.device.screen],
        ["CPU Cores", report.device.cpuCores],
        ["Memory", report.device.memory],
      ])
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SpeedTest Pro Report - ${report.reportGenerated}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', system-ui, sans-serif; background: #0f172a; color: #e2e8f0; padding: 2rem; }
  .container { max-width: 720px; margin: 0 auto; }
  h1 { font-size: 1.75rem; margin-bottom: 0.25rem; color: #60a5fa; }
  .subtitle { color: #94a3b8; font-size: 0.875rem; margin-bottom: 2rem; }
  .section { background: #1e293b; border-radius: 12px; padding: 1.5rem; margin-bottom: 1.25rem; border: 1px solid #334155; }
  .section h2 { font-size: 1rem; color: #60a5fa; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
  table { width: 100%; border-collapse: collapse; }
  tr { border-bottom: 1px solid #334155; }
  tr:last-child { border-bottom: none; }
  td { padding: 0.625rem 0; font-size: 0.9rem; }
  .label { color: #94a3b8; width: 45%; }
  .grade { font-weight: 700; padding: 2px 10px; border-radius: 6px; font-size: 1rem; }
  .grade-Aplus, .grade-A { background: #065f46; color: #34d399; }
  .grade-B { background: #1e3a5f; color: #60a5fa; }
  .grade-C { background: #78350f; color: #fbbf24; }
  .grade-D, .grade-F { background: #7f1d1d; color: #f87171; }
  .footer { text-align: center; margin-top: 2rem; color: #64748b; font-size: 0.75rem; }
</style>
</head>
<body>
<div class="container">
  <h1>⚡ SpeedTest Pro Report</h1>
  <p class="subtitle">Generated: ${report.reportGenerated}</p>
  ${section("Connection Details", [
    ["IP Address", report.connection.ipAddress],
    ["ISP", report.connection.isp],
    ["ASN", report.connection.asn],
    ["Location", report.connection.location],
    ["Timezone", report.connection.timezone],
    ["IP Type", report.connection.ipType],
    ["VPN Detected", report.connection.vpnDetected ? "⚠️ Yes" : "✅ No"],
  ])}
  ${speedSection}
  ${qualitySection}
  ${deviceSection}
  <div class="footer">SpeedTest Pro • Privacy-first speed testing</div>
</div>
</body>
</html>`;
}

export function downloadReport(data: ReportData, format: ReportFormat) {
  let content: string;
  let mimeType: string;
  let extension: string;

  switch (format) {
    case "json":
      content = generateJSON(data);
      mimeType = "application/json";
      extension = "json";
      break;
    case "csv":
      content = generateCSV(data);
      mimeType = "text/csv";
      extension = "csv";
      break;
    case "html":
      content = generateHTML(data);
      mimeType = "text/html";
      extension = "html";
      break;
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `speedtest-report-${Date.now()}.${extension}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
