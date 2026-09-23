"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { LinkButton } from "@/components/ui/LinkButton";
import { toApiError } from "@/lib/api/errors";

import { useCategories } from "../hooks/useCategories";
import type { ProductFormValues, ProductPayload } from "../types";
import {
  hasErrors,
  toProductPayload,
  validateProductForm,
} from "../validation";
import type { ProductFormErrors } from "../validation";

type ProductFormProps = {
  initialValues: ProductFormValues;
  submitLabel: string;
  /** Throws an ApiError on failure; the form renders the message. */
  onSubmit: (payload: ProductPayload) => Promise<void>;
  cancelHref: string;
};

/** Shared by /products/new and /products/[id]/edit. */
export function ProductForm({
  initialValues,
  submitLabel,
  onSubmit,
  cancelHref,
}: ProductFormProps) {
  const { categories } = useCategories();

  const [values, setValues] = useState<ProductFormValues>(initialValues);
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: keyof ProductFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return; // Prevents a double submission.

    const validationErrors = validateProductForm(values);
    setErrors(validationErrors);
    setApiErrorMessage(null);
    if (hasErrors(validationErrors)) return;

    setIsSubmitting(true);
    try {
      await onSubmit(toProductPayload(values));
      // On success the caller navigates away, so the button stays disabled.
    } catch (caught: unknown) {
      setApiErrorMessage(toApiError(caught).message);
      setIsSubmitting(false);
    }
  }

  const describedBy = (field: keyof ProductFormValues) =>
    errors[field] ? `${field}-error` : undefined;

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-2xl space-y-5">
      <Field label="Title" htmlFor="title" error={errors.title}>
        <Input
          id="title"
          value={values.title}
          hasError={Boolean(errors.title)}
          aria-describedby={describedBy("title")}
          onChange={(event) => updateField("title", event.target.value)}
        />
      </Field>

      <Field label="Description" htmlFor="description" error={errors.description}>
        <Textarea
          id="description"
          rows={4}
          value={values.description}
          hasError={Boolean(errors.description)}
          aria-describedby={describedBy("description")}
          onChange={(event) => updateField("description", event.target.value)}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Price (USD)" htmlFor="price" error={errors.price}>
          <Input
            id="price"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={values.price}
            hasError={Boolean(errors.price)}
            aria-describedby={describedBy("price")}
            onChange={(event) => updateField("price", event.target.value)}
          />
        </Field>

        <Field label="Stock" htmlFor="stock" error={errors.stock}>
          <Input
            id="stock"
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            value={values.stock}
            hasError={Boolean(errors.stock)}
            aria-describedby={describedBy("stock")}
            onChange={(event) => updateField("stock", event.target.value)}
          />
        </Field>
      </div>

      <Field label="Category" htmlFor="category" error={errors.category}>
        <Select
          id="category"
          value={values.category}
          hasError={Boolean(errors.category)}
          aria-describedby={describedBy("category")}
          onChange={(event) => updateField("category", event.target.value)}
        >
          <option value="">Select a category…</option>
          {categories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.name}
            </option>
          ))}
          {/* Keeps an existing value selectable while categories are still loading. */}
          {values.category &&
            !categories.some((category) => category.slug === values.category) && (
              <option value={values.category}>{values.category}</option>
            )}
        </Select>
      </Field>

      <Field
        label="Thumbnail URL"
        htmlFor="thumbnail"
        error={errors.thumbnail}
        hint="Optional. Must be a full http(s) URL."
      >
        <Input
          id="thumbnail"
          type="url"
          placeholder="https://example.com/image.png"
          value={values.thumbnail}
          hasError={Boolean(errors.thumbnail)}
          aria-describedby={describedBy("thumbnail")}
          onChange={(event) => updateField("thumbnail", event.target.value)}
        />
      </Field>

      {apiErrorMessage && (
        <p
          role="alert"
          className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-inset ring-red-200"
        >
          {apiErrorMessage}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" isLoading={isSubmitting}>
          {isSubmitting ? "Saving…" : submitLabel}
        </Button>
        <LinkButton href={cancelHref} variant="secondary">
          Cancel
        </LinkButton>
      </div>
    </form>
  );
}
