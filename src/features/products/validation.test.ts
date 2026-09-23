import { describe, expect, it } from "vitest";

import type { ProductFormValues } from "./types";
import { toProductPayload, validateProductForm } from "./validation";

const validValues: ProductFormValues = {
  title: "Wireless Mouse",
  description: "A comfortable wireless mouse with a long battery life.",
  price: "29.99",
  category: "electronics",
  stock: "42",
  thumbnail: "https://example.com/mouse.png",
};

const validate = (overrides: Partial<ProductFormValues>) =>
  validateProductForm({ ...validValues, ...overrides });

describe("validateProductForm", () => {
  it("accepts a complete, valid form", () => {
    expect(validateProductForm(validValues)).toEqual({});
  });

  it("treats an empty thumbnail as valid, since it is optional", () => {
    expect(validate({ thumbnail: "" })).toEqual({});
  });

  it("requires a title of a reasonable length", () => {
    expect(validate({ title: "" }).title).toMatch(/required/i);
    expect(validate({ title: "ab" }).title).toMatch(/at least/i);
  });

  it("requires a description of a reasonable length", () => {
    expect(validate({ description: "short" }).description).toMatch(/at least/i);
  });

  it.each([
    ["", /required/i],
    ["abc", /number/i],
    ["0", /greater than 0/i],
    ["-5", /greater than 0/i],
  ])("rejects the price %j", (price, expected) => {
    expect(validate({ price }).price).toMatch(expected);
  });

  it("rejects a negative or fractional stock", () => {
    expect(validate({ stock: "-1" }).stock).toMatch(/negative/i);
    expect(validate({ stock: "1.5" }).stock).toMatch(/whole number/i);
  });

  it("allows zero stock", () => {
    expect(validate({ stock: "0" }).stock).toBeUndefined();
  });

  it("requires a category", () => {
    expect(validate({ category: "  " }).category).toMatch(/category/i);
  });

  it.each(["not-a-url", "ftp://example.com/x.png", "javascript:alert(1)"])(
    "rejects the thumbnail %j",
    (thumbnail) => {
      expect(validate({ thumbnail }).thumbnail).toMatch(/valid http/i);
    },
  );
});

describe("toProductPayload", () => {
  it("trims strings and converts the numeric fields", () => {
    expect(
      toProductPayload({ ...validValues, title: "  Wireless Mouse  " }),
    ).toEqual({
      title: "Wireless Mouse",
      description: validValues.description,
      price: 29.99,
      category: "electronics",
      stock: 42,
      thumbnail: "https://example.com/mouse.png",
    });
  });
});
