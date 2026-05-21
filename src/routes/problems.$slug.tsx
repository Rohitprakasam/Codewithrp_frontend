import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import Editor from "@monaco-editor/react";
import { motion, AnimatePresence } from "framer-motion";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import {
  ArrowLeft, Play, Send, CheckCircle2, XCircle, Terminal, FileText, ChevronDown, Code2,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Btn } from "@/components/btn";
import { DifficultyBadge } from "@/components/badges";
import { ProblemsService, SubmissionsService } from "@/services/api";
import type { Problem } from "@/types";

export const Route = createFileRoute("/problems/$slug")({
  head: () => ({ meta: [{ title: "Solve — codepit" }] }),
  component: ProblemPage,
});

const LANGS = [
  { id: "javascript", label: "JavaScript" },
  { id: "python", label: "Python" },
  { id: "cpp", label: "C++" },
];

function ProblemPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [lang, setLang] = useState("javascript");
  const [code, setCode] = useState("");
  const [tab, setTab] = useState<"testcases" | "console">("testcases");
  const [activeTc, setActiveTc] = useState(0);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [output, setOutput] = useState<{ text: string; ok: boolean; time: string } | null>(null);

  useEffect(() => {
    ProblemsService.get(slug).then((p) => {
      if (!p) { navigate({ to: "/dashboard" }); return; }
      setProblem(p);
      setCode(p.starterCode[lang] ?? "");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useEffect(() => {
    if (problem) setCode(problem.starterCode[lang] ?? "");
  }, [lang, problem]);

  const run = async () => {
    setRunning(true); setTab("console");
    const res = await SubmissionsService.run(code, lang);
    setOutput({ text: res.output, ok: res.passed, time: res.time });
    setRunning(false);
  };

  const submit = async () => {
    setSubmitting(true); setTab("console");
    const res = await SubmissionsService.submit(code, lang);
    setOutput({ text: res.status === "Accepted" ? "All testcases passed 🎉" : "Some testcases failed.", ok: res.status === "Accepted", time: res.runtime });
    if (res.status === "Accepted") toast.success(`Accepted in ${res.runtime}`);
    else toast.error("Wrong Answer");
    setSubmitting(false);
  };

  if (!problem) {
    return <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">Loading problem…</div>;
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-30 h-14 shrink-0 border-b border-border bg-background/80 backdrop-blur px-4 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/dashboard" className="grid place-items-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="grid place-items-center h-7 w-7 rounded-md bg-primary/15 text-primary">
            <Code2 className="h-3.5 w-3.5" />
          </div>
          <h1 className="font-semibold truncate">{problem.title}</h1>
          <DifficultyBadge value={problem.difficulty} />
        </div>
        <div className="flex items-center gap-2">
          <Btn variant="outline" size="sm" onClick={run} loading={running}>
            <Play className="h-3.5 w-3.5" /> Run
          </Btn>
          <Btn variant="success" size="sm" onClick={submit} loading={submitting}>
            <Send className="h-3.5 w-3.5" /> Submit
          </Btn>
        </div>
      </header>

      <div className="flex-1 min-h-0 p-3">
        <PanelGroup direction="horizontal" className="rounded-xl overflow-hidden border border-border bg-card/30">
          <Panel defaultSize={45} minSize={28}>
            <LeftPanel problem={problem} />
          </Panel>
          <PanelResizeHandle className="w-1.5 bg-border/40 hover:bg-primary/40 transition-colors" />
          <Panel defaultSize={55} minSize={32}>
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between h-11 px-3 border-b border-border bg-background/40 shrink-0">
                <div className="relative">
                  <select
                    value={lang}
                    onChange={(e) => setLang(e.target.value)}
                    className="appearance-none bg-accent text-sm rounded-md pl-3 pr-8 py-1.5 outline-none border border-border hover:bg-accent/80 transition-colors cursor-pointer"
                  >
                    {LANGS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none text-muted-foreground" />
                </div>
                <span className="text-xs text-muted-foreground">auto-saved</span>
              </div>

              <PanelGroup direction="vertical" className="flex-1">
                <Panel defaultSize={65} minSize={30}>
                  <div className="h-full bg-[color:var(--editor)]">
                    <Editor
                      height="100%"
                      language={lang}
                      value={code}
                      onChange={(v) => setCode(v ?? "")}
                      theme="vs-dark"
                      options={{
                        fontSize: 13,
                        minimap: { enabled: false },
                        fontFamily: "ui-monospace, JetBrains Mono, monospace",
                        scrollBeyondLastLine: false,
                        smoothScrolling: true,
                        cursorBlinking: "smooth",
                        padding: { top: 14 },
                        lineNumbersMinChars: 3,
                      }}
                    />
                  </div>
                </Panel>
                <PanelResizeHandle className="h-1.5 bg-border/40 hover:bg-primary/40 transition-colors" />
                <Panel defaultSize={35} minSize={15}>
                  <div className="h-full flex flex-col bg-background/40">
                    <div className="flex items-center gap-1 border-b border-border px-2 shrink-0">
                      <TabBtn active={tab === "testcases"} onClick={() => setTab("testcases")} icon={<FileText className="h-3.5 w-3.5" />}>Testcases</TabBtn>
                      <TabBtn active={tab === "console"} onClick={() => setTab("console")} icon={<Terminal className="h-3.5 w-3.5" />}>Console</TabBtn>
                    </div>
                    <div className="flex-1 overflow-auto scrollbar-thin p-4">
                      <AnimatePresence mode="wait">
                        {tab === "testcases" ? (
                          <motion.div
                            key="tc"
                            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                          >
                            <div className="flex gap-1.5 mb-4">
                              {problem.testcases.filter((t) => !t.hidden).map((t, i) => (
                                <button
                                  key={t.id}
                                  onClick={() => setActiveTc(i)}
                                  className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
                                    activeTc === i ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/50"
                                  }`}
                                >
                                  Case {i + 1}
                                </button>
                              ))}
                            </div>
                            <div className="space-y-3">
                              <KV label="Input" value={problem.testcases[activeTc]?.input ?? ""} />
                              <KV label="Expected" value={problem.testcases[activeTc]?.output ?? ""} />
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="out"
                            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="font-mono text-xs"
                          >
                            {running || submitting ? (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <span className="h-3 w-3 rounded-full border-2 border-primary border-r-transparent animate-spin" />
                                Executing…
                              </div>
                            ) : output ? (
                              <div className="space-y-3">
                                <div className={`flex items-center gap-2 text-sm font-medium ${output.ok ? "text-success" : "text-destructive"}`}>
                                  {output.ok ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                  {output.ok ? "Accepted" : "Wrong Answer"}
                                  <span className="text-muted-foreground text-xs ml-auto font-normal">Runtime: {output.time}</span>
                                </div>
                                <pre className="whitespace-pre-wrap rounded-md bg-[color:var(--editor)] border border-border p-3 text-foreground/90">{output.text}</pre>
                              </div>
                            ) : (
                              <p className="text-muted-foreground">Run your code to see output here.</p>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </Panel>
              </PanelGroup>
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, children, icon }: { active: boolean; onClick: () => void; children: React.ReactNode; icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors ${
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      {children}
      {active && <motion.span layoutId="tab-underline" className="absolute inset-x-2 -bottom-px h-0.5 bg-primary rounded-full" />}
    </button>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <pre className="font-mono text-xs whitespace-pre-wrap rounded-md bg-[color:var(--editor)] border border-border p-3">{value}</pre>
    </div>
  );
}

function LeftPanel({ problem }: { problem: Problem }) {
  const [open, setOpen] = useState({ desc: true, ex: true, cons: true });
  return (
    <div className="h-full overflow-auto scrollbar-thin">
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{problem.id}. {problem.title}</h2>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <DifficultyBadge value={problem.difficulty} />
            {problem.tags.map((t) => (
              <span key={t} className="text-xs bg-muted/60 text-muted-foreground rounded px-2 py-0.5">{t}</span>
            ))}
            <span className="text-xs text-muted-foreground ml-auto">Acceptance {problem.acceptance}%</span>
          </div>
        </div>

        <Section title="Description" open={open.desc} onToggle={() => setOpen((s) => ({ ...s, desc: !s.desc }))}>
          <p className="text-sm leading-relaxed text-foreground/85 whitespace-pre-line">{problem.description}</p>
        </Section>

        <Section title="Examples" open={open.ex} onToggle={() => setOpen((s) => ({ ...s, ex: !s.ex }))}>
          <div className="space-y-4">
            {problem.examples.map((ex, i) => (
              <div key={i} className="rounded-lg border border-border bg-background/40 p-4 space-y-2">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Example {i + 1}</div>
                <KV label="Input" value={ex.input} />
                <KV label="Output" value={ex.output} />
                {ex.explanation && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Explanation</div>
                    <p className="text-sm text-foreground/80">{ex.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>

        <Section title="Constraints" open={open.cons} onToggle={() => setOpen((s) => ({ ...s, cons: !s.cons }))}>
          <ul className="space-y-1.5 text-sm font-mono text-foreground/85">
            {problem.constraints.map((c, i) => <li key={i}>· {c}</li>)}
          </ul>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div>
      <button onClick={onToggle} className="flex w-full items-center justify-between text-sm font-semibold mb-3 group">
        <span>{title}</span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-0" : "-rotate-90"}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
