import { apiClient } from "@/lib/api/client";

import type {
  Category,
  Product,
  ProductListResponse,
  ProductPayload,
} from "./types";
import type { ProductQuery } from "./urlParams";

/**
 * DummyJSON supports `sortBy` + `order` on /products, /products/search and
 * /products/category/{slug}, so all sorting is done server-side.
 */
function listParams(query: ProductQuery) {
  return {
    limit: query.pageSize,
    skip: (query.page - 1) * query.pageSize,
    sortBy: query.sort,
    order: query.order,
  };
}

/**
 * Fetches one page of products.
 *
 * Endpoint selection (see README > Search + category):
 *   search present            -> /products/search?q=   (search wins)
 *   category only             -> /products/category/{slug}
 *   neither                   -> /products
 *
 * `signal` comes from an AbortController so a superseded request can be
 * canceled before its response arrives.
 */
export async function fetchProducts(
  query: ProductQuery,
  signal?: AbortSignal,
): Promise<ProductListResponse> {
  const params = listParams(query);

  if (query.search) {
    const { data } = await apiClient.get<ProductListResponse>(
      "/products/search",
      { params: { ...params, q: query.search }, signal },
    );
    return data;
  }

  if (query.category) {
    const { data } = await apiClient.get<ProductListResponse>(
      `/products/category/${encodeURIComponent(query.category)}`,
      { params, signal },
    );
    return data;
  }

  const { data } = await apiClient.get<ProductListResponse>("/products", {
    params,
    signal,
  });
  return data;
}

export async function fetchCategories(
  signal?: AbortSignal,
): Promise<Category[]> {
  const { data } = await apiClient.get<Category[]>("/products/categories", {
    signal,
  });
  return data;
}

export async function fetchProduct(
  id: number,
  signal?: AbortSignal,
): Promise<Product> {
  const { data } = await apiClient.get<Product>(`/products/${id}`, { signal });
  return data;
}

export async function createProduct(
  payload: ProductPayload,
): Promise<Product> {
  const { data } = await apiClient.post<Product>("/products/add", payload);
  return data;
}

export async function updateProduct(
  id: number,
  payload: ProductPayload,
): Promise<Product> {
  const { data } = await apiClient.put<Product>(`/products/${id}`, payload);
  return data;
}

export async function deleteProduct(id: number): Promise<Product> {
  const { data } = await apiClient.delete<Product>(`/products/${id}`);
  return data;
}
