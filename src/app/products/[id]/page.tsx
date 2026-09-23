"use client";

import { useParams, useRouter } from "next/navigation";

import { FullPageSpinner } from "@/components/ui/FullPageSpinner";
import { LinkButton } from "@/components/ui/LinkButton";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { ProductDetail } from "@/features/products/components/ProductDetail";
import { useProduct } from "@/features/products/hooks/useProduct";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  // `Number("abc")` is NaN, which useProduct treats as "cannot exist".
  const id = Number(params.id);
  const { product, isLoading, notFound, error, retry } = useProduct(id);

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

      <ProductDetail
        product={product}
        onDeleted={() => router.replace("/products")}
      />
    </div>
  );
}
