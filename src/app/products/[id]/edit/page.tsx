"use client";

import { useParams, useRouter } from "next/navigation";

import { FullPageSpinner } from "@/components/ui/FullPageSpinner";
import { LinkButton } from "@/components/ui/LinkButton";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { updateProduct } from "@/features/products/api";
import { ProductForm } from "@/features/products/components/ProductForm";
import { useProduct } from "@/features/products/hooks/useProduct";
import { useMutations } from "@/features/products/MutationsProvider";
import type { Product, ProductPayload } from "@/features/products/types";

/** Maps the loaded product onto the string-based form values. */
function toFormValues(product: Product) {
  return {
    title: product.title,
    description: product.description,
    price: String(product.price),
    category: product.category,
    stock: String(product.stock),
    thumbnail: product.thumbnail ?? "",
  };
}

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { state, recordUpdate } = useMutations();

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

  async function handleSubmit(payload: ProductPayload) {
    // `product` is guaranteed here: the guards above return early without it.
    const current = product as Product;

    // A product created in this session does not exist on the server, so
    // sending a PUT for it would 404. We update the local copy instead.
    const isLocalOnly = state.created.some((item) => item.id === current.id);
    const updated = isLocalOnly
      ? { ...current, ...payload }
      : { ...current, ...(await updateProduct(current.id, payload)) };

    recordUpdate(updated);
    router.replace(`/products/${updated.id}?updated=1`);
  }

  return (
    <div className="space-y-6">
      <div>
        <LinkButton
          href={`/products/${product.id}`}
          variant="secondary"
          size="sm"
        >
          ← Back to product
        </LinkButton>
        <h1 className="mt-4 text-xl font-semibold text-slate-900">
          Edit product
        </h1>
        <p className="text-sm text-slate-600">
          DummyJSON simulates this request, so the change is kept for the
          current browser session only.
        </p>
      </div>

      <ProductForm
        initialValues={toFormValues(product)}
        submitLabel="Save changes"
        onSubmit={handleSubmit}
        cancelHref={`/products/${product.id}`}
      />
    </div>
  );
}
