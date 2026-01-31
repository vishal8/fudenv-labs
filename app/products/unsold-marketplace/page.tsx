// PASTE THIS FILE AS-IS
// app/products/unsold-marketplace/page.tsx
import { getProduct } from "@/lib/site";

export const metadata = {
  title: "Unsold Inventory Marketplace"
};

export default function Page() {
  const p = getProduct("unsold-marketplace");

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">{p.name}</h1>
      <p className="mt-3 max-w-2xl text-zinc-700">{p.tagline}</p>

      <div className="mt-6 flex flex-wrap gap-2">
        <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-700">
          Status: {p.status}
        </span>
        {p.stack.map((t) => (
          <span key={t} className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
            {t}
          </span>
        ))}
      </div>

      <div className="mt-10 grid gap-5">
        <Card title="Problem">
          Millions of dollars of sellable inventory are wasted due to poor demand visibility, pricing friction,
          and timing mismatches.
        </Card>
        <Card title="Solution">
          A two-sided marketplace that matches unsold inventory to buyers dynamically, with pricing and logistics
          considerations built into the workflow.
        </Card>
        <Card title="What I built">
          <ul className="list-disc space-y-2 pl-5">
            {p.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </Card>
        <Card title="Notes">
          Designed to be demo-friendly: clear flows, measurable outcomes, and a roadmap that prioritizes repeat supply
          and retention.
        </Card>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-soft">
      <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
      <div className="mt-3 text-sm text-zinc-700">{children}</div>
    </section>
  );
}