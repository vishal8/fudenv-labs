// PASTE THIS FILE AS-IS
// app/products/page.tsx
import { products } from "@/lib/site";
import { ProductCard } from "@/components/ProductCard";

export const metadata = {
  title: "Products"
};

export default function ProductsPage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Products</h1>
      <p className="mt-3 max-w-2xl text-zinc-700">
        A collection of products exploring marketplaces, growth analytics, and decision-making systems.
        Each project is built end-to-end—from problem discovery to working prototype.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {products.map((p) => (
          <ProductCard key={p.key} product={p} />
        ))}
      </div>
    </div>
  );
}