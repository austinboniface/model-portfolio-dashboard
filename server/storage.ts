import {
  type User,
  type InsertUser,
  type Model,
  type Security,
  type Holding,
  type Trade,
  type AssetClass,
  assetClassConfig,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface CreateModelInput {
  name: string;
  description: string;
  objective: string;
  riskLevel: "conservative" | "moderate" | "aggressive";
  benchmark: string;
  holdings: { ticker: string; targetWeight: number }[];
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getModels(): Promise<Model[]>;
  getModel(id: string): Promise<Model | undefined>;
  createModel(input: CreateModelInput): Promise<Model>;
  getSecurities(): Promise<Security[]>;
  getSecurity(id: string): Promise<Security | undefined>;
  getTrades(): Promise<Trade[]>;
  executeTrades(tradeIds: string[]): Promise<void>;
  deleteTrades(tradeIds: string[]): Promise<void>;
}

// Sample securities data
const sampleSecurities: Security[] = [
  {
    id: "sec-1",
    ticker: "VFIAX",
    name: "Vanguard 500 Index Fund Admiral",
    type: "mutual_fund",
    assetClass: "us_equity",
    prospectusAssetClass: "us_equity",
    manager: "Vanguard",
    expenseRatio: 0.04,
    inceptionDate: "2000-11-13",
    aum: 450000000000,
    ytdReturn: 18.45,
    oneYearReturn: 22.34,
    threeYearReturn: 12.56,
    fiveYearReturn: 14.23,
    standardDeviation: 15.2,
    sharpeRatio: 1.12,
    beta: 1.0,
    underlyingHoldings: [
      { ticker: "AAPL", name: "Apple Inc", weight: 7.2, assetClass: "us_equity", sector: "Technology" },
      { ticker: "MSFT", name: "Microsoft Corp", weight: 6.8, assetClass: "us_equity", sector: "Technology" },
      { ticker: "AMZN", name: "Amazon.com Inc", weight: 3.4, assetClass: "us_equity", sector: "Consumer Discretionary" },
      { ticker: "NVDA", name: "NVIDIA Corp", weight: 3.1, assetClass: "us_equity", sector: "Technology" },
      { ticker: "GOOGL", name: "Alphabet Inc A", weight: 2.1, assetClass: "us_equity", sector: "Communication Services" },
      { ticker: "META", name: "Meta Platforms Inc", weight: 1.9, assetClass: "us_equity", sector: "Communication Services" },
      { ticker: "BRK.B", name: "Berkshire Hathaway B", weight: 1.7, assetClass: "us_equity", sector: "Financials" },
      { ticker: "TSLA", name: "Tesla Inc", weight: 1.5, assetClass: "us_equity", sector: "Consumer Discretionary" },
    ],
  },
  {
    id: "sec-2",
    ticker: "VBTLX",
    name: "Vanguard Total Bond Market Index Admiral",
    type: "mutual_fund",
    assetClass: "fixed_income",
    prospectusAssetClass: "fixed_income",
    manager: "Vanguard",
    expenseRatio: 0.05,
    inceptionDate: "2001-11-12",
    aum: 320000000000,
    ytdReturn: 2.15,
    oneYearReturn: 3.45,
    threeYearReturn: -1.23,
    fiveYearReturn: 0.89,
    standardDeviation: 4.8,
    sharpeRatio: 0.42,
    beta: 0.15,
    underlyingHoldings: [
      { ticker: "UST-10Y", name: "US Treasury 10Y", weight: 18.5, assetClass: "fixed_income" },
      { ticker: "UST-30Y", name: "US Treasury 30Y", weight: 12.3, assetClass: "fixed_income" },
      { ticker: "MBS", name: "Mortgage-Backed Securities", weight: 25.4, assetClass: "fixed_income" },
      { ticker: "CORP-IG", name: "Investment Grade Corporate", weight: 22.1, assetClass: "fixed_income" },
    ],
  },
  {
    id: "sec-3",
    ticker: "VTIAX",
    name: "Vanguard Total International Stock Index Admiral",
    type: "mutual_fund",
    assetClass: "intl_equity",
    prospectusAssetClass: "intl_equity",
    manager: "Vanguard",
    expenseRatio: 0.11,
    inceptionDate: "2010-11-29",
    aum: 180000000000,
    ytdReturn: 8.92,
    oneYearReturn: 11.23,
    threeYearReturn: 4.56,
    fiveYearReturn: 6.78,
    standardDeviation: 16.8,
    sharpeRatio: 0.78,
    beta: 0.92,
    underlyingHoldings: [
      { ticker: "NESN", name: "Nestle SA", weight: 1.8, assetClass: "intl_equity" },
      { ticker: "TSM", name: "Taiwan Semiconductor", weight: 1.6, assetClass: "intl_equity" },
      { ticker: "NOVO-B", name: "Novo Nordisk", weight: 1.4, assetClass: "intl_equity" },
      { ticker: "ASML", name: "ASML Holding NV", weight: 1.3, assetClass: "intl_equity" },
      { ticker: "SAP", name: "SAP SE", weight: 0.9, assetClass: "intl_equity" },
    ],
  },
  {
    id: "sec-4",
    ticker: "SPY",
    name: "SPDR S&P 500 ETF Trust",
    type: "etf",
    assetClass: "us_equity",
    prospectusAssetClass: "us_equity",
    manager: "State Street",
    expenseRatio: 0.09,
    inceptionDate: "1993-01-22",
    aum: 520000000000,
    ytdReturn: 18.23,
    oneYearReturn: 22.12,
    threeYearReturn: 12.34,
    fiveYearReturn: 14.01,
    standardDeviation: 15.1,
    sharpeRatio: 1.10,
    beta: 1.0,
    underlyingHoldings: [
      { ticker: "AAPL", name: "Apple Inc", weight: 7.1, assetClass: "us_equity", sector: "Technology" },
      { ticker: "MSFT", name: "Microsoft Corp", weight: 6.9, assetClass: "us_equity", sector: "Technology" },
      { ticker: "AMZN", name: "Amazon.com Inc", weight: 3.3, assetClass: "us_equity", sector: "Consumer Discretionary" },
      { ticker: "NVDA", name: "NVIDIA Corp", weight: 3.0, assetClass: "us_equity", sector: "Technology" },
    ],
  },
  {
    id: "sec-5",
    ticker: "QQQ",
    name: "Invesco QQQ Trust",
    type: "etf",
    assetClass: "us_equity",
    prospectusAssetClass: "us_equity",
    manager: "Invesco",
    expenseRatio: 0.20,
    inceptionDate: "1999-03-10",
    aum: 245000000000,
    ytdReturn: 24.56,
    oneYearReturn: 32.45,
    threeYearReturn: 15.67,
    fiveYearReturn: 18.92,
    standardDeviation: 19.8,
    sharpeRatio: 1.25,
    beta: 1.15,
    underlyingHoldings: [
      { ticker: "AAPL", name: "Apple Inc", weight: 11.2, assetClass: "us_equity", sector: "Technology" },
      { ticker: "MSFT", name: "Microsoft Corp", weight: 10.5, assetClass: "us_equity", sector: "Technology" },
      { ticker: "AMZN", name: "Amazon.com Inc", weight: 5.8, assetClass: "us_equity", sector: "Consumer Discretionary" },
      { ticker: "NVDA", name: "NVIDIA Corp", weight: 5.2, assetClass: "us_equity", sector: "Technology" },
      { ticker: "META", name: "Meta Platforms Inc", weight: 4.8, assetClass: "us_equity", sector: "Communication Services" },
    ],
  },
  {
    id: "sec-6",
    ticker: "AGG",
    name: "iShares Core US Aggregate Bond ETF",
    type: "etf",
    assetClass: "fixed_income",
    prospectusAssetClass: "fixed_income",
    manager: "BlackRock",
    expenseRatio: 0.03,
    inceptionDate: "2003-09-22",
    aum: 95000000000,
    ytdReturn: 2.34,
    oneYearReturn: 3.67,
    threeYearReturn: -1.12,
    fiveYearReturn: 0.78,
    standardDeviation: 4.6,
    sharpeRatio: 0.45,
    beta: 0.12,
    underlyingHoldings: [
      { ticker: "UST", name: "US Treasuries", weight: 38.5, assetClass: "fixed_income" },
      { ticker: "MBS", name: "Mortgage-Backed Securities", weight: 27.2, assetClass: "fixed_income" },
      { ticker: "CORP", name: "Corporate Bonds", weight: 24.1, assetClass: "fixed_income" },
    ],
  },
  {
    id: "sec-7",
    ticker: "VWO",
    name: "Vanguard FTSE Emerging Markets ETF",
    type: "etf",
    assetClass: "intl_equity",
    prospectusAssetClass: "intl_equity",
    manager: "Vanguard",
    expenseRatio: 0.08,
    inceptionDate: "2005-03-04",
    aum: 75000000000,
    ytdReturn: 6.45,
    oneYearReturn: 8.23,
    threeYearReturn: 1.23,
    fiveYearReturn: 3.45,
    standardDeviation: 18.9,
    sharpeRatio: 0.52,
    beta: 1.05,
    underlyingHoldings: [
      { ticker: "TSM", name: "Taiwan Semiconductor", weight: 5.8, assetClass: "intl_equity" },
      { ticker: "TCEHY", name: "Tencent Holdings", weight: 3.2, assetClass: "intl_equity" },
      { ticker: "BABA", name: "Alibaba Group", weight: 2.1, assetClass: "intl_equity" },
    ],
  },
  {
    id: "sec-8",
    ticker: "AAPL",
    name: "Apple Inc",
    type: "equity",
    assetClass: "us_equity",
    ytdReturn: 32.45,
    oneYearReturn: 42.12,
    threeYearReturn: 18.56,
    fiveYearReturn: 28.34,
    standardDeviation: 24.5,
    sharpeRatio: 1.45,
    beta: 1.18,
  },
  {
    id: "sec-9",
    ticker: "MSFT",
    name: "Microsoft Corporation",
    type: "equity",
    assetClass: "us_equity",
    ytdReturn: 28.92,
    oneYearReturn: 38.45,
    threeYearReturn: 22.34,
    fiveYearReturn: 32.12,
    standardDeviation: 22.8,
    sharpeRatio: 1.52,
    beta: 1.12,
  },
  {
    id: "sec-10",
    ticker: "JNJ",
    name: "Johnson & Johnson",
    type: "equity",
    assetClass: "us_equity",
    ytdReturn: -2.34,
    oneYearReturn: 1.23,
    threeYearReturn: 3.45,
    fiveYearReturn: 5.67,
    standardDeviation: 14.2,
    sharpeRatio: 0.68,
    beta: 0.65,
  },
  {
    id: "sec-11",
    ticker: "VGSLX",
    name: "Vanguard Real Estate Index Admiral",
    type: "mutual_fund",
    assetClass: "real_estate",
    prospectusAssetClass: "real_estate",
    manager: "Vanguard",
    expenseRatio: 0.12,
    inceptionDate: "2001-05-31",
    aum: 35000000000,
    ytdReturn: 5.67,
    oneYearReturn: 8.92,
    threeYearReturn: 2.34,
    fiveYearReturn: 4.56,
    standardDeviation: 18.5,
    sharpeRatio: 0.58,
    beta: 0.85,
    underlyingHoldings: [
      { ticker: "PLD", name: "Prologis Inc", weight: 8.2, assetClass: "real_estate" },
      { ticker: "AMT", name: "American Tower Corp", weight: 6.5, assetClass: "real_estate" },
      { ticker: "EQIX", name: "Equinix Inc", weight: 4.8, assetClass: "real_estate" },
    ],
  },
  {
    id: "sec-12",
    ticker: "PDBC",
    name: "Invesco Optimum Yield Diversified Commodity",
    type: "etf",
    assetClass: "commodities",
    prospectusAssetClass: "commodities",
    manager: "Invesco",
    expenseRatio: 0.59,
    inceptionDate: "2014-11-07",
    aum: 5000000000,
    ytdReturn: 4.23,
    oneYearReturn: 6.78,
    threeYearReturn: 8.92,
    fiveYearReturn: 5.34,
    standardDeviation: 15.6,
    sharpeRatio: 0.42,
    beta: 0.45,
    underlyingHoldings: [
      { ticker: "CRUDE", name: "Crude Oil Futures", weight: 15.2, assetClass: "commodities" },
      { ticker: "GOLD", name: "Gold Futures", weight: 12.8, assetClass: "commodities" },
      { ticker: "CORN", name: "Corn Futures", weight: 8.5, assetClass: "commodities" },
    ],
  },
];

// Helper to generate historical returns
function generateHistoricalReturns(months: number, avgReturn: number): { date: string; value: number; benchmark: number }[] {
  const data = [];
  let portfolioValue = 0;
  let benchmarkValue = 0;
  const today = new Date();
  
  for (let i = months; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthlyReturn = (avgReturn / 12) + (Math.random() - 0.5) * 3;
    const benchmarkReturn = (avgReturn / 12) * 0.9 + (Math.random() - 0.5) * 2.5;
    portfolioValue += monthlyReturn;
    benchmarkValue += benchmarkReturn;
    data.push({
      date: date.toISOString().split("T")[0],
      value: parseFloat(portfolioValue.toFixed(2)),
      benchmark: parseFloat(benchmarkValue.toFixed(2)),
    });
  }
  return data;
}

// Sample models
const sampleModels: Model[] = [
  {
    id: "model-1",
    name: "Growth Portfolio",
    description: "Aggressive growth-focused model for long-term capital appreciation",
    objective: "Maximize long-term capital growth through equity exposure",
    riskLevel: "aggressive",
    benchmark: "S&P 500",
    createdAt: "2023-01-15",
    lastRebalanced: "2024-11-01",
    totalAum: 12500000,
    holdings: [
      {
        id: "hold-1",
        securityId: "sec-4",
        security: sampleSecurities.find(s => s.id === "sec-4")!,
        targetWeight: 40,
        currentWeight: 42.5,
        shares: 850,
        marketValue: 4987500,
        drift: 2.5,
        gainLoss: 425000,
        gainLossPercent: 9.32,
      },
      {
        id: "hold-2",
        securityId: "sec-5",
        security: sampleSecurities.find(s => s.id === "sec-5")!,
        targetWeight: 25,
        currentWeight: 26.8,
        shares: 650,
        marketValue: 3350000,
        drift: 1.8,
        gainLoss: 312000,
        gainLossPercent: 10.28,
      },
      {
        id: "hold-3",
        securityId: "sec-3",
        security: sampleSecurities.find(s => s.id === "sec-3")!,
        targetWeight: 20,
        currentWeight: 18.2,
        shares: 45000,
        marketValue: 2275000,
        drift: -1.8,
        gainLoss: 145000,
        gainLossPercent: 6.81,
      },
      {
        id: "hold-4",
        securityId: "sec-8",
        security: sampleSecurities.find(s => s.id === "sec-8")!,
        targetWeight: 10,
        currentWeight: 9.5,
        shares: 520,
        marketValue: 1187500,
        drift: -0.5,
        gainLoss: 185000,
        gainLossPercent: 18.45,
      },
      {
        id: "hold-5",
        securityId: "sec-9",
        security: sampleSecurities.find(s => s.id === "sec-9")!,
        targetWeight: 5,
        currentWeight: 3.0,
        shares: 180,
        marketValue: 700000,
        drift: -2.0,
        gainLoss: 95000,
        gainLossPercent: 15.72,
      },
    ],
    performance: {
      ytdReturn: 21.45,
      oneMonthReturn: 2.34,
      threeMonthReturn: 5.67,
      oneYearReturn: 26.78,
      threeYearReturn: 14.23,
      fiveYearReturn: 16.45,
      sinceInception: 48.92,
      benchmarkYtd: 18.23,
      benchmarkOneYear: 22.12,
      alpha: 3.22,
      beta: 1.08,
      sharpeRatio: 1.32,
      standardDeviation: 17.8,
      maxDrawdown: -18.45,
      historicalReturns: generateHistoricalReturns(24, 21.45),
    },
    allocation: {
      byAssetClass: [
        { assetClass: "us_equity", weight: 78.8, color: assetClassConfig.us_equity.color },
        { assetClass: "intl_equity", weight: 18.2, color: assetClassConfig.intl_equity.color },
        { assetClass: "cash", weight: 3.0, color: assetClassConfig.cash.color },
      ],
      xrayAllocation: [
        { assetClass: "us_equity", weight: 82.5, color: assetClassConfig.us_equity.color },
        { assetClass: "intl_equity", weight: 14.5, color: assetClassConfig.intl_equity.color },
        { assetClass: "cash", weight: 3.0, color: assetClassConfig.cash.color },
      ],
      bySector: [
        { sector: "Technology", weight: 38.5 },
        { sector: "Consumer Discretionary", weight: 15.2 },
        { sector: "Healthcare", weight: 12.8 },
        { sector: "Financials", weight: 11.5 },
        { sector: "Communication Services", weight: 9.8 },
        { sector: "Industrials", weight: 7.2 },
        { sector: "Other", weight: 5.0 },
      ],
      byRegion: [
        { region: "United States", weight: 78.8 },
        { region: "Europe", weight: 8.5 },
        { region: "Asia Pacific", weight: 6.2 },
        { region: "Emerging Markets", weight: 3.5 },
        { region: "Other", weight: 3.0 },
      ],
    },
  },
  {
    id: "model-2",
    name: "Balanced Income",
    description: "Moderate risk model balancing growth and income generation",
    objective: "Generate consistent income while preserving capital",
    riskLevel: "moderate",
    benchmark: "60/40 Blend",
    createdAt: "2022-06-01",
    lastRebalanced: "2024-10-15",
    totalAum: 8750000,
    holdings: [
      {
        id: "hold-6",
        securityId: "sec-1",
        security: sampleSecurities.find(s => s.id === "sec-1")!,
        targetWeight: 35,
        currentWeight: 36.2,
        shares: 12500,
        marketValue: 3167500,
        drift: 1.2,
        gainLoss: 285000,
        gainLossPercent: 9.89,
      },
      {
        id: "hold-7",
        securityId: "sec-2",
        security: sampleSecurities.find(s => s.id === "sec-2")!,
        targetWeight: 30,
        currentWeight: 28.5,
        shares: 22000,
        marketValue: 2493750,
        drift: -1.5,
        gainLoss: 42000,
        gainLossPercent: 1.71,
      },
      {
        id: "hold-8",
        securityId: "sec-3",
        security: sampleSecurities.find(s => s.id === "sec-3")!,
        targetWeight: 15,
        currentWeight: 14.8,
        shares: 28000,
        marketValue: 1295000,
        drift: -0.2,
        gainLoss: 78000,
        gainLossPercent: 6.41,
      },
      {
        id: "hold-9",
        securityId: "sec-11",
        security: sampleSecurities.find(s => s.id === "sec-11")!,
        targetWeight: 10,
        currentWeight: 10.5,
        shares: 8500,
        marketValue: 918750,
        drift: 0.5,
        gainLoss: 45000,
        gainLossPercent: 5.15,
      },
      {
        id: "hold-10",
        securityId: "sec-10",
        security: sampleSecurities.find(s => s.id === "sec-10")!,
        targetWeight: 10,
        currentWeight: 10.0,
        shares: 5200,
        marketValue: 875000,
        drift: 0.0,
        gainLoss: -15000,
        gainLossPercent: -1.69,
      },
    ],
    performance: {
      ytdReturn: 9.82,
      oneMonthReturn: 1.12,
      threeMonthReturn: 2.89,
      oneYearReturn: 12.45,
      threeYearReturn: 5.67,
      fiveYearReturn: 7.23,
      sinceInception: 21.34,
      benchmarkYtd: 8.92,
      benchmarkOneYear: 10.78,
      alpha: 1.45,
      beta: 0.72,
      sharpeRatio: 0.98,
      standardDeviation: 10.2,
      maxDrawdown: -12.34,
      historicalReturns: generateHistoricalReturns(24, 9.82),
    },
    allocation: {
      byAssetClass: [
        { assetClass: "us_equity", weight: 46.2, color: assetClassConfig.us_equity.color },
        { assetClass: "fixed_income", weight: 28.5, color: assetClassConfig.fixed_income.color },
        { assetClass: "intl_equity", weight: 14.8, color: assetClassConfig.intl_equity.color },
        { assetClass: "real_estate", weight: 10.5, color: assetClassConfig.real_estate.color },
      ],
      xrayAllocation: [
        { assetClass: "us_equity", weight: 42.8, color: assetClassConfig.us_equity.color },
        { assetClass: "fixed_income", weight: 32.2, color: assetClassConfig.fixed_income.color },
        { assetClass: "intl_equity", weight: 12.5, color: assetClassConfig.intl_equity.color },
        { assetClass: "real_estate", weight: 10.5, color: assetClassConfig.real_estate.color },
        { assetClass: "cash", weight: 2.0, color: assetClassConfig.cash.color },
      ],
      bySector: [
        { sector: "Technology", weight: 22.5 },
        { sector: "Government Bonds", weight: 18.2 },
        { sector: "Healthcare", weight: 11.5 },
        { sector: "Real Estate", weight: 10.5 },
        { sector: "Financials", weight: 10.2 },
        { sector: "Corporate Bonds", weight: 10.3 },
        { sector: "Consumer Staples", weight: 8.8 },
        { sector: "Other", weight: 8.0 },
      ],
      byRegion: [
        { region: "United States", weight: 74.7 },
        { region: "Europe", weight: 10.2 },
        { region: "Asia Pacific", weight: 8.5 },
        { region: "Other", weight: 6.6 },
      ],
    },
  },
  {
    id: "model-3",
    name: "Conservative Income",
    description: "Low-risk model focused on capital preservation and steady income",
    objective: "Preserve capital while generating reliable income",
    riskLevel: "conservative",
    benchmark: "Bloomberg US Agg",
    createdAt: "2021-03-15",
    lastRebalanced: "2024-09-20",
    totalAum: 5250000,
    holdings: [
      {
        id: "hold-11",
        securityId: "sec-2",
        security: sampleSecurities.find(s => s.id === "sec-2")!,
        targetWeight: 45,
        currentWeight: 44.2,
        shares: 42000,
        marketValue: 2320500,
        drift: -0.8,
        gainLoss: 35000,
        gainLossPercent: 1.53,
      },
      {
        id: "hold-12",
        securityId: "sec-6",
        security: sampleSecurities.find(s => s.id === "sec-6")!,
        targetWeight: 25,
        currentWeight: 26.1,
        shares: 13500,
        marketValue: 1370250,
        drift: 1.1,
        gainLoss: 28000,
        gainLossPercent: 2.08,
      },
      {
        id: "hold-13",
        securityId: "sec-1",
        security: sampleSecurities.find(s => s.id === "sec-1")!,
        targetWeight: 20,
        currentWeight: 19.7,
        shares: 4200,
        marketValue: 1034250,
        drift: -0.3,
        gainLoss: 85000,
        gainLossPercent: 8.96,
      },
      {
        id: "hold-14",
        securityId: "sec-10",
        security: sampleSecurities.find(s => s.id === "sec-10")!,
        targetWeight: 10,
        currentWeight: 10.0,
        shares: 3100,
        marketValue: 525000,
        drift: 0.0,
        gainLoss: -8500,
        gainLossPercent: -1.59,
      },
    ],
    performance: {
      ytdReturn: 4.56,
      oneMonthReturn: 0.45,
      threeMonthReturn: 1.23,
      oneYearReturn: 5.89,
      threeYearReturn: 1.23,
      fiveYearReturn: 2.45,
      sinceInception: 8.92,
      benchmarkYtd: 3.67,
      benchmarkOneYear: 4.12,
      alpha: 0.89,
      beta: 0.35,
      sharpeRatio: 0.72,
      standardDeviation: 5.8,
      maxDrawdown: -6.78,
      historicalReturns: generateHistoricalReturns(24, 4.56),
    },
    allocation: {
      byAssetClass: [
        { assetClass: "fixed_income", weight: 70.3, color: assetClassConfig.fixed_income.color },
        { assetClass: "us_equity", weight: 29.7, color: assetClassConfig.us_equity.color },
      ],
      xrayAllocation: [
        { assetClass: "fixed_income", weight: 68.5, color: assetClassConfig.fixed_income.color },
        { assetClass: "us_equity", weight: 28.5, color: assetClassConfig.us_equity.color },
        { assetClass: "cash", weight: 3.0, color: assetClassConfig.cash.color },
      ],
      bySector: [
        { sector: "Government Bonds", weight: 35.2 },
        { sector: "Corporate Bonds", weight: 25.1 },
        { sector: "MBS", weight: 10.0 },
        { sector: "Technology", weight: 8.5 },
        { sector: "Healthcare", weight: 8.2 },
        { sector: "Consumer Staples", weight: 6.5 },
        { sector: "Other", weight: 6.5 },
      ],
      byRegion: [
        { region: "United States", weight: 92.5 },
        { region: "Other", weight: 7.5 },
      ],
    },
  },
  {
    id: "model-4",
    name: "Global Diversified",
    description: "Globally diversified model with exposure across asset classes",
    objective: "Achieve broad diversification across global markets",
    riskLevel: "moderate",
    benchmark: "MSCI ACWI",
    createdAt: "2023-06-01",
    lastRebalanced: "2024-11-10",
    totalAum: 6800000,
    holdings: [
      {
        id: "hold-15",
        securityId: "sec-4",
        security: sampleSecurities.find(s => s.id === "sec-4")!,
        targetWeight: 30,
        currentWeight: 31.5,
        shares: 365,
        marketValue: 2142000,
        drift: 1.5,
        gainLoss: 195000,
        gainLossPercent: 10.02,
      },
      {
        id: "hold-16",
        securityId: "sec-3",
        security: sampleSecurities.find(s => s.id === "sec-3")!,
        targetWeight: 25,
        currentWeight: 24.2,
        shares: 32000,
        marketValue: 1645600,
        drift: -0.8,
        gainLoss: 98000,
        gainLossPercent: 6.34,
      },
      {
        id: "hold-17",
        securityId: "sec-7",
        security: sampleSecurities.find(s => s.id === "sec-7")!,
        targetWeight: 15,
        currentWeight: 14.8,
        shares: 22000,
        marketValue: 1006400,
        drift: -0.2,
        gainLoss: 45000,
        gainLossPercent: 4.68,
      },
      {
        id: "hold-18",
        securityId: "sec-6",
        security: sampleSecurities.find(s => s.id === "sec-6")!,
        targetWeight: 15,
        currentWeight: 14.5,
        shares: 10000,
        marketValue: 986000,
        drift: -0.5,
        gainLoss: 22000,
        gainLossPercent: 2.28,
      },
      {
        id: "hold-19",
        securityId: "sec-11",
        security: sampleSecurities.find(s => s.id === "sec-11")!,
        targetWeight: 10,
        currentWeight: 10.5,
        shares: 6500,
        marketValue: 714000,
        drift: 0.5,
        gainLoss: 35000,
        gainLossPercent: 5.15,
      },
      {
        id: "hold-20",
        securityId: "sec-12",
        security: sampleSecurities.find(s => s.id === "sec-12")!,
        targetWeight: 5,
        currentWeight: 4.5,
        shares: 12000,
        marketValue: 306000,
        drift: -0.5,
        gainLoss: 12000,
        gainLossPercent: 4.08,
      },
    ],
    performance: {
      ytdReturn: 12.34,
      oneMonthReturn: 1.56,
      threeMonthReturn: 3.45,
      oneYearReturn: 15.67,
      threeYearReturn: 7.89,
      fiveYearReturn: 9.12,
      sinceInception: 18.45,
      benchmarkYtd: 11.23,
      benchmarkOneYear: 14.56,
      alpha: 1.11,
      beta: 0.88,
      sharpeRatio: 1.05,
      standardDeviation: 13.5,
      maxDrawdown: -14.23,
      historicalReturns: generateHistoricalReturns(24, 12.34),
    },
    allocation: {
      byAssetClass: [
        { assetClass: "us_equity", weight: 31.5, color: assetClassConfig.us_equity.color },
        { assetClass: "intl_equity", weight: 39.0, color: assetClassConfig.intl_equity.color },
        { assetClass: "fixed_income", weight: 14.5, color: assetClassConfig.fixed_income.color },
        { assetClass: "real_estate", weight: 10.5, color: assetClassConfig.real_estate.color },
        { assetClass: "commodities", weight: 4.5, color: assetClassConfig.commodities.color },
      ],
      xrayAllocation: [
        { assetClass: "us_equity", weight: 35.2, color: assetClassConfig.us_equity.color },
        { assetClass: "intl_equity", weight: 34.5, color: assetClassConfig.intl_equity.color },
        { assetClass: "fixed_income", weight: 14.8, color: assetClassConfig.fixed_income.color },
        { assetClass: "real_estate", weight: 10.5, color: assetClassConfig.real_estate.color },
        { assetClass: "commodities", weight: 4.5, color: assetClassConfig.commodities.color },
        { assetClass: "cash", weight: 0.5, color: assetClassConfig.cash.color },
      ],
      bySector: [
        { sector: "Technology", weight: 18.5 },
        { sector: "Financials", weight: 14.2 },
        { sector: "Industrials", weight: 12.8 },
        { sector: "Consumer Discretionary", weight: 11.5 },
        { sector: "Healthcare", weight: 10.2 },
        { sector: "Real Estate", weight: 10.5 },
        { sector: "Materials", weight: 8.3 },
        { sector: "Other", weight: 14.0 },
      ],
      byRegion: [
        { region: "United States", weight: 46.0 },
        { region: "Europe", weight: 22.5 },
        { region: "Asia Pacific", weight: 18.5 },
        { region: "Emerging Markets", weight: 10.5 },
        { region: "Other", weight: 2.5 },
      ],
    },
  },
];

// Sample trades
const sampleTrades: Trade[] = [
  {
    id: "trade-1",
    modelId: "model-1",
    securityId: "sec-9",
    security: sampleSecurities.find(s => s.id === "sec-9")!,
    action: "buy",
    targetWeight: 7.0,
    status: "pending",
    notes: "Increase MSFT position to target weight",
    createdAt: "2024-11-20",
  },
  {
    id: "trade-2",
    modelId: "model-1",
    securityId: "sec-4",
    security: sampleSecurities.find(s => s.id === "sec-4")!,
    action: "sell",
    targetWeight: 40.0,
    status: "staged",
    notes: "Trim SPY to target weight after drift",
    createdAt: "2024-11-18",
  },
  {
    id: "trade-3",
    modelId: "model-2",
    securityId: "sec-2",
    security: sampleSecurities.find(s => s.id === "sec-2")!,
    action: "buy",
    targetWeight: 30.0,
    status: "pending",
    notes: "Rebalance bond allocation",
    createdAt: "2024-11-19",
  },
  {
    id: "trade-4",
    modelId: "model-3",
    securityId: "sec-6",
    security: sampleSecurities.find(s => s.id === "sec-6")!,
    action: "rebalance",
    targetWeight: 25.0,
    status: "executed",
    notes: "Quarterly rebalance",
    createdAt: "2024-11-01",
    executedAt: "2024-11-02",
  },
  {
    id: "trade-5",
    modelId: "model-4",
    securityId: "sec-7",
    security: sampleSecurities.find(s => s.id === "sec-7")!,
    action: "buy",
    quantity: 5000,
    status: "pending",
    notes: "Tactical shift to emerging markets",
    createdAt: "2024-11-21",
  },
];

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private models: Map<string, Model>;
  private securities: Map<string, Security>;
  private trades: Map<string, Trade>;

  constructor() {
    this.users = new Map();
    this.models = new Map();
    this.securities = new Map();
    this.trades = new Map();

    // Initialize with sample data
    sampleModels.forEach((model) => this.models.set(model.id, model));
    sampleSecurities.forEach((security) => this.securities.set(security.id, security));
    sampleTrades.forEach((trade) => this.trades.set(trade.id, trade));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getModels(): Promise<Model[]> {
    return Array.from(this.models.values());
  }

  async getModel(id: string): Promise<Model | undefined> {
    return this.models.get(id);
  }

  async getSecurities(): Promise<Security[]> {
    return Array.from(this.securities.values());
  }

  async getSecurity(id: string): Promise<Security | undefined> {
    return this.securities.get(id);
  }

  async getTrades(): Promise<Trade[]> {
    return Array.from(this.trades.values());
  }

  async executeTrades(tradeIds: string[]): Promise<void> {
    tradeIds.forEach((id) => {
      const trade = this.trades.get(id);
      if (trade && trade.status !== "executed") {
        trade.status = "executed";
        trade.executedAt = new Date().toISOString().split("T")[0];
      }
    });
  }

  async deleteTrades(tradeIds: string[]): Promise<void> {
    tradeIds.forEach((id) => {
      this.trades.delete(id);
    });
  }

  async createModel(input: CreateModelInput): Promise<Model> {
    const modelId = `model-${randomUUID().slice(0, 8)}`;
    const today = new Date().toISOString().split("T")[0];

    // Build holdings from tickers - match with existing securities or create placeholder
    const holdings: Holding[] = [];
    let totalWeight = 0;

    for (const h of input.holdings) {
      const existingSecurity = Array.from(this.securities.values()).find(
        s => s.ticker.toUpperCase() === h.ticker.toUpperCase()
      );

      const security: Security = existingSecurity || {
        id: `sec-${randomUUID().slice(0, 8)}`,
        ticker: h.ticker.toUpperCase(),
        name: `${h.ticker.toUpperCase()} Imported Security`,
        type: "equity",
        assetClass: "us_equity",
        ytdReturn: 0,
        oneYearReturn: 0,
        threeYearReturn: 0,
        fiveYearReturn: 0,
        standardDeviation: 0,
        sharpeRatio: 0,
        beta: 1,
      };

      if (!existingSecurity) {
        this.securities.set(security.id, security);
      }

      const marketValue = Math.round(h.targetWeight * 100000);
      holdings.push({
        id: `holding-${randomUUID().slice(0, 8)}`,
        securityId: security.id,
        security,
        targetWeight: h.targetWeight,
        currentWeight: h.targetWeight,
        marketValue,
        drift: 0,
        gainLoss: 0,
        gainLossPercent: 0,
      });
      totalWeight += h.targetWeight;
    }

    const totalAum = holdings.reduce((sum, h) => sum + h.marketValue, 0);

    const model: Model = {
      id: modelId,
      name: input.name,
      description: input.description,
      objective: input.objective,
      riskLevel: input.riskLevel,
      benchmark: input.benchmark,
      createdAt: today,
      lastRebalanced: today,
      totalAum,
      holdings,
      performance: {
        ytdReturn: 0,
        oneMonthReturn: 0,
        threeMonthReturn: 0,
        oneYearReturn: 0,
        threeYearReturn: 0,
        fiveYearReturn: 0,
        sinceInception: 0,
        benchmarkYtd: 0,
        benchmarkOneYear: 0,
        alpha: 0,
        beta: 1,
        sharpeRatio: 0,
        standardDeviation: 0,
        maxDrawdown: 0,
        historicalReturns: [],
      },
      allocation: {
        byAssetClass: [],
        bySector: [],
        byRegion: [],
        xrayAllocation: [],
      },
    };

    // Calculate allocation by asset class
    const assetClassMap = new Map<AssetClass, number>();
    holdings.forEach(h => {
      const current = assetClassMap.get(h.security.assetClass) || 0;
      assetClassMap.set(h.security.assetClass, current + h.targetWeight);
    });

    model.allocation.byAssetClass = Array.from(assetClassMap.entries()).map(([ac, weight]) => ({
      assetClass: ac,
      weight,
      color: assetClassConfig[ac].color,
    }));
    model.allocation.xrayAllocation = model.allocation.byAssetClass;

    this.models.set(modelId, model);
    return model;
  }
}

export const storage = new MemStorage();
