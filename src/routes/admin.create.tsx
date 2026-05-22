import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Save, Trash2, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { AppSidebar } from "@/components/app-sidebar";
import { Btn } from "@/components/btn";
import { ProblemsService } from "@/services/api";
import type { Difficulty } from "@/types";

export const Route = createFileRoute("/admin/create")({
  head: () => ({ meta: [{ title: "Create problem — CodeWithRP" }] }),
  component: CreatePage,
});

type TC = { id: string; input: string; output: string; hidden: boolean };

function CreatePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("Easy");
  const [description, setDescription] = useState("");
  const [starter, setStarter] = useState(`import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Read input and write solution output here
    }
}`);
  const [tcs, setTcs] = useState<TC[]>([
    { id: "1", input: "", output: "", hidden: false },
  ]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const visible = tcs.filter((t) => !t.hidden);
  const hidden = tcs.filter((t) => t.hidden);

  const addTC = (hiddenFlag: boolean) =>
    setTcs((s) => [...s, { id: String(Date.now()), input: "", output: "", hidden: hiddenFlag }]);
  const removeTC = (id: string) => setTcs((s) => s.filter((t) => t.id !== id));
  const updateTC = (id: string, patch: Partial<TC>) =>
    setTcs((s) => s.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const save = async () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Title required";
    if (!description.trim()) e.description = "Description required";
    if (!starter.trim()) e.starter = "Starter code required";
    if (visible.length === 0) e.tcs = "At least one visible testcase required";
    setErrors(e);
    if (Object.keys(e).length) return;

    setSaving(true);
    try {
      await ProblemsService.create({
        title,
        difficulty,
        description,
        starter_code: starter,
        tags: [],
        visible_testcases: visible.map((t) => ({ input: t.input, expected_output: t.output })),
        hidden_testcases: hidden.map((t) => ({ input: t.input, expected_output: t.output })),
      });
      toast.success("Problem published");
      navigate({ to: "/admin" });
    } catch (err: any) {
      toast.error(err.message || "Could not save problem");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <AppSidebar variant="admin" />
      <main className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 h-16 border-b border-border bg-background/70 backdrop-blur px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate({ to: "/admin" })} className="grid place-items-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-base font-semibold">Create problem</h1>
              <p className="text-xs text-muted-foreground">Design the problem statement and testcases.</p>
            </div>
          </div>
          <Btn onClick={save} loading={saving}><Save className="h-4 w-4" /> Save problem</Btn>
        </header>

        <div className="p-6 lg:p-8 max-w-4xl w-full mx-auto space-y-6">
          <Card>
            <FieldLabel error={errors.title}>Title</FieldLabel>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Two Sum"
              className="mt-1.5 w-full h-10 rounded-md border border-border bg-background/40 px-3 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all"
            />

            <div className="mt-5">
              <FieldLabel>Difficulty</FieldLabel>
              <div className="mt-1.5 flex gap-2">
                {(["Easy", "Medium", "Hard"] as Difficulty[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`px-4 h-9 rounded-md text-sm border transition-colors ${
                      difficulty === d ? "border-primary/60 bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <FieldLabel error={errors.description}>Description</FieldLabel>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              placeholder="Describe the problem. Markdown supported."
              className="mt-1.5 w-full rounded-md border border-border bg-background/40 px-3 py-2.5 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all resize-y"
            />
          </Card>

          <Card>
            <FieldLabel>Starter code</FieldLabel>
            <textarea
              value={starter}
              onChange={(e) => setStarter(e.target.value)}
              rows={6}
              className="mt-1.5 w-full font-mono text-xs rounded-md border border-border bg-[color:var(--editor)] px-3 py-2.5 outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 resize-y"
            />
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold flex items-center gap-2"><Eye className="h-4 w-4 text-success" /> Visible testcases</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Shown to students as examples.</p>
              </div>
              <Btn variant="outline" size="sm" onClick={() => addTC(false)}><Plus className="h-3.5 w-3.5" /> Add</Btn>
            </div>
            {errors.tcs && <p className="text-xs text-destructive mt-2">{errors.tcs}</p>}
            <TCList list={visible} onUpdate={updateTC} onRemove={removeTC} />
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold flex items-center gap-2"><EyeOff className="h-4 w-4 text-warning" /> Hidden testcases</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Used to grade submissions.</p>
              </div>
              <Btn variant="outline" size="sm" onClick={() => addTC(true)}><Plus className="h-3.5 w-3.5" /> Add</Btn>
            </div>
            <TCList list={hidden} onUpdate={updateTC} onRemove={removeTC} />
          </Card>
        </div>
      </main>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card/60 p-5"
    >{children}</motion.div>
  );
}

function FieldLabel({ children, error }: { children: React.ReactNode; error?: string }) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{children}</label>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}

function TCList({ list, onUpdate, onRemove }: {
  list: TC[]; onUpdate: (id: string, p: Partial<TC>) => void; onRemove: (id: string) => void;
}) {
  return (
    <div className="mt-4 space-y-3">
      <AnimatePresence initial={false}>
        {list.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="rounded-lg border border-border bg-background/40 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground">Case {i + 1}</span>
                <button
                  onClick={() => onRemove(t.id)}
                  className="grid place-items-center h-7 w-7 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Input</label>
                  <textarea
                    value={t.input}
                    onChange={(e) => onUpdate(t.id, { input: e.target.value })}
                    rows={3}
                    className="mt-1 w-full font-mono text-xs rounded-md border border-border bg-[color:var(--editor)] px-2.5 py-2 outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 resize-y"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Expected output</label>
                  <textarea
                    value={t.output}
                    onChange={(e) => onUpdate(t.id, { output: e.target.value })}
                    rows={3}
                    className="mt-1 w-full font-mono text-xs rounded-md border border-border bg-[color:var(--editor)] px-2.5 py-2 outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 resize-y"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      {list.length === 0 && (
        <p className="text-xs text-muted-foreground py-3 text-center border border-dashed border-border rounded-lg">No testcases yet.</p>
      )}
    </div>
  );
}
