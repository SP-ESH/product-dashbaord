"use client";

import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Field";
import { cn } from "@/utils/cn";

import { getPageItems, getPaginationInfo } from "../pagination";
import { PAGE_SIZES } from "../urlParams";
import type { PageSize } from "../urlParams";

type PaginationProps = {
  total: number;
  page: number;
  pageSize: PageSize;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: PageSize) => void;
};

export function Pagination({
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const { totalPages, summary, isFirstPage, isLastPage } = getPaginationInfo(
    total,
    page,
    pageSize,
  );
  const pageItems = getPageItems(page, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col gap-4 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-center gap-3">
        <p className="text-sm text-slate-600" aria-live="polite">
          {summary}
        </p>
        <label htmlFor="page-size" className="sr-only">
          Products per page
        </label>
        <Select
          id="page-size"
          className="w-auto py-1"
          value={pageSize}
          onChange={(event) =>
            onPageSizeChange(Number(event.target.value) as PageSize)
          }
        >
          {PAGE_SIZES.map((size) => (
            <option key={size} value={size}>
              {size} per page
            </option>
          ))}
        </Select>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="secondary"
          size="sm"
          disabled={isFirstPage}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>

        {pageItems.map((item, index) =>
          item === null ? (
            <span key={`gap-${index}`} className="px-2 text-slate-400">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              aria-current={item === page ? "page" : undefined}
              onClick={() => onPageChange(item)}
              className={cn(
                "min-w-9 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900",
                item === page
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100",
              )}
            >
              {item}
            </button>
          ),
        )}

        <Button
          variant="secondary"
          size="sm"
          disabled={isLastPage}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </nav>
  );
}
