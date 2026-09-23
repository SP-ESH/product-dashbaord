import { AppHeader } from "@/components/AppHeader";
import { RequireAuth } from "@/features/auth/RequireAuth";

/** Every route under /products is protected and shares the same shell. */
export default function ProductsLayout({ children }: LayoutProps<"/products">) {
  return (
    <RequireAuth>
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </RequireAuth>
  );
}
