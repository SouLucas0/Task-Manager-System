import { useState } from "react";
import { useListBugs, getListBugsQueryKey, useGetBugsSummary, getGetBugsSummaryQueryKey } from "@workspace/api-client-react";
import type { ListBugsParams } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Bug, Plus } from "lucide-react";
import { BugSheet } from "@/components/bugs/BugSheet";
import { ReportBugDialog } from "@/components/bugs/ReportBugDialog";
import { format } from "date-fns";

const STATUS_LABELS: Record<string, string> = {
  open: "Aberto",
  in_progress: "Em andamento",
  resolved: "Resolvido",
  closed: "Fechado",
};

const STATUS_COLORS: Record<string, string> = {
  open: "bg-red-100 text-red-700 border-red-200",
  in_progress: "bg-yellow-100 text-yellow-700 border-yellow-200",
  resolved: "bg-green-100 text-green-700 border-green-200",
  closed: "bg-gray-100 text-gray-500 border-gray-200",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "secondary",
  medium: "default",
  high: "destructive",
  critical: "destructive",
} as const;

const PRIORITY_LABELS: Record<string, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  critical: "Crítica",
};

export default function Bugs() {
  const [statusFilter, setStatusFilter] = useState<ListBugsParams["status"] | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<ListBugsParams["priority"] | "all">("all");
  const [selectedBugId, setSelectedBugId] = useState<number | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const queryParams = {
    ...(statusFilter !== "all" ? { status: statusFilter } : {}),
    ...(priorityFilter !== "all" ? { priority: priorityFilter } : {}),
  };

  const { data: bugs, isLoading } = useListBugs(queryParams, {
    query: { queryKey: getListBugsQueryKey(queryParams) },
  });

  const openBug = (id: number) => {
    setSelectedBugId(id);
    setSheetOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">Bugs</h1>
          <p className="text-muted-foreground text-sm">Reporte e acompanhe bugs do sistema.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="open">Aberto</SelectItem>
              <SelectItem value="in_progress">Em andamento</SelectItem>
              <SelectItem value="resolved">Resolvido</SelectItem>
              <SelectItem value="closed">Fechado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={(v: any) => setPriorityFilter(v)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="low">Baixa</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="critical">Crítica</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => setReportOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Reportar bug
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <Card key={i} className="p-4 flex items-center gap-4">
              <Skeleton className="h-5 w-5 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/5" />
              </div>
            </Card>
          ))
        ) : bugs?.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed rounded-lg border-muted">
            <Bug className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <h3 className="text-lg font-medium">Nenhum bug encontrado</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Tente ajustar os filtros ou reporte um novo bug.
            </p>
          </div>
        ) : (
          bugs?.map((bug) => (
            <Card
              key={bug.id}
              onClick={() => openBug(bug.id)}
              className={`p-4 flex items-center gap-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/50 ${
                bug.status === "closed" || bug.status === "resolved" ? "opacity-60" : ""
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className={`font-medium truncate ${bug.status === "resolved" || bug.status === "closed" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                  {bug.title}
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[bug.status]}`}>
                    {STATUS_LABELS[bug.status]}
                  </span>
                  {bug.version && (
                    <span className="text-xs text-muted-foreground">v{bug.version}</span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(bug.created_at), "dd/MM/yyyy")}
                  </span>
                  {bug.issue_url && (
                    <span className="text-xs text-primary underline cursor-pointer" onClick={(e) => { e.stopPropagation(); window.open(bug.issue_url!, "_blank"); }}>
                      GitHub #{bug.issue_number}
                    </span>
                  )}
                </div>
              </div>
              <Badge
                variant={PRIORITY_COLORS[bug.priority] as any}
                className="capitalize shrink-0"
              >
                {PRIORITY_LABELS[bug.priority]}
              </Badge>
            </Card>
          ))
        )}
      </div>

      <BugSheet bugId={selectedBugId} open={sheetOpen} onOpenChange={setSheetOpen} />
      <ReportBugDialog open={reportOpen} onOpenChange={setReportOpen} />
    </div>
  );
}
