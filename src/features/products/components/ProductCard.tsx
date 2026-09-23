import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { LinkButton } from "@/components/ui/LinkButton";
import { formatCategory, formatPrice, formatRating } from "@/utils/format";

import type { Product } from "../types";
import { ProductImage } from "./ProductImage";
import { StockBadge } from "./StockBadge";

/** Mobile/tablet view of a single product. */
export function ProductCard({
  product,
  onDelete,
}: {
  product: Product;
  onDelete: (product: Product) => void;
}) {
  return (
    <article className="rounded-lg bg-white p-4 ring-1 ring-slate-200">
      <div className="flex gap-4">
        <ProductImage
          src={product.thumbnail}
          alt=""
          className="h-16 w-16 shrink-0 rounded bg-slate-100"
        />
        <div className="min-w-0 flex-1">
          <Link
            href={`/products/${product.id}`}
            className="block truncate font-medium text-slate-900 hover:underline"
          >
            {product.title}
          </Link>
          <p className="text-sm text-slate-500">
            {formatCategory(product.category)}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span className="font-medium text-slate-900">
              {formatPrice(product.price)}
            </span>
            <span className="text-slate-500">
              ★ {formatRating(product.rating)}
            </span>
            <StockBadge stock={product.stock} />
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <LinkButton
          href={`/products/${product.id}/edit`}
          variant="secondary"
          size="sm"
        >
          Edit
        </LinkButton>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-600 hover:bg-red-50"
          onClick={() => onDelete(product)}
        >
          Delete
        </Button>
      </div>
    </article>
  );
}
