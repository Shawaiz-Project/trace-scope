import { useEffect, useRef } from "react";

interface SpeedGaugeProps {
  value: number; // Current speed in Mbps
  maxValue?: number; // Max gauge value
  label: string;
  unit?: string;
  isActive?: boolean;
  color?: "primary" | "success" | "info";
}

export function SpeedGauge({
  value,
  maxValue = 100,
  label,
  unit = "Mbps",
  isActive = false,
  color = "primary",
}: SpeedGaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animatedValue = useRef(0);
  const animationRef = useRef<number>();

  const colorMap = {
    primary: { main: "#3b82f6", glow: "#60a5fa" },
    success: { main: "#22c55e", glow: "#4ade80" },
    info: { main: "#0ea5e9", glow: "#38bdf8" },
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 200;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = 80;
    const lineWidth = 12;

    const draw = () => {
      // Smooth animation towards target value
      const diff = value - animatedValue.current;
      animatedValue.current += diff * 0.1;

      ctx.clearRect(0, 0, size, size);

      // Background arc
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0.75 * Math.PI, 2.25 * Math.PI);
      ctx.strokeStyle = "hsl(var(--muted))";
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.stroke();

      // Value arc
      const percentage = Math.min(animatedValue.current / maxValue, 1);
      const endAngle = 0.75 * Math.PI + percentage * 1.5 * Math.PI;

      if (percentage > 0) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0.75 * Math.PI, endAngle);
        
        // Gradient stroke
        const gradient = ctx.createLinearGradient(0, 0, size, size);
        gradient.addColorStop(0, colorMap[color].main);
        gradient.addColorStop(1, colorMap[color].glow);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = "round";
        ctx.stroke();

        // Glow effect when active
        if (isActive) {
          ctx.shadowColor = colorMap[color].glow;
          ctx.shadowBlur = 15;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      }

      // Continue animation if not settled
      if (Math.abs(diff) > 0.01) {
        animationRef.current = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, maxValue, isActive, color]);

  // Trigger redraw when value changes
  useEffect(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 200;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = 80;
    const lineWidth = 12;

    const animate = () => {
      const diff = value - animatedValue.current;
      animatedValue.current += diff * 0.1;

      ctx.clearRect(0, 0, size, size);

      // Background arc
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0.75 * Math.PI, 2.25 * Math.PI);
      ctx.strokeStyle = "hsl(var(--muted))";
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.stroke();

      // Value arc
      const percentage = Math.min(animatedValue.current / maxValue, 1);
      const endAngle = 0.75 * Math.PI + percentage * 1.5 * Math.PI;

      if (percentage > 0) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0.75 * Math.PI, endAngle);
        
        const gradient = ctx.createLinearGradient(0, 0, size, size);
        gradient.addColorStop(0, colorMap[color].main);
        gradient.addColorStop(1, colorMap[color].glow);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = "round";
        ctx.stroke();

        if (isActive) {
          ctx.shadowColor = colorMap[color].glow;
          ctx.shadowBlur = 15;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      }

      if (Math.abs(diff) > 0.01) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, maxValue, isActive, color]);

  const displayValue = value < 1 ? value.toFixed(2) : value.toFixed(1);

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={200}
          height={200}
          className="transform -rotate-0"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold ${isActive ? 'animate-pulse' : ''}`}>
            {displayValue}
          </span>
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>
      </div>
      <span className="text-sm font-medium text-muted-foreground mt-2">
        {label}
      </span>
    </div>
  );
}
