export type Review = {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
};

export type Product = {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage?: number;
  rating: number;
  stock: number;
  tags?: string[];
  brand?: string;
  sku?: string;
  images: string[];
  thumbnail: string;
  reviews?: Review[];
};

/** Shape returned by every list endpoint (/products, /search, /category/x). */
export type ProductListResponse = {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
};

/** /products/categories returns objects, not plain strings. */
export type Category = {
  slug: string;
  name: string;
  url: string;
};

/** The subset of fields our create/edit form owns. */
export type ProductFormValues = {
  title: string;
  description: string;
  price: string;
  category: string;
  stock: string;
  thumbnail: string;
};

/** Same fields, parsed into the types the API expects. */
export type ProductPayload = {
  title: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  thumbnail: string;
};
