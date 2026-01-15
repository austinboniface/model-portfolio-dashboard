import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AllocationChart } from "@/components/allocation-chart";
import {
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  X,
} from "lucide-react";
import type { Security, AssetClass, SecurityType, ResearchFilters } from "@shared/schema";
import { assetClassConfig, securityTypeLabels } from "@shared/schema";

export default function Research() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAssetClasses, setSelectedAssetClasses] = useState<AssetClass[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<SecurityType[]>([]);
  const [selectedSecurity, setSelectedSecurity] = useState<Security | null>(null);
  const [showFilters, setShowFilters] = useState(true);

  const { data: securities, isLoading } = useQuery<Security[]>({
    queryKey: ["/api/securities"],
  });

  const filteredSecurities = securities?.filter((security) => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (
        !security.ticker.toLowerCase().includes(term) &&
        !security.name.toLowerCase().includes(term)
      ) {
        return false;
      }
    }
    if (selectedAssetClasses.length > 0 && !selectedAssetClasses.includes(security.assetClass)) {
      return false;
    }
    if (selectedTypes.length > 0 && !selectedTypes.includes(security.type)) {
      return false;
    }
    return true;
  });

  const toggleAssetClass = (assetClass: AssetClass) => {
    setSelectedAssetClasses((prev) =>
      prev.includes(assetClass)
        ? prev.filter((ac) => ac !== assetClass)
        : [...prev, assetClass]
    );
  };

  const toggleType = (type: SecurityType) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedAssetClasses([]);
    setSelectedTypes([]);
  };

  const hasActiveFilters = searchTerm || selectedAssetClasses.length > 0 || selectedTypes.length > 0;

  return (
    <div className="flex h-full">
      {showFilters && (
        <div className="w-64 border-r border-border p-4 bg-card/50 shrink-0 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium">Filters</h2>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} data-testid="button-clear-filters">
                Clear all
              </Button>
            )}
          </div>

          <div className="space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search securities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
                data-testid="input-search-securities"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-3 block">
                Asset Class
              </Label>
              <div className="space-y-2">
                {(Object.keys(assetClassConfig) as AssetClass[]).map((assetClass) => (
                  <div key={assetClass} className="flex items-center gap-2">
                    <Checkbox
                      id={assetClass}
                      checked={selectedAssetClasses.includes(assetClass)}
                      onCheckedChange={() => toggleAssetClass(assetClass)}
                      data-testid={`checkbox-${assetClass}`}
                    />
                    <Label htmlFor={assetClass} className="text-sm cursor-pointer flex items-center gap-2">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: assetClassConfig[assetClass].color }}
                      />
                      {assetClassConfig[assetClass].label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-3 block">
                Security Type
              </Label>
              <div className="space-y-2">
                {(Object.keys(securityTypeLabels) as SecurityType[]).map((type) => (
                  <div key={type} className="flex items-center gap-2">
                    <Checkbox
                      id={type}
                      checked={selectedTypes.includes(type)}
                      onCheckedChange={() => toggleType(type)}
                      data-testid={`checkbox-${type}`}
                    />
                    <Label htmlFor={type} className="text-sm cursor-pointer">
                      {securityTypeLabels[type]}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-screen-xl mx-auto space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold" data-testid="text-research-title">
                Research Center
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Search and analyze securities for portfolio construction
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                data-testid="button-toggle-filters"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchTerm && (
                <Badge variant="secondary" className="gap-1">
                  Search: {searchTerm}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setSearchTerm("")}
                  />
                </Badge>
              )}
              {selectedAssetClasses.map((ac) => (
                <Badge key={ac} variant="secondary" className="gap-1">
                  {assetClassConfig[ac].label}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => toggleAssetClass(ac)}
                  />
                </Badge>
              ))}
              {selectedTypes.map((type) => (
                <Badge key={type} variant="secondary" className="gap-1">
                  {securityTypeLabels[type]}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => toggleType(type)}
                  />
                </Badge>
              ))}
            </div>
          )}

          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-4 space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-10 w-16" />
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16 ml-auto" />
                    </div>
                  ))}
                </div>
              ) : filteredSecurities && filteredSecurities.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Security</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Asset Class</TableHead>
                      <TableHead>Manager</TableHead>
                      <TableHead className="text-right">Expense</TableHead>
                      <TableHead className="text-right">YTD</TableHead>
                      <TableHead className="text-right">1Y</TableHead>
                      <TableHead className="text-right">Sharpe</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSecurities.map((security) => (
                      <TableRow
                        key={security.id}
                        className="hover-elevate cursor-pointer"
                        onClick={() => setSelectedSecurity(security)}
                        data-testid={`row-security-${security.id}`}
                      >
                        <TableCell>
                          <div>
                            <div className="font-mono font-medium">{security.ticker}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {security.name}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {securityTypeLabels[security.type]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: assetClassConfig[security.assetClass].color }}
                            />
                            <span className="text-sm">
                              {assetClassConfig[security.assetClass].label}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {security.manager || "-"}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {security.expenseRatio !== undefined
                            ? `${security.expenseRatio.toFixed(2)}%`
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`font-mono text-sm ${
                            security.ytdReturn >= 0 ? "text-chart-2" : "text-destructive"
                          }`}>
                            {security.ytdReturn >= 0 ? "+" : ""}
                            {security.ytdReturn.toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`font-mono text-sm ${
                            security.oneYearReturn >= 0 ? "text-chart-2" : "text-destructive"
                          }`}>
                            {security.oneYearReturn >= 0 ? "+" : ""}
                            {security.oneYearReturn.toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {security.sharpeRatio.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" data-testid={`button-view-${security.id}`}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" data-testid={`button-add-${security.id}`}>
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-12 text-center">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Securities Found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search criteria or filters.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Sheet open={!!selectedSecurity} onOpenChange={() => setSelectedSecurity(null)}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          {selectedSecurity && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <span className="font-mono">{selectedSecurity.ticker}</span>
                  <Badge variant="outline" className="text-xs">
                    {securityTypeLabels[selectedSecurity.type]}
                  </Badge>
                </SheetTitle>
                <p className="text-sm text-muted-foreground">
                  {selectedSecurity.name}
                </p>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-md bg-muted/50">
                    <div className="text-xs text-muted-foreground mb-1">YTD Return</div>
                    <div className={`font-mono text-xl font-medium flex items-center gap-1 ${
                      selectedSecurity.ytdReturn >= 0 ? "text-chart-2" : "text-destructive"
                    }`}>
                      {selectedSecurity.ytdReturn >= 0 ? (
                        <ArrowUpRight className="h-5 w-5" />
                      ) : (
                        <ArrowDownRight className="h-5 w-5" />
                      )}
                      {selectedSecurity.ytdReturn >= 0 ? "+" : ""}
                      {selectedSecurity.ytdReturn.toFixed(2)}%
                    </div>
                  </div>
                  <div className="p-4 rounded-md bg-muted/50">
                    <div className="text-xs text-muted-foreground mb-1">1 Year Return</div>
                    <div className={`font-mono text-xl font-medium flex items-center gap-1 ${
                      selectedSecurity.oneYearReturn >= 0 ? "text-chart-2" : "text-destructive"
                    }`}>
                      {selectedSecurity.oneYearReturn >= 0 ? (
                        <ArrowUpRight className="h-5 w-5" />
                      ) : (
                        <ArrowDownRight className="h-5 w-5" />
                      )}
                      {selectedSecurity.oneYearReturn >= 0 ? "+" : ""}
                      {selectedSecurity.oneYearReturn.toFixed(2)}%
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Fund Details</h4>
                  <div className="space-y-2">
                    {selectedSecurity.manager && (
                      <DetailRow label="Manager" value={selectedSecurity.manager} />
                    )}
                    <DetailRow
                      label="Asset Class"
                      value={assetClassConfig[selectedSecurity.assetClass].label}
                    />
                    {selectedSecurity.prospectusAssetClass && (
                      <DetailRow
                        label="Prospectus Asset Class"
                        value={assetClassConfig[selectedSecurity.prospectusAssetClass].label}
                      />
                    )}
                    {selectedSecurity.expenseRatio !== undefined && (
                      <DetailRow
                        label="Expense Ratio"
                        value={`${selectedSecurity.expenseRatio.toFixed(2)}%`}
                      />
                    )}
                    {selectedSecurity.aum !== undefined && (
                      <DetailRow
                        label="AUM"
                        value={`$${(selectedSecurity.aum / 1000000000).toFixed(1)}B`}
                      />
                    )}
                    {selectedSecurity.inceptionDate && (
                      <DetailRow label="Inception Date" value={selectedSecurity.inceptionDate} />
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Performance Metrics</h4>
                  <div className="space-y-2">
                    <DetailRow
                      label="3 Year Return"
                      value={`${selectedSecurity.threeYearReturn >= 0 ? "+" : ""}${selectedSecurity.threeYearReturn.toFixed(2)}%`}
                      valueClass={selectedSecurity.threeYearReturn >= 0 ? "text-chart-2" : "text-destructive"}
                    />
                    <DetailRow
                      label="5 Year Return"
                      value={`${selectedSecurity.fiveYearReturn >= 0 ? "+" : ""}${selectedSecurity.fiveYearReturn.toFixed(2)}%`}
                      valueClass={selectedSecurity.fiveYearReturn >= 0 ? "text-chart-2" : "text-destructive"}
                    />
                    <DetailRow
                      label="Standard Deviation"
                      value={`${selectedSecurity.standardDeviation.toFixed(2)}%`}
                    />
                    <DetailRow
                      label="Sharpe Ratio"
                      value={selectedSecurity.sharpeRatio.toFixed(2)}
                    />
                    <DetailRow label="Beta" value={selectedSecurity.beta.toFixed(2)} />
                  </div>
                </div>

                {selectedSecurity.underlyingHoldings && selectedSecurity.underlyingHoldings.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-3">
                      X-Ray Holdings ({selectedSecurity.underlyingHoldings.length})
                    </h4>
                    <div className="max-h-64 overflow-y-auto space-y-1 pr-2">
                      {selectedSecurity.underlyingHoldings.map((holding, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: assetClassConfig[holding.assetClass].color }}
                            />
                            <span className="font-mono text-sm">{holding.ticker}</span>
                            <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                              {holding.name}
                            </span>
                          </div>
                          <span className="font-mono text-sm">{holding.weight.toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-border">
                  <Button className="w-full" data-testid="button-add-to-model">
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Model
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function DetailRow({
  label,
  value,
  valueClass = "",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`font-mono text-sm ${valueClass}`}>{value}</span>
    </div>
  );
}
