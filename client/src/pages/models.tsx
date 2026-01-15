import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ModelCard } from "@/components/model-card";
import { 
  Plus, 
  FolderOpen, 
  LayoutGrid, 
  List, 
  Download, 
  Upload,
  FileSpreadsheet,
  X 
} from "lucide-react";
import type { Model } from "@shared/schema";
import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Models() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [csvContent, setCsvContent] = useState("");
  const [modelName, setModelName] = useState("");
  const [description, setDescription] = useState("");
  const [riskLevel, setRiskLevel] = useState<"conservative" | "moderate" | "aggressive">("moderate");
  const [benchmark, setBenchmark] = useState("S&P 500");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const { data: models, isLoading } = useQuery<Model[]>({
    queryKey: ["/api/models"],
  });

  const importMutation = useMutation({
    mutationFn: async (data: {
      csvData: string;
      modelName: string;
      description: string;
      riskLevel: string;
      benchmark: string;
    }) => {
      const res = await apiRequest("POST", "/api/models/import", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/models"] });
      setImportDialogOpen(false);
      resetImportForm();
      toast({
        title: "Model Imported",
        description: "Your model portfolio has been successfully imported from CSV.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetImportForm = () => {
    setCsvContent("");
    setModelName("");
    setDescription("");
    setRiskLevel("moderate");
    setBenchmark("S&P 500");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setCsvContent(text);
        if (!modelName) {
          setModelName(file.name.replace(/\.csv$/i, ""));
        }
      };
      reader.readAsText(file);
    }
  };

  const handleImport = () => {
    if (!csvContent || !modelName) {
      toast({
        title: "Missing Information",
        description: "Please provide both a CSV file and model name.",
        variant: "destructive",
      });
      return;
    }
    importMutation.mutate({
      csvData: csvContent,
      modelName,
      description,
      riskLevel,
      benchmark,
    });
  };

  const handleExportAll = () => {
    window.open("/api/export/models", "_blank");
  };

  const handleDownloadTemplate = () => {
    window.open("/api/templates/model-import", "_blank");
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-screen-2xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-models-title">
            Model Portfolios
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            View and manage all your model portfolios
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center border border-border rounded-md">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="rounded-r-none"
              onClick={() => setViewMode("grid")}
              data-testid="button-view-grid"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="rounded-l-none"
              onClick={() => setViewMode("list")}
              data-testid="button-view-list"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" data-testid="button-export-menu">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={handleExportAll}
                data-testid="menu-export-all-models"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export All Models (CSV)
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => window.open("/api/export/securities", "_blank")}
                data-testid="menu-export-securities"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export Securities (CSV)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            variant="outline" 
            onClick={() => setImportDialogOpen(true)}
            data-testid="button-import-model"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>

          <Button data-testid="button-new-model">
            <Plus className="h-4 w-4 mr-2" />
            New Model
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className={viewMode === "grid" 
          ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          : "space-y-4"
        }>
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
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : models && models.length > 0 ? (
        <div className={viewMode === "grid"
          ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          : "space-y-4"
        }>
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
              Create your first model portfolio to start tracking performance and managing allocations.
            </p>
            <div className="flex items-center justify-center gap-2">
              <Button 
                variant="outline"
                onClick={() => setImportDialogOpen(true)}
                data-testid="button-import-first-model"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import from CSV
              </Button>
              <Button data-testid="button-create-first-model">
                <Plus className="h-4 w-4 mr-2" />
                Create Model
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="max-w-lg" aria-describedby="import-dialog-description">
          <DialogHeader>
            <DialogTitle>Import Model from CSV</DialogTitle>
            <DialogDescription id="import-dialog-description">
              Upload a CSV file with your model holdings. The CSV should have columns for Ticker and Target Weight.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="csv-file">CSV File</Label>
              <div className="flex gap-2">
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="flex-1"
                  data-testid="input-csv-file"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadTemplate}
                  data-testid="button-download-template"
                >
                  Template
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Download the template for the expected CSV format
              </p>
            </div>

            {csvContent && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="bg-muted rounded-md p-3 text-xs font-mono max-h-32 overflow-auto">
                  {csvContent.split("\n").slice(0, 6).map((line, idx) => (
                    <div key={idx} className="text-muted-foreground">{line}</div>
                  ))}
                  {csvContent.split("\n").length > 6 && (
                    <div className="text-muted-foreground/60">... and {csvContent.split("\n").length - 6} more rows</div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="model-name">Model Name *</Label>
              <Input
                id="model-name"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="My Growth Portfolio"
                data-testid="input-model-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Portfolio description..."
                rows={2}
                data-testid="input-description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="risk-level">Risk Level</Label>
                <Select value={riskLevel} onValueChange={(v: "conservative" | "moderate" | "aggressive") => setRiskLevel(v)}>
                  <SelectTrigger data-testid="select-risk-level">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conservative">Conservative</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="aggressive">Aggressive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="benchmark">Benchmark</Label>
                <Input
                  id="benchmark"
                  value={benchmark}
                  onChange={(e) => setBenchmark(e.target.value)}
                  placeholder="S&P 500"
                  data-testid="input-benchmark"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setImportDialogOpen(false);
                resetImportForm();
              }}
              data-testid="button-cancel-import"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={importMutation.isPending || !csvContent || !modelName}
              data-testid="button-confirm-import"
            >
              {importMutation.isPending ? "Importing..." : "Import Model"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
