// PASTE THIS FILE AS-IS
// app/page.tsx
import Link from "next/link";
import { products, site } from "@/lib/site";
import { ProductCard } from "@/components/ProductCard";
import { Section } from "@/components/Section";

export default function HomePage() {
  return (
    <div>
      <div className="rounded-3xl border border-zinc-200 bg-gradient-to-b from-zinc-50 to-white p-8 shadow-soft">
        <p className="text-sm font-medium text-zinc-600">Fudenv Labs</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          {site.tagline}
        </h1>
        <p className="mt-4 max-w-2xl text-base text-zinc-700 whitespace-pre-line">
          {site.ownerLine}
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white shadow-soft hover:bg-zinc-800"
          >
            View Products →
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-900 shadow-soft hover:bg-zinc-50"
          >
            About
          </Link>
        </div>
      </div>

      <Section title="Products" kicker="What I’m building">
        <div className="grid gap-5 sm:grid-cols-2">
          {products.map((p) => (
            <ProductCard key={p.key} product={p} />
          ))}
        </div>
        <div className="mt-6">
          <Link href="/products" className="text-sm font-medium text-zinc-900 hover:underline">
            See all products →
          </Link>
        </div>
      </Section>

      <Section title="Curiosity" kicker="Why this exists">
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            {
              title: "Everyday Problems",
              body: "A lot of what shows up here starts with something small that feels inefficient, messy, or just worth rethinking."
            },
            {
              title: "Analytical by instinct",
              body: "I like breaking problems into parts, thinking through tradeoffs, and building something concrete instead of guessing."
            },
            {
              title: "Ideas in motion",
              body: "Some of these projects are practical. Some are oddly specific. Some begin as random thoughts and turn into full builds."
            },
            {
              title: "Open to feedback",
              body: "Most of this is iterative. If you see a better way to approach something, I’m always open to ideas, feedback, and learning from other people."
            }
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-soft"
            >
              <div className="text-base font-semibold text-zinc-900">{item.title}</div>
              <div className="mt-2 text-sm text-zinc-700">{item.body}</div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}