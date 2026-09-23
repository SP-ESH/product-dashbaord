"use client";

/* eslint-disable react-hooks/set-state-in-effect -- Data fetching without React Query/SWR means the response has to land in state from inside an effect. That is the intended pattern here; the AbortController keeps it safe. */

import { useCallback, useEffect, useState } from "react";

import { toApiError } from "@/lib/api/errors";
import type { ApiError } from "@/lib/api/errors";

import { fetchProducts } from "../api";
import { useMutations } from "../MutationsProvider";
import { mergePage } from "../mutations";
import type { Product } from "../types";
import type { ProductQuery } from "../urlParams";

type ProductListResult = {
  products: Product[];
  total: number;
  /** True only for the very first load, so we don't flash a skeleton on every keystroke. */
  isLoading: boolean;
  /** True whenever a request is in flight, including background refreshes. */
  isFetching: boolean;
  error: ApiError | null;
  retry: () => void;
};

type PageData = { products: Product[]; total: number };

export function useProductList(query: ProductQuery): ProductListResult {
  const [page, setPage] = useState<PageData | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const { state: mutationState } = useMutations();

  const { search, category, sort, order, pageSize } = query;
  const pageNumber = query.page;

  useEffect(() => {
    // One controller per request. The cleanup below aborts it as soon as the
    // query changes, so a slow response for an older query can never resolve
    // and overwrite a newer one (see README > Race conditions).
    const controller = new AbortController();

    setIsFetching(true);
    setError(null);

    fetchProducts(
      { page: pageNumber, pageSize, search, category, sort, order },
      controller.signal,
    )
      .then((response) => {
        setPage({ products: response.products, total: response.total });
        setIsFetching(false);
      })
      .catch((caught: unknown) => {
        const apiError = toApiError(caught);
        // A canceled request is an expected outcome, never a user-facing error.
        if (apiError.canceled) return;
        setError(apiError);
        setIsFetching(false);
      });

    return () => controller.abort();
  }, [pageNumber, pageSize, search, category, sort, order, retryCount]);

  const retry = useCallback(() => setRetryCount((count) => count + 1), []);

  const merged = page
    ? mergePage(page, mutationState, query)
    : { products: [], total: 0 };

  return {
    products: merged.products,
    total: merged.total,
    isLoading: page === null && isFetching,
    isFetching,
    error,
    retry,
  };
}
