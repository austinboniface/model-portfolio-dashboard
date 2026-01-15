import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, type LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: LucideIcon;
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  className = "",
}: StatCardProps) {
  const hasChange = change !== undefined;
  const isPositive = change !== undefined && change >= 0;

  return (
    <Card className={className} data-testid={`stat-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="text-xs text-muted-foreground font-medium mb-1">
              {title}
            </div>
            <div className="font-mono text-xl font-semibold truncate">
              {value}
            </div>
            {hasChange && (
              <div className={`flex items-center gap-1 mt-1 text-xs ${
                isPositive ? "text-chart-2" : "text-destructive"
              }`}>
                {isPositive ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                <span className="font-mono">
                  {isPositive ? "+" : ""}{change.toFixed(2)}%
                </span>
                {changeLabel && (
                  <span className="text-muted-foreground">{changeLabel}</span>
                )}
              </div>
            )}
          </div>
          {Icon && (
            <div className="p-2 rounded-md bg-primary/10">
              <Icon className="h-4 w-4 text-primary" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
