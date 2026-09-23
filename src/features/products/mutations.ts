import type { Product } from "./types";
import type { ProductQuery } from "./urlParams";

/**
 * DummyJSON simulates POST/PUT/DELETE: it echoes a success response but never
 * stores anything, so the next GET returns the untouched original data. This
 * module is the small overlay we apply on top of every fetched page so the
 * user still sees their own changes for the current browser session.
 */
export type MutationState = {
  created: Product[];
  /** id -> updated product, merged over whatever the server returns. */
  updated: Record<number, Product>;
  /** Kept as full products so we can tell whether a deletion affects the current filter. */
  deleted: Product[];
};

export const EMPTY_MUTATION_STATE: MutationState = {
  created: [],
  updated: {},
  deleted: [],
};

/** Does a locally-held product belong in the currently filtered list? */
export function matchesQuery(product: Product, query: ProductQuery): boolean {
  if (query.search) {
    const needle = query.search.toLowerCase();
    const haystack = `${product.title} ${product.description} ${product.category}`;
    if (!haystack.toLowerCase().includes(needle)) return false;
  }

  // Search takes precedence over category, matching the API behaviour.
  if (!query.search && query.category && product.category !== query.category) {
    return false;
  }

  return true;
}

export function applyMutationsToProduct(
  product: Product,
  state: MutationState,
): Product {
  return state.updated[product.id] ?? product;
}

export function isDeleted(id: number, state: MutationState): boolean {
  return state.deleted.some((product) => product.id === id);
}

/**
 * DummyJSON returns the same id (194 + 1) for every POST /products/add, so two
 * products created in one session would collide. When that happens we keep the
 * server's product but give it the next free local id.
 */
export function withUniqueLocalId(
  product: Product,
  state: MutationState,
): Product {
  const takenIds = new Set(state.created.map((item) => item.id));
  if (!takenIds.has(product.id)) return product;

  let id = product.id;
  while (takenIds.has(id)) id += 1;
  return { ...product, id };
}

export type MergedPage = {
  products: Product[];
  total: number;
};

/**
 * Merges one fetched page with the local overlay:
 *  - deleted products are dropped
 *  - edited products show their new values
 *  - locally created products are pinned to the top of page 1
 *
 * Locally created products are not sorted or paginated by the server, which is
 * why they stay pinned rather than appearing at their "correct" position.
 */
export function mergePage(
  page: { products: Product[]; total: number },
  state: MutationState,
  query: ProductQuery,
): MergedPage {
  const visible = page.products
    .filter((product) => !isDeleted(product.id, state))
    .map((product) => applyMutationsToProduct(product, state));

  const createdMatching = state.created.filter((product) =>
    matchesQuery(product, query),
  );
  const deletedMatching = state.deleted.filter((product) =>
    matchesQuery(product, query),
  );

  const isFirstPage = query.page === 1;
  const products = isFirstPage ? [...createdMatching, ...visible] : visible;

  return {
    products,
    total: Math.max(
      0,
      page.total + createdMatching.length - deletedMatching.length,
    ),
  };
}
