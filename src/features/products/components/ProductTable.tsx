import type { Product } from "../types";
import { ProductRow } from "./ProductRow";

const COLUMNS = [
  { key: "product", label: "Product", align: "left" },
  { key: "category", label: "Category", align: "left" },
  { key: "price", label: "Price", align: "right" },
  { key: "rating", label: "Rating", align: "right" },
  { key: "stock", label: "Stock", align: "left" },
  { key: "actions", label: "Actions", align: "right" },
] as const;

/** Desktop view. The mobile view uses <ProductCard> instead. */
export function ProductTable({
  products,
  onDelete,
}: {
  products: Product[];
  onDelete: (product: Product) => void;
}) {
  return (
    <div className="overflow-hidden rounded-lg ring-1 ring-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <caption className="sr-only">Products</caption>
        <thead className="bg-slate-50">
          <tr>
            {COLUMNS.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`px-4 py-3 font-medium text-slate-600 ${
                  column.align === "right" ? "text-right" : "text-left"
                }`}
              >
                {column.key === "actions" ? (
                  <span className="sr-only">{column.label}</span>
                ) : (
                  column.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {products.map((product) => (
            <ProductRow key={product.id} product={product} onDelete={onDelete} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
