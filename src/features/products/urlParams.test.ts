import { describe, expect, it } from "vitest";

import {
  buildProductQueryString,
  parseProductQuery,
  productsHref,
} from "./urlParams";
import type { ProductQuery } from "./urlParams";

const parse = (queryString: string) =>
  parseProductQuery(new URLSearchParams(queryString));

describe("parseProductQuery", () => {
  it("falls back to defaults for an empty query string", () => {
    expect(parse("")).toEqual({
      page: 1,
      pageSize: 10,
      search: "",
      category: "",
      sort: undefined,
      order: "asc",
    });
  });

  it("reads valid values", () => {
    expect(parse("search=phone&category=smartphones&sort=price&order=desc&page=3&pageSize=50"))
      .toEqual({
        page: 3,
        pageSize: 50,
        search: "phone",
        category: "smartphones",
        sort: "price",
        order: "desc",
      });
  });

  it.each(["page=abc", "page=-2", "page=0", "page=1.5", "page="])(
    "normalizes an invalid page (%s) to 1",
    (queryString) => {
      expect(parse(queryString).page).toBe(1);
    },
  );

  it("keeps an out-of-range page, which the UI clamps once the total is known", () => {
    expect(parse("page=999").page).toBe(999);
  });

  it.each(["pageSize=7", "pageSize=abc", "pageSize=-10"])(
    "normalizes an unsupported page size (%s) to 10",
    (queryString) => {
      expect(parse(queryString).pageSize).toBe(10);
    },
  );

  it("ignores an unknown sort field", () => {
    expect(parse("sort=colour").sort).toBeUndefined();
  });

  it("treats any order other than desc as asc", () => {
    expect(parse("sort=price&order=sideways").order).toBe("asc");
  });

  it("trims whitespace around search and category", () => {
    expect(parse("search=%20phone%20&category=%20phones%20")).toMatchObject({
      search: "phone",
      category: "phones",
    });
  });
});

describe("buildProductQueryString", () => {
  const base: ProductQuery = {
    page: 1,
    pageSize: 10,
    search: "",
    category: "",
    sort: undefined,
    order: "asc",
  };

  it("omits every default value", () => {
    expect(buildProductQueryString(base)).toBe("");
    expect(productsHref(base)).toBe("/products");
  });

  it("includes only the non-default values", () => {
    expect(buildProductQueryString({ ...base, search: "phone", page: 2 })).toBe(
      "search=phone&page=2",
    );
  });

  it("writes order alongside sort", () => {
    expect(
      buildProductQueryString({ ...base, sort: "rating", order: "desc" }),
    ).toBe("sort=rating&order=desc");
  });

  it("round-trips back to the same query", () => {
    const query: ProductQuery = {
      ...base,
      search: "laptop",
      category: "laptops",
      sort: "price",
      order: "desc",
      page: 4,
      pageSize: 20,
    };

    expect(parse(buildProductQueryString(query))).toEqual(query);
  });
});
