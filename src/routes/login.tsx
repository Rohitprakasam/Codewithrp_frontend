import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Code2, Mail, Lock, ArrowRight } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Btn } from "@/components/btn";
import { AuthService } from "@/services/api";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — codepit" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "admin">("student");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Min 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const user = await AuthService.login(email, password, role);
      signIn(user);
      toast.success(`Welcome back, ${user.name}`);
      navigate({ to: role === "admin" ? "/admin" : "/dashboard" });
    } catch {
      toast.error("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="grid place-items-center h-11 w-11 rounded-xl bg-primary/15 text-primary glow-ring">
            <Code2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Welcome to codepit</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to keep your streak alive.</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/70 backdrop-blur p-6 shadow-2xl shadow-black/30">
          <div className="flex p-1 mb-5 rounded-lg bg-muted/60 text-sm">
            {(["student", "admin"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`relative flex-1 py-1.5 rounded-md capitalize transition-colors ${
                  role === r ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {role === r && (
                  <motion.span
                    layoutId="role-pill"
                    className="absolute inset-0 rounded-md bg-background shadow"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative">{r}</span>
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <Field
              icon={<Mail className="h-4 w-4" />}
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@dev.io"
              error={errors.email}
            />
            <Field
              icon={<Lock className="h-4 w-4" />}
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              error={errors.password}
            />

            <Btn type="submit" loading={loading} className="w-full mt-2" size="lg">
              {loading ? "Signing in..." : <>Sign in <ArrowRight className="h-4 w-4" /></>}
            </Btn>

            <p className="text-xs text-center text-muted-foreground pt-2">
              Demo mode — use any email & 6+ char password.
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

function Field({
  icon, label, type, value, onChange, placeholder, error,
}: {
  icon: React.ReactNode; label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder?: string; error?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className={`mt-1.5 group relative flex items-center rounded-md border bg-background/50 transition-all
        ${error ? "border-destructive/60" : "border-border focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20"}`}>
        <span className="pl-3 text-muted-foreground group-focus-within:text-primary transition-colors">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent px-2.5 py-2.5 text-sm outline-none placeholder:text-muted-foreground/60"
        />
      </div>
      {error && <span className="text-xs text-destructive mt-1 inline-block">{error}</span>}
    </label>
  );
}
