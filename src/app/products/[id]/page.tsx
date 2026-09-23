"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { LinkButton } from "@/components/ui/LinkButton";
import { FullPageSpinner } from "@/components/ui/FullPageSpinner";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { ProductDetail } from "@/features/products/components/ProductDetail";
import { useProduct } from "@/features/products/hooks/useProduct";

function ProductDetailView() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  // `Number("abc")` is NaN, which useProduct treats as "cannot exist".
  const id = Number(params.id);
  const { product, isLoading, notFound, error, retry } = useProduct(id);

  const flash =
    searchParams.get("created") === "1"
      ? "Product created. DummyJSON does not persist it, so it is kept for this session only."
      : searchParams.get("updated") === "1"
        ? "Product updated. DummyJSON does not persist it, so the change is kept for this session only."
        : null;

  if (isLoading) return <FullPageSpinner label="Loading product…" />;

  // Checked before the not-found branch: a failed request is not the same as
  // a product that does not exist.
  if (error) return <ErrorState message={error.message} onRetry={retry} />;

  if (notFound || !product) {
    return (
      <EmptyState
        title="Product not found"
        description={`No product exists with the id "${params.id}".`}
        action={<LinkButton href="/products">Back to products</LinkButton>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <LinkButton href="/products" variant="secondary" size="sm">
        ← Back to products
      </LinkButton>

      {flash && (
        <p
          role="status"
          className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800 ring-1 ring-inset ring-emerald-200"
        >
          {flash}
        </p>
      )}

      <ProductDetail
        product={product}
        onDeleted={() => router.replace("/products")}
      />
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <Suspense fallback={<FullPageSpinner label="Loading product…" />}>
      <ProductDetailView />
    </Suspense>
  );
}
