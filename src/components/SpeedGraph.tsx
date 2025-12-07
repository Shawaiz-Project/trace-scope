import { useEffect, useRef, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface SpeedDataPoint {
  time: number;
  speed: number;
}

interface SpeedGraphProps {
  dataPoints: SpeedDataPoint[];
  isActive: boolean;
  phase: "download" | "upload" | "idle";
  maxValue?: number;
}

export function SpeedGraph({ dataPoints, isActive, phase, maxValue = 100 }: SpeedGraphProps) {
  const [displayData, setDisplayData] = useState<SpeedDataPoint[]>([]);

  useEffect(() => {
    if (isActive) {
      setDisplayData(dataPoints.slice(-30)); // Show last 30 data points
    }
  }, [dataPoints, isActive]);

  useEffect(() => {
    if (!isActive) {
      // Keep final data when test completes
      if (dataPoints.length > 0) {
        setDisplayData(dataPoints.slice(-30));
      }
    }
  }, [isActive, dataPoints]);

  const lineColor = phase === "download" ? "#3b82f6" : phase === "upload" ? "#22c55e" : "#94a3b8";
  const gradientId = `speedGradient-${phase}`;

  if (displayData.length < 2) {
    return (
      <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
        {isActive ? "Collecting data..." : "Run a test to see the speed graph"}
      </div>
    );
  }

  const calculatedMax = Math.max(maxValue, ...displayData.map((d) => d.speed)) * 1.1;

  return (
    <div className="h-32 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={displayData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={lineColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
          <XAxis
            dataKey="time"
            tick={false}
            axisLine={{ stroke: "hsl(var(--border))" }}
          />
          <YAxis
            domain={[0, calculatedMax]}
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickFormatter={(val) => `${val.toFixed(0)}`}
            width={40}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(value: number) => [`${value.toFixed(2)} Mbps`, phase === "download" ? "Download" : "Upload"]}
            labelFormatter={() => ""}
          />
          <Line
            type="monotone"
            dataKey="speed"
            stroke={lineColor}
            strokeWidth={2}
            dot={false}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
