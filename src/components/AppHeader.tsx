"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { useAuth } from "@/features/auth/AuthProvider";

export function AppHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/products"
          className="font-semibold text-slate-900 hover:underline"
        >
          Product Admin
        </Link>

        <div className="flex items-center gap-3">
          {user && (
            <span className="hidden text-sm text-slate-600 sm:inline">
              {user.firstName} {user.lastName}
            </span>
          )}
          <Button variant="secondary" size="sm" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </div>
    </header>
  );
}
