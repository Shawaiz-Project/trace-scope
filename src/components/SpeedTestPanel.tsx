import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SpeedGauge } from "./SpeedGauge";
import { SpeedGraph } from "./SpeedGraph";
import {
  runSpeedTest,
  formatSpeed,
  formatBytes,
  type SpeedTestResult,
  type SpeedTestProgress,
} from "@/lib/speedtest";
import { saveTestResult } from "@/lib/speedHistory";
import {
  Play,
  Square,
  Download,
  Upload,
  Activity,
  Wifi,
  Clock,
  BarChart3,
  Share2,
} from "lucide-react";
import { toast } from "sonner";

interface SpeedTestPanelProps {
  onComplete?: (result: SpeedTestResult) => void;
  ipAddress?: string;
  isp?: string;
  location?: string;
}

interface SpeedDataPoint {
  time: number;
  speed: number;
}

export function SpeedTestPanel({ onComplete, ipAddress, isp, location }: SpeedTestPanelProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState<SpeedTestProgress>({ phase: "idle", progress: 0 });
  const [result, setResult] = useState<SpeedTestResult | null>(null);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [currentPing, setCurrentPing] = useState(0);
  const [downloadData, setDownloadData] = useState<SpeedDataPoint[]>([]);
  const [uploadData, setUploadData] = useState<SpeedDataPoint[]>([]);
  const startTimeRef = useRef<number>(0);

  const startTest = useCallback(async () => {
    setIsRunning(true);
    setResult(null);
    setCurrentSpeed(0);
    setCurrentPing(0);
    setDownloadData([]);
    setUploadData([]);
    startTimeRef.current = Date.now();

    try {
      const testResult = await runSpeedTest((prog) => {
        setProgress(prog);
        if (prog.currentSpeed !== undefined) {
          setCurrentSpeed(prog.currentSpeed);

          const timeElapsed = (Date.now() - startTimeRef.current) / 1000;

          if (prog.phase === "download") {
            setDownloadData((prev) => [...prev, { time: timeElapsed, speed: prog.currentSpeed! }]);
          } else if (prog.phase === "upload") {
            setUploadData((prev) => [...prev, { time: timeElapsed, speed: prog.currentSpeed! }]);
          }
        }
        if (prog.currentPing !== undefined) {
          setCurrentPing(prog.currentPing);
        }
      });

      setResult(testResult);
      onComplete?.(testResult);

      // Save to history
      saveTestResult(testResult, ipAddress, isp, location);

      toast.success("Speed test complete!");
    } catch (error) {
      console.error("Speed test failed:", error);
      toast.error("Speed test failed. Please try again.");
    } finally {
      setIsRunning(false);
      setProgress({ phase: "idle", progress: 0 });
    }
  }, [onComplete, ipAddress, isp, location]);

  const getPhaseLabel = () => {
    switch (progress.phase) {
      case "ping":
        return "Testing Latency...";
      case "download":
        return "Testing Download...";
      case "upload":
        return "Testing Upload...";
      case "complete":
        return "Complete!";
      default:
        return "Ready";
    }
  };

  const getOverallProgress = () => {
    switch (progress.phase) {
      case "ping":
        return progress.progress * 0.1;
      case "download":
        return 10 + progress.progress * 0.45;
      case "upload":
        return 55 + progress.progress * 0.45;
      case "complete":
        return 100;
      default:
        return 0;
    }
  };

  const shareResult = () => {
    if (!result) return;

    const text = `🚀 Speed Test Results\n📥 Download: ${formatSpeed(result.download.speedMbps)}\n📤 Upload: ${formatSpeed(result.upload.speedMbps)}\n📶 Ping: ${result.ping.latency.toFixed(1)}ms`;

    if (navigator.share) {
      navigator.share({
        title: "Speed Test Results",
        text: text,
      }).catch(() => {
        navigator.clipboard.writeText(text);
        toast.success("Results copied to clipboard!");
      });
    } else {
      navigator.clipboard.writeText(text);
      toast.success("Results copied to clipboard!");
    }
  };

  const graphPhase = progress.phase === "download" ? "download" : progress.phase === "upload" ? "upload" : "idle";
  const graphData = progress.phase === "download" ? downloadData : progress.phase === "upload" ? uploadData : result ? downloadData : [];

  return (
    <div className="space-y-6">
      {/* Main Gauge Display */}
      <div className="flex flex-col items-center">
        <SpeedGauge
          value={isRunning ? currentSpeed : result?.download.speedMbps || 0}
          maxValue={Math.max(100, currentSpeed * 1.5, result?.download.speedMbps || 100)}
          label={isRunning ? getPhaseLabel() : result ? "Download Speed" : "Ready to Test"}
          isActive={isRunning}
          color={progress.phase === "upload" ? "success" : "primary"}
        />
      </div>

      {/* Speed Graph */}
      {(isRunning || result) && (
        <div className="bg-muted/30 rounded-lg p-3">
          <div className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
            <BarChart3 className="w-3 h-3" />
            {isRunning ? `Real-time ${progress.phase === "upload" ? "Upload" : "Download"} Speed` : "Speed Graph"}
          </div>
          <SpeedGraph
            dataPoints={graphData}
            isActive={isRunning && (progress.phase === "download" || progress.phase === "upload")}
            phase={graphPhase}
            maxValue={Math.max(50, currentSpeed * 1.2)}
          />
        </div>
      )}

      {/* Progress Bar */}
      {isRunning && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{getPhaseLabel()}</span>
            <span className="font-medium">{Math.round(getOverallProgress())}%</span>
          </div>
          <Progress value={getOverallProgress()} className="h-2" />
        </div>
      )}

      {/* Current Stats During Test */}
      {isRunning && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <Activity className="w-5 h-5 mx-auto mb-2 text-primary" />
            <div className="text-lg font-bold">{currentPing.toFixed(1)} ms</div>
            <div className="text-xs text-muted-foreground">Current Ping</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <Wifi className="w-5 h-5 mx-auto mb-2 text-primary" />
            <div className="text-lg font-bold">{formatSpeed(currentSpeed)}</div>
            <div className="text-xs text-muted-foreground">Current Speed</div>
          </div>
        </div>
      )}

      {/* Results Display */}
      {result && !isRunning && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-lg p-4 text-center">
              <Activity className="w-5 h-5 mx-auto mb-2 text-info" />
              <div className="text-2xl font-bold">{result.ping.latency.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">Ping (ms)</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 text-center">
              <Download className="w-5 h-5 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{result.download.speedMbps.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">Download (Mbps)</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 text-center">
              <Upload className="w-5 h-5 mx-auto mb-2 text-success" />
              <div className="text-2xl font-bold">{result.upload.speedMbps.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">Upload (Mbps)</div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-muted-foreground flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> Jitter
              </span>
              <span className="font-mono">{result.ping.jitter.toFixed(2)} ms</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" /> Test Time
              </span>
              <span className="font-mono">
                {((result.download.durationMs + result.upload.durationMs) / 1000).toFixed(1)}s
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-muted-foreground flex items-center gap-2">
                <Download className="w-4 h-4" /> Data Downloaded
              </span>
              <span className="font-mono">{formatBytes(result.download.bytesTransferred)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-muted-foreground flex items-center gap-2">
                <Upload className="w-4 h-4" /> Data Uploaded
              </span>
              <span className="font-mono">{formatBytes(result.upload.bytesTransferred)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 justify-center">
        <Button onClick={startTest} disabled={isRunning} size="lg" className="px-8">
          {isRunning ? (
            <>
              <Square className="mr-2 h-5 w-5" />
              Testing...
            </>
          ) : (
            <>
              <Play className="mr-2 h-5 w-5" />
              {result ? "Test Again" : "Start Test"}
            </>
          )}
        </Button>

        {result && !isRunning && (
          <Button onClick={shareResult} variant="outline" size="lg">
            <Share2 className="mr-2 h-5 w-5" />
            Share
          </Button>
        )}
      </div>
    </div>
  );
}
