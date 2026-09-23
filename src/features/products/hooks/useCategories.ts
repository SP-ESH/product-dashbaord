"use client";

import { useEffect, useState } from "react";

import { toApiError } from "@/lib/api/errors";

import { fetchCategories } from "../api";
import type { Category } from "../types";

/** Loads the category list once. A failure just leaves the filter empty. */
export function useCategories(): { categories: Category[]; isLoading: boolean } {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    fetchCategories(controller.signal)
      .then((data) => {
        setCategories(data);
        setIsLoading(false);
      })
      .catch((caught: unknown) => {
        if (toApiError(caught).canceled) return;
        setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  return { categories, isLoading };
}
