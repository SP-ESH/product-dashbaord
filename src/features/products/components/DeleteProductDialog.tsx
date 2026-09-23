"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { toApiError } from "@/lib/api/errors";

import { deleteProduct } from "../api";
import { useMutations } from "../MutationsProvider";
import type { Product } from "../types";

type DeleteProductDialogProps = {
  /** The product to confirm deletion for, or null when the dialog is closed. */
  product: Product | null;
  onClose: () => void;
  onDeleted?: (product: Product) => void;
};

export function DeleteProductDialog({
  product,
  onClose,
  onDeleted,
}: DeleteProductDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { recordDelete } = useMutations();

  async function handleDelete() {
    if (!product || isDeleting) return; // Guards against a double click.

    setIsDeleting(true);
    setError(null);

    try {
      await deleteProduct(product.id);
      recordDelete(product);
      onDeleted?.(product);
      onClose();
    } catch (caught: unknown) {
      setError(toApiError(caught).message);
    } finally {
      setIsDeleting(false);
    }
  }

  function handleClose() {
    if (isDeleting) return;
    setError(null);
    onClose();
  }

  return (
    <Modal
      isOpen={product !== null}
      title="Delete product"
      onClose={handleClose}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>
            {isDeleting ? "Deleting…" : "Delete"}
          </Button>
        </>
      }
    >
      <p>
        Are you sure you want to delete{" "}
        <span className="font-medium text-slate-900">{product?.title}</span>?
      </p>
      <p className="mt-2 text-xs text-slate-500">
        DummyJSON simulates deletions, so this only removes the product from the
        current session.
      </p>
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}
    </Modal>
  );
}
