import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Security types
export type SecurityType = "equity" | "mutual_fund" | "etf";
export type AssetClass = "us_equity" | "intl_equity" | "fixed_income" | "alternatives" | "cash" | "real_estate" | "commodities";

// Security schema for individual holdings
export interface Security {
  id: string;
  ticker: string;
  name: string;
  type: SecurityType;
  assetClass: AssetClass;
  prospectusAssetClass?: AssetClass;
  manager?: string;
  expenseRatio?: number;
  inceptionDate?: string;
  aum?: number;
  ytdReturn: number;
  oneYearReturn: number;
  threeYearReturn: number;
  fiveYearReturn: number;
  standardDeviation: number;
  sharpeRatio: number;
  beta: number;
  underlyingHoldings?: UnderlyingHolding[];
}

// Underlying holdings for X-ray functionality
export interface UnderlyingHolding {
  ticker: string;
  name: string;
  weight: number;
  assetClass: AssetClass;
  sector?: string;
}

// Model portfolio holding
export interface Holding {
  id: string;
  securityId: string;
  security: Security;
  targetWeight: number;
  currentWeight: number;
  shares?: number;
  marketValue: number;
  drift: number;
  gainLoss: number;
  gainLossPercent: number;
}

// Model portfolio
export interface Model {
  id: string;
  name: string;
  description: string;
  objective: string;
  riskLevel: "conservative" | "moderate" | "aggressive";
  benchmark: string;
  createdAt: string;
  lastRebalanced: string;
  totalAum: number;
  holdings: Holding[];
  performance: PerformanceData;
  allocation: AllocationBreakdown;
}

// Performance data
export interface PerformanceData {
  ytdReturn: number;
  oneMonthReturn: number;
  threeMonthReturn: number;
  oneYearReturn: number;
  threeYearReturn: number;
  fiveYearReturn: number;
  sinceInception: number;
  benchmarkYtd: number;
  benchmarkOneYear: number;
  alpha: number;
  beta: number;
  sharpeRatio: number;
  standardDeviation: number;
  maxDrawdown: number;
  historicalReturns: { date: string; value: number; benchmark: number }[];
}

// Allocation breakdown
export interface AllocationBreakdown {
  byAssetClass: { assetClass: AssetClass; weight: number; color: string }[];
  bySector: { sector: string; weight: number }[];
  byRegion: { region: string; weight: number }[];
  xrayAllocation: { assetClass: AssetClass; weight: number; color: string }[];
}

// Trade/Tactical shift
export interface Trade {
  id: string;
  modelId: string;
  securityId: string;
  security: Security;
  action: "buy" | "sell" | "rebalance";
  quantity?: number;
  targetWeight?: number;
  status: "pending" | "staged" | "executed";
  notes?: string;
  createdAt: string;
  executedAt?: string;
}

// Research filters
export interface ResearchFilters {
  assetClasses: AssetClass[];
  securityTypes: SecurityType[];
  minExpenseRatio?: number;
  maxExpenseRatio?: number;
  minYtdReturn?: number;
  minOneYearReturn?: number;
  minAum?: number;
  searchTerm?: string;
}

// Insert schemas
export const insertSecuritySchema = z.object({
  ticker: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(["equity", "mutual_fund", "etf"]),
  assetClass: z.enum(["us_equity", "intl_equity", "fixed_income", "alternatives", "cash", "real_estate", "commodities"]),
  prospectusAssetClass: z.enum(["us_equity", "intl_equity", "fixed_income", "alternatives", "cash", "real_estate", "commodities"]).optional(),
  manager: z.string().optional(),
  expenseRatio: z.number().optional(),
});

export const insertModelSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  objective: z.string().min(1),
  riskLevel: z.enum(["conservative", "moderate", "aggressive"]),
  benchmark: z.string().min(1),
});

export const insertTradeSchema = z.object({
  modelId: z.string().min(1),
  securityId: z.string().min(1),
  action: z.enum(["buy", "sell", "rebalance"]),
  quantity: z.number().optional(),
  targetWeight: z.number().optional(),
  notes: z.string().optional(),
});

export type InsertSecurity = z.infer<typeof insertSecuritySchema>;
export type InsertModel = z.infer<typeof insertModelSchema>;
export type InsertTrade = z.infer<typeof insertTradeSchema>;

// Asset class labels and colors
export const assetClassConfig: Record<AssetClass, { label: string; color: string }> = {
  us_equity: { label: "US Equity", color: "hsl(210, 85%, 45%)" },
  intl_equity: { label: "Int'l Equity", color: "hsl(170, 75%, 40%)" },
  fixed_income: { label: "Fixed Income", color: "hsl(30, 85%, 50%)" },
  alternatives: { label: "Alternatives", color: "hsl(280, 65%, 50%)" },
  cash: { label: "Cash", color: "hsl(220, 10%, 60%)" },
  real_estate: { label: "Real Estate", color: "hsl(340, 75%, 50%)" },
  commodities: { label: "Commodities", color: "hsl(45, 85%, 50%)" },
};

export const securityTypeLabels: Record<SecurityType, string> = {
  equity: "Individual Equity",
  mutual_fund: "Mutual Fund",
  etf: "ETF",
};
