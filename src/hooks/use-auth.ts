import { useEffect, useState } from "react";
import type { User } from "@/types";

const KEY = "cp_auth_user";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(KEY);
    if (raw) setUser(JSON.parse(raw));
  }, []);

  const signIn = (u: User) => {
    localStorage.setItem(KEY, JSON.stringify(u));
    setUser(u);
  };
  const signOut = () => {
    localStorage.removeItem(KEY);
    setUser(null);
  };
  return { user, signIn, signOut };
}
