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
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">What I’m building</h1>
      <p className="mt-3 max-w-2xl text-zinc-700">
        These are a mix of practical tools, experiments, and product ideas I’ve taken from rough concept to working prototype or live tool. They’re all different, but they come from the same instinct.
      </p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {products.map((p) => (
          <ProductCard key={p.key} product={p} />
        ))}
      </div>
    </div>
  );
}