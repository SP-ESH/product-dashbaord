import { Suspense } from "react";

import { FullPageSpinner } from "@/components/ui/FullPageSpinner";
import { ProductsView } from "@/features/products/components/ProductsView";

/**
 * ProductsView reads the query string with `useSearchParams`, which Next
 * requires to sit inside a Suspense boundary.
 */
export default function ProductsPage() {
  return (
    <Suspense fallback={<FullPageSpinner label="Loading products…" />}>
      <ProductsView />
    </Suspense>
  );
}
