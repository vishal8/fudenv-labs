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
          Hi, I’m Vishal, a product minded operator building real tools. I like ambiguous problems where
          strategy, analytics, and execution all matter.
        </p>
        <p>
          Fudenv Labs is my personal build space.
          <br /><br />
          I started it as a way to give shape to the kinds of ideas that usually live half finished in notes, spreadsheets, and late night tabs. Some come from everyday annoyances. Some come from work. Some are completely random. The common thread is that they feel interesting enough to build.
          <br /><br />
          I like working on things that sit between usefulness and curiosity: decision tools, niche optimizers, workflow ideas, little systems that make life or work slightly better.
          <br /><br />
          This site is where those ideas become real.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-soft">
        <h2 className="text-lg font-semibold text-zinc-900">What you’ll find here</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-700">
          {[
            {
              title: "Useful tools",
              body: "Decision tools, optimizers, and small systems built around problems I kept thinking about."
            },
            {
              title: "Experiments",
              body: "Ideas I want to test in the real world, even if they start rough or a little weird."
            },
            {
              title: "Analytical builds",
              body: "Projects where strategy, modeling, and execution all come together in something interactive."
            },
            {
              title: "Things in progress",
              body: "Not everything here is finished. A lot of it is part build, part learning process, and part open question."
            }
          ].map((item) => (
            <li key={item.title}>
              <span className="font-medium text-zinc-900">{item.title}:</span>{" "}
              {item.body}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}