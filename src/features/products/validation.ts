import type { ProductFormValues, ProductPayload } from "./types";

export type ProductFormErrors = Partial<Record<keyof ProductFormValues, string>>;

const TITLE_MIN_LENGTH = 3;
const DESCRIPTION_MIN_LENGTH = 10;
const MAX_PRICE = 1_000_000;

export const EMPTY_PRODUCT_FORM: ProductFormValues = {
  title: "",
  description: "",
  price: "",
  category: "",
  stock: "",
  thumbnail: "",
};

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/** Returns one message per invalid field; an empty object means "valid". */
export function validateProductForm(
  values: ProductFormValues,
): ProductFormErrors {
  const errors: ProductFormErrors = {};

  const title = values.title.trim();
  if (!title) errors.title = "Title is required.";
  else if (title.length < TITLE_MIN_LENGTH) {
    errors.title = `Title must be at least ${TITLE_MIN_LENGTH} characters.`;
  }

  const description = values.description.trim();
  if (!description) errors.description = "Description is required.";
  else if (description.length < DESCRIPTION_MIN_LENGTH) {
    errors.description = `Description must be at least ${DESCRIPTION_MIN_LENGTH} characters.`;
  }

  const price = Number(values.price);
  if (values.price.trim() === "") errors.price = "Price is required.";
  else if (!Number.isFinite(price)) errors.price = "Price must be a number.";
  else if (price <= 0) errors.price = "Price must be greater than 0.";
  else if (price > MAX_PRICE) errors.price = "Price is unrealistically high.";

  if (!values.category.trim()) errors.category = "Please choose a category.";

  const stock = Number(values.stock);
  if (values.stock.trim() === "") errors.stock = "Stock is required.";
  else if (!Number.isInteger(stock)) errors.stock = "Stock must be a whole number.";
  else if (stock < 0) errors.stock = "Stock cannot be negative.";

  const thumbnail = values.thumbnail.trim();
  if (thumbnail && !isValidHttpUrl(thumbnail)) {
    errors.thumbnail = "Enter a valid http(s) image URL.";
  }

  return errors;
}

export function hasErrors(errors: ProductFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

/** Converts validated string inputs into the types the API expects. */
export function toProductPayload(values: ProductFormValues): ProductPayload {
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    price: Number(values.price),
    category: values.category.trim(),
    stock: Number(values.stock),
    thumbnail: values.thumbnail.trim(),
  };
}
