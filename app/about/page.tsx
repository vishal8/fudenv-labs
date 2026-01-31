// PASTE THIS FILE AS-IS
// app/about/page.tsx
export const metadata = {
  title: "About"
};

export default function AboutPage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">About</h1>

      <div className="mt-6 space-y-4 text-zinc-700">
        <p>
          I’m Vishal — a product-minded operator building real tools. I like ambiguous problems where
          strategy, analytics, and execution all matter.
        </p>
        <p>
          Fudenv Labs is my product studio: a place to explore ideas, ship MVPs, instrument outcomes,
          and iterate fast.
        </p>
        <p>
          I’m interested in roles that sit at the intersection of product, growth, and decision science.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-soft">
        <h2 className="text-lg font-semibold text-zinc-900">What you’ll find here</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-700">
          <li>Clear product narratives: problem → solution → build</li>
          <li>Working prototypes and technical architecture</li>
          <li>Thoughts on marketplaces, analytics, and optimization</li>
        </ul>
      </div>
    </div>
  );
}