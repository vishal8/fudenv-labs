import { getProduct } from "@/lib/site";

export const metadata = {
  title: "Trader Tax Engine"
};

export default function Page() {
  const p = getProduct("trader-tax-engine");

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
          Active trading creates a messy tax footprint. Wash sales are hard to track across accounts, especially with repeated entries and exits.  
          Quarterly tax estimates are often guesswork, which leads to surprises at filing time.
        </Card>
        <Card title="Solution">
          A system that tracks realized activity, identifies wash sales across accounts, and estimates tax liability in real time. Instead of reacting at year end, it gives a running view of where you stand.
        </Card>
        <Card title="What I built">
          <ul className="list-disc space-y-2 pl-5">
            {p.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </Card>
        <Card title="Next">
          Support for direct brokerage imports and automated trade reconciliation. More precise tax modeling (short vs long-term splits, carryforwards, scenario planning). Simple outputs (dashboards/reports) that make it easier to act on the numbers.
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