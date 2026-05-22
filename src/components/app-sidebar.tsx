import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Code2,
  LayoutDashboard,
  ListChecks,
  History,
  Settings,
  Trophy,
  Users,
  PlusCircle,
  LogOut,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "@tanstack/react-router";

type Item = { label: string; to: string; icon: React.ComponentType<{ className?: string }> };

const studentNav: Item[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Problems", to: "/dashboard", icon: ListChecks },
  { label: "Submissions", to: "/dashboard", icon: History },
  { label: "Messages", to: "/messages", icon: MessageSquare },
];

const adminNav: Item[] = [
  { label: "Overview", to: "/admin", icon: LayoutDashboard },
  { label: "Problems", to: "/admin", icon: ListChecks },
  { label: "Create", to: "/admin/create", icon: PlusCircle },
  { label: "Messages", to: "/messages", icon: MessageSquare },
];

export function AppSidebar({ variant = "student" }: { variant?: "student" | "admin" }) {
  const items = variant === "admin" ? adminNav : studentNav;
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar/60 backdrop-blur">
      <div className="flex h-16 items-center gap-2 px-5 border-b border-sidebar-border">
        <div className="grid place-items-center h-8 w-8 rounded-lg bg-primary/15 text-primary">
          <Code2 className="h-4 w-4" />
        </div>
        <span className="font-semibold tracking-tight">CodeWithRP</span>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {items.map((item) => {
          const active = path === item.to;
          return (
            <Link
              key={item.label}
              to={item.to}
              className={cn(
                "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "text-foreground bg-accent"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/60",
              )}
            >
              {active && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-y-1 left-0 w-0.5 rounded-r bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border space-y-2">
        <div className="flex items-center gap-3 px-2 py-2 rounded-md">
          <div className="h-8 w-8 rounded-full bg-primary/20 grid place-items-center text-primary text-sm font-medium">
            {(user?.name?.[0] ?? "G").toUpperCase()}
          </div>
          <div className="text-xs leading-tight min-w-0">
            <div className="font-medium truncate">{user?.name ?? "Guest"}</div>
            <div className="text-muted-foreground truncate">{user?.role ?? "student"}</div>
          </div>
        </div>
        <button
          onClick={() => {
            signOut();
            navigate({ to: "/login" });
          }}
          className="flex w-full items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </aside>
  );
}
