"use client";

/* eslint-disable react-hooks/set-state-in-effect -- Same as useProductList: a manual fetch has to write its result to state from an effect. */

import { useCallback, useEffect, useState } from "react";

import { toApiError } from "@/lib/api/errors";
import type { ApiError } from "@/lib/api/errors";

import { fetchProduct } from "../api";
import { useMutations } from "../MutationsProvider";
import { applyMutationsToProduct, isDeleted } from "../mutations";
import type { Product } from "../types";

type ProductResult = {
  product: Product | null;
  isLoading: boolean;
  /** Separate from `error` so the page can render a proper not-found screen. */
  notFound: boolean;
  error: ApiError | null;
  retry: () => void;
};

export function useProduct(id: number): ProductResult {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const { state: mutationState } = useMutations();
  const locallyCreated = mutationState.created.find((item) => item.id === id);
  const locallyDeleted = isDeleted(id, mutationState);

  useEffect(() => {
    // An id that is not a positive integer can never exist on the server.
    if (!Number.isInteger(id) || id < 1) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }

    // Products created in this session only exist locally, so skip the request.
    if (locallyCreated || locallyDeleted) {
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setError(null);
    setNotFound(false);

    fetchProduct(id, controller.signal)
      .then((data) => {
        setProduct(data);
        setIsLoading(false);
      })
      .catch((caught: unknown) => {
        const apiError = toApiError(caught);
        if (apiError.canceled) return;
        if (apiError.status === 404) setNotFound(true);
        else setError(apiError);
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [id, retryCount, locallyCreated, locallyDeleted]);

  const retry = useCallback(() => setRetryCount((count) => count + 1), []);

  if (locallyDeleted) {
    return { product: null, isLoading: false, notFound: true, error: null, retry };
  }

  if (locallyCreated) {
    return {
      product: locallyCreated,
      isLoading: false,
      notFound: false,
      error: null,
      retry,
    };
  }

  return {
    product: product ? applyMutationsToProduct(product, mutationState) : null,
    isLoading,
    notFound,
    error,
    retry,
  };
}
