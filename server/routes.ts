import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, type CreateModelInput } from "./storage";
import { insertModelSchema, type Model, type Security, type Holding } from "@shared/schema";
import { testYChartsConnection, getYChartsHoldings, getYChartsMetrics, clearYChartsCache } from "./ycharts";

// Helper function to convert model to CSV
function modelToCSV(model: Model): string {
  const headers = ["Ticker", "Security Name", "Type", "Asset Class", "Target Weight (%)", "Current Weight (%)", "Market Value ($)", "Drift (%)"];
  const rows = model.holdings.map(h => [
    h.security.ticker,
    `"${h.security.name}"`,
    h.security.type,
    h.security.assetClass,
    h.targetWeight.toFixed(2),
    h.currentWeight.toFixed(2),
    h.marketValue.toFixed(2),
    h.drift.toFixed(2)
  ].join(","));
  
  return [headers.join(","), ...rows].join("\n");
}

// Helper function to convert securities to CSV
function securitiesToCSV(securities: Security[]): string {
  const headers = ["Ticker", "Name", "Type", "Asset Class", "Manager", "Expense Ratio (%)", "YTD Return (%)", "1Y Return (%)", "3Y Return (%)", "5Y Return (%)", "Sharpe Ratio", "Standard Deviation"];
  const rows = securities.map(s => [
    s.ticker,
    `"${s.name}"`,
    s.type,
    s.assetClass,
    s.manager ? `"${s.manager}"` : "",
    s.expenseRatio ? s.expenseRatio.toFixed(2) : "",
    s.ytdReturn.toFixed(2),
    s.oneYearReturn.toFixed(2),
    s.threeYearReturn.toFixed(2),
    s.fiveYearReturn.toFixed(2),
    s.sharpeRatio.toFixed(2),
    s.standardDeviation.toFixed(2)
  ].join(","));
  
  return [headers.join(","), ...rows].join("\n");
}

// Helper to parse CSV
function parseCSV(csvText: string): string[][] {
  const lines = csvText.trim().split("\n");
  return lines.map(line => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Get all models
  app.get("/api/models", async (req, res) => {
    try {
      const models = await storage.getModels();
      res.json(models);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch models" });
    }
  });

  // Get single model by ID
  app.get("/api/models/:id", async (req, res) => {
    try {
      const model = await storage.getModel(req.params.id);
      if (!model) {
        return res.status(404).json({ error: "Model not found" });
      }
      res.json(model);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch model" });
    }
  });

  // Get all securities
  app.get("/api/securities", async (req, res) => {
    try {
      const securities = await storage.getSecurities();
      res.json(securities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch securities" });
    }
  });

  // Get single security by ID
  app.get("/api/securities/:id", async (req, res) => {
    try {
      const security = await storage.getSecurity(req.params.id);
      if (!security) {
        return res.status(404).json({ error: "Security not found" });
      }
      res.json(security);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch security" });
    }
  });

  // Get all trades
  app.get("/api/trades", async (req, res) => {
    try {
      const trades = await storage.getTrades();
      res.json(trades);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trades" });
    }
  });

  // Execute trades
  app.post("/api/trades/execute", async (req, res) => {
    try {
      const { tradeIds } = req.body;
      if (!Array.isArray(tradeIds)) {
        return res.status(400).json({ error: "tradeIds must be an array" });
      }
      await storage.executeTrades(tradeIds);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to execute trades" });
    }
  });

  // Delete trades
  app.delete("/api/trades", async (req, res) => {
    try {
      const { tradeIds } = req.body;
      if (!Array.isArray(tradeIds)) {
        return res.status(400).json({ error: "tradeIds must be an array" });
      }
      await storage.deleteTrades(tradeIds);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete trades" });
    }
  });

  // Export model to CSV
  app.get("/api/models/:id/export", async (req, res) => {
    try {
      const model = await storage.getModel(req.params.id);
      if (!model) {
        return res.status(404).json({ error: "Model not found" });
      }
      const csv = modelToCSV(model);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="${model.name.replace(/\s+/g, "_")}_holdings.csv"`);
      res.send(csv);
    } catch (error) {
      res.status(500).json({ error: "Failed to export model" });
    }
  });

  // Export all models summary to CSV
  app.get("/api/export/models", async (req, res) => {
    try {
      const models = await storage.getModels();
      const headers = ["Model Name", "Risk Level", "Benchmark", "Total AUM ($)", "YTD Return (%)", "1Y Return (%)", "Sharpe Ratio", "Holdings Count", "Last Rebalanced"];
      const rows = models.map(m => [
        `"${m.name}"`,
        m.riskLevel,
        `"${m.benchmark}"`,
        m.totalAum.toFixed(2),
        m.performance.ytdReturn.toFixed(2),
        m.performance.oneYearReturn.toFixed(2),
        m.performance.sharpeRatio.toFixed(2),
        m.holdings.length.toString(),
        m.lastRebalanced
      ].join(","));
      
      const csv = [headers.join(","), ...rows].join("\n");
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="all_models_summary.csv"');
      res.send(csv);
    } catch (error) {
      res.status(500).json({ error: "Failed to export models" });
    }
  });

  // Export securities to CSV
  app.get("/api/export/securities", async (req, res) => {
    try {
      const securities = await storage.getSecurities();
      const csv = securitiesToCSV(securities);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="securities.csv"');
      res.send(csv);
    } catch (error) {
      res.status(500).json({ error: "Failed to export securities" });
    }
  });

  // Import model from CSV
  app.post("/api/models/import", async (req, res) => {
    try {
      const { csvData, modelName, description, objective, riskLevel, benchmark } = req.body;
      
      if (!csvData || !modelName) {
        return res.status(400).json({ error: "CSV data and model name are required" });
      }

      const rows = parseCSV(csvData);
      if (rows.length < 2) {
        return res.status(400).json({ error: "CSV must have headers and at least one data row" });
      }

      const headers = rows[0].map(h => h.toLowerCase());
      const tickerIdx = headers.findIndex(h => h.includes("ticker"));
      const weightIdx = headers.findIndex(h => h.includes("target") || h.includes("weight"));
      
      if (tickerIdx === -1 || weightIdx === -1) {
        return res.status(400).json({ error: "CSV must have Ticker and Target Weight columns" });
      }

      const holdings: { ticker: string; targetWeight: number }[] = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length > Math.max(tickerIdx, weightIdx)) {
          const ticker = row[tickerIdx];
          const weight = parseFloat(row[weightIdx]);
          if (ticker && !isNaN(weight)) {
            holdings.push({ ticker, targetWeight: weight });
          }
        }
      }

      if (holdings.length === 0) {
        return res.status(400).json({ error: "No valid holdings found in CSV" });
      }

      const model = await storage.createModel({
        name: modelName,
        description: description || `Imported model: ${modelName}`,
        objective: objective || "Growth and Income",
        riskLevel: riskLevel || "moderate",
        benchmark: benchmark || "S&P 500",
        holdings
      });

      res.json({ success: true, model });
    } catch (error) {
      console.error("Import error:", error);
      res.status(500).json({ error: "Failed to import model" });
    }
  });

  // Get CSV template
  app.get("/api/templates/model-import", (req, res) => {
    const template = `Ticker,Target Weight (%)
VFIAX,25.00
VXUS,20.00
BND,30.00
VNQ,10.00
GLD,15.00`;
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="model_import_template.csv"');
    res.send(template);
  });

  // Y-Charts API endpoints
  app.get("/api/ycharts/test", async (req, res) => {
    try {
      const result = await testYChartsConnection();
      res.json(result);
    } catch (error) {
      res.status(500).json({ 
        connected: false, 
        message: `Error testing connection: ${error instanceof Error ? error.message : String(error)}` 
      });
    }
  });

  // Get holdings from Y-Charts for specified symbols
  app.get("/api/ycharts/holdings/:symbols", async (req, res) => {
    try {
      const symbols = req.params.symbols.split(",").map(s => s.trim().toUpperCase());
      const holdings = await getYChartsHoldings(symbols);
      const result: Record<string, any[]> = {};
      holdings.forEach((value, key) => {
        result[key] = value;
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch holdings from Y-Charts" });
    }
  });

  // Get metrics from Y-Charts for specified symbols
  app.get("/api/ycharts/metrics/:symbols", async (req, res) => {
    try {
      const symbols = req.params.symbols.split(",").map(s => s.trim().toUpperCase());
      const metricsParam = req.query.metrics as string | undefined;
      const metrics = metricsParam ? metricsParam.split(",") : undefined;
      const data = await getYChartsMetrics(symbols, metrics);
      const result: Record<string, Record<string, number>> = {};
      data.forEach((value, key) => {
        result[key] = value;
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch metrics from Y-Charts" });
    }
  });

  // Clear Y-Charts cache
  app.post("/api/ycharts/cache/clear", (req, res) => {
    clearYChartsCache();
    res.json({ success: true, message: "Y-Charts cache cleared" });
  });

  return httpServer;
}
