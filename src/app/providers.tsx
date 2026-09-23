"use client";

import type { ReactNode } from "react";

import { ToastProvider } from "@/components/ui/Toast";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { MutationsProvider } from "@/features/products/MutationsProvider";

/**
 * The only global state in the app:
 *  - AuthProvider: the logged-in user and token.
 *  - MutationsProvider: local results of the simulated DummyJSON mutations.
 *  - ToastProvider: transient "what just happened" messages.
 * Everything else lives in the URL or in component state.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <MutationsProvider>
        <ToastProvider>{children}</ToastProvider>
      </MutationsProvider>
    </AuthProvider>
  );
}
