import { Link } from "wouter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PerformanceSparkline } from "@/components/performance-sparkline";
import { AllocationChart } from "@/components/allocation-chart";
import { ArrowUpRight, ArrowDownRight, MoreHorizontal, Eye } from "lucide-react";
import type { Model } from "@shared/schema";

interface ModelCardProps {
  model: Model;
}

const riskLevelColors = {
  conservative: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  moderate: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  aggressive: "bg-chart-5/10 text-chart-5 border-chart-5/20",
};

export function ModelCard({ model }: ModelCardProps) {
  const isPositive = model.performance.ytdReturn >= 0;

  return (
    <Card className="hover-elevate transition-all duration-200" data-testid={`card-model-${model.id}`}>
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-medium text-base truncate">{model.name}</h3>
            <Badge 
              variant="outline" 
              className={`text-xs capitalize ${riskLevelColors[model.riskLevel]}`}
            >
              {model.riskLevel}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
            {model.description}
          </p>
        </div>
        <Button variant="ghost" size="icon" className="shrink-0" data-testid={`button-model-menu-${model.id}`}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Total AUM</div>
            <div className="font-mono text-lg font-medium">
              ${(model.totalAum / 1000000).toFixed(1)}M
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground mb-1">YTD Return</div>
            <div className={`font-mono text-lg font-medium flex items-center justify-end gap-1 ${
              isPositive ? "text-chart-2" : "text-destructive"
            }`}>
              {isPositive ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownRight className="h-4 w-4" />
              )}
              {isPositive ? "+" : ""}{model.performance.ytdReturn.toFixed(2)}%
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <AllocationChart 
            data={model.allocation.byAssetClass} 
            size={64} 
          />
          <PerformanceSparkline 
            data={model.performance.historicalReturns} 
            positive={isPositive}
          />
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
          <div>
            <div className="text-xs text-muted-foreground">1Y Return</div>
            <div className={`font-mono text-sm font-medium ${
              model.performance.oneYearReturn >= 0 ? "text-chart-2" : "text-destructive"
            }`}>
              {model.performance.oneYearReturn >= 0 ? "+" : ""}
              {model.performance.oneYearReturn.toFixed(1)}%
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Holdings</div>
            <div className="font-mono text-sm font-medium">
              {model.holdings.length}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Sharpe</div>
            <div className="font-mono text-sm font-medium">
              {model.performance.sharpeRatio.toFixed(2)}
            </div>
          </div>
        </div>

        <Link href={`/models/${model.id}`}>
          <Button 
            variant="secondary" 
            className="w-full" 
            data-testid={`button-view-model-${model.id}`}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
