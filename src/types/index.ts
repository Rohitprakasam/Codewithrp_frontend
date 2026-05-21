export type Difficulty = "Easy" | "Medium" | "Hard";
export type SubmissionStatus = "Accepted" | "Wrong Answer" | "TLE" | "Runtime Error" | "Pending";
export type Role = "student" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface TestCase {
  id: string;
  input: string;
  output: string;
  hidden?: boolean;
}

export interface Problem {
  id: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  description: string;
  constraints: string[];
  examples: { input: string; output: string; explanation?: string }[];
  starterCode: Record<string, string>;
  testcases: TestCase[];
  acceptance: number;
}

export interface Submission {
  id: string;
  problemId: string;
  problemTitle: string;
  user: string;
  language: string;
  status: SubmissionStatus;
  runtime: string;
  submittedAt: string;
}
