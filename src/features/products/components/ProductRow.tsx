import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { LinkButton } from "@/components/ui/LinkButton";
import { formatCategory, formatPrice, formatRating } from "@/utils/format";

import type { Product } from "../types";
import { ProductImage } from "./ProductImage";
import { StockBadge } from "./StockBadge";

export function ProductRow({
  product,
  onDelete,
}: {
  product: Product;
  onDelete: (product: Product) => void;
}) {
  return (
    <tr className="hover:bg-slate-50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <ProductImage
            src={product.thumbnail}
            alt=""
            className="h-10 w-10 shrink-0 rounded bg-slate-100"
          />
          <Link
            href={`/products/${product.id}`}
            className="font-medium text-slate-900 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
          >
            {product.title}
          </Link>
        </div>
      </td>
      <td className="px-4 py-3 text-slate-600">
        {formatCategory(product.category)}
      </td>
      <td className="px-4 py-3 text-right tabular-nums text-slate-900">
        {formatPrice(product.price)}
      </td>
      <td className="px-4 py-3 text-right tabular-nums text-slate-600">
        {formatRating(product.rating)}
      </td>
      <td className="px-4 py-3">
        <StockBadge stock={product.stock} />
      </td>
      <td className="px-4 py-3">
        <div className="flex justify-end gap-2">
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
      </td>
    </tr>
  );
}
