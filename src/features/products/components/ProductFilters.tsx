"use client";

import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Field";

import { useCategories } from "../hooks/useCategories";
import { SORT_FIELDS } from "../urlParams";
import type { ProductQuery, SortField, SortOrder } from "../urlParams";
import { SearchInput } from "./SearchInput";

type ProductFiltersProps = {
  query: ProductQuery;
  onSearchChange: (search: string) => void;
  onCategoryChange: (category: string) => void;
  onSortChange: (sort: SortField | undefined, order: SortOrder) => void;
  onReset: () => void;
};

const SORT_LABELS: Record<SortField, string> = {
  title: "Title",
  price: "Price",
  rating: "Rating",
};

/** Encodes sort + order as one value so a single <select> can drive both. */
function encodeSort(sort: SortField | undefined, order: SortOrder): string {
  return sort ? `${sort}:${order}` : "";
}

function decodeSort(value: string): [SortField | undefined, SortOrder] {
  const [sort, order] = value.split(":");
  if (!SORT_FIELDS.includes(sort as SortField)) return [undefined, "asc"];
  return [sort as SortField, order === "desc" ? "desc" : "asc"];
}

export function ProductFilters({
  query,
  onSearchChange,
  onCategoryChange,
  onSortChange,
  onReset,
}: ProductFiltersProps) {
  const { categories } = useCategories();
  const hasActiveFilters = Boolean(query.search || query.category || query.sort);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <SearchInput value={query.search} onDebouncedChange={onSearchChange} />

        <div className="flex flex-col gap-3 sm:flex-row">
          <div>
            <label
              htmlFor="category-filter"
              className="mb-1 block text-xs font-medium text-slate-600"
            >
              Category
            </label>
            <Select
              id="category-filter"
              value={query.category}
              onChange={(event) => onCategoryChange(event.target.value)}
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label
              htmlFor="sort-filter"
              className="mb-1 block text-xs font-medium text-slate-600"
            >
              Sort by
            </label>
            <Select
              id="sort-filter"
              value={encodeSort(query.sort, query.order)}
              onChange={(event) => onSortChange(...decodeSort(event.target.value))}
            >
              <option value="">Default order</option>
              {SORT_FIELDS.map((field) => (
                <optgroup key={field} label={SORT_LABELS[field]}>
                  <option value={`${field}:asc`}>
                    {SORT_LABELS[field]} (ascending)
                  </option>
                  <option value={`${field}:desc`}>
                    {SORT_LABELS[field]} (descending)
                  </option>
                </optgroup>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
          {query.search && query.category && (
            <p className="rounded-md bg-amber-50 px-2 py-1 text-xs text-amber-800 ring-1 ring-inset ring-amber-200">
              DummyJSON cannot search inside a category, so the search term is
              being applied across all categories.
            </p>
          )}
          <Button variant="ghost" size="sm" onClick={onReset}>
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
