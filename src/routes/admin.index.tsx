import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, Search, X, Eye, Users, FileText, CheckCircle2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { AppSidebar } from "@/components/app-sidebar";
import { Btn } from "@/components/btn";
import { DifficultyBadge, StatusBadge } from "@/components/badges";
import { ProblemsService, SubmissionsService, AdminService } from "@/services/api";
import type { Problem, Submission, SubmissionStatus, User } from "@/types";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin — CodeWithRP" }] }),
  component: AdminPage,
});

const STATUS_FILTERS: ("All" | SubmissionStatus)[] = ["All", "Accepted", "Wrong Answer", "TLE", "Runtime Error"];

function AdminPage() {
  const [problems, setProblems] = useState<Problem[] | null>(null);
  const [subs, setSubs] = useState<Submission[] | null>(null);
  const [filter, setFilter] = useState<(typeof STATUS_FILTERS)[number]>("All");
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState<Submission | null>(null);
  const [assignModal, setAssignModal] = useState<Problem | null>(null);
  const [createStudentModal, setCreateStudentModal] = useState(false);
  const [students, setStudents] = useState<User[] | null>(null);

  useEffect(() => {
    ProblemsService.list().then(setProblems);
    SubmissionsService.list().then(setSubs);
    AdminService.getStudents().then(setStudents);
  }, []);

  const filteredSubs = useMemo(() => {
    if (!subs) return [];
    return subs.filter(
      (s) =>
        (filter === "All" || s.status === filter) &&
        (s.user.toLowerCase().includes(query.toLowerCase()) ||
          s.problemTitle.toLowerCase().includes(query.toLowerCase())),
    );
  }, [subs, filter, query]);

  return (
    <div className="min-h-screen flex">
      <AppSidebar variant="admin" />
      <main className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 h-16 border-b border-border bg-background/70 backdrop-blur px-6 lg:px-8 flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold">Admin</h1>
            <p className="text-xs text-muted-foreground">Manage problems, students, and submissions.</p>
          </div>
          <div className="flex gap-2">
            <Btn size="sm" variant="outline" onClick={() => setCreateStudentModal(true)}>
              <Users className="h-4 w-4 mr-2" /> New Student
            </Btn>
            <Link to="/admin/create">
              <Btn size="sm"><PlusCircle className="h-4 w-4" /> New problem</Btn>
            </Link>
          </div>
        </header>

        <div className="p-6 lg:p-8 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard icon={FileText} label="Total problems" value={problems?.length ?? "—"} color="text-primary" />
            <StatCard icon={Users} label="Active students" value={students?.length ?? "—"} color="text-warning" />
            <StatCard icon={CheckCircle2} label="Submissions" value={subs?.length ?? "—"} color="text-success" />
          </div>

          <section>
            <h2 className="text-lg font-semibold tracking-tight mb-4">Problem bank</h2>
            <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
              {(problems ?? Array.from({ length: 4 })).map((p, i) => (
                <div key={(p as Problem)?.id ?? i} className="flex items-center justify-between px-5 py-3.5 border-b border-border last:border-0 hover:bg-accent/30 transition-colors text-sm">
                  {p ? (
                    <>
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-muted-foreground tabular-nums w-6">{(p as Problem).display_id}</span>
                        <span className="font-medium truncate">{(p as Problem).title}</span>
                        <DifficultyBadge value={(p as Problem).difficulty} />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{(p as Problem).acceptance}% acc.</span>
                        <button onClick={() => setAssignModal(p as Problem)} className="hover:text-primary transition-colors font-medium">Assign</button>
                        <button className="hover:text-foreground transition-colors">Edit</button>
                      </div>
                    </>
                  ) : (
                    <div className="h-4 w-full bg-muted rounded animate-pulse" />
                  )}
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold tracking-tight mb-4">Students</h2>
            <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
              <div className="grid grid-cols-12 px-5 py-3 text-xs uppercase tracking-wider text-muted-foreground border-b border-border bg-background/30">
                <div className="col-span-5">Name</div>
                <div className="col-span-5">Email</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>
              {students ? students.map((s, i) => (
                <div key={s.id} className="grid grid-cols-12 items-center px-5 py-3.5 text-sm border-b border-border last:border-0 hover:bg-accent/40 transition-colors w-full">
                  <div className="col-span-5 font-medium truncate">{s.name}</div>
                  <div className="col-span-5 text-muted-foreground truncate">{s.email}</div>
                  <div className="col-span-2 text-right">
                    <button 
                      onClick={async () => {
                        if (confirm(`Remove student ${s.name}?`)) {
                          try {
                            await AdminService.deleteStudent(s.id);
                            setStudents(prev => prev ? prev.filter(x => x.id !== s.id) : null);
                            toast.success("Student removed");
                          } catch (e: any) {
                            toast.error(e.message || "Failed to remove");
                          }
                        }
                      }}
                      className="text-xs font-medium text-destructive hover:underline transition-all"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )) : (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="px-5 py-4 border-b border-border last:border-0">
                    <div className="h-4 w-full bg-muted rounded animate-pulse" />
                  </div>
                ))
              )}
            </div>
          </section>

          <section>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 className="text-lg font-semibold tracking-tight">Submissions</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search student or problem…"
                    className="h-9 w-64 rounded-md border border-border bg-card/50 pl-8 pr-3 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div className="flex items-center rounded-md border border-border bg-card/50 p-0.5 text-xs overflow-x-auto">
                  {STATUS_FILTERS.map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 h-8 rounded-[6px] whitespace-nowrap transition-colors ${
                        filter === f ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
              <div className="grid grid-cols-12 px-5 py-3 text-xs uppercase tracking-wider text-muted-foreground border-b border-border bg-background/30">
                <div className="col-span-3">Student</div>
                <div className="col-span-4">Problem</div>
                <div className="col-span-2 hidden sm:block">Lang</div>
                <div className="col-span-3 sm:col-span-2">Status</div>
                <div className="col-span-2 sm:col-span-1 text-right">Time</div>
              </div>
              {filteredSubs.map((s, i) => (
                <motion.button
                  key={s.id}
                  onClick={() => setModal(s)}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="grid grid-cols-12 items-center px-5 py-3.5 text-sm border-b border-border last:border-0 hover:bg-accent/40 transition-colors w-full text-left"
                >
                  <div className="col-span-3 truncate">{s.user}</div>
                  <div className="col-span-4 font-medium truncate">{s.problemTitle}</div>
                  <div className="col-span-2 hidden sm:block text-muted-foreground">{s.language}</div>
                  <div className="col-span-3 sm:col-span-2"><StatusBadge value={s.status} /></div>
                  <div className="col-span-2 sm:col-span-1 text-right text-xs text-muted-foreground">{s.submittedAt}</div>
                </motion.button>
              ))}
              {!subs && Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="px-5 py-4 border-b border-border last:border-0">
                  <div className="h-4 w-full bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <AnimatePresence>
        {modal && <SubmissionModal sub={modal} onClose={() => setModal(null)} />}
        {assignModal && students && (
          <AssignModal 
            problem={assignModal} 
            students={students} 
            onClose={() => setAssignModal(null)} 
          />
        )}
        {createStudentModal && (
          <CreateStudentModal 
            onClose={() => setCreateStudentModal(false)}
            onCreated={(s) => {
              setStudents((prev) => prev ? [...prev, s] : [s]);
              setCreateStudentModal(false);
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: React.ReactNode; color: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/60 p-5 flex items-center gap-4">
      <div className={`h-10 w-10 rounded-lg bg-background grid place-items-center ${color}`}><Icon className="h-5 w-5" /></div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-xl font-semibold">{value}</div>
      </div>
    </div>
  );
}

function SubmissionModal({ sub, onClose }: { sub: Submission; onClose: () => void }) {
  const [details, setDetails] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    SubmissionsService.get(sub.id)
      .then((res) => {
        setDetails(res);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load submission details");
        setLoading(false);
      });
  }, [sub.id]);

  const displaySub = details || sub;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ type: "spring", stiffness: 400, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Submission details</h3>
          </div>
          <button onClick={onClose} className="grid place-items-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <Info label="Student" value={displaySub.user} />
            <Info label="Problem" value={displaySub.problemTitle} />
            <Info label="Language" value={displaySub.language} />
            <Info label="Runtime" value={displaySub.runtime} />
            <Info label="Status" value={<StatusBadge value={displaySub.status} />} />
            <Info label="Submitted" value={displaySub.submittedAt} />
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1.5">Code</div>
            {loading ? (
              <div className="h-24 flex items-center justify-center text-xs text-muted-foreground border border-border rounded-md bg-[color:var(--editor)]">
                Loading code preview…
              </div>
            ) : (
              <pre className="font-mono text-xs whitespace-pre-wrap rounded-md bg-[color:var(--editor)] border border-border p-4 max-h-64 overflow-auto scrollbar-thin">
                {displaySub.source_code || "// No code submitted"}
              </pre>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm">{value}</div>
    </div>
  );
}

function AssignModal({ problem, students, onClose }: { problem: Problem; students: User[]; onClose: () => void }) {
  const [assigned, setAssigned] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AdminService.getAssignments(problem.id)
      .then((res) => {
        setAssigned(res);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load assignments");
        setLoading(false);
      });
  }, [problem.id]);

  const toggle = (id: string) => {
    setAssigned(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const save = async () => {
    setLoading(true);
    try {
      await AdminService.assignProblem(problem.id, assigned);
      toast.success("Assignments updated!");
      onClose();
    } catch (e: any) {
      toast.error(e.message || "Failed to assign");
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 8 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-semibold">Assign: {problem.title}</h3>
          <button onClick={onClose} className="grid place-items-center h-8 w-8 rounded-md text-muted-foreground hover:bg-accent transition-colors"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-5">
          {loading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Loading...</div>
          ) : (
            <div className="space-y-4">
              <div className="max-h-60 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
                {students.map(s => (
                  <label key={s.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-accent/40 cursor-pointer transition-colors border border-transparent hover:border-border">
                    <input type="checkbox" checked={assigned.includes(s.id)} onChange={() => toggle(s.id)} className="h-4 w-4 rounded border-border bg-background" />
                    <div>
                      <div className="text-sm font-medium">{s.name}</div>
                      <div className="text-xs text-muted-foreground">{s.email}</div>
                    </div>
                  </label>
                ))}
                {students.length === 0 && <div className="text-sm text-muted-foreground">No students found.</div>}
              </div>
              <Btn onClick={save} className="w-full" disabled={loading}>Save Assignments</Btn>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function CreateStudentModal({ onClose, onCreated }: { onClose: () => void; onCreated: (u: User) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await AdminService.createStudent({ name, email, password });
      toast.success("Student created successfully!");
      onCreated(u);
    } catch (err: any) {
      toast.error(err.message || "Creation failed");
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 8 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-semibold">Create Student</h3>
          <button onClick={onClose} className="grid place-items-center h-8 w-8 rounded-md text-muted-foreground hover:bg-accent transition-colors"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Full Name</label>
            <input required value={name} onChange={e => setName(e.target.value)} className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Email</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Password</label>
            <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
          </div>
          <Btn type="submit" loading={loading} className="w-full mt-2">Create Student</Btn>
        </form>
      </motion.div>
    </motion.div>
  );
}
