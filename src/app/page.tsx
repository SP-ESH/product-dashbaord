import { redirect } from "next/navigation";

/** The dashboard has no separate home screen; /products is the entry point. */
export default function HomePage() {
  redirect("/products");
}
