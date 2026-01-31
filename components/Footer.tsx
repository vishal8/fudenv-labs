// PASTE THIS FILE AS-IS
// components/Footer.tsx
import Link from "next/link";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="font-semibold text-zinc-900">{site.name}</div>
            <div className="mt-1 text-sm text-zinc-600">{site.tagline}</div>
          </div>
          <div className="flex items-center gap-5 text-sm font-medium">
            <Link href="/products" className="text-zinc-700 hover:text-zinc-900">
              Products
            </Link>
            <Link href="/about" className="text-zinc-700 hover:text-zinc-900">
              About
            </Link>
            <Link href="/contact" className="text-zinc-700 hover:text-zinc-900">
              Contact
            </Link>
          </div>
        </div>

        <div className="mt-8 text-xs text-zinc-500">
          © {new Date().getFullYear()} {site.name}. Built with Next.js.
        </div>
      </div>
    </footer>
  );
}