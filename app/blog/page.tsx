// PASTE THIS FILE AS-IS
// app/blog/page.tsx
export const metadata = {
  title: "Blog"
};

export default function BlogPage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Blog</h1>
      <p className="mt-3 max-w-2xl text-zinc-700">
        Coming soon. I’ll share build notes, product lessons, and deep dives on marketplaces, MMM, and optimization.
      </p>

      <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-700 shadow-soft">
        <div className="font-semibold text-zinc-900">Suggested first posts</div>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>How I think about MVP scope</li>
          <li>MMM for SMBs: what breaks and how to simplify</li>
          <li>Decision engines &gt; spreadsheets</li>
        </ul>
      </div>
    </div>
  );
}