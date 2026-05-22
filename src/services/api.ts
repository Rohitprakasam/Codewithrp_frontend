import type { Problem, Submission, SubmissionStatus } from "@/types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function getHeaders() {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const rawUser = localStorage.getItem("cp_auth_user");
  if (rawUser) {
    try {
      const user = JSON.parse(rawUser);
      if (user?.token) {
        headers["Authorization"] = `Bearer ${user.token}`;
      }
    } catch (e) {
      // ignore
    }
  }
  return headers;
}

async function safeFetch(url: string, options?: RequestInit) {
  try {
    const res = await fetch(url, options);
    if (res.status === 401) {
      localStorage.removeItem("cp_auth_user");
      window.location.href = "/login";
    }
    return res;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("Network error: Please check if the backend is running.");
    }
    throw error;
  }
}

export const ProblemsService = {
  async list(): Promise<Problem[]> {
    const res = await safeFetch(`${API_BASE}/problems`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch problems");
    const result = await res.json();
    // Map backend response fields to frontend expectations
    return (result.data || []).map((p: any) => ({
      id: p.id,
      display_id: p.display_id,
      slug: p.slug,
      title: p.title,
      difficulty: p.difficulty,
      tags: p.tags || [],
      description: p.description || "",
      constraints: [
        "Standard Java Class Name must be 'Main'",
        "Execution time limit is 8.0 seconds",
      ],
      examples: [],
      starterCode: { java: p.starter_code || "" },
      testcases: [],
      acceptance: 50,
    }));
  },

  async get(slug: string): Promise<Problem | undefined> {
    const res = await safeFetch(`${API_BASE}/problems/${slug}`, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      if (res.status === 404) return undefined;
      throw new Error("Failed to fetch problem details");
    }
    const result = await res.json();
    const p = result.data;

    // Map visible testcases from backend to UI examples and testcases array
    const testcases = (p.visible_testcases || []).map((tc: any) => ({
      id: tc.id,
      input: tc.input,
      output: tc.expected_output,
      hidden: false,
    }));

    return {
      id: p.id,
      display_id: p.display_id,
      slug: p.slug,
      title: p.title,
      difficulty: p.difficulty,
      tags: p.tags || [],
      description: p.description || "",
      constraints: [
        "Standard Java Class Name must be 'Main'",
        "Execution time limit is 8.0 seconds",
      ],
      examples: testcases.map((tc: any) => ({
        input: tc.input,
        output: tc.output,
        explanation: "",
      })),
      starterCode: { java: p.starter_code || "" },
      testcases,
      acceptance: 50,
    };
  },

  async create(p: {
    title: string;
    difficulty: "Easy" | "Medium" | "Hard";
    description: string;
    starter_code: string;
    tags: string[];
    visible_testcases: { input: string; expected_output: string }[];
    hidden_testcases: { input: string; expected_output: string }[];
  }): Promise<any> {
    const res = await safeFetch(`${API_BASE}/admin/problems`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(p),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || "Failed to publish problem");
    }
    const result = await res.json();
    return result.data;
  },
};

