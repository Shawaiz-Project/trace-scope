// Generate shareable speed test result card

interface CardData {
  downloadMbps: number;
  uploadMbps: number;
  ping: number;
  jitter: number;
  qualityScore: number;
  grade: string;
  isp: string;
  location: string;
  serverRegion: string;
  timestamp: string;
  theme: "dark" | "light";
}

// Generate card using Canvas API
export async function generateShareCard(data: CardData): Promise<{
  blob: Blob;
  dataUrl: string;
  filename: string;
}> {
  const width = 1200;
  const height = 630;

  // Create canvas
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  // Theme colors
  const isDark = data.theme === "dark";
  const bgColor = isDark ? "#111827" : "#f9fafb";
  const cardBg = isDark ? "#1f2937" : "#ffffff";
  const textPrimary = isDark ? "#ffffff" : "#111827";
  const textSecondary = isDark ? "#9ca3af" : "#6b7280";
  const accentColor = "#3b82f6";
  const downloadColor = "#22c55e";
  const uploadColor = "#a855f7";

  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  // Card background with border
  const padding = 40;
  ctx.fillStyle = cardBg;
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 2;
  roundRect(ctx, padding, padding, width - padding * 2, height - padding * 2, 16);
  ctx.fill();
  ctx.stroke();

  // Title
  ctx.fillStyle = accentColor;
  ctx.font = "bold 36px system-ui, -apple-system, sans-serif";
  ctx.fillText("Speed Test Results", 80, 100);

  // Grade badge
  const gradeColors: Record<string, string> = {
    "A+": "#22c55e",
    A: "#22c55e",
    B: "#eab308",
    C: "#f97316",
    D: "#ef4444",
    F: "#ef4444",
  };
  const gradeColor = gradeColors[data.grade] || accentColor;

  // Draw grade circle
  const gradeX = 1050;
  const gradeY = 100;
  ctx.beginPath();
  ctx.arc(gradeX, gradeY, 50, 0, Math.PI * 2);
  ctx.fillStyle = gradeColor;
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 36px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(data.grade, gradeX, gradeY + 12);
  ctx.textAlign = "left";

  // Score text
  ctx.fillStyle = textSecondary;
  ctx.font = "18px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(`Score: ${data.qualityScore}`, gradeX, gradeY + 80);
  ctx.textAlign = "left";

  // Main metrics
  const metricsY = 200;

  // Download
  ctx.fillStyle = downloadColor;
  ctx.font = "bold 24px system-ui";
  ctx.fillText("↓ DOWNLOAD", 80, metricsY);
  ctx.fillStyle = textPrimary;
  ctx.font = "bold 72px system-ui";
  ctx.fillText(data.downloadMbps.toFixed(1), 80, metricsY + 80);
  ctx.fillStyle = textSecondary;
  ctx.font = "24px system-ui";
  ctx.fillText("Mbps", 280, metricsY + 80);

  // Upload
  ctx.fillStyle = uploadColor;
  ctx.font = "bold 24px system-ui";
  ctx.fillText("↑ UPLOAD", 450, metricsY);
  ctx.fillStyle = textPrimary;
  ctx.font = "bold 72px system-ui";
  ctx.fillText(data.uploadMbps.toFixed(1), 450, metricsY + 80);
  ctx.fillStyle = textSecondary;
  ctx.font = "24px system-ui";
  ctx.fillText("Mbps", 630, metricsY + 80);

  // Ping
  ctx.fillStyle = accentColor;
  ctx.font = "bold 24px system-ui";
  ctx.fillText("PING", 800, metricsY);
  ctx.fillStyle = textPrimary;
  ctx.font = "bold 72px system-ui";
  ctx.fillText(data.ping.toFixed(0), 800, metricsY + 80);
  ctx.fillStyle = textSecondary;
  ctx.font = "24px system-ui";
  ctx.fillText("ms", 920, metricsY + 80);

  // Jitter
  ctx.fillStyle = textSecondary;
  ctx.font = "bold 20px system-ui";
  ctx.fillText("JITTER", 1000, metricsY);
  ctx.fillStyle = textPrimary;
  ctx.font = "bold 36px system-ui";
  ctx.fillText(data.jitter.toFixed(1), 1000, metricsY + 50);
  ctx.fillStyle = textSecondary;
  ctx.font = "18px system-ui";
  ctx.fillText("ms", 1080, metricsY + 50);

  // Divider
  ctx.beginPath();
  ctx.moveTo(80, 360);
  ctx.lineTo(width - 80, 360);
  ctx.strokeStyle = textSecondary;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Info section
  const infoY = 400;
  ctx.font = "24px system-ui";

  // ISP
  ctx.fillStyle = textSecondary;
  ctx.fillText("ISP:", 80, infoY);
  ctx.fillStyle = textPrimary;
  ctx.fillText(data.isp.substring(0, 40), 150, infoY);

  // Location
  ctx.fillStyle = textSecondary;
  ctx.fillText("Location:", 80, infoY + 45);
  ctx.fillStyle = textPrimary;
  ctx.fillText(data.location.substring(0, 35), 200, infoY + 45);

  // Server
  ctx.fillStyle = textSecondary;
  ctx.fillText("Server:", 650, infoY);
  ctx.fillStyle = textPrimary;
  ctx.fillText(data.serverRegion.substring(0, 25), 750, infoY);

  // Timestamp
  ctx.fillStyle = textSecondary;
  ctx.fillText("Tested:", 650, infoY + 45);
  ctx.fillStyle = textPrimary;
  ctx.fillText(data.timestamp.substring(0, 25), 750, infoY + 45);

  // Footer
  ctx.fillStyle = accentColor;
  ctx.font = "bold 24px system-ui";
  ctx.fillText("SpeedTest Dashboard", 80, height - 70);
  ctx.fillStyle = textSecondary;
  ctx.font = "20px system-ui";
  ctx.fillText("speedtest.app", width - 200, height - 70);

  // Convert to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const dataUrl = canvas.toDataURL("image/png", 0.95);
          const dt = new Date().toISOString().replace(/[:.]/g, "-").substring(0, 19);
          const filename = `speedtest_result_${dt}.png`;
          resolve({ blob, dataUrl, filename });
        } else {
          reject(new Error("Failed to generate image"));
        }
      },
      "image/png",
      0.95
    );
  });
}

// Helper function for rounded rectangles
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// Download the generated card
export function downloadCard(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Share using Web Share API
export async function shareCard(blob: Blob, filename: string): Promise<boolean> {
  if (navigator.share && navigator.canShare) {
    try {
      const file = new File([blob], filename, { type: "image/png" });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Speed Test Results",
          text: "Check out my speed test results!",
        });
        return true;
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Share failed:", error);
      }
    }
  }
  return false;
}
