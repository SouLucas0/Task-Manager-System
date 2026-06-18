import { useState } from "react";
import { createBug } from "@/lib/store";
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

export function ReportBugDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setIsSubmitting(true);

    const context = {
      url: window.location.href,
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    };

    // Simulate a small delay
    setTimeout(() => {
      createBug({
        title: form.title.trim(),
        description: form.description || null,
        priority: form.priority,
        steps_to_reproduce: form.steps_to_reproduce || null,
        environment: form.environment || null,
        version: form.version || null,
        url: context.url,
        user_agent: context.user_agent,
        timestamp: context.timestamp,
      });
      toast({ title: "Bug reportado com sucesso", description: "Obrigado por nos ajudar a melhorar!" });
      setForm(DEFAULT_FORM);
      setIsSubmitting(false);
      onOpenChange(false);
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Reportar Bug</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bug-title">T\u00edtulo</Label>
            <Input id="bug-title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Resumo do problema" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bug-desc">Descri\u00e7\u00e3o</Label>
            <Textarea id="bug-desc" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Descreva o bug em detalhes..." rows={3} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bug-steps">Passos para reproduzir</Label>
            <Textarea id="bug-steps" value={form.steps_to_reproduce} onChange={(e) => setForm((f) => ({ ...f, steps_to_reproduce: e.target.value }))} placeholder="1. Abrir a p\u00e1gina..." rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bug-env">Ambiente</Label>
              <Input id="bug-env" value={form.environment} onChange={(e) => setForm((f) => ({ ...f, environment: e.target.value }))} placeholder="Chrome, Windows..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bug-version">Vers\u00e3o</Label>
              <Input id="bug-version" value={form.version} onChange={(e) => setForm((f) => ({ ...f, version: e.target.value }))} placeholder="1.0.0" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bug-priority">Prioridade</Label>
            <Select value={form.priority} onValueChange={(v) => setForm((f) => ({ ...f, priority: v as any }))}>
              <SelectTrigger id="bug-priority"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">M\u00e9dia</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="critical">Cr\u00edtica</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
            Contexto autom\u00e1tico: {window.location.href} | {navigator.userAgent}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reportar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
