import { useState } from "react";
import { useCreateBug, getListBugsQueryKey, getGetBugsSummaryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const DEFAULT_FORM = {
  title: "",
  description: "",
  priority: "medium" as const,
  steps_to_reproduce: "",
  environment: "",
  version: "",
};

export function ReportBugDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(DEFAULT_FORM);

  const createBug = useCreateBug();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    const context = {
      url: window.location.href,
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    };

    createBug.mutate(
      {
        data: {
          title: form.title.trim(),
          description: form.description || undefined,
          priority: form.priority,
          steps_to_reproduce: form.steps_to_reproduce || undefined,
          environment: form.environment || undefined,
          version: form.version || undefined,
          url: context.url,
          user_agent: context.user_agent,
          timestamp: context.timestamp,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Bug reportado com sucesso!" });
          queryClient.invalidateQueries({ queryKey: getListBugsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetBugsSummaryQueryKey() });
          setForm(DEFAULT_FORM);
          onOpenChange(false);
        },
        onError: () => {
          toast({ title: "Erro ao reportar bug", variant: "destructive" });
        },
      }
    );
  };

  const update = (key: keyof typeof DEFAULT_FORM, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Reportar bug</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="bug-title">Título *</Label>
            <Input
              id="bug-title"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="Descreva o bug brevemente"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Prioridade</Label>
              <Select value={form.priority} onValueChange={(v: any) => update("priority", v)}>
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
              <Label htmlFor="bug-version">Versão</Label>
              <Input
                id="bug-version"
                value={form.version}
                onChange={(e) => update("version", e.target.value)}
                placeholder="ex: 1.2.0"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="bug-env">Ambiente</Label>
            <Input
              id="bug-env"
              value={form.environment}
              onChange={(e) => update("environment", e.target.value)}
              placeholder="ex: Chrome 120 / Windows 11"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="bug-desc">Descrição</Label>
            <Textarea
              id="bug-desc"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="O que aconteceu? O que era esperado?"
              className="resize-none min-h-[80px]"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="bug-steps">Passos para reproduzir</Label>
            <Textarea
              id="bug-steps"
              value={form.steps_to_reproduce}
              onChange={(e) => update("steps_to_reproduce", e.target.value)}
              placeholder={"1. Abra a página...\n2. Clique em...\n3. Observe o erro"}
              className="resize-none min-h-[90px] font-mono text-sm"
            />
          </div>

          <div className="rounded-md bg-muted p-3 space-y-1 text-xs text-muted-foreground">
            <p className="font-medium text-foreground text-sm">Contexto automático</p>
            <p>
              <span className="font-medium">URL:</span> {window.location.pathname}
            </p>
            <p>
              <span className="font-medium">Navegador:</span> {navigator.userAgent.split(" ").slice(-2).join(" ")}
            </p>
            <p>
              <span className="font-medium">Horário:</span> {new Date().toLocaleString("pt-BR")}
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createBug.isPending || !form.title.trim()}>
              {createBug.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reportar bug
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
