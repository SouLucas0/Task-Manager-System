import { Link, useLocation } from "wouter";
import { LayoutDashboard, CheckSquare, Tags } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetTasksSummary } from "@workspace/api-client-react";
import { getGetTasksSummaryQueryKey } from "@workspace/api-client-react";

export function Sidebar() {
  const [location] = useLocation();
  const { data: summary } = useGetTasksSummary({
    query: {
      queryKey: getGetTasksSummaryQueryKey(),
    }
  });

  const links = [
    {
      href: "/",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/tasks",
      label: "Tasks",
      icon: CheckSquare,
      badge: summary?.by_status?.todo ? summary.by_status.todo : undefined,
    },
    {
      href: "/categories",
      label: "Categories",
      icon: Tags,
    },
  ];

  return (
    <div className="flex h-full w-64 flex-col bg-sidebar border-r border-sidebar-border">
      <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold tracking-tight text-sidebar-foreground">
          TaskFlow
        </h1>
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
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <div className="flex items-center">
                <link.icon className="mr-3 h-4 w-4" />
                {link.label}
              </div>
              {link.badge !== undefined && (
                <span className="bg-primary text-primary-foreground ml-auto inline-block rounded-full py-0.5 px-2 text-xs font-semibold">
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-sidebar-border text-xs text-sidebar-foreground/50">
        Focus mode active
      </div>
    </div>
  );
}
