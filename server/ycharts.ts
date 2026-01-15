import type { Security, UnderlyingHolding, AssetClass } from "@shared/schema";

const YCHARTS_API_BASE = "https://ycharts.com/api/v3";
const YCHARTS_API_KEY = process.env.YCHARTS_API_KEY;

interface YChartsHolding {
  weight: number;
  name: string;
  security_id: string;
}

interface YChartsHoldingsResponse {
  meta: { status: string; url: string };
  response: {
    [symbol: string]: {
      meta: { status: string };
      results?: {
        holdings?: {
          meta: { status: string };
          data: YChartsHolding[];
        };
      };
    };
  };
}

interface YChartsMetricData {
  meta: { status: string };
  data: Array<[string, number]>;
}

interface YChartsPointResponse {
  meta: { status: string };
  response: {
    [symbol: string]: {
      meta: { status: string };
      results?: Record<string, YChartsMetricData | undefined>;
    };
  };
}

const holdingsCache = new Map<string, { data: UnderlyingHolding[]; fetchedAt: number }>();
const metricsCache = new Map<string, { data: Record<string, number>; fetchedAt: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour cache

function mapSectorToAssetClass(symbol: string, sector?: string): AssetClass {
  if (!sector) return "us_equity";
  const sectorLower = sector.toLowerCase();
  if (sectorLower.includes("bond") || sectorLower.includes("fixed") || sectorLower.includes("treasury")) {
    return "fixed_income";
  }
  if (sectorLower.includes("real estate") || sectorLower.includes("reit")) {
    return "real_estate";
  }
  if (sectorLower.includes("commodity") || sectorLower.includes("gold") || sectorLower.includes("oil")) {
    return "commodities";
  }
  return "us_equity";
}

export async function getYChartsHoldings(symbols: string[]): Promise<Map<string, UnderlyingHolding[]>> {
  if (!YCHARTS_API_KEY) {
    console.warn("YCHARTS_API_KEY not configured, returning empty holdings");
    return new Map();
  }

  const result = new Map<string, UnderlyingHolding[]>();
  const symbolsToFetch: string[] = [];

  for (const symbol of symbols) {
    const cached = holdingsCache.get(symbol);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
      result.set(symbol, cached.data);
    } else {
      symbolsToFetch.push(symbol);
    }
  }

  if (symbolsToFetch.length === 0) {
    return result;
  }

  const batchSize = 25;
  for (let i = 0; i < symbolsToFetch.length; i += batchSize) {
    const batch = symbolsToFetch.slice(i, i + batchSize);
    const symbolsParam = batch.join(",");

    try {
      const response = await fetch(
        `${YCHARTS_API_BASE}/companies/${symbolsParam}/holdings`,
        {
          headers: {
            "X-YCHARTSAUTHORIZATION": YCHARTS_API_KEY!,
            "Content-Type": "application/json; charset=UTF-8",
          },
        }
      );

      if (!response.ok) {
        console.error(`YCharts API error: ${response.status} ${response.statusText}`);
        continue;
      }

      const data: YChartsHoldingsResponse = await response.json();

      for (const symbol of batch) {
        const symbolData = data.response[symbol];
        if (symbolData?.meta?.status === "ok" && symbolData.results?.holdings?.data) {
          const holdings: UnderlyingHolding[] = symbolData.results.holdings.data.map((h) => ({
            ticker: h.security_id,
            name: h.name,
            weight: h.weight,
            assetClass: mapSectorToAssetClass(h.security_id),
          }));

          result.set(symbol, holdings);
          holdingsCache.set(symbol, { data: holdings, fetchedAt: Date.now() });
        } else {
          result.set(symbol, []);
          holdingsCache.set(symbol, { data: [], fetchedAt: Date.now() });
        }
      }
    } catch (error) {
      console.error("Error fetching YCharts holdings:", error);
    }
  }

  return result;
}

export async function getYChartsMetrics(
  symbols: string[],
  metrics: string[] = ["price", "pe_ratio", "eps", "market_cap", "dividend_yield"]
): Promise<Map<string, Record<string, number>>> {
  if (!YCHARTS_API_KEY) {
    console.warn("YCHARTS_API_KEY not configured, returning empty metrics");
    return new Map();
  }

  const result = new Map<string, Record<string, number>>();
  const symbolsToFetch: string[] = [];

  for (const symbol of symbols) {
    const cached = metricsCache.get(symbol);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
      result.set(symbol, cached.data);
    } else {
      symbolsToFetch.push(symbol);
    }
  }

  if (symbolsToFetch.length === 0) {
    return result;
  }

  const batchSize = 25;
  for (let i = 0; i < symbolsToFetch.length; i += batchSize) {
    const batch = symbolsToFetch.slice(i, i + batchSize);
    const symbolsParam = batch.join(",");
    const metricsParam = metrics.join(",");

    try {
      const response = await fetch(
        `${YCHARTS_API_BASE}/companies/${symbolsParam}/points/${metricsParam}`,
        {
          headers: {
            "X-YCHARTSAUTHORIZATION": YCHARTS_API_KEY!,
            "Content-Type": "application/json; charset=UTF-8",
          },
        }
      );

      if (!response.ok) {
        console.error(`YCharts API error: ${response.status} ${response.statusText}`);
        continue;
      }

      const data: YChartsPointResponse = await response.json();

      for (const symbol of batch) {
        const symbolData = data.response[symbol];
        if (symbolData?.meta?.status === "ok" && symbolData.results) {
          const metricsData: Record<string, number> = {};
          for (const [metricName, metricData] of Object.entries(symbolData.results)) {
            if (metricData?.data && metricData.data.length > 0) {
              const latestValue = metricData.data[metricData.data.length - 1];
              if (latestValue && latestValue[1] !== null) {
                metricsData[metricName] = latestValue[1];
              }
            }
          }
          result.set(symbol, metricsData);
          metricsCache.set(symbol, { data: metricsData, fetchedAt: Date.now() });
        } else {
          result.set(symbol, {});
          metricsCache.set(symbol, { data: {}, fetchedAt: Date.now() });
        }
      }
    } catch (error) {
      console.error("Error fetching YCharts metrics:", error);
    }
  }

  return result;
}

export async function testYChartsConnection(): Promise<{
  connected: boolean;
  message: string;
  sampleData?: any;
}> {
  if (!YCHARTS_API_KEY) {
    return {
      connected: false,
      message: "YCHARTS_API_KEY environment variable is not set",
    };
  }

  try {
    const response = await fetch(`${YCHARTS_API_BASE}/companies/SPY/holdings`, {
      headers: {
        "X-YCHARTSAUTHORIZATION": YCHARTS_API_KEY!,
        "Content-Type": "application/json; charset=UTF-8",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        connected: false,
        message: `API returned ${response.status}: ${errorText}`,
      };
    }

    const data = await response.json();
    return {
      connected: true,
      message: "Successfully connected to YCharts API",
      sampleData: data,
    };
  } catch (error) {
    return {
      connected: false,
      message: `Connection error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

export function clearYChartsCache(): void {
  holdingsCache.clear();
  metricsCache.clear();
}
