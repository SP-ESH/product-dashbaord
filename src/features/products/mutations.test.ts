import { describe, expect, it } from "vitest";

import { EMPTY_MUTATION_STATE, matchesQuery, mergePage, withUniqueLocalId } from "./mutations";
import type { MutationState } from "./mutations";
import type { Product } from "./types";
import type { ProductQuery } from "./urlParams";

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 1,
    title: "Essence Mascara",
    description: "A mascara.",
    category: "beauty",
    price: 9.99,
    rating: 4.5,
    stock: 5,
    images: [],
    thumbnail: "",
    ...overrides,
  };
}

const baseQuery: ProductQuery = {
  page: 1,
  pageSize: 10,
  search: "",
  category: "",
  sort: undefined,
  order: "asc",
};

describe("matchesQuery", () => {
  const product = makeProduct({ title: "iPhone 13", category: "smartphones" });

  it("matches everything when no filter is set", () => {
    expect(matchesQuery(product, baseQuery)).toBe(true);
  });

  it("matches a case-insensitive search on the title", () => {
    expect(matchesQuery(product, { ...baseQuery, search: "iphone" })).toBe(true);
    expect(matchesQuery(product, { ...baseQuery, search: "laptop" })).toBe(false);
  });

  it("matches the selected category", () => {
    expect(matchesQuery(product, { ...baseQuery, category: "smartphones" })).toBe(true);
    expect(matchesQuery(product, { ...baseQuery, category: "beauty" })).toBe(false);
  });

  it("lets search win over category, matching the API behaviour", () => {
    const query = { ...baseQuery, search: "iphone", category: "beauty" };
    expect(matchesQuery(product, query)).toBe(true);
  });
});

describe("mergePage", () => {
  const serverPage = {
    products: [makeProduct({ id: 1 }), makeProduct({ id: 2, title: "Lipstick" })],
    total: 194,
  };

  it("returns the server page untouched when nothing was mutated", () => {
    const merged = mergePage(serverPage, EMPTY_MUTATION_STATE, baseQuery);
    expect(merged.products).toHaveLength(2);
    expect(merged.total).toBe(194);
  });

  it("drops deleted products and lowers the total", () => {
    const state: MutationState = {
      ...EMPTY_MUTATION_STATE,
      deleted: [makeProduct({ id: 1 })],
    };

    const merged = mergePage(serverPage, state, baseQuery);
    expect(merged.products.map((p) => p.id)).toEqual([2]);
    expect(merged.total).toBe(193);
  });

  it("shows edited values instead of the server's", () => {
    const state: MutationState = {
      ...EMPTY_MUTATION_STATE,
      updated: { 1: makeProduct({ id: 1, title: "Renamed" }) },
    };

    const merged = mergePage(serverPage, state, baseQuery);
    expect(merged.products[0].title).toBe("Renamed");
    expect(merged.total).toBe(194);
  });

  it("pins locally created products to the top of page 1", () => {
    const state: MutationState = {
      ...EMPTY_MUTATION_STATE,
      created: [makeProduct({ id: 195, title: "Brand New" })],
    };

    const merged = mergePage(serverPage, state, baseQuery);
    expect(merged.products[0].title).toBe("Brand New");
    expect(merged.total).toBe(195);
  });

  it("does not repeat created products on later pages", () => {
    const state: MutationState = {
      ...EMPTY_MUTATION_STATE,
      created: [makeProduct({ id: 195, title: "Brand New" })],
    };

    const merged = mergePage(serverPage, state, { ...baseQuery, page: 2 });
    expect(merged.products.map((p) => p.title)).not.toContain("Brand New");
  });

  it("keeps the server total intact when a locally created product is removed", () => {
    // Deleting a local-only product removes it from `created` and must not be
    // added to `deleted`, or the total would drop below the server's.
    const merged = mergePage(serverPage, EMPTY_MUTATION_STATE, baseQuery);
    expect(merged.total).toBe(194);
  });

  it("hides a created product that does not match the active filter", () => {
    const state: MutationState = {
      ...EMPTY_MUTATION_STATE,
      created: [makeProduct({ id: 195, title: "Brand New", category: "beauty" })],
    };

    const merged = mergePage(serverPage, state, {
      ...baseQuery,
      category: "laptops",
    });
    expect(merged.products.map((p) => p.id)).toEqual([1, 2]);
  });
});

describe("withUniqueLocalId", () => {
  it("keeps the server id when it is not already taken", () => {
    expect(withUniqueLocalId(makeProduct({ id: 195 }), EMPTY_MUTATION_STATE).id).toBe(195);
  });

  it("picks the next free id when DummyJSON repeats one", () => {
    const state: MutationState = {
      ...EMPTY_MUTATION_STATE,
      created: [makeProduct({ id: 195 }), makeProduct({ id: 196 })],
    };
    expect(withUniqueLocalId(makeProduct({ id: 195 }), state).id).toBe(197);
  });
});
