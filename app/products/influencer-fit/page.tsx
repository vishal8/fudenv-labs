// PASTE THIS FILE AS-IS
// app/products/influencer-fit/page.tsx
import { getProduct } from "@/lib/site";

export const metadata = {
  title: "Influencer Fit Engine"
};

export default function Page() {
  const p = getProduct("influencer-fit");

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
          Brands often pick creators based on surface metrics (followers, vibes) rather than fit: audience overlap,
          content affinity, and outcome likelihood.
        </Card>
        <Card title="Solution">
          A fit engine that scores creators against a brand’s positioning using audience signals, content themes,
          and historical collaboration patterns.
        </Card>
        <Card title="What I built">
          <ul className="list-disc space-y-2 pl-5">
            {p.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </Card>
        <Card title="Next">
          Add a simple report export (PDF/links), plus guardrails for fraudulent engagement and bot-heavy audiences.
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