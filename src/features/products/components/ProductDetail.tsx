"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { LinkButton } from "@/components/ui/LinkButton";
import { formatCategory, formatDate, formatPrice, formatRating } from "@/utils/format";

import type { Product } from "../types";
import { DeleteProductDialog } from "./DeleteProductDialog";
import { ProductImage } from "./ProductImage";
import { StockBadge } from "./StockBadge";

function ProductGallery({ product }: { product: Product }) {
  // A locally created product may have no images at all; ProductImage then
  // falls back to the placeholder.
  const usableImages = (product.images ?? []).filter(Boolean);
  const images = usableImages.length ? usableImages : [product.thumbnail];
  const [activeImage, setActiveImage] = useState(images[0]);

  return (
    <div>
      <div className="rounded-lg bg-white p-4 ring-1 ring-slate-200">
        <ProductImage
          src={activeImage}
          alt={product.title}
          className="mx-auto h-64 w-full"
        />
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {images.map((image) => (
            <button
              key={image}
              type="button"
              onClick={() => setActiveImage(image)}
              aria-label={`Show image ${images.indexOf(image) + 1}`}
              aria-current={image === activeImage}
              className={`rounded-md bg-white p-1 ring-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 ${
                image === activeImage ? "ring-slate-900" : "ring-slate-200"
              }`}
            >
              <ProductImage src={image} alt="" className="h-14 w-14" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Reviews({ reviews }: { reviews: Product["reviews"] }) {
  if (!reviews?.length) {
    return (
      <p className="text-sm text-slate-500">
        This product has no reviews yet.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {reviews.map((review, index) => (
        <li
          key={`${review.reviewerEmail}-${index}`}
          className="rounded-lg bg-white p-4 ring-1 ring-slate-200"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-slate-900">
              {review.reviewerName}
            </p>
            <p className="text-sm text-slate-500">
              ★ {review.rating} · {formatDate(review.date)}
            </p>
          </div>
          <p className="mt-1 text-sm text-slate-600">{review.comment}</p>
        </li>
      ))}
    </ul>
  );
}

export function ProductDetail({
  product,
  onDeleted,
}: {
  product: Product;
  onDeleted: () => void;
}) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <ProductGallery product={product} />

        <div className="space-y-4">
          <div>
            <p className="text-sm text-slate-500">
              {formatCategory(product.category)}
              {product.brand ? ` · ${product.brand}` : ""}
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900">
              {product.title}
            </h1>
          </div>

          <p className="text-3xl font-semibold text-slate-900">
            {formatPrice(product.price)}
          </p>

          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <span>★ {formatRating(product.rating)}</span>
            <StockBadge stock={product.stock} />
            {product.sku && <span className="text-slate-400">SKU {product.sku}</span>}
          </div>

          <p className="text-sm leading-6 text-slate-700">
            {product.description}
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <LinkButton
              href={`/products/${product.id}/edit`}
              variant="primary"
            >
              Edit product
            </LinkButton>
            <Button variant="danger" onClick={() => setIsDeleteOpen(true)}>
              Delete product
            </Button>
          </div>
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Reviews</h2>
        <Reviews reviews={product.reviews} />
      </section>

      <DeleteProductDialog
        product={isDeleteOpen ? product : null}
        onClose={() => setIsDeleteOpen(false)}
        onDeleted={onDeleted}
      />
    </div>
  );
}
