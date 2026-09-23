import { describe, expect, it } from "vitest";

import { clampPage, getPageItems, getPaginationInfo } from "./pagination";

describe("getPaginationInfo", () => {
  it("describes the middle page of the DummyJSON catalogue", () => {
    const info = getPaginationInfo(194, 2, 20);
    expect(info).toMatchObject({
      totalPages: 10,
      firstItem: 21,
      lastItem: 40,
      summary: "Showing 21–40 of 194",
      isFirstPage: false,
      isLastPage: false,
    });
  });

  it("stops the last page at the total", () => {
    const info = getPaginationInfo(194, 10, 20);
    expect(info.lastItem).toBe(194);
    expect(info.isLastPage).toBe(true);
  });

  it("treats a single page as both first and last", () => {
    const info = getPaginationInfo(4, 1, 10);
    expect(info).toMatchObject({
      totalPages: 1,
      summary: "Showing 1–4 of 4",
      isFirstPage: true,
      isLastPage: true,
    });
  });

  it("handles an empty result set without dividing by zero", () => {
    const info = getPaginationInfo(0, 1, 10);
    expect(info).toMatchObject({
      totalPages: 1,
      firstItem: 0,
      lastItem: 0,
      summary: "No results",
    });
  });
});

describe("clampPage", () => {
  it("pulls a page beyond the end back to the last page", () => {
    expect(clampPage(999, 10)).toBe(10);
  });

  it.each([0, -1, 1.5, Number.NaN])("normalizes %s to 1", (page) => {
    expect(clampPage(page, 10)).toBe(1);
  });

  it("never returns 0 when there are no pages", () => {
    expect(clampPage(1, 0)).toBe(1);
  });
});

describe("getPageItems", () => {
  it("lists every page when they all fit", () => {
    expect(getPageItems(1, 4)).toEqual([1, 2, 3, 4]);
  });

  it("collapses the gaps around the current page", () => {
    expect(getPageItems(5, 10)).toEqual([1, null, 4, 5, 6, null, 10]);
  });

  it("only gaps on the right when near the start", () => {
    expect(getPageItems(2, 10)).toEqual([1, 2, 3, null, 10]);
  });

  it("returns a single page for an empty result set", () => {
    expect(getPageItems(1, 1)).toEqual([1]);
  });
});
