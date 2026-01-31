// PASTE THIS FILE AS-IS
// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    default: site.name,
    template: `%s • ${site.name}`
  },
  description: site.tagline,
  metadataBase: new URL(`https://${site.domain}`)
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <Navbar />
        <main className="mx-auto w-full max-w-5xl px-4 py-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}