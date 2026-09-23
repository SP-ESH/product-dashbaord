"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { LinkButton } from "@/components/ui/LinkButton";
import { EmptyState, ErrorState } from "@/components/ui/States";

import { useProductList } from "../hooks/useProductList";
import { getPaginationInfo } from "../pagination";
import type { Product } from "../types";
import { parseProductQuery, productsHref } from "../urlParams";
import type { PageSize, ProductQuery, SortField, SortOrder } from "../urlParams";
import { DeleteProductDialog } from "./DeleteProductDialog";
import { Pagination } from "./Pagination";
import { ProductCard } from "./ProductCard";
import { ProductFilters } from "./ProductFilters";
import { ProductListSkeleton } from "./ProductListSkeleton";
import { ProductTable } from "./ProductTable";

export function ProductsView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // The URL is the single source of truth for the list state.
  const query = parseProductQuery(searchParams);
  const { products, total, isLoading, isFetching, error, retry } =
    useProductList(query);
  const { totalPages } = getPaginationInfo(total, query.page, query.pageSize);

  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  /**
   * `push` keeps browser back/forward working for real user actions;
   * `replace` is used for automatic corrections so the bad URL isn't in history.
   */
  const applyQuery = useCallback(
    (next: ProductQuery, mode: "push" | "replace" = "push") => {
      router[mode](productsHref(next), { scroll: false });
    },
    [router],
  );

  // `?page=999` is valid syntax but out of range; pull it back to the last page
  // once we know how many pages there actually are.
  useEffect(() => {
    if (isFetching || error) return;
    if (query.page > totalPages) {
      applyQuery({ ...query, page: totalPages }, "replace");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetching, error, query.page, totalPages]);

  // Changing what is being listed always returns to page 1.
  const handleSearchChange = (search: string) =>
    applyQuery({ ...query, search, page: 1 });

  const handleCategoryChange = (category: string) =>
    applyQuery({ ...query, category, page: 1 });

  const handleSortChange = (sort: SortField | undefined, order: SortOrder) =>
    applyQuery({ ...query, sort, order, page: 1 });

  const handlePageSizeChange = (pageSize: PageSize) =>
    applyQuery({ ...query, pageSize, page: 1 });

  const handlePageChange = (page: number) => applyQuery({ ...query, page });

  const handleReset = () =>
    applyQuery({ ...query, search: "", category: "", sort: undefined, page: 1 });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Products</h1>
          <p className="text-sm text-slate-600">
            Browse, search and manage the catalogue.
          </p>
        </div>
        <LinkButton href="/products/new" variant="primary">
          Add product
        </LinkButton>
      </div>

      <ProductFilters
        query={query}
        onSearchChange={handleSearchChange}
        onCategoryChange={handleCategoryChange}
        onSortChange={handleSortChange}
        onReset={handleReset}
      />

      {isLoading ? (
        <ProductListSkeleton rows={Math.min(query.pageSize, 6)} />
      ) : error ? (
        <ErrorState message={error.message} onRetry={retry} />
      ) : products.length === 0 ? (
        <EmptyState
          title="No products found."
          description="Try a different search term or clear the filters."
        />
      ) : (
        <div
          // Dim the list during background refreshes instead of replacing it
          // with a skeleton, which would flicker on every filter change.
          className={isFetching ? "opacity-60 transition-opacity" : undefined}
        >
          <div className="hidden md:block">
            <ProductTable products={products} onDelete={setProductToDelete} />
          </div>
          <div className="space-y-3 md:hidden">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onDelete={setProductToDelete}
              />
            ))}
          </div>
        </div>
      )}

      {!isLoading && !error && total > 0 && (
        <Pagination
          total={total}
          page={query.page}
          pageSize={query.pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      <DeleteProductDialog
        product={productToDelete}
        onClose={() => setProductToDelete(null)}
      />
    </div>
  );
}
