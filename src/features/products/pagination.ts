/** Pure pagination maths, derived from the API's `total` plus our page/limit. */

export type PaginationInfo = {
  totalPages: number;
  /** 1-based index of the first item on the page; 0 when there are none. */
  firstItem: number;
  lastItem: number;
  /** e.g. "Showing 21–40 of 194" */
  summary: string;
  isFirstPage: boolean;
  isLastPage: boolean;
};

export function getPaginationInfo(
  total: number,
  page: number,
  pageSize: number,
): PaginationInfo {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const firstItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, total);

  return {
    totalPages,
    firstItem,
    lastItem,
    summary:
      total === 0
        ? "No results"
        : `Showing ${firstItem}–${lastItem} of ${total}`,
    isFirstPage: page <= 1,
    isLastPage: page >= totalPages,
  };
}

/** Keeps a page number inside the range the current result set actually has. */
export function clampPage(page: number, totalPages: number): number {
  if (!Number.isInteger(page) || page < 1) return 1;
  return Math.min(page, Math.max(1, totalPages));
}

/**
 * Page buttons to render, with `null` marking an ellipsis gap.
 * Always shows the first and last page plus a window around the current one.
 */
export function getPageItems(
  currentPage: number,
  totalPages: number,
  windowSize = 1,
): Array<number | null> {
  if (totalPages <= 1) return [1];

  // With few enough pages every number fits, so no ellipsis is needed.
  const maxWithoutGaps = 5 + windowSize * 2;
  if (totalPages <= maxWithoutGaps) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages]);
  for (let page = currentPage - windowSize; page <= currentPage + windowSize; page += 1) {
    if (page >= 1 && page <= totalPages) pages.add(page);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const items: Array<number | null> = [];

  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) items.push(null);
    items.push(page);
  });

  return items;
}
