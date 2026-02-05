import { useMemo } from "react";
import {
  calculateNetworkQuality,
  getGradeColor,
  getGradeBgColor,
  type NetworkQualityScore as QualityScore,
} from "@/lib/networkScoring";
import { Check, X, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface NetworkQualityScoreProps {
  ping: number;
  jitter: number;
  downloadMbps: number;
  uploadMbps: number;
  packetLoss?: number;
}

export function NetworkQualityScore({
  ping,
  jitter,
  downloadMbps,
  uploadMbps,
  packetLoss = 0,
}: NetworkQualityScoreProps) {
  const [showDetails, setShowDetails] = useState(false);

  const quality = useMemo(
    () => calculateNetworkQuality(ping, jitter, downloadMbps, uploadMbps, packetLoss),
    [ping, jitter, downloadMbps, uploadMbps, packetLoss]
  );

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
      {/* Score Display */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Network Quality</h3>
          <p className="text-sm text-muted-foreground">{quality.summary}</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Score Circle */}
          <div className="relative w-20 h-20">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              {/* Background circle */}
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-muted"
              />
              {/* Score arc */}
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={`${quality.overallScore} 100`}
                className={getGradeColor(quality.grade).replace("text-", "stroke-")}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold">{quality.overallScore}</span>
            </div>
          </div>
          {/* Grade Badge */}
          <div
            className={`w-14 h-14 rounded-full ${getGradeBgColor(quality.grade)} flex items-center justify-center`}
          >
            <span className="text-xl font-bold text-white">{quality.grade}</span>
          </div>
        </div>
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {quality.recommendations.map((rec) => (
          <div
            key={rec.category}
            className={`p-3 rounded-lg border ${
              rec.suitable
                ? "bg-green-500/10 border-green-500/30"
                : "bg-muted/50 border-border"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{rec.icon}</span>
              <span className="font-medium text-sm">{rec.label}</span>
              {rec.suitable ? (
                <Check className="w-4 h-4 text-green-500 ml-auto" />
              ) : (
                <X className="w-4 h-4 text-muted-foreground ml-auto" />
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">{rec.description}</p>
          </div>
        ))}
      </div>

      {/* Expandable Details */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground w-full justify-center"
      >
        {showDetails ? (
          <>
            <ChevronUp className="w-4 h-4" /> Hide Details
          </>
        ) : (
          <>
            <ChevronDown className="w-4 h-4" /> Show Details
          </>
        )}
      </button>

      {showDetails && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Ping Score</div>
            <div className="text-lg font-bold">{quality.pingScore}/100</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Jitter Score</div>
            <div className="text-lg font-bold">{quality.jitterScore}/100</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Download Score</div>
            <div className="text-lg font-bold">{quality.downloadScore}/100</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Upload Score</div>
            <div className="text-lg font-bold">{quality.uploadScore}/100</div>
          </div>
        </div>
      )}
    </div>
  );
}
