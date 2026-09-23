"use client";

/* eslint-disable react-hooks/set-state-in-effect -- Keeps the uncontrolled-feeling input in sync when the URL changes from outside (back/forward, clear filters). */

import { useEffect, useState } from "react";

import { Input } from "@/components/ui/Field";
import { useDebounce } from "@/hooks/useDebounce";

const DEBOUNCE_MS = 450;

/**
 * Keeps its own immediate value so typing stays responsive, and reports the
 * debounced value upward so the URL (and therefore the API call) only changes
 * once the user pauses.
 */
export function SearchInput({
  value,
  onDebouncedChange,
}: {
  value: string;
  onDebouncedChange: (value: string) => void;
}) {
  const [inputValue, setInputValue] = useState(value);
  const debouncedValue = useDebounce(inputValue, DEBOUNCE_MS);

  // Keep in sync when the URL changes from elsewhere (back/forward, reset).
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (debouncedValue.trim() !== value) {
      onDebouncedChange(debouncedValue.trim());
    }
    // `value` and `onDebouncedChange` are intentionally left out: this effect
    // should only fire when the debounced input settles, not when the URL
    // catches up afterwards.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  return (
    <div className="w-full sm:max-w-xs">
      <label htmlFor="product-search" className="sr-only">
        Search products
      </label>
      <Input
        id="product-search"
        type="search"
        placeholder="Search products…"
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
      />
    </div>
  );
}
