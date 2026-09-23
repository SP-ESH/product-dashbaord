"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ReactNode } from "react";

import { FullPageSpinner } from "@/components/ui/FullPageSpinner";

import { useAuth } from "./AuthProvider";

/**
 * Client-side route guard: wraps every protected page. While the token is being
 * read from localStorage we show a spinner, and once we know the user is not
 * authenticated we replace the history entry with /login.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status !== "authenticated") {
    return <FullPageSpinner label="Checking your session…" />;
  }

  return <>{children}</>;
}
