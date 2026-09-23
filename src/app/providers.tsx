"use client";

import type { ReactNode } from "react";

import { AuthProvider } from "@/features/auth/AuthProvider";
import { MutationsProvider } from "@/features/products/MutationsProvider";

/**
 * The only two pieces of global state in the app:
 *  - AuthProvider: the logged-in user and token.
 *  - MutationsProvider: local results of the simulated DummyJSON mutations.
 * Everything else lives in the URL or in component state.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <MutationsProvider>{children}</MutationsProvider>
    </AuthProvider>
  );
}
