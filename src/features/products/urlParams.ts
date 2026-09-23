/**
 * Single place where the /products URL is parsed and rebuilt.
 *
 * Everything the list page needs lives in the query string, so a refresh or a
 * shared link restores the exact same view. Anything unparseable falls back to
 * a safe default instead of throwing.
 */

export const PAGE_SIZES = [10, 20, 50] as const;
export type PageSize = (typeof PAGE_SIZES)[number];

export const SORT_FIELDS = ["title", "price", "rating"] as const;
export type SortField = (typeof SORT_FIELDS)[number];

export type SortOrder = "asc" | "desc";

export const DEFAULT_PAGE_SIZE: PageSize = 10;
export const DEFAULT_ORDER: SortOrder = "asc";

export type ProductQuery = {
  page: number;
  pageSize: PageSize;
  search: string;
  category: string;
  /** Undefined means "let the API use its natural order". */
  sort?: SortField;
  order: SortOrder;
};

/** `?page=abc`, `?page=-3` and `?page=1.5` all normalize to page 1. */
function parsePage(raw: string | null): number {
  const page = Number(raw);
  if (!Number.isInteger(page) || page < 1) return 1;
  return page;
}

function parsePageSize(raw: string | null): PageSize {
  const size = Number(raw);
  return PAGE_SIZES.includes(size as PageSize)
    ? (size as PageSize)
    : DEFAULT_PAGE_SIZE;
}

function parseSort(raw: string | null): SortField | undefined {
  return SORT_FIELDS.includes(raw as SortField)
    ? (raw as SortField)
    : undefined;
}

function parseOrder(raw: string | null): SortOrder {
  return raw === "desc" ? "desc" : DEFAULT_ORDER;
}

export function parseProductQuery(
  params: URLSearchParams | ReadonlyURLSearchParams,
): ProductQuery {
  return {
    page: parsePage(params.get("page")),
    pageSize: parsePageSize(params.get("pageSize")),
    search: (params.get("search") ?? "").trim(),
    category: (params.get("category") ?? "").trim(),
    sort: parseSort(params.get("sort")),
    order: parseOrder(params.get("order")),
  };
}

/**
 * Rebuilds the query string, leaving out values that equal the default so the
 * URL stays readable (`/products` rather than `/products?page=1&pageSize=10`).
 */
export function buildProductQueryString(query: ProductQuery): string {
  const params = new URLSearchParams();

  if (query.search) params.set("search", query.search);
  if (query.category) params.set("category", query.category);
  if (query.sort) {
    params.set("sort", query.sort);
    params.set("order", query.order);
  }
  if (query.page > 1) params.set("page", String(query.page));
  if (query.pageSize !== DEFAULT_PAGE_SIZE) {
    params.set("pageSize", String(query.pageSize));
  }

  return params.toString();
}

export function productsHref(query: ProductQuery): string {
  const queryString = buildProductQueryString(query);
  return queryString ? `/products?${queryString}` : "/products";
}

/**
 * Minimal structural type for Next's `useSearchParams()` return value, so this
 * module stays framework-free and unit-testable with a plain URLSearchParams.
 */
type ReadonlyURLSearchParams = { get(name: string): string | null };
