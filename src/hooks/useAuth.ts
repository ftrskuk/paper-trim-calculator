"use client";

import { useState } from "react";

export function useAuthMock() {
  const [user, setUser] = useState<{ email: string } | null>({
    email: "planner@example.com",
  });

  const signInWithGoogle = async () => {
    setUser({ email: "planner@example.com" });
  };

  const signOut = async () => {
    setUser(null);
  };

  return {
    user,
    signInWithGoogle,
    signOut,
  };
}

