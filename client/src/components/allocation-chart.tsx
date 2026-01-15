import { useMemo } from "react";
import type { AssetClass } from "@shared/schema";
import { assetClassConfig } from "@shared/schema";

interface AllocationItem {
  assetClass: AssetClass;
  weight: number;
  color: string;
}

interface AllocationChartProps {
  data: AllocationItem[];
  size?: number;
  showLegend?: boolean;
  className?: string;
}

export function AllocationChart({
  data,
  size = 120,
  showLegend = false,
  className = "",
}: AllocationChartProps) {
  const segments = useMemo(() => {
    const total = data.reduce((sum, item) => sum + item.weight, 0);
    let currentAngle = -90;
    
    return data.map((item) => {
      const percentage = (item.weight / total) * 100;
      const angle = (percentage / 100) * 360;
      const startAngle = currentAngle;
      currentAngle += angle;
      
      const startRad = (startAngle * Math.PI) / 180;
      const endRad = ((startAngle + angle) * Math.PI) / 180;
      
      const radius = size / 2 - 2;
      const innerRadius = radius * 0.6;
      const cx = size / 2;
      const cy = size / 2;
      
      const x1 = cx + radius * Math.cos(startRad);
      const y1 = cy + radius * Math.sin(startRad);
      const x2 = cx + radius * Math.cos(endRad);
      const y2 = cy + radius * Math.sin(endRad);
      const x3 = cx + innerRadius * Math.cos(endRad);
      const y3 = cy + innerRadius * Math.sin(endRad);
      const x4 = cx + innerRadius * Math.cos(startRad);
      const y4 = cy + innerRadius * Math.sin(startRad);
      
      const largeArc = angle > 180 ? 1 : 0;
      
      const pathD = `
        M ${x1} ${y1}
        A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
        L ${x3} ${y3}
        A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}
        Z
      `;
      
      return {
        ...item,
        percentage,
        pathD,
      };
    });
  }, [data, size]);

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {segments.map((segment, index) => (
          <path
            key={index}
            d={segment.pathD}
            fill={segment.color}
            stroke="hsl(var(--background))"
            strokeWidth={1}
          />
        ))}
      </svg>
      {showLegend && (
        <div className="flex flex-col gap-1">
          {segments.map((segment) => (
            <div key={segment.assetClass} className="flex items-center gap-2 text-xs">
              <div
                className="h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-muted-foreground">
                {assetClassConfig[segment.assetClass].label}
              </span>
              <span className="font-mono font-medium">
                {segment.percentage.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
