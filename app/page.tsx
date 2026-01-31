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
        <p className="mt-4 max-w-2xl text-base text-zinc-700">
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

      <Section title="How I work" kicker="Principles">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "Start with the user",
              body: "Define the job-to-be-done and narrow to an MVP that can ship."
            },
            {
              title: "Instrument everything",
              body: "Make metrics part of the product—so iteration is obvious."
            },
            {
              title: "Ship, learn, repeat",
              body: "Tight loops: build → test → refine → launch."
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