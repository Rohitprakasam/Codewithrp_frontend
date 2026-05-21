// Service layer placeholders — swap these for real API calls later.
import { problems, submissions } from "@/lib/mock-data";
import type { Problem, Submission } from "@/types";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const ProblemsService = {
  async list(): Promise<Problem[]> {
    await delay(400);
    return problems;
  },
  async get(slug: string): Promise<Problem | undefined> {
    await delay(250);
    return problems.find((p) => p.slug === slug);
  },
  async create(p: Partial<Problem>): Promise<Problem> {
    await delay(500);
    return { ...(p as Problem), id: String(Date.now()) };
  },
};

export const SubmissionsService = {
  async list(): Promise<Submission[]> {
    await delay(300);
    return submissions;
  },
  async run(_code: string, _language: string): Promise<{ output: string; passed: boolean; time: string }> {
    await delay(900);
    const passed = Math.random() > 0.35;
    return {
      output: passed ? "[0, 1]\n\nAll sample tests passed." : "Expected [0,1] but got [1,0]\n\n1 test failed.",
      passed,
      time: `${Math.floor(20 + Math.random() * 80)} ms`,
    };
  },
  async submit(_code: string, _language: string): Promise<{ status: "Accepted" | "Wrong Answer"; runtime: string }> {
    await delay(1400);
    const ok = Math.random() > 0.3;
    return { status: ok ? "Accepted" : "Wrong Answer", runtime: `${Math.floor(20 + Math.random() * 100)} ms` };
  },
};

export const AuthService = {
  async login(email: string, _password: string, role: "student" | "admin") {
    await delay(700);
    return { id: "u1", name: email.split("@")[0], email, role };
  },
};
