import { cn } from "@/lib/utils";
import type { Difficulty, SubmissionStatus } from "@/types";

export function DifficultyBadge({ value, className }: { value: Difficulty; className?: string }) {
  const styles: Record<Difficulty, string> = {
    Easy: "bg-success/15 text-success border-success/30",
    Medium: "bg-warning/15 text-warning border-warning/30",
    Hard: "bg-destructive/15 text-destructive border-destructive/30",
  };
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium", styles[value], className)}>
      {value}
    </span>
  );
}

export function StatusBadge({ value }: { value: SubmissionStatus }) {
  const map: Record<SubmissionStatus, string> = {
    Accepted: "bg-success/15 text-success border-success/30",
    "Wrong Answer": "bg-destructive/15 text-destructive border-destructive/30",
    TLE: "bg-warning/15 text-warning border-warning/30",
    "Runtime Error": "bg-destructive/15 text-destructive border-destructive/30",
    "Compilation Error": "bg-destructive/15 text-destructive border-destructive/30",
    Pending: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium", map[value])}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {value}
    </span>
  );
}
