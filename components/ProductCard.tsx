// PASTE THIS FILE AS-IS
// components/ProductCard.tsx
import Link from "next/link";
import type { Product } from "@/lib/site";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={product.href}
      className="group block rounded-2xl border border-zinc-200 bg-white p-6 shadow-soft transition hover:-translate-y-0.5 hover:border-zinc-300"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 group-hover:underline">
            {product.name}
          </h3>
          <p className="mt-1 text-sm text-zinc-600">{product.tagline}</p>
        </div>
        <span className="shrink-0 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-700">
          {product.status}
        </span>
      </div>

      <ul className="mt-4 space-y-2 text-sm text-zinc-700">
        {product.bullets.slice(0, 3).map((b) => (
          <li key={b} className="flex gap-2">
            <span className="mt-[6px] inline-block h-1.5 w-1.5 rounded-full bg-zinc-400" />
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex flex-wrap gap-2">
        {product.stack.slice(0, 5).map((t) => (
          <span
            key={t}
            className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700"
          >
            {t}
          </span>
        ))}
      </div>

      <div className="mt-6 text-sm font-medium text-zinc-900">
        Open tool → <span className="transition group-hover:translate-x-0.5">→</span>
      </div>
    </Link>
  );
}