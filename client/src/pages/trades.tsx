import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowRightLeft,
  Plus,
  Play,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  Filter,
} from "lucide-react";
import type { Trade } from "@shared/schema";
import { assetClassConfig, securityTypeLabels } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";

const statusConfig = {
  pending: { label: "Pending", icon: Clock, color: "bg-chart-3/10 text-chart-3 border-chart-3/20" },
  staged: { label: "Staged", icon: Play, color: "bg-primary/10 text-primary border-primary/20" },
  executed: { label: "Executed", icon: CheckCircle2, color: "bg-chart-2/10 text-chart-2 border-chart-2/20" },
};

const actionConfig = {
  buy: { label: "Buy", color: "text-chart-2" },
  sell: { label: "Sell", color: "text-destructive" },
  rebalance: { label: "Rebalance", color: "text-primary" },
};

export default function Trades() {
  const [selectedTrades, setSelectedTrades] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: trades, isLoading } = useQuery<Trade[]>({
    queryKey: ["/api/trades"],
  });

  const executeTradesMutation = useMutation({
    mutationFn: async (tradeIds: string[]) => {
      return apiRequest("POST", "/api/trades/execute", { tradeIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trades"] });
      setSelectedTrades(new Set());
    },
  });

  const deleteTradesMutation = useMutation({
    mutationFn: async (tradeIds: string[]) => {
      return apiRequest("DELETE", "/api/trades", { tradeIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trades"] });
      setSelectedTrades(new Set());
    },
  });

  const filteredTrades = trades?.filter((trade) => {
    if (statusFilter === "all") return true;
    return trade.status === statusFilter;
  });

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedTrades);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedTrades(newSelected);
  };

  const toggleSelectAll = () => {
    if (!filteredTrades) return;
    if (selectedTrades.size === filteredTrades.length) {
      setSelectedTrades(new Set());
    } else {
      setSelectedTrades(new Set(filteredTrades.map((t) => t.id)));
    }
  };

  const selectedTradesList = Array.from(selectedTrades);
  const canExecute = selectedTradesList.length > 0 && 
    filteredTrades?.filter(t => selectedTrades.has(t.id)).every(t => t.status !== "executed");

  const stats = trades ? {
    pending: trades.filter(t => t.status === "pending").length,
    staged: trades.filter(t => t.status === "staged").length,
    executed: trades.filter(t => t.status === "executed").length,
    total: trades.length,
  } : { pending: 0, staged: 0, executed: 0, total: 0 };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-screen-2xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-trades-title">
            Trade Blotter
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage tactical shifts and portfolio trades
          </p>
        </div>
        <Button data-testid="button-new-trade">
          <Plus className="h-4 w-4 mr-2" />
          New Trade
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-xs text-muted-foreground mb-1">Total Trades</div>
            <div className="font-mono text-2xl font-semibold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-chart-3" />
              <div className="text-xs text-muted-foreground">Pending</div>
            </div>
            <div className="font-mono text-2xl font-semibold mt-1">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Play className="h-4 w-4 text-primary" />
              <div className="text-xs text-muted-foreground">Staged</div>
            </div>
            <div className="font-mono text-2xl font-semibold mt-1">{stats.staged}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-chart-2" />
              <div className="text-xs text-muted-foreground">Executed</div>
            </div>
            <div className="font-mono text-2xl font-semibold mt-1">{stats.executed}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-4">
          <CardTitle className="text-lg">Trade Orders</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]" data-testid="select-status-filter">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="staged">Staged</SelectItem>
                <SelectItem value="executed">Executed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {selectedTrades.size > 0 && (
            <div className="flex items-center justify-between gap-4 px-4 py-3 bg-muted/50 border-b border-border">
              <span className="text-sm text-muted-foreground">
                {selectedTrades.size} trade{selectedTrades.size > 1 ? "s" : ""} selected
              </span>
              <div className="flex items-center gap-2">
                {canExecute && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" data-testid="button-execute-selected">
                        <Play className="h-4 w-4 mr-2" />
                        Execute
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Execute Trades?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will execute {selectedTrades.size} selected trade{selectedTrades.size > 1 ? "s" : ""}. 
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => executeTradesMutation.mutate(selectedTradesList)}
                        >
                          Execute
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" data-testid="button-delete-selected">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Trades?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete {selectedTrades.size} selected trade{selectedTrades.size > 1 ? "s" : ""}.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteTradesMutation.mutate(selectedTradesList)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20 ml-auto" />
                </div>
              ))}
            </div>
          ) : filteredTrades && filteredTrades.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={selectedTrades.size === filteredTrades.length && filteredTrades.length > 0}
                      onCheckedChange={toggleSelectAll}
                      data-testid="checkbox-select-all"
                    />
                  </TableHead>
                  <TableHead>Security</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrades.map((trade) => {
                  const StatusIcon = statusConfig[trade.status].icon;
                  return (
                    <TableRow
                      key={trade.id}
                      className="hover-elevate"
                      data-testid={`row-trade-${trade.id}`}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedTrades.has(trade.id)}
                          onCheckedChange={() => toggleSelect(trade.id)}
                          data-testid={`checkbox-trade-${trade.id}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-mono font-medium">{trade.security.ticker}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                            {trade.security.name}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {trade.modelId}
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium capitalize ${actionConfig[trade.action].color}`}>
                          {actionConfig[trade.action].label}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {trade.targetWeight !== undefined
                          ? `${trade.targetWeight.toFixed(1)}%`
                          : trade.quantity !== undefined
                          ? `${trade.quantity} shares`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`gap-1 ${statusConfig[trade.status].color}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig[trade.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(trade.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                        {trade.notes || "-"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 text-center">
              <ArrowRightLeft className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Trades</h3>
              <p className="text-muted-foreground mb-4">
                {statusFilter !== "all"
                  ? `No ${statusFilter} trades found.`
                  : "Create your first trade to get started."}
              </p>
              <Button data-testid="button-create-first-trade">
                <Plus className="h-4 w-4 mr-2" />
                New Trade
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {filteredTrades && filteredTrades.length > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Showing {filteredTrades.length} of {trades?.length || 0} trades
              </span>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Total Buy Value:</span>
                  <span className="font-mono text-chart-2">$125,000</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Total Sell Value:</span>
                  <span className="font-mono text-destructive">$85,000</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Net:</span>
                  <span className="font-mono">$40,000</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
