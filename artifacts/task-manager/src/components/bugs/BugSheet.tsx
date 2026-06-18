import { useState, useEffect, useRef } from "react";
import { useGetBug, useUpdateBug, useDeleteBug, getListBugsQueryKey, getGetBugQueryKey, getGetBugsSummaryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";

export function BugSheet({
  bugId,
  open,
  onOpenChange,
}: {
  bugId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bug, isLoading } = useGetBug(bugId as number, {
    query: {
      enabled: !!bugId && open,
      queryKey: getGetBugQueryKey(bugId as number),
    },
  });

  const updateBug = useUpdateBug();
  const deleteBug = useDeleteBug();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState("");
  const [environment, setEnvironment] = useState("");
  const [version, setVersion] = useState("");

  const initializedForId = useRef<number | null>(null);

  useEffect(() => {
    if (bug && initializedForId.current !== bug.id) {
      initializedForId.current = bug.id;
      setTitle(bug.title);
      setDescription(bug.description || "");
      setSteps(bug.steps_to_reproduce || "");
      setEnvironment(bug.environment || "");
      setVersion(bug.version || "");
    }
  }, [bug]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getListBugsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetBugsSummaryQueryKey() });
  };

  const handleUpdate = (updates: Record<string, unknown>) => {
    if (!bugId) return;
    updateBug.mutate(
      { id: bugId, data: updates },
      {
        onSuccess: (updated) => {
          invalidate();
          queryClient.setQueryData(getGetBugQueryKey(bugId), updated);
        },
      }
    );
  };

  const handleDelete = () => {
    if (!bugId) return;
    deleteBug.mutate(
      { id: bugId },
      {
        onSuccess: () => {
          toast({ title: "Bug removido" });
          onOpenChange(false);
          invalidate();
        },
      }
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        {isLoading || !bug ? (
          <div className="py-6 text-center text-muted-foreground">Carregando detalhes...</div>
        ) : (
          <div className="space-y-5 pt-6">
            <SheetHeader>
              <SheetTitle className="sr-only">Detalhes do Bug</SheetTitle>
              <SheetDescription className="sr-only">Editar bug reportado</SheetDescription>
            </SheetHeader>

            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Título</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => title !== bug.title && handleUpdate({ title })}
                className="text-lg font-medium bg-transparent border-transparent px-0 py-1 h-auto shadow-none focus-visible:ring-0 focus-visible:border-border"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Status</Label>
                <Select value={bug.status} onValueChange={(v) => handleUpdate({ status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Aberto</SelectItem>
                    <SelectItem value="in_progress">Em andamento</SelectItem>
                    <SelectItem value="resolved">Resolvido</SelectItem>
                    <SelectItem value="closed">Fechado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Prioridade</Label>
                <Select value={bug.priority} onValueChange={(v) => handleUpdate({ priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Versão</Label>
                <Input
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  onBlur={() => version !== (bug.version || "") && handleUpdate({ version: version || null })}
                  placeholder="ex: 1.2.0"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Ambiente</Label>
                <Input
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value)}
                  onBlur={() => environment !== (bug.environment || "") && handleUpdate({ environment: environment || null })}
                  placeholder="ex: Chrome / Windows"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Descrição</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => description !== (bug.description || "") && handleUpdate({ description: description || null })}
                placeholder="Descreva o problema..."
                className="min-h-[90px] resize-none"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Passos para reproduzir</Label>
              <Textarea
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
                onBlur={() => steps !== (bug.steps_to_reproduce || "") && handleUpdate({ steps_to_reproduce: steps || null })}
                placeholder="1. Abra a página...&#10;2. Clique em...&#10;3. Observe o erro"
                className="min-h-[100px] resize-none font-mono text-sm"
              />
            </div>

            <div className="pt-4 border-t border-border space-y-3">
              {bug.issue_url && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">GitHub:</span>
                  <a
                    href={bug.issue_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline font-medium hover:text-primary/80"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Issue #{bug.issue_number}
                  </a>
                </div>
              )}
              {bug.url && (
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">URL:</span>{" "}
                  <a href={bug.url} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80" onClick={(e) => e.stopPropagation()}>
                    {bug.url.length > 60 ? bug.url.slice(0, 57) + "..." : bug.url}
                  </a>
                </div>
              )}
              {bug.timestamp && (
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Horário:</span>{" "}
                  {new Date(bug.timestamp).toLocaleString("pt-BR")}
                </div>
              )}
              {bug.user_agent && (
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Navegador:</span>{" "}
                  {bug.user_agent.length > 80 ? bug.user_agent.slice(0, 77) + "..." : bug.user_agent}
                </div>
              )}
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Reportado em {format(new Date(bug.created_at), "dd/MM/yyyy")}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
