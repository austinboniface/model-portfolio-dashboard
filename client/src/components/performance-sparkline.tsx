import { useMemo } from "react";

interface SparklineProps {
  data: { date: string; value: number }[];
  width?: number;
  height?: number;
  className?: string;
  positive?: boolean;
}

export function PerformanceSparkline({
  data,
  width = 120,
  height = 32,
  className = "",
  positive,
}: SparklineProps) {
  const pathD = useMemo(() => {
    if (data.length < 2) return "";
    
    const values = data.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    
    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((d.value - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    });
    
    return `M${points.join(" L")}`;
  }, [data, width, height]);

  const isPositive = positive ?? (data.length >= 2 && data[data.length - 1].value >= data[0].value);

  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox={`0 0 ${width} ${height}`}
    >
      <path
        d={pathD}
        fill="none"
        stroke={isPositive ? "hsl(170, 75%, 40%)" : "hsl(0, 72%, 48%)"}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
