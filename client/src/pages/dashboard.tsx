import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ModelCard } from "@/components/model-card";
import { StatCard } from "@/components/stat-card";
import { BarChart3, FolderOpen, TrendingUp, AlertTriangle } from "lucide-react";
import type { Model } from "@shared/schema";

export default function Dashboard() {
  const { data: models, isLoading } = useQuery<Model[]>({
    queryKey: ["/api/models"],
  });

  const stats = models ? {
    totalAum: models.reduce((sum, m) => sum + m.totalAum, 0),
    modelCount: models.length,
    avgYtdReturn: models.reduce((sum, m) => sum + m.performance.ytdReturn, 0) / models.length,
    driftAlerts: models.filter(m => 
      m.holdings.some(h => Math.abs(h.drift) > 3)
    ).length,
  } : null;

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-screen-2xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold" data-testid="text-dashboard-title">
          Model Portfolio Dashboard
        </h1>
        <p className="text-muted-foreground">
          Monitor your model portfolios, track performance, and manage allocations.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="pt-4">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-7 w-28" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : stats && (
          <>
            <StatCard
              title="Total AUM"
              value={`$${(stats.totalAum / 1000000).toFixed(1)}M`}
              change={2.4}
              changeLabel="vs last month"
              icon={BarChart3}
            />
            <StatCard
              title="Active Models"
              value={stats.modelCount}
              icon={FolderOpen}
            />
            <StatCard
              title="Avg. YTD Return"
              value={`${stats.avgYtdReturn >= 0 ? "+" : ""}${stats.avgYtdReturn.toFixed(2)}%`}
              change={stats.avgYtdReturn}
              icon={TrendingUp}
            />
            <StatCard
              title="Drift Alerts"
              value={stats.driftAlerts}
              icon={AlertTriangle}
            />
          </>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium">Model Portfolios</h2>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-60" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <Skeleton className="h-8 w-28" />
                  </div>
                  <Skeleton className="h-9 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : models && models.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {models.map((model) => (
              <ModelCard key={model.id} model={model} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Models Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first model portfolio to get started with due diligence.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-48 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <ActivityItem
                  action="Rebalanced"
                  target="Growth Portfolio"
                  time="2 hours ago"
                />
                <ActivityItem
                  action="Added position"
                  target="MSFT to Income Portfolio"
                  time="Yesterday"
                />
                <ActivityItem
                  action="Updated allocation"
                  target="Balanced Model"
                  time="2 days ago"
                />
                <ActivityItem
                  action="Created model"
                  target="Tech Growth"
                  time="1 week ago"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Market Snapshot</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <MarketItem ticker="SPY" name="S&P 500 ETF" change={0.45} price={587.23} />
              <MarketItem ticker="QQQ" name="Nasdaq 100 ETF" change={0.72} price={512.89} />
              <MarketItem ticker="AGG" name="US Agg Bond ETF" change={-0.12} price={98.45} />
              <MarketItem ticker="VEA" name="Int'l Developed" change={0.28} price={51.34} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ActivityItem({ action, target, time }: { action: string; target: string; time: string }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
        <TrendingUp className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm">
          <span className="font-medium">{action}</span>{" "}
          <span className="text-muted-foreground">{target}</span>
        </div>
        <div className="text-xs text-muted-foreground">{time}</div>
      </div>
    </div>
  );
}

function MarketItem({ ticker, name, change, price }: { ticker: string; name: string; change: number; price: number }) {
  const isPositive = change >= 0;
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
      <div className="flex items-center gap-3">
        <div className="font-mono font-medium text-sm">{ticker}</div>
        <div className="text-xs text-muted-foreground">{name}</div>
      </div>
      <div className="flex items-center gap-4">
        <div className="font-mono text-sm">${price.toFixed(2)}</div>
        <div className={`font-mono text-sm ${isPositive ? "text-chart-2" : "text-destructive"}`}>
          {isPositive ? "+" : ""}{change.toFixed(2)}%
        </div>
      </div>
    </div>
  );
}
