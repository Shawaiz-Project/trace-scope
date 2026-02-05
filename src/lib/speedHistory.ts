import type { SpeedTestResult } from "./speedtest";
import { calculateNetworkQuality } from "./networkScoring";

export interface SpeedHistoryEntry extends SpeedTestResult {
  id: string;
  ipAddress?: string;
  isp?: string;
  location?: string;
  serverName?: string;
  qualityScore?: number;
  qualityGrade?: string;
}

const STORAGE_KEY = "speedtest_history";
const MAX_HISTORY_ENTRIES = 50;

export function saveTestResult(
  result: SpeedTestResult,
  ipAddress?: string,
  isp?: string,
  location?: string,
  serverName?: string
): SpeedHistoryEntry {
  // Calculate quality score
  const quality = calculateNetworkQuality(
    result.ping.latency,
    result.ping.jitter,
    result.download.speedMbps,
    result.upload.speedMbps
  );

  const entry: SpeedHistoryEntry = {
    ...result,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ipAddress,
    isp,
    location,
    serverName,
    qualityScore: quality.overallScore,
    qualityGrade: quality.grade,
  };

  const history = getTestHistory();
  history.unshift(entry);

  // Keep only the most recent entries
  if (history.length > MAX_HISTORY_ENTRIES) {
    history.length = MAX_HISTORY_ENTRIES;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  return entry;
}

export function getTestHistory(): SpeedHistoryEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function clearTestHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function deleteTestEntry(id: string): void {
  const history = getTestHistory();
  const filtered = history.filter((entry) => entry.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function getAverageStats(history: SpeedHistoryEntry[]): {
  avgDownload: number;
  avgUpload: number;
  avgPing: number;
  totalTests: number;
} {
  if (history.length === 0) {
    return { avgDownload: 0, avgUpload: 0, avgPing: 0, totalTests: 0 };
  }

  const totals = history.reduce(
    (acc, entry) => ({
      download: acc.download + entry.download.speedMbps,
      upload: acc.upload + entry.upload.speedMbps,
      ping: acc.ping + entry.ping.latency,
    }),
    { download: 0, upload: 0, ping: 0 }
  );

  return {
    avgDownload: totals.download / history.length,
    avgUpload: totals.upload / history.length,
    avgPing: totals.ping / history.length,
    totalTests: history.length,
  };
}
