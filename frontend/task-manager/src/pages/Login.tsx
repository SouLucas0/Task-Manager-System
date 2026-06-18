import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CheckSquare, Loader2 } from "lucide-react";

export default function Login() {
  const [, navigate] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate delay
    await new Promise((r) => setTimeout(r, 500));
    // Mock login: any credentials work (or use a stored user if available)
    const stored = localStorage.getItem("task-manager-users");
    let users: { name: string; email: string; password: string }[] = [];
    if (stored) {
      try { users = JSON.parse(stored); } catch { /* noop */ }
    }
    const user = users.find((u) => u.email === form.email && u.password === form.password);
    if (user) {
      login("local-token", { id: 1, name: user.name, email: user.email });
      toast({ title: "Bem-vindo de volta!", description: `Olá, ${user.name}.` });
      navigate("/");
    } else {
      toast({
        title: "Erro ao entrar",
        description: "Email ou senha inválidos",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">Task Manager</span>
          </div>
          <p className="text-muted-foreground text-sm">Gerencie suas tarefas com eficiência</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Entrar</CardTitle>
            <CardDescription>Acesse sua conta para continuar</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="seu@email.com" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required autoComplete="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required autoComplete="current-password" />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Entrar
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  login("demo-token", { id: 1, name: "Demo", email: "demo@taskmanager.com" });
                  toast({ title: "Login demo ativado" });
                  navigate("/");
                }}
              >
                Entrar com Demo
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Não tem conta?{" "}
                <button type="button" className="text-primary underline-offset-4 hover:underline font-medium" onClick={() => navigate("/register")}>
                  Cadastre-se
                </button>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
