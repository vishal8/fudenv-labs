// PASTE THIS FILE AS-IS
// components/Section.tsx
import React from "react";

export function Section({
  title,
  kicker,
  children
}: {
  title: string;
  kicker?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-10">
      <div className="mx-auto w-full max-w-5xl px-4">
        {kicker ? (
          <p className="text-sm font-medium text-zinc-500">{kicker}</p>
        ) : null}
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">
          {title}
        </h2>
        <div className="mt-5">{children}</div>
      </div>
    </section>
  );
}