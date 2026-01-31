// PASTE THIS FILE AS-IS
// app/contact/page.tsx
import { site } from "@/lib/site";

export const metadata = {
  title: "Contact"
};

export default function ContactPage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Contact</h1>
      <p className="mt-3 max-w-2xl text-zinc-700">
        Want to chat about a role, a project, or a collab? Reach out.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <a
          href={`mailto:${site.email}`}
          className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-soft hover:bg-zinc-50"
        >
          <div className="text-sm font-medium text-zinc-500">Email</div>
          <div className="mt-1 text-base font-semibold text-zinc-900">{site.email}</div>
          <div className="mt-3 text-sm font-medium text-zinc-900">
            Send email <span>→</span>
          </div>
        </a>

        <a
          href={site.links.linkedin}
          target="_blank"
          rel="noreferrer"
          className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-soft hover:bg-zinc-50"
        >
          <div className="text-sm font-medium text-zinc-500">LinkedIn</div>
          <div className="mt-1 text-base font-semibold text-zinc-900">Open profile</div>
          <div className="mt-3 text-sm font-medium text-zinc-900">
            View <span>→</span>
          </div>
        </a>
      </div>
    </div>
  );
}