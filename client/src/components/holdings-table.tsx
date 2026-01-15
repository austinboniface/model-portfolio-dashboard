import { useState, Fragment } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { Holding } from "@shared/schema";
import { assetClassConfig, securityTypeLabels } from "@shared/schema";

interface HoldingsTableProps {
  holdings: Holding[];
  showXray?: boolean;
}

export function HoldingsTable({ holdings, showXray = false }: HoldingsTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  return (
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            {showXray && <TableHead className="w-10"></TableHead>}
            <TableHead>Security</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Asset Class</TableHead>
            <TableHead className="text-right">Target</TableHead>
            <TableHead className="text-right">Current</TableHead>
            <TableHead className="text-right">Drift</TableHead>
            <TableHead className="text-right">Market Value</TableHead>
            <TableHead className="text-right">Gain/Loss</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {holdings.map((holding) => {
            const isExpanded = expandedRows.has(holding.id);
            const hasUnderlyingHoldings = 
              holding.security.underlyingHoldings && 
              holding.security.underlyingHoldings.length > 0;
            const driftAbs = Math.abs(holding.drift);
            const isDriftSignificant = driftAbs > 2;

            return (
              <Fragment key={holding.id}>
                <TableRow 
                  className="hover-elevate"
                  data-testid={`row-holding-${holding.id}`}
                >
                  {showXray && (
                    <TableCell>
                      {hasUnderlyingHoldings && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleRow(holding.id)}
                          data-testid={`button-expand-${holding.id}`}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-mono font-medium">{holding.security.ticker}</span>
                      <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {holding.security.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {securityTypeLabels[holding.security.type]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: assetClassConfig[holding.security.assetClass].color }}
                      />
                      <span className="text-sm">
                        {assetClassConfig[holding.security.assetClass].label}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {holding.targetWeight.toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {holding.currentWeight.toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`font-mono ${
                      isDriftSignificant 
                        ? holding.drift > 0 ? "text-chart-2" : "text-destructive"
                        : "text-muted-foreground"
                    }`}>
                      {holding.drift > 0 ? "+" : ""}{holding.drift.toFixed(2)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    ${holding.marketValue.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className={`flex items-center justify-end gap-1 font-mono ${
                      holding.gainLoss >= 0 ? "text-chart-2" : "text-destructive"
                    }`}>
                      {holding.gainLoss >= 0 ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      {holding.gainLossPercent >= 0 ? "+" : ""}
                      {holding.gainLossPercent.toFixed(2)}%
                    </div>
                  </TableCell>
                </TableRow>
                {showXray && isExpanded && hasUnderlyingHoldings && (
                  <TableRow className="bg-muted/30">
                    <TableCell colSpan={9} className="p-0">
                      <div className="p-4 pl-12">
                        <div className="text-xs font-medium text-muted-foreground mb-2">
                          Underlying Holdings ({holding.security.underlyingHoldings!.length})
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                          {holding.security.underlyingHoldings!.slice(0, 12).map((uh, idx) => (
                            <div 
                              key={idx} 
                              className="flex items-center justify-between text-xs py-1 border-b border-border/50 last:border-0"
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-1.5 w-1.5 rounded-full"
                                  style={{ backgroundColor: assetClassConfig[uh.assetClass].color }}
                                />
                                <span className="font-mono">{uh.ticker}</span>
                              </div>
                              <span className="font-mono text-muted-foreground">
                                {uh.weight.toFixed(1)}%
                              </span>
                            </div>
                          ))}
                        </div>
                        {holding.security.underlyingHoldings!.length > 12 && (
                          <div className="text-xs text-muted-foreground mt-2">
                            +{holding.security.underlyingHoldings!.length - 12} more holdings
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
