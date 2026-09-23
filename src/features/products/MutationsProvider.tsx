"use client";

/* eslint-disable react-hooks/set-state-in-effect -- Reads sessionStorage, which is only available in the browser, so the first read happens after hydration. */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { EMPTY_MUTATION_STATE } from "./mutations";
import type { MutationState } from "./mutations";
import type { Product } from "./types";

const STORAGE_KEY = "pd.mutations";

type MutationsContextValue = {
  state: MutationState;
  recordCreate: (product: Product) => void;
  recordUpdate: (product: Product) => void;
  recordDelete: (product: Product) => void;
};

const MutationsContext = createContext<MutationsContextValue | null>(null);

function readState(): MutationState {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_MUTATION_STATE;
    // Spread over the empty state so an older/partial payload can't break the app.
    return { ...EMPTY_MUTATION_STATE, ...(JSON.parse(raw) as MutationState) };
  } catch {
    return EMPTY_MUTATION_STATE;
  }
}

function writeState(state: MutationState): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore unavailable storage.
  }
}

/**
 * Holds the results of local mutations for the current browser session.
 * sessionStorage (not localStorage) because these changes are deliberately
 * temporary — DummyJSON never persisted them.
 */
export function MutationsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MutationState>(EMPTY_MUTATION_STATE);

  // sessionStorage can only be read in the browser, so the stored overlay is
  // restored after hydration rather than in the initial state.
  useEffect(() => {
    setState(readState());
  }, []);

  /**
   * Writes to sessionStorage happen here, inside the update, rather than in an
   * effect watching `state`. An effect would also run on the first render and
   * overwrite the stored overlay with the empty initial state.
   */
  const updateState = useCallback(
    (getNext: (current: MutationState) => MutationState) => {
      setState((current) => {
        const next = getNext(current);
        writeState(next);
        return next;
      });
    },
    [],
  );

  const recordCreate = useCallback((product: Product) => {
    updateState((current) => ({ ...current, created: [product, ...current.created] }));
  }, [updateState]);

  const recordUpdate = useCallback((product: Product) => {
    updateState((current) => ({
      ...current,
      // A locally created product is edited in place rather than added to `updated`.
      created: current.created.map((item) =>
        item.id === product.id ? product : item,
      ),
      updated: { ...current.updated, [product.id]: product },
    }));
  }, [updateState]);

  const recordDelete = useCallback((product: Product) => {
    updateState((current) => ({
      ...current,
      created: current.created.filter((item) => item.id !== product.id),
      deleted: [...current.deleted, product],
    }));
  }, [updateState]);

  const value = useMemo(
    () => ({ state, recordCreate, recordUpdate, recordDelete }),
    [state, recordCreate, recordUpdate, recordDelete],
  );

  return (
    <MutationsContext.Provider value={value}>
      {children}
    </MutationsContext.Provider>
  );
}

export function useMutations(): MutationsContextValue {
  const context = useContext(MutationsContext);
  if (!context) {
    throw new Error("useMutations must be used inside <MutationsProvider>");
  }
  return context;
}
