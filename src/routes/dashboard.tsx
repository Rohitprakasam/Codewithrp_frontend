import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Search, Filter, TrendingUp, CheckCircle2, Flame, Clock } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { DifficultyBadge, StatusBadge } from "@/components/badges";
import { ProblemsService, SubmissionsService } from "@/services/api";
import type { Problem, Submission } from "@/types";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — codepit" }] }),
  component: Dashboard,
});

function Dashboard() {
  const [problems, setProblems] = useState<Problem[] | null>(null);
  const [subs, setSubs] = useState<Submission[] | null>(null);
  const [query, setQuery] = useState("");
  const [diff, setDiff] = useState<"All" | "Easy" | "Medium" | "Hard">("All");

  useEffect(() => {
    ProblemsService.list().then(setProblems);
    SubmissionsService.list().then(setSubs);
  }, []);

  const filtered = useMemo(() => {
    if (!problems) return [];
    return problems.filter(
      (p) =>
        (diff === "All" || p.difficulty === diff) &&
        (p.title.toLowerCase().includes(query.toLowerCase()) ||
          p.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))),
    );
  }, [problems, query, diff]);

  return (
    <div className="min-h-screen flex">
      <AppSidebar variant="student" />
      <main className="flex-1 flex flex-col min-w-0">
        <TopBar title="Dashboard" subtitle="Pick up where you left off." />

        <div className="p-6 lg:p-8 space-y-8">
          <Stats subs={subs} total={problems?.length ?? 0} />

          <section>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Problems</h2>
                <p className="text-xs text-muted-foreground">{filtered.length} of {problems?.length ?? 0} shown</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search problems…"
                    className="h-9 w-56 sm:w-72 rounded-md border border-border bg-card/50 pl-8 pr-3 text-sm outline-none transition-all focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="hidden sm:flex items-center rounded-md border border-border bg-card/50 p-0.5 text-xs">
                  {(["All", "Easy", "Medium", "Hard"] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDiff(d)}
                      className={`px-3 h-8 rounded-[6px] transition-colors ${
                        diff === d ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
              <div className="grid grid-cols-12 px-5 py-3 text-xs uppercase tracking-wider text-muted-foreground border-b border-border bg-background/30">
                <div className="col-span-1">#</div>
                <div className="col-span-6 sm:col-span-5">Title</div>
                <div className="hidden sm:block col-span-3">Tags</div>
                <div className="col-span-3 sm:col-span-2">Difficulty</div>
                <div className="col-span-2 sm:col-span-1 text-right">Acc.</div>
              </div>
              {!problems
                ? Array.from({ length: 6 }).map((_, i) => <RowSkeleton key={i} />)
                : filtered.map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <Link
                        to="/problems/$slug"
                        params={{ slug: p.slug }}
                        className="grid grid-cols-12 items-center px-5 py-3.5 text-sm border-b border-border last:border-0 transition-colors hover:bg-accent/40 group"
                      >
                        <div className="col-span-1 text-muted-foreground">{p.id}</div>
                        <div className="col-span-6 sm:col-span-5 font-medium group-hover:text-primary transition-colors truncate">
                          {p.title}
                        </div>
                        <div className="hidden sm:flex col-span-3 gap-1.5 flex-wrap">
                          {p.tags.slice(0, 2).map((t) => (
                            <span key={t} className="text-xs text-muted-foreground bg-muted/60 rounded px-1.5 py-0.5">
                              {t}
                            </span>
                          ))}
                        </div>
                        <div className="col-span-3 sm:col-span-2"><DifficultyBadge value={p.difficulty} /></div>
                        <div className="col-span-2 sm:col-span-1 text-right text-muted-foreground tabular-nums">{p.acceptance}%</div>
                      </Link>
                    </motion.div>
                  ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold tracking-tight mb-4">Recent activity</h2>
            <div className="rounded-xl border border-border bg-card/50 divide-y divide-border">
              {(subs ?? []).slice(0, 5).map((s) => (
                <div key={s.id} className="flex items-center justify-between px-5 py-3 text-sm hover:bg-accent/30 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="font-medium truncate">{s.problemTitle}</span>
                    <span className="text-xs text-muted-foreground hidden sm:inline">· {s.language}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground tabular-nums hidden sm:inline">{s.runtime}</span>
                    <StatusBadge value={s.status} />
                    <span className="text-xs text-muted-foreground tabular-nums w-16 text-right">{s.submittedAt}</span>
                  </div>
                </div>
              ))}
              {!subs && Array.from({ length: 4 }).map((_, i) => <RowSkeleton key={i} small />)}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="sticky top-0 z-20 h-16 border-b border-border bg-background/70 backdrop-blur px-6 lg:px-8 flex items-center justify-between">
      <div>
        <h1 className="text-base font-semibold">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </header>
  );
}

function Stats({ subs, total }: { subs: Submission[] | null; total: number }) {
  const accepted = subs?.filter((s) => s.status === "Accepted").length ?? 0;
  const streak = 7;
  const stats = [
    { label: "Solved", value: `${accepted}/${total}`, icon: CheckCircle2, color: "text-success" },
    { label: "Submissions", value: subs?.length ?? "—", icon: TrendingUp, color: "text-primary" },
    { label: "Day streak", value: `${streak} days`, icon: Flame, color: "text-warning" },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          className="rounded-xl border border-border bg-card/60 p-5 flex items-center gap-4"
        >
          <div className={`h-10 w-10 rounded-lg bg-background grid place-items-center ${s.color}`}>
            <s.icon className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className="text-xl font-semibold tabular-nums">{s.value}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function RowSkeleton({ small }: { small?: boolean }) {
  return (
    <div className={`px-5 ${small ? "py-3" : "py-4"} flex items-center gap-4 border-b border-border last:border-0`}>
      <div className="h-3 w-8 rounded bg-muted animate-pulse" />
      <div className="h-3 flex-1 rounded bg-muted animate-pulse" />
      <div className="h-3 w-16 rounded bg-muted animate-pulse" />
    </div>
  );
}
