export type Difficulty = "Easy" | "Medium" | "Hard";
export type SubmissionStatus = "Accepted" | "Wrong Answer" | "TLE" | "Runtime Error" | "Pending" | "Compilation Error";
export type Role = "student" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  token?: string;
}

export interface TestCase {
  id: string;
  input: string;
  output: string;
  hidden?: boolean;
}

export interface Problem {
  id: string;
  display_id: number;
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
  source_code?: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string | null;
  content: string;
  read_at: string | null;
  created_at: string;
}

export interface Thread {
  user_id: string;
  user_name: string;
  user_email: string;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: string | number;
}