export const SubmissionsService = {
  async list(): Promise<Submission[]> {
    const rawUser = localStorage.getItem("cp_auth_user");
    let url = `${API_BASE}/submissions/me`;
    if (rawUser) {
      try {
        const user = JSON.parse(rawUser);
        if (user?.role === "admin") {
          url = `${API_BASE}/admin/submissions`;
        }
      } catch (e) {
        // ignore
      }
    }
    const res = await safeFetch(url, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch submissions");
    const result = await res.json();

    return (result.data || []).map((s: any) => ({
      id: s.id,
      problemId: s.problem_id,
      problemTitle: s.problem_title || "Problem",
      user: s.user_name || s.user_email || "Student",
      language: "Java",
      status: s.status as SubmissionStatus,
      runtime: s.runtime || "N/A",
      submittedAt: new Date(s.submitted_at).toLocaleString([], {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      source_code: s.source_code,
    }));
  },

  async get(id: string): Promise<Submission> {
    const res = await safeFetch(`${API_BASE}/admin/submissions/${id}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch submission details");
    const result = await res.json();
    const s = result.data;

    return {
      id: s.id,
      problemId: s.problem_id,
      problemTitle: s.problem_title || "Problem",
      user: s.user_name || s.user_email || "Student",
      language: "Java",
      status: s.status as SubmissionStatus,
      runtime: s.runtime || "N/A",
      submittedAt: new Date(s.submitted_at).toLocaleString([], {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      source_code: s.source_code,
    };
  },

  async run(
    problemId: string,
    code: string,
  ): Promise<{ output: string; passed: boolean; status: SubmissionStatus; time: string }> {
    const start = Date.now();
    const res = await safeFetch(`${API_BASE}/execute/run`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ problem_id: problemId, source_code: code }),
    });
    const elapsed = Date.now() - start;

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return {
        output: errData.message || "Failed to execute run",
        passed: false,
        status: "Wrong Answer",
        time: `${elapsed} ms`,
      };
    }
    const result = await res.json();
    const passed = result.status === "Accepted";
    const output = result.stderr ? result.stderr : result.stdout;
    return {
      output,
      passed,
      status: result.status as SubmissionStatus,
      time: `${elapsed} ms`,
    };
  },

  async submit(
    problemId: string,
    code: string,
  ): Promise<{ status: SubmissionStatus; runtime: string }> {
    const res = await safeFetch(`${API_BASE}/execute/submit`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ problem_id: problemId, source_code: code }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || "Failed to submit execution");
    }
    const result = await res.json();
    return {
      status: result.status as SubmissionStatus,
      runtime: result.runtime || "N/A",
    };
  },
};

export const AuthService = {
  async login(email: string, password: string, _role: "student" | "admin") {
    const res = await safeFetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || "Invalid credentials");
    }
    const result = await res.json();
    const { token, user } = result.data;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    };
  },
};

export const AdminService = {
  async getStudents() {
    const res = await safeFetch(`${API_BASE}/admin/users`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch students");
    const result = await res.json();
    return result.data;
  },

  async createStudent(payload: any) {
    const res = await safeFetch(`${API_BASE}/admin/users`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to create student");
    }
    const result = await res.json();
    return result.data;
  },

  async deleteStudent(id: string) {
    const res = await safeFetch(`${API_BASE}/admin/users/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to delete student");
    }
    const result = await res.json();
    return result.data;
  },

  async getAssignments(problemId: string) {
    const res = await safeFetch(`${API_BASE}/admin/problems/${problemId}/assign`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch assignments");
    const result = await res.json();
    return result.data;
  },

  async assignProblem(problemId: string, userIds: string[]) {
    const res = await safeFetch(`${API_BASE}/admin/problems/${problemId}/assign`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ user_ids: userIds }),
    });
    if (!res.ok) throw new Error("Failed to assign problem");
    const result = await res.json();
    return result.data;
  },
};

export const MessagesService = {
  async getAdminPeer() {
    const res = await safeFetch(`${API_BASE}/messages/admin-peer`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to get admin peer");
    const result = await res.json();
    return result.data;
  },

  async getThreads() {
    const res = await safeFetch(`${API_BASE}/messages/threads`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch threads");
    const result = await res.json();
    return result.data;
  },

  async getChat(peerId: string) {
    const res = await safeFetch(`${API_BASE}/messages/${peerId}`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch chat");
    const result = await res.json();
    return result.data;
  },

  async send(receiverId: string, content: string) {
    const res = await safeFetch(`${API_BASE}/messages`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ receiver_id: receiverId, content }),
    });
    if (!res.ok) throw new Error("Failed to send message");
    const result = await res.json();
    return result.data;
  },
};
