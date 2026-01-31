// PASTE THIS FILE AS-IS
// lib/site.ts
export type ProductKey =
  | "unsold-marketplace"
  | "mmm-analytics"
  | "influencer-fit"
  | "credit-card-optimizer";

export type Product = {
  key: ProductKey;
  name: string;
  tagline: string;
  href: `/products/${ProductKey}`;
  status: "MVP" | "Prototype" | "Live" | "In progress";
  bullets: string[];
  stack: string[];
};

export const site = {
  name: "Fudenv Labs",
  domain: "fudenv.com",
  tagline: "A product studio building data-driven tools across marketplaces, analytics, and decision optimization.",
  ownerLine: "I design, build, and ship products from discovery to MVP—combining product strategy, analytics, and engineering.",
  email: "hello@fudenv.com",
  links: {
    linkedin: "https://www.linkedin.com/",
    github: "https://github.com/"
  }
};

export const products: Product[] = [
  {
    key: "unsold-marketplace",
    name: "Unsold Inventory Marketplace",
    tagline: "Supply-demand matching for surplus food & retail inventory.",
    href: "/products/unsold-marketplace",
    status: "MVP",
    bullets: [
      "Two-sided marketplace flows (supply + demand).",
      "Matching and pricing rules for time-sensitive inventory.",
      "MVP roadmap focused on partnerships and repeat supply."
    ],
    stack: ["Next.js", "TypeScript", "Python", "FastAPI", "SQL"]
  },
  {
    key: "mmm-analytics",
    name: "MMM Analytics Platform",
    tagline: "Marketing mix modeling & spend optimization for SMB advertisers.",
    href: "/products/mmm-analytics",
    status: "Prototype",
    bullets: [
      "MMM pipeline design and modeling approach.",
      "Scenario planning and budget reallocation insights.",
      "Outputs packaged for non-technical operators."
    ],
    stack: ["Python", "FastAPI", "SQL", "Next.js", "TypeScript"]
  },
  {
    key: "influencer-fit",
    name: "Influencer Fit Engine",
    tagline: "Market-fit and audience overlap analysis for creator partnerships.",
    href: "/products/influencer-fit",
    status: "In progress",
    bullets: [
      "Brand-to-creator matching logic and scoring.",
      "Audience overlap + content affinity signals.",
      "Reporting built for partnership decision-making."
    ],
    stack: ["Next.js", "TypeScript", "Python", "SQL"]
  },
  {
    key: "credit-card-optimizer",
    name: "Credit Card Optimizer",
    tagline: "Decision engine to maximize rewards across complex card ecosystems.",
    href: "/products/credit-card-optimizer",
    status: "Prototype",
    bullets: [
      "Optimization logic for multi-card setups and categories.",
      "Configurable assumptions (value per point, caps, multipliers).",
      "Outputs as clear recommendations and comparisons."
    ],
    stack: ["Next.js", "TypeScript", "Math/Optimization", "CSV/JSON inputs"]
  }
];

export function getProduct(key: ProductKey): Product {
  const found = products.find((p) => p.key === key);
  if (!found) throw new Error(`Unknown product key: ${key}`);
  return found;
}