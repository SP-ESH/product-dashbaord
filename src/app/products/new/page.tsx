"use client";

import { useRouter } from "next/navigation";

import { LinkButton } from "@/components/ui/LinkButton";
import { useToast } from "@/components/ui/Toast";
import { createProduct } from "@/features/products/api";
import { ProductForm } from "@/features/products/components/ProductForm";
import { useMutations } from "@/features/products/MutationsProvider";
import { withUniqueLocalId } from "@/features/products/mutations";
import type { ProductPayload } from "@/features/products/types";
import { EMPTY_PRODUCT_FORM } from "@/features/products/validation";

export default function NewProductPage() {
  const router = useRouter();
  const { state, recordCreate } = useMutations();
  const { showToast } = useToast();

  async function handleSubmit(payload: ProductPayload) {
    const created = await createProduct(payload);

    // DummyJSON echoes the product back but never stores it, so we keep the
    // result locally to show it for the rest of the session. The response only
    // contains the fields we sent plus an id, so the rest are filled in here
    // rather than read off the response (`rating`, for example, is missing).
    const product = withUniqueLocalId(
      {
        ...payload,
        id: created.id,
        rating: 0,
        images: payload.thumbnail ? [payload.thumbnail] : [],
        reviews: [],
      },
      state,
    );
    recordCreate(product);

    showToast(
      `"${product.title}" was created. DummyJSON does not persist it, so it is kept for this session only.`,
    );
    router.replace(`/products/${product.id}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <LinkButton href="/products" variant="secondary" size="sm">
          ← Back to products
        </LinkButton>
        <h1 className="mt-4 text-xl font-semibold text-slate-900">
          Add product
        </h1>
        <p className="text-sm text-slate-600">
          DummyJSON simulates this request, so the product is kept for the
          current browser session only.
        </p>
      </div>

      <ProductForm
        initialValues={EMPTY_PRODUCT_FORM}
        submitLabel="Create product"
        onSubmit={handleSubmit}
        cancelHref="/products"
      />
    </div>
  );
}
