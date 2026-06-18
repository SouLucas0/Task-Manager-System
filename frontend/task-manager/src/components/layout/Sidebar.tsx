import { Link, useLocation } from "wouter";
import { LayoutDashboard, CheckSquare, Tags, Bug, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore, getTasksSummary } from "@/lib/store";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { tasks } = useStore();
  const summary = useMemo(() => getTasksSummary(), [tasks]);

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/tasks", label: "Tarefas", icon: CheckSquare, badge: summary?.by_status?.todo ? summary.by_status.todo : undefined },
    { href: "/categories", label: "Categorias", icon: Tags },
    { href: "/bugs", label: "Bugs", icon: Bug },
  ];

  return (
    <div className="flex h-full w-64 flex-col bg-sidebar border-r border-sidebar-border">
      <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold tracking-tight text-sidebar-foreground">Task Manager</h1>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {links.map((link) => {
          const isActive = location === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <div className="flex items-center">
                <link.icon className="mr-3 h-4 w-4" />
                {link.label}
              </div>
              {link.badge !== undefined && (
                <span className="bg-primary text-primary-foreground ml-auto inline-block rounded-full py-0.5 px-2 text-xs font-semibold">{link.badge}</span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-2 px-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 shrink-0">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="flex flex-col items-start overflow-hidden">
                <span className="text-xs font-medium truncate max-w-[130px]">{user?.name}</span>
                <span className="text-[10px] text-sidebar-foreground/50 truncate max-w-[130px]">{user?.email}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56">
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
