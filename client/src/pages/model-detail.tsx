import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { PerformanceChart } from "@/components/performance-chart";
import { AllocationChart } from "@/components/allocation-chart";
import { HoldingsTable } from "@/components/holdings-table";
import { StatCard } from "@/components/stat-card";
import {
  ArrowLeft,
  Edit,
  RefreshCw,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  TrendingUp,
  Shield,
  Zap,
  Download,
} from "lucide-react";
import type { Model } from "@shared/schema";
import { assetClassConfig } from "@shared/schema";

const riskLevelColors = {
  conservative: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  moderate: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  aggressive: "bg-chart-5/10 text-chart-5 border-chart-5/20",
};

export default function ModelDetail() {
  const [, params] = useRoute("/models/:id");
  const modelId = params?.id;

  const { data: model, isLoading } = useQuery<Model>({
    queryKey: ["/api/models", modelId],
    enabled: !!modelId,
  });

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 space-y-6 max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="pt-4">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-7 w-28" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!model) {
    return (
      <div className="p-6 lg:p-8 max-w-screen-2xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-medium mb-2">Model Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The model you're looking for doesn't exist.
            </p>
            <Link href="/">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPositiveYtd = model.performance.ytdReturn >= 0;

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-screen-2xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-semibold" data-testid="text-model-name">
                {model.name}
              </h1>
              <Badge
                variant="outline"
                className={`capitalize ${riskLevelColors[model.riskLevel]}`}
              >
                {model.riskLevel}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              {model.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => window.open(`/api/models/${modelId}/export`, "_blank")}
            data-testid="button-export-model"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" data-testid="button-edit-model">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button data-testid="button-rebalance">
            <RefreshCw className="h-4 w-4 mr-2" />
            Rebalance
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total AUM"
          value={`$${(model.totalAum / 1000000).toFixed(2)}M`}
          icon={BarChart3}
        />
        <StatCard
          title="YTD Return"
          value={`${isPositiveYtd ? "+" : ""}${model.performance.ytdReturn.toFixed(2)}%`}
          change={model.performance.ytdReturn}
          icon={TrendingUp}
        />
        <StatCard
          title="Sharpe Ratio"
          value={model.performance.sharpeRatio.toFixed(2)}
          icon={Target}
        />
        <StatCard
          title="Alpha"
          value={`${model.performance.alpha >= 0 ? "+" : ""}${model.performance.alpha.toFixed(2)}%`}
          icon={Zap}
        />
      </div>

      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-4">
          <TabsTrigger value="performance" data-testid="tab-performance">
            Performance
          </TabsTrigger>
          <TabsTrigger value="holdings" data-testid="tab-holdings">
            Holdings
          </TabsTrigger>
          <TabsTrigger value="allocation" data-testid="tab-allocation">
            Allocation
          </TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Historical Performance</span>
                <span className="text-sm font-normal text-muted-foreground">
                  vs {model.benchmark}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PerformanceChart data={model.performance.historicalReturns} height={350} />
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <MetricCard label="1 Month" value={model.performance.oneMonthReturn} />
            <MetricCard label="3 Month" value={model.performance.threeMonthReturn} />
            <MetricCard label="YTD" value={model.performance.ytdReturn} />
            <MetricCard label="1 Year" value={model.performance.oneYearReturn} />
            <MetricCard label="3 Year" value={model.performance.threeYearReturn} />
            <MetricCard label="5 Year" value={model.performance.fiveYearReturn} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Risk Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Standard Deviation</div>
                  <div className="font-mono text-lg font-medium">
                    {model.performance.standardDeviation.toFixed(2)}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Beta</div>
                  <div className="font-mono text-lg font-medium">
                    {model.performance.beta.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Max Drawdown</div>
                  <div className="font-mono text-lg font-medium text-destructive">
                    {model.performance.maxDrawdown.toFixed(2)}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Sharpe Ratio</div>
                  <div className="font-mono text-lg font-medium">
                    {model.performance.sharpeRatio.toFixed(2)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="holdings" className="mt-6 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-lg">Portfolio Holdings</CardTitle>
              <Badge variant="secondary">{model.holdings.length} positions</Badge>
            </CardHeader>
            <CardContent>
              <HoldingsTable holdings={model.holdings} showXray />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allocation" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Prospectus Allocation</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Asset allocation as stated in fund prospectuses
                </p>
              </CardHeader>
              <CardContent>
                <AllocationChart
                  data={model.allocation.byAssetClass}
                  size={180}
                  showLegend
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">X-Ray Allocation</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Actual underlying holdings exposure
                </p>
              </CardHeader>
              <CardContent>
                <AllocationChart
                  data={model.allocation.xrayAllocation}
                  size={180}
                  showLegend
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sector Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {model.allocation.bySector.map((sector) => (
                  <div key={sector.sector} className="flex items-center gap-4">
                    <div className="w-32 text-sm truncate">{sector.sector}</div>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${sector.weight}%` }}
                      />
                    </div>
                    <div className="w-16 text-right font-mono text-sm">
                      {sector.weight.toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Risk Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Volatility (Annualized)</span>
                  <span className="font-mono">{model.performance.standardDeviation.toFixed(2)}%</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Beta vs Benchmark</span>
                  <span className="font-mono">{model.performance.beta.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Max Drawdown</span>
                  <span className="font-mono text-destructive">{model.performance.maxDrawdown.toFixed(2)}%</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Tracking Error</span>
                  <span className="font-mono">2.34%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Factor Exposure
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FactorBar factor="Value" exposure={0.45} />
                <FactorBar factor="Growth" exposure={0.72} />
                <FactorBar factor="Momentum" exposure={0.38} />
                <FactorBar factor="Quality" exposure={0.65} />
                <FactorBar factor="Size" exposure={-0.22} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Manager Due Diligence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {model.holdings
                  .filter((h) => h.security.type === "mutual_fund" || h.security.type === "etf")
                  .slice(0, 6)
                  .map((holding) => (
                    <div
                      key={holding.id}
                      className="p-4 rounded-md border border-border bg-card"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-mono font-medium">{holding.security.ticker}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                            {holding.security.name}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {holding.security.type === "mutual_fund" ? "MF" : "ETF"}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-xs">
                        {holding.security.manager && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Manager</span>
                            <span>{holding.security.manager}</span>
                          </div>
                        )}
                        {holding.security.expenseRatio !== undefined && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Expense Ratio</span>
                            <span className="font-mono">{holding.security.expenseRatio.toFixed(2)}%</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">YTD Return</span>
                          <span className={`font-mono ${holding.security.ytdReturn >= 0 ? "text-chart-2" : "text-destructive"}`}>
                            {holding.security.ytdReturn >= 0 ? "+" : ""}{holding.security.ytdReturn.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  const isPositive = value >= 0;
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="text-xs text-muted-foreground mb-1">{label}</div>
        <div className={`font-mono text-lg font-medium flex items-center gap-1 ${
          isPositive ? "text-chart-2" : "text-destructive"
        }`}>
          {isPositive ? (
            <ArrowUpRight className="h-4 w-4" />
          ) : (
            <ArrowDownRight className="h-4 w-4" />
          )}
          {isPositive ? "+" : ""}{value.toFixed(2)}%
        </div>
      </CardContent>
    </Card>
  );
}

function FactorBar({ factor, exposure }: { factor: string; exposure: number }) {
  const isPositive = exposure >= 0;
  const width = Math.abs(exposure) * 100;
  
  return (
    <div className="flex items-center gap-4">
      <div className="w-24 text-sm">{factor}</div>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-px h-full bg-border" />
        </div>
        {isPositive ? (
          <div
            className="absolute left-1/2 h-full bg-chart-2 rounded-r-full"
            style={{ width: `${width / 2}%` }}
          />
        ) : (
          <div
            className="absolute right-1/2 h-full bg-destructive rounded-l-full"
            style={{ width: `${width / 2}%` }}
          />
        )}
      </div>
      <div className={`w-12 text-right font-mono text-sm ${
        isPositive ? "text-chart-2" : "text-destructive"
      }`}>
        {isPositive ? "+" : ""}{exposure.toFixed(2)}
      </div>
    </div>
  );
}
