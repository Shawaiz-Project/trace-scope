import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  getTestHistory,
  clearTestHistory,
  deleteTestEntry,
  getAverageStats,
  type SpeedHistoryEntry,
} from "@/lib/speedHistory";
import { formatSpeed } from "@/lib/speedtest";
import {
  Download,
  Upload,
  Activity,
  Trash2,
  Clock,
  TrendingUp,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";

export function TestHistory() {
  const [history, setHistory] = useState<SpeedHistoryEntry[]>([]);
  const [stats, setStats] = useState(getAverageStats([]));

  const loadHistory = () => {
    const data = getTestHistory();
    setHistory(data);
    setStats(getAverageStats(data));
  };

  useEffect(() => {
    loadHistory();
    
    // Listen for storage changes
    const handleStorage = () => loadHistory();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all test history?")) {
      clearTestHistory();
      loadHistory();
      toast.success("History cleared");
    }
  };

  const handleDelete = (id: string) => {
    deleteTestEntry(id);
    loadHistory();
    toast.success("Entry deleted");
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No test history yet</p>
        <p className="text-sm mt-1">Run a speed test to start tracking</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <TrendingUp className="w-4 h-4 mx-auto mb-1 text-primary" />
          <div className="text-lg font-bold">{stats.totalTests}</div>
          <div className="text-xs text-muted-foreground">Total Tests</div>
        </div>
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <Download className="w-4 h-4 mx-auto mb-1 text-primary" />
          <div className="text-lg font-bold">{stats.avgDownload.toFixed(1)}</div>
          <div className="text-xs text-muted-foreground">Avg Download (Mbps)</div>
        </div>
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <Upload className="w-4 h-4 mx-auto mb-1 text-success" />
          <div className="text-lg font-bold">{stats.avgUpload.toFixed(1)}</div>
          <div className="text-xs text-muted-foreground">Avg Upload (Mbps)</div>
        </div>
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <Activity className="w-4 h-4 mx-auto mb-1 text-info" />
          <div className="text-lg font-bold">{stats.avgPing.toFixed(0)}</div>
          <div className="text-xs text-muted-foreground">Avg Ping (ms)</div>
        </div>
      </div>

      {/* Clear Button */}
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={handleClearAll}>
          <Trash2 className="w-4 h-4 mr-1" />
          Clear All
        </Button>
      </div>

      {/* History List */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {history.map((entry) => (
          <div
            key={entry.id}
            className="bg-card border border-border rounded-lg p-3 flex items-center justify-between group"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1">
                  <Download className="w-3 h-3 text-primary" />
                  <span className="font-mono">{entry.download.speedMbps.toFixed(1)}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Upload className="w-3 h-3 text-success" />
                  <span className="font-mono">{entry.upload.speedMbps.toFixed(1)}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Activity className="w-3 h-3 text-info" />
                  <span className="font-mono">{entry.ping.latency.toFixed(0)}ms</span>
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {formatDate(entry.timestamp)}
                {entry.location && (
                  <>
                    <span className="text-border">•</span>
                    <MapPin className="w-3 h-3" />
                    {entry.location}
                  </>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
              onClick={() => handleDelete(entry.id)}
            >
              <Trash2 className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
