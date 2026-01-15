import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Database,
  Globe,
  Trash2,
  AlertTriangle
} from "lucide-react";

interface YChartsTestResult {
  connected: boolean;
  message: string;
  sampleData?: any;
}

export default function Settings() {
  const [testResult, setTestResult] = useState<YChartsTestResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const testConnection = async () => {
    setIsTesting(true);
    try {
      const response = await fetch("/api/ycharts/test");
      const result = await response.json();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        connected: false,
        message: `Connection error: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setIsTesting(false);
    }
  };

  const clearCacheMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/ycharts/cache/clear", { method: "POST" });
      if (!response.ok) {
        throw new Error(`Failed to clear cache: ${response.status}`);
      }
      return response.json();
    }
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure data sources and API connections
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Y-Charts API Integration
            </CardTitle>
            <CardDescription>
              Connect to Y-Charts for real-time financial data including fund holdings, 
              performance metrics, and security information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">API Connection Status</p>
                <p className="text-xs text-muted-foreground">
                  Test your Y-Charts API key to verify connectivity
                </p>
              </div>
              <Button 
                onClick={testConnection} 
                disabled={isTesting}
                variant="outline"
                data-testid="button-test-ycharts"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Test Connection
                  </>
                )}
              </Button>
            </div>

            {testResult && (
              <div className={`p-4 rounded-lg border ${
                testResult.connected 
                  ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800" 
                  : "bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800"
              }`}>
                <div className="flex items-start gap-3">
                  {testResult.connected ? (
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {testResult.connected ? "Connected" : "Not Connected"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {testResult.message}
                    </p>
                    {!testResult.connected && (
                      <p className="text-xs text-muted-foreground mt-2">
                        The application will continue using sample data. To enable live data, 
                        ensure your Y-Charts subscription includes REST API access.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Cache Management</p>
                <p className="text-xs text-muted-foreground">
                  Clear cached API responses to fetch fresh data
                </p>
              </div>
              <Button 
                onClick={() => clearCacheMutation.mutate()} 
                disabled={clearCacheMutation.isPending}
                variant="outline"
                data-testid="button-clear-cache"
              >
                {clearCacheMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Clearing...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Cache
                  </>
                )}
              </Button>
            </div>

            {clearCacheMutation.isSuccess && (
              <p className="text-xs text-green-600 dark:text-green-400">
                Cache cleared successfully
              </p>
            )}
            {clearCacheMutation.isError && (
              <p className="text-xs text-red-600 dark:text-red-400">
                Failed to clear cache. Please try again.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Source
            </CardTitle>
            <CardDescription>
              Current data source configuration for portfolio information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Active Data Source</p>
                <p className="text-xs text-muted-foreground">
                  The system automatically falls back to sample data when API is unavailable
                </p>
              </div>
              <Badge variant="secondary">
                Sample Data
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Features</CardTitle>
            <CardDescription>
              Y-Charts API capabilities when connected
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-sm font-medium">Fund Holdings</p>
                <p className="text-xs text-muted-foreground">
                  Get underlying holdings for ETFs and mutual funds for X-ray analysis
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Performance Metrics</p>
                <p className="text-xs text-muted-foreground">
                  Fetch real-time price data, returns, and risk metrics
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Company Fundamentals</p>
                <p className="text-xs text-muted-foreground">
                  Access P/E ratios, EPS, market cap, and dividend data
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Economic Indicators</p>
                <p className="text-xs text-muted-foreground">
                  Track treasury rates, unemployment, CPI, and more
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
