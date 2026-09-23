const LOW_STOCK_THRESHOLD = 10;

export function StockBadge({ stock }: { stock: number }) {
  const tone =
    stock === 0
      ? "bg-red-50 text-red-700 ring-red-200"
      : stock <= LOW_STOCK_THRESHOLD
        ? "bg-amber-50 text-amber-700 ring-amber-200"
        : "bg-emerald-50 text-emerald-700 ring-emerald-200";

  const label = stock === 0 ? "Out of stock" : `${stock} in stock`;

  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${tone}`}
    >
      {label}
    </span>
  );
}
