"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

type Category = "dining" | "groceries" | "flights" | "hotels" | "other";
type Program = "cash_back" | "bilt" | "capital_one" | "amex_mr" | "chase_ur" | "citi_ty";
type RentMode = "option_a" | "option_b";
type BenefitSettings = { period: string; legacyCycles: number; obsidianValue: number; palladiumValue: number; legacyObsidianValue: number; legacyPalladiumValue: number };
const DEFAULT_BENEFITS: BenefitSettings = { period: "refreshed", legacyCycles: 6, obsidianValue: 0, palladiumValue: 0, legacyObsidianValue: 0, legacyPalladiumValue: 0 };

function benefitValues(settings: BenefitSettings, mode: RentMode, annualA: number, annualB: number, names: string[]) {
  const legacyCycles = settings.period === "transition" ? settings.legacyCycles : settings.period === "legacy" ? 12 : 0;
  const selectedMode = settings.period === "legacy" ? "option_b" : mode;
  const housing = (selectedMode === "option_b" ? annualB : annualA) * legacyCycles / 12 + annualA * (12 - legacyCycles) / 12;
  const credit = names.reduce((total, name) => {
    const refreshed = name === "Bilt Obsidian" ? settings.obsidianValue : name === "Bilt Palladium" ? settings.palladiumValue : 0;
    const legacy = name === "Bilt Obsidian" ? settings.legacyObsidianValue : name === "Bilt Palladium" ? settings.legacyPalladiumValue : 0;
    return total + (settings.period === "transition" ? refreshed + legacy : settings.period === "legacy" ? legacy : refreshed);
  }, 0);
  return { housing, credit, label: legacyCycles === 0 ? "Housing-only" : legacyCycles === 12 ? selectedMode === "option_b" ? "Flexible" : "Housing-only" : `${legacyCycles} cycles ${selectedMode === "option_b" ? "Flexible" : "Housing-only"}, ${12 - legacyCycles} Housing-only` };
}
type TabKey = "optimizer" | "bilt";

type Card = {
  name: string;
  annualFee: number;
  program: Program;
  mult: Record<Category, number>;
};

type SpendState = Record<Category, number>;

type ScenarioRow = {
  category: Category;
  spend: number;
  card: string;
  program: string;
  rate: string;
  earned: string;
  value: number;
};

type Scenario = {
  assignment: Record<Category, string>;
  usedCards: string[];
  coreValue: number;
  creditValue: number;
  rentValue: number;
  fees: number;
  totalValue: number;
  rentModeUsed: string;
  rentExplain: string;
  nonRentSpendOnBilt: number;
  rows: ScenarioRow[];
};

type SingleCardScenario = {
  creditValue: number;
  rows: Array<{
    category: string;
    spend: string;
    rate: string;
    earned: string;
    value: string;
  }>;
  coreValue: number;
  rentA: number;
  rentB: number;
  usedRent: number;
  usedLabel: string;
  fee: number;
  net: number;
  explain: string;
};

const CATEGORIES: Category[] = ["dining", "groceries", "flights", "hotels", "other"];
const BILT_NAMES = new Set(["Bilt Blue", "Bilt Obsidian", "Bilt Palladium"]);

const PROGRAM_LABELS: Record<Program, string> = {
  cash_back: "Cashback",
  bilt: "Bilt",
  capital_one: "Capital One",
  amex_mr: "Amex MR",
  chase_ur: "Chase UR",
  citi_ty: "Citi TY",
};

const CARDS: Card[] = [
  { name: "Bilt Blue", annualFee: 0, program: "bilt", mult: { dining: 1, groceries: 1, flights: 1, hotels: 1, other: 1 } },
  { name: "Bilt Obsidian", annualFee: 95, program: "bilt", mult: { dining: 3, groceries: 1, flights: 2, hotels: 2, other: 1 } },
  { name: "Bilt Palladium", annualFee: 495, program: "bilt", mult: { dining: 2, groceries: 2, flights: 2, hotels: 2, other: 2 } },
  { name: "Venture X", annualFee: 395, program: "capital_one", mult: { dining: 2, groceries: 2, flights: 5, hotels: 10, other: 2 } },
  { name: "Amex Gold", annualFee: 325, program: "amex_mr", mult: { dining: 4, groceries: 4, flights: 2, hotels: 3, other: 1 } },
  { name: "Amex Platinum", annualFee: 695, program: "amex_mr", mult: { dining: 1, groceries: 1, flights: 5, hotels: 5, other: 1 } },
  { name: "Chase Sapphire Reserve", annualFee: 795, program: "chase_ur", mult: { dining: 3, groceries: 1, flights: 8, hotels: 8, other: 1 } },
  { name: "Chase Sapphire Preferred", annualFee: 95, program: "chase_ur", mult: { dining: 3, groceries: 1, flights: 5, hotels: 5, other: 1 } },
  { name: "Citi Strata Elite", annualFee: 595, program: "citi_ty", mult: { dining: 3, groceries: 1, flights: 6, hotels: 12, other: 1 } },
  { name: "Citi Double Cash", annualFee: 0, program: "cash_back", mult: { dining: 2, groceries: 2, flights: 2, hotels: 2, other: 2 } },
  { name: "Amazon Prime Visa", annualFee: 0, program: "cash_back", mult: { dining: 2, groceries: 5, flights: 5, hotels: 5, other: 1 } },
];

const EMPTY_SPEND: SpendState = {
  dining: 0,
  groceries: 0,
  flights: 0,
  hotels: 0,
  other: 0,
};
const BILT_TIER_25 = 0.5;
const BILT_TIER_50 = 0.75;
const BILT_TIER_75 = 1.0;
const BILT_TIER_100 = 1.25;
const BILT_CASH_RATE = 0.04;
const BILT_UNLOCK_RATE = 0.03;

function fmtMoney(n: number): string {
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}
function fmtPoints(n: number): string {
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}
function safePct(n: number): string {
  return `${n.toFixed(2)}%`;
}

function cloneSpend(spend: SpendState): SpendState {
  return {
    dining: spend.dining,
    groceries: spend.groceries,
    flights: spend.flights,
    hotels: spend.hotels,
    other: spend.other,
  };
}

function kCombinations<T>(arr: T[], k: number): T[][] {
  const out: T[][] = [];

  function helper(start: number, path: T[]) {
    if (path.length === k) {
      out.push([...path]);
      return;
    }
    for (let i = start; i < arr.length; i += 1) {
      path.push(arr[i]!);
      helper(i + 1, path);
      path.pop();
    }
  }

  helper(0, []);
  return out;
}

function biltRentValue(args: {
  rent: number;
  nonRentSpendOnBilt: number;
  biltCpp: number; // already in dollars per point, e.g. 1.0 cpp => 0.01
  mode: Exclude<RentMode, "auto">;
  tier25: number;
  tier50: number;
  tier75: number;
  tier100: number;
  biltCashRate: number;
  unlockRate: number;
}): { value: number; explain: string } {
  const {
    rent,
    nonRentSpendOnBilt,
    biltCpp,
    mode,
  } = args;

  if (rent <= 0) return { value: 0, explain: "No rent." };

  if (mode === "option_a") {
    const points = 12 * optionAPoints(rent / 12, nonRentSpendOnBilt / 12);
    const ratio = rent > 0 ? nonRentSpendOnBilt / rent : 0;

    let tierLabel = "<25%";
    if (ratio >= 1.0) tierLabel = "≥100%";
    else if (ratio >= 0.75) tierLabel = "75–100%";
    else if (ratio >= 0.5) tierLabel = "50–75%";
    else if (ratio >= 0.25) tierLabel = "25–50%";

    const value = points * biltCpp;

    return {
      value,
      explain: `Option A: ${fmtPoints(points)} rent points from tier ${tierLabel}, valued at ${fmtMoney(value)}`
    };
  }

  const points = optionBPoints(rent, nonRentSpendOnBilt);
  const value = points * biltCpp;

  return {
    value,
    explain: `Option B: ${fmtPoints(points)} rent points unlocked from Bilt Cash conversion, valued at ${fmtMoney(value)}`
  };
}

function optionAPoints(rent: number, nonRentSpendOnBilt: number): number {
  if (rent <= 0) return 0;
  const ratio = rent > 0 ? nonRentSpendOnBilt / rent : 0;
  let tier = 0;

  if (ratio >= 1.0) tier = 1.25;
  else if (ratio >= 0.75) tier = 1.0;
  else if (ratio >= 0.5) tier = 0.75;
  else if (ratio >= 0.25) tier = 0.5;
  else tier = 0;

  const rawPoints = rent * tier;
  return ratio < 0.25 ? 250 : rawPoints;
}

function optionBPoints(rent: number, nonRentSpendOnBilt: number): number {
  const biltCash = nonRentSpendOnBilt * 0.04;
  const unlockedPoints = biltCash / 0.03;
  return Math.min(rent, unlockedPoints);
}
function buildBiltComparisonData(
  rent: number,
  maxAdditionalSpend: number,
  step: number
) {
  const rows: Array<{
    additionalSpend: number;
    optionAPoints: number;
    optionBPoints: number;
    diff: number;
    optionAMultiplier: number | null;
    optionBMultiplier: number | null;
  }> = [];

  for (let additionalSpend = 0; additionalSpend <= maxAdditionalSpend; additionalSpend += step) {
    const rentPointsA = optionAPoints(rent, additionalSpend);
    const rentPointsB = optionBPoints(rent, additionalSpend);

    // include 1x points earned on the non-rent spend itself
    const totalPointsA = additionalSpend + rentPointsA;
    const totalPointsB = additionalSpend + rentPointsB;

    rows.push({
      additionalSpend,
      optionAPoints: totalPointsA,
      optionBPoints: totalPointsB,
      diff: totalPointsA - totalPointsB,
      optionAMultiplier: additionalSpend > 0 ? totalPointsA / additionalSpend : null,
      optionBMultiplier: additionalSpend > 0 ? totalPointsB / additionalSpend : null,
    });
  }

  return rows;
}
function valueForSpend(args: {
  card: Card;
  category: Category;
  spend: number;
  cppByProgram: Record<Program, number>;
  hasPrime: boolean;
  wholeFoodsShare: number;
  useTravelPortal: boolean;
}): { value: number; earned: string; rate: string } {
  const { card, category, spend, cppByProgram, hasPrime, wholeFoodsShare, useTravelPortal } = args;
  const mult = card.mult[category] ?? 0;

  if (card.program === "cash_back") {
    if (card.name === "Amazon Prime Visa") {
      if (category === "groceries") {
        const wfSpend = spend * wholeFoodsShare;
        const otherSpend = spend - wfSpend;
        const wfRate = hasPrime ? 5 : 3;
        const otherRate = 1;
        const value = wfSpend * (wfRate / 100) + otherSpend * (otherRate / 100);
        const blended = spend > 0 ? (value / spend) * 100 : 0;
        return { value, earned: fmtMoney(value), rate: `blended ${safePct(blended)}` };
      }

      if (category === "flights" || category === "hotels") {
        const rate = useTravelPortal ? (hasPrime ? 5 : 3) : 1;
        const value = spend * (rate / 100);
        return { value, earned: fmtMoney(value), rate: `${rate}%` };
      }
    }

    const value = spend * (mult / 100);
    return { value, earned: fmtMoney(value), rate: `${mult}%` };
  }

  const points = spend * mult;
  const value = points * (cppByProgram[card.program] ?? 0);

  return {
    value,
    earned: `${points.toLocaleString(undefined, { maximumFractionDigits: 0 })} pts`,
    rate: `${mult}x`,
  };
}

function evaluateAssignment(args: {
  benefits: BenefitSettings;
  assignment: Record<Category, string>;
  selected: Record<string, Card>;
  spend: SpendState;
  cppByProgram: Record<Program, number>;
  rent: number;
  rentMode: RentMode;
  hasPrime: boolean;
  wholeFoodsShare: number;
  useTravelPortal: boolean;
}): Scenario {
  const {
    assignment,
    selected,
    spend,
    cppByProgram,
    rent,
    rentMode,
    hasPrime,
    wholeFoodsShare,
    useTravelPortal,
  } = args;

  const usedCards = Array.from(new Set(Object.values(assignment))).sort();
  let coreValue = 0;
  let nonRentSpendOnBilt = 0;

  const rows: ScenarioRow[] = CATEGORIES.map((category) => {
    const cardName = assignment[category];
    const card = selected[cardName]!;

    const result = valueForSpend({
      card,
      category,
      spend: spend[category],
      cppByProgram,
      hasPrime,
      wholeFoodsShare,
      useTravelPortal,
    });

    coreValue += result.value;
    if (BILT_NAMES.has(cardName)) nonRentSpendOnBilt += spend[category];

    return {
      category,
      spend: spend[category],
      card: cardName,
      program: PROGRAM_LABELS[card.program],
      rate: result.rate,
      earned: result.earned,
      value: result.value,
    };
  });

  const fees = usedCards.reduce((sum, name) => sum + (selected[name]?.annualFee ?? 0), 0);

  let rentValue = 0;
  let rentExplain = "No Bilt used.";
  let rentModeUsed = "—";

  if (rent > 0 && usedCards.some((n) => BILT_NAMES.has(n))) {
    const a = biltRentValue({
      rent,
      nonRentSpendOnBilt,
      biltCpp: cppByProgram.bilt,
      mode: "option_a",
      tier25: BILT_TIER_25,
      tier50: BILT_TIER_50,
      tier75: BILT_TIER_75,
      tier100: BILT_TIER_100,
      biltCashRate: BILT_CASH_RATE,
      unlockRate: BILT_UNLOCK_RATE,
    });

    const b = biltRentValue({
      rent,
      nonRentSpendOnBilt,
      biltCpp: cppByProgram.bilt,
      mode: "option_b",
      tier25: BILT_TIER_25,
      tier50: BILT_TIER_50,
      tier75: BILT_TIER_75,
      tier100: BILT_TIER_100,
      biltCashRate: BILT_CASH_RATE,
      unlockRate: BILT_UNLOCK_RATE,
    });

    const result = benefitValues(args.benefits, rentMode, a.value, b.value, usedCards);
    rentValue = result.housing;
    rentModeUsed = result.label;
    rentExplain = `${result.label}; equal monthly spending and housing payments.`;
  }

  const creditValue = benefitValues(args.benefits, rentMode, 0, 0, usedCards).credit;
  return {
    creditValue,
    assignment,
    usedCards,
    coreValue,
    rentValue,
    fees,
    totalValue: coreValue + rentValue + creditValue - fees,
    rentModeUsed,
    rentExplain,
    nonRentSpendOnBilt,
    rows,
  };
}

function bestCombos(args: {
  benefits: BenefitSettings;
  selectedCards: Record<string, Card>;
  spend: SpendState;
  cppByProgram: Record<Program, number>;
  rent: number;
  rentMode: RentMode;
  hasPrime: boolean;
  wholeFoodsShare: number;
  useTravelPortal: boolean;
  maxCardsAllowed: number;
  topK: number;
}): Scenario[] {
  const names = Object.keys(args.selectedCards);
  const raw: Scenario[] = [];

  for (let k = 1; k <= Math.min(args.maxCardsAllowed, names.length); k += 1) {
    const subsets = kCombinations(names, k);

    for (const chosen of subsets) {
      if (chosen.filter((name) => BILT_NAMES.has(name)).length > 1) continue;
      for (const d of chosen) {
        for (const g of chosen) {
          for (const f of chosen) {
            for (const h of chosen) {
              for (const o of chosen) {
                const assignment: Record<Category, string> = {
                  dining: d,
                  groceries: g,
                  flights: f,
                  hotels: h,
                  other: o,
                };

                raw.push(
                  evaluateAssignment({
                    benefits: args.benefits,
                    assignment,
                    selected: args.selectedCards,
                    spend: args.spend,
                    cppByProgram: args.cppByProgram,
                    rent: args.rent,
                    rentMode: args.rentMode,
                    hasPrime: args.hasPrime,
                    wholeFoodsShare: args.wholeFoodsShare,
                    useTravelPortal: args.useTravelPortal,
                  })
                );
              }
            }
          }
        }
      }
    }
  }

  raw.sort((a, b) => {
    if (b.totalValue !== a.totalValue) return b.totalValue - a.totalValue;
    return a.usedCards.length - b.usedCards.length;
  });

  const bestByCardSet = new Map<string, Scenario>();

  for (const r of raw) {
    const key = r.usedCards.join(" | ");
    const existing = bestByCardSet.get(key);
    if (!existing || r.totalValue > existing.totalValue) {
      bestByCardSet.set(key, r);
    }
  }

  return Array.from(bestByCardSet.values())
    .sort((a, b) => {
      if (b.totalValue !== a.totalValue) return b.totalValue - a.totalValue;
      return a.usedCards.length - b.usedCards.length;
    })
    .slice(0, args.topK);
}

function buildSingleCardScenario(args: {
  benefits: BenefitSettings;
  card: Card;
  spend: SpendState;
  rent: number;
  rentMode: RentMode;
  cppByProgram: Record<Program, number>;
  hasPrime: boolean;
  wholeFoodsShare: number;
  useTravelPortal: boolean;
}): SingleCardScenario {
  const { card, spend, rent, rentMode, cppByProgram, hasPrime, wholeFoodsShare, useTravelPortal } = args;

  let coreValue = 0;
  let nonRentSpendOnBilt = 0;

  const rows: SingleCardScenario["rows"] = CATEGORIES.map((category) => {
    const result = valueForSpend({
      card,
      category,
      spend: spend[category],
      cppByProgram,
      hasPrime,
      wholeFoodsShare,
      useTravelPortal,
    });

    coreValue += result.value;
    if (BILT_NAMES.has(card.name)) nonRentSpendOnBilt += spend[category];

    return {
      category,
      spend: fmtMoney(spend[category]),
      rate: result.rate,
      earned: result.earned,
      value: fmtMoney(result.value),
    };
  });

  let rentA = 0;
  let rentB = 0;
  let usedRent = 0;
  let usedLabel = "—";
  let explain = "No Bilt used.";

  if (rent > 0 && BILT_NAMES.has(card.name)) {
    const a = biltRentValue({
      rent,
      nonRentSpendOnBilt,
      biltCpp: cppByProgram.bilt,
      mode: "option_a",
      tier25: BILT_TIER_25,
      tier50: BILT_TIER_50,
      tier75: BILT_TIER_75,
      tier100: BILT_TIER_100,
      biltCashRate: BILT_CASH_RATE,
      unlockRate: BILT_UNLOCK_RATE,
    });

    const b = biltRentValue({
      rent,
      nonRentSpendOnBilt,
      biltCpp: cppByProgram.bilt,
      mode: "option_b",
      tier25: BILT_TIER_25,
      tier50: BILT_TIER_50,
      tier75: BILT_TIER_75,
      tier100: BILT_TIER_100,
      biltCashRate: BILT_CASH_RATE,
      unlockRate: BILT_UNLOCK_RATE,
    });

    rentA = a.value;
    rentB = b.value;

    const result = benefitValues(args.benefits, rentMode, a.value, b.value, [card.name]);
    usedRent = result.housing;
    usedLabel = result.label;
    explain = `${result.label}; equal monthly spending and housing payments.`;
  }

  const fee = card.annualFee;
  const creditValue = benefitValues(args.benefits, rentMode, 0, 0, [card.name]).credit;
  const net = coreValue + usedRent + creditValue - fee;
  rows.push({ category: "Usable credits", spend: "—", rate: "User valuation", earned: "—", value: fmtMoney(creditValue) });

  return {
    rows,
    creditValue,
    coreValue,
    rentA,
    rentB,
    usedRent,
    usedLabel,
    fee,
    net,
    explain,
  };
}

function Table(props: { columns: string[]; rows: Array<Record<string, ReactNode>> }) {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-zinc-50">
          <tr>
            {props.columns.map((col) => (
              <th
                key={col}
                className="border-b border-zinc-200 px-4 py-3 text-left font-medium text-zinc-500"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {props.rows.map((row, idx) => (
            <tr key={idx} className="border-b border-zinc-100 last:border-b-0">
              {props.columns.map((col) => (
                <td key={col} className="px-4 py-3 align-top text-zinc-900">
                  {row[col]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TabButton(props: { active: boolean; children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
        props.active
          ? "border border-zinc-900 bg-zinc-900 text-white"
          : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
      }`}
    >
      {props.children}
    </button>
  );
}

export default function CardOptimizerPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("optimizer");

  const [draftSelectedNames, setDraftSelectedNames] = useState<string[]>([]);
  const [draftSpend, setDraftSpend] = useState<SpendState>(EMPTY_SPEND);
  const [draftRent, setDraftRent] = useState(0);
  const [draftMaxCardsAllowed, setDraftMaxCardsAllowed] = useState(3);
  const [draftRentMode, setDraftRentMode] = useState<RentMode>("option_a");
  const [eligibility, setEligibility] = useState("refreshed");
  const [draftBenefits, setDraftBenefits] = useState(DEFAULT_BENEFITS);
  const [benefits, setBenefits] = useState(DEFAULT_BENEFITS);
  const [draftHasPrime, setDraftHasPrime] = useState(true);
  const [draftWholeFoodsShare, setDraftWholeFoodsShare] = useState(0.25);
  const [draftUseTravelPortal, setDraftUseTravelPortal] = useState(false);
  const [draftBiltCpp, setDraftBiltCpp] = useState(1.0);
  const [draftCap1Cpp, setDraftCap1Cpp] = useState(1.0);
  const [draftAmexCpp, setDraftAmexCpp] = useState(1.2);
  const [draftChaseCpp, setDraftChaseCpp] = useState(1.25);
  const [draftCitiCpp, setDraftCitiCpp] = useState(1.1);

  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [spend, setSpend] = useState<SpendState>(EMPTY_SPEND);
  const [rent, setRent] = useState(0);
  const [maxCardsAllowed, setMaxCardsAllowed] = useState(3);
  const [rentMode, setRentMode] = useState<RentMode>("option_a");
  const [hasPrime, setHasPrime] = useState(true);
  const [wholeFoodsShare, setWholeFoodsShare] = useState(0.25);
  const [useTravelPortal, setUseTravelPortal] = useState(false);
  const [biltCpp, setBiltCpp] = useState(1.0);
  const [cap1Cpp, setCap1Cpp] = useState(1.0);
  const [amexCpp, setAmexCpp] = useState(1.2);
  const [chaseCpp, setChaseCpp] = useState(1.25);
  const [citiCpp, setCitiCpp] = useState(1.1);

  const [cardA, setCardA] = useState("");
  const [cardB, setCardB] = useState("");

  const [biltMonthlyRent, setBiltMonthlyRent] = useState(0);
  const [biltMonthlyRentTouched, setBiltMonthlyRentTouched] = useState(false);

  function applyChanges() {
    setBenefits({ ...draftBenefits, period: eligibility });
    setSelectedNames([...draftSelectedNames]);
    setSpend(cloneSpend(draftSpend));
    setRent(draftRent);
    setMaxCardsAllowed(draftMaxCardsAllowed);
    setRentMode(draftRentMode);
    setHasPrime(draftHasPrime);
    setWholeFoodsShare(draftWholeFoodsShare);
    setUseTravelPortal(draftUseTravelPortal);
    setBiltCpp(draftBiltCpp);
    setCap1Cpp(draftCap1Cpp);
    setAmexCpp(draftAmexCpp);
    setChaseCpp(draftChaseCpp);
    setCitiCpp(draftCitiCpp);
  }

  function clearAll() {
    setDraftBenefits(DEFAULT_BENEFITS);
    setBenefits(DEFAULT_BENEFITS);
    setDraftSelectedNames([]);
    setDraftSpend(cloneSpend(EMPTY_SPEND));
    setDraftRent(0);
    setDraftMaxCardsAllowed(3);
    setDraftRentMode("option_a");
    setEligibility("refreshed");
    setDraftHasPrime(true);
    setDraftWholeFoodsShare(0.25);
    setDraftUseTravelPortal(false);
    setDraftBiltCpp(1.0);
    setDraftCap1Cpp(1.0);
    setDraftAmexCpp(1.2);
    setDraftChaseCpp(1.25);
    setDraftCitiCpp(1.1);

    setSelectedNames([]);
    setSpend(cloneSpend(EMPTY_SPEND));
    setRent(0);
    setMaxCardsAllowed(3);
    setRentMode("option_a");
    setHasPrime(true);
    setWholeFoodsShare(0.25);
    setUseTravelPortal(false);
    setBiltCpp(1.0);
    setCap1Cpp(1.0);
    setAmexCpp(1.2);
    setChaseCpp(1.25);
    setCitiCpp(1.1);

    setCardA("");
    setCardB("");

    setBiltMonthlyRent(0);
    setBiltMonthlyRentTouched(false);
  }

  const selectedCards = useMemo(() => {
    return Object.fromEntries(
      CARDS.filter((c) => selectedNames.includes(c.name)).map((c) => [c.name, c])
    ) as Record<string, Card>;
  }, [selectedNames]);

  const cppByProgram = useMemo<Record<Program, number>>(
    () => ({
      cash_back: 1,
      bilt: biltCpp / 100,
      capital_one: cap1Cpp / 100,
      amex_mr: amexCpp / 100,
      chase_ur: chaseCpp / 100,
      citi_ty: citiCpp / 100,
    }),
    [biltCpp, cap1Cpp, amexCpp, chaseCpp, citiCpp]
  );
  const derivedMonthlyRent = useMemo(() => {
  return rent > 0 ? rent / 12 : 0;
}, [rent]);

  const scenarios = useMemo(() => {
    if (!Object.keys(selectedCards).length) return [];
    return bestCombos({
      benefits,
      selectedCards,
      spend,
      cppByProgram,
      rent,
      rentMode,
      hasPrime,
      wholeFoodsShare,
      useTravelPortal,
      maxCardsAllowed,
      topK: 10,
    });
  }, [benefits, selectedCards, spend, cppByProgram, rent, rentMode, hasPrime, wholeFoodsShare, useTravelPortal, maxCardsAllowed]);

  const best = scenarios[0] ?? null;

  const bestCore = useMemo(() => {
    if (!scenarios.length) return null;
    return [...scenarios].sort((a, b) => b.coreValue - a.coreValue)[0];
  }, [scenarios]);

  const comparatorChoices = Object.keys(selectedCards);

  useEffect(() => {
    if (!comparatorChoices.length) {
      setCardA("");
      setCardB("");
      return;
    }

    if (!comparatorChoices.includes(cardA)) {
      setCardA(comparatorChoices[0] ?? "");
    }

    if (!comparatorChoices.includes(cardB)) {
      setCardB(comparatorChoices[Math.min(1, comparatorChoices.length - 1)] ?? "");
    }
  }, [comparatorChoices, cardA, cardB]);

  useEffect(() => {
  if (!biltMonthlyRentTouched) {
    setBiltMonthlyRent(derivedMonthlyRent);
  }
}, [derivedMonthlyRent, biltMonthlyRentTouched]);

  const scenarioA = useMemo(() => {
    const card = selectedCards[cardA];
    if (!card) return null;
    return buildSingleCardScenario({
      benefits,
      card,
      spend,
      rent,
      rentMode,
      cppByProgram,
      hasPrime,
      wholeFoodsShare,
      useTravelPortal,
    });
  }, [benefits, cardA, selectedCards, spend, rent, rentMode, cppByProgram, hasPrime, wholeFoodsShare, useTravelPortal]);

  const scenarioB = useMemo(() => {
    const card = selectedCards[cardB];
    if (!card) return null;
    return buildSingleCardScenario({
      benefits,
      card,
      spend,
      rent,
      rentMode,
      cppByProgram,
      hasPrime,
      wholeFoodsShare,
      useTravelPortal,
    });
  }, [benefits, cardB, selectedCards, spend, rent, rentMode, cppByProgram, hasPrime, wholeFoodsShare, useTravelPortal]);

const biltDeepDiveRaw = useMemo(() => {
  const maxX = biltMonthlyRent > 0 ? Math.ceil((biltMonthlyRent * 2) / 100) * 100 : 5000;
  const step = biltMonthlyRent > 0 && biltMonthlyRent <= 5000 ? 100 : 250;

  return buildBiltComparisonData(biltMonthlyRent, maxX, step);
}, [biltMonthlyRent]);

const biltDeepDiveData = useMemo(() => {
  const effectiveRent = Math.max(0, biltMonthlyRent);
  const maxX = Math.ceil((effectiveRent * 2) / 100) * 100;
  const step = 100;

  return buildBiltComparisonData(effectiveRent, maxX, step).map((d) => ({
    x: d.additionalSpend,
    optionA: d.optionAPoints,
    optionB: d.optionBPoints,
    optionAMultiplier: d.optionAMultiplier,
    optionBMultiplier: d.optionBMultiplier,
  }));
}, [biltMonthlyRent]);

  const breakpoint = useMemo(() => {
  let seenBAboveA = false;

  for (const d of biltDeepDiveRaw) {
    if (d.optionBPoints > d.optionAPoints) seenBAboveA = true;
    if (seenBAboveA && d.optionAPoints >= d.optionBPoints) return d;
  }

  return null;
}, [biltDeepDiveRaw]);

const firstOptionBLead = useMemo(() => {
  return biltDeepDiveRaw.find((d) => d.optionBPoints > d.optionAPoints) ?? null;
}, [biltDeepDiveRaw]);

const maxOptionBLead = useMemo(() => {
  let best = null as null | typeof biltDeepDiveRaw[number];
  for (const d of biltDeepDiveRaw) {
    if (d.optionBPoints > d.optionAPoints) {
      if (!best || d.diff < best.diff) best = d;
    }
  }
  return best;
}, [biltDeepDiveRaw]);

  return (
  <main className="min-h-screen bg-white text-zinc-900">
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <div className="mb-8">
        <h1 className="text-5xl font-semibold tracking-tight">Card Optimizer</h1>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="/products"
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-100"
          >
            ← Back to Products
          </a>

          <a
            href="https://github.com/vishal8/card-optimizer"
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-100"
          >
            View Code
          </a>

          <a
            href="mailto:your@email.com"
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-100"
          >
            Share Feedback
          </a>
        </div>

        <p className="mt-3 max-w-4xl text-lg text-zinc-500">
          Optimize across cards, compare single-card outcomes, and model Bilt rent value with Option A vs Option B.
        </p>

        <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-5 text-sm">
          <div className="mb-2 font-medium text-zinc-900">What this tool does</div>
          <ul className="list-disc space-y-1 pl-5 text-zinc-600">
            <li>Optimizes category spend across multiple credit cards</li>
            <li>Models Bilt rent value using multiple reward structures</li>
            <li>Compares single-card vs multi-card strategies</li>
            <li>Outputs best setup based on your assumptions</li>
          </ul>
        </div>

        <div className="mt-6 flex gap-3">
          <TabButton active={activeTab === "optimizer"} onClick={() => setActiveTab("optimizer")}>
            Optimizer
          </TabButton>
          <TabButton active={activeTab === "bilt"} onClick={() => setActiveTab("bilt")}>
            Bilt Deep Dive
          </TabButton>
        </div>
      </div>

      {activeTab === "optimizer" ? (
        <>
          <div className="grid gap-6 lg:grid-cols-[290px_minmax(0,1fr)]">
            <section className="rounded-3xl border border-zinc-200 bg-white p-5">
              <h2 className="text-xl font-semibold">Inputs</h2>

              <div className="mt-5 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">Cards to include</label>
                  <div className="grid gap-2">
                    {CARDS.map((card) => {
                      const checked = draftSelectedNames.includes(card.name);
                      return (
                        <label
                          key={card.name}
                          className="flex items-center justify-between rounded-2xl border border-zinc-200 px-3 py-2 hover:bg-zinc-50"
                        >
                          <span className="text-sm">{card.name}</span>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setDraftSelectedNames((prev) => [...prev, card.name]);
                              } else {
                                setDraftSelectedNames((prev) => prev.filter((x) => x !== card.name));
                              }
                            }}
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-200 p-4">
                  <h3 className="mb-3 font-medium">Annual spend</h3>
                  <div className="grid gap-3">
                    {CATEGORIES.map((cat) => (
                      <label key={cat} className="grid gap-1">
                        <span className="text-sm capitalize text-zinc-500">{cat}</span>
                        <input
                          className="w-full min-w-0 rounded-xl border border-zinc-200 bg-white px-3 py-2 outline-none focus:border-zinc-400"
                          type="number"
                          value={draftSpend[cat]}
                          onChange={(e) =>
                            setDraftSpend((prev) => ({ ...prev, [cat]: Number(e.target.value) || 0 }))
                          }
                        />
                      </label>
                    ))}
                    <label className="grid gap-1">
                      <span className="text-sm text-zinc-500">Rent</span>
                      <input
                        className="w-full min-w-0 rounded-xl border border-zinc-200 bg-white px-3 py-2 outline-none focus:border-zinc-400"
                        type="number"
                        value={draftRent}
                        onChange={(e) => setDraftRent(Number(e.target.value) || 0)}
                      />
                    </label>
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-200 p-4">
                  <h3 className="mb-3 font-medium">Amazon assumptions</h3>
                  <div className="grid gap-4">
                    <label className="flex items-center justify-between gap-4">
                      <span className="text-sm text-zinc-700">I have Amazon Prime</span>
                      <input
                        type="checkbox"
                        checked={draftHasPrime}
                        onChange={(e) => setDraftHasPrime(e.target.checked)}
                      />
                    </label>

                    <label className="grid gap-1">
                      <span className="text-sm text-zinc-500">Share of grocery spend at Whole Foods / Amazon</span>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={draftWholeFoodsShare}
                        onChange={(e) => setDraftWholeFoodsShare(Number(e.target.value))}
                      />
                      <span className="text-sm text-zinc-500">{Math.round(draftWholeFoodsShare * 100)}%</span>
                    </label>

                    <label className="flex items-center justify-between gap-4">
                      <span className="text-sm text-zinc-700">Book travel through portal when required</span>
                      <input
                        type="checkbox"
                        checked={draftUseTravelPortal}
                        onChange={(e) => setDraftUseTravelPortal(e.target.checked)}
                      />
                    </label>
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-200 p-4">
                  <h3 className="mb-3 font-medium">Valuations (cpp)</h3>
                  <div className="grid gap-3">
                    {[
                      ["Bilt", draftBiltCpp, setDraftBiltCpp],
                      ["Capital One", draftCap1Cpp, setDraftCap1Cpp],
                      ["Amex MR", draftAmexCpp, setDraftAmexCpp],
                      ["Chase UR", draftChaseCpp, setDraftChaseCpp],
                      ["Citi TY", draftCitiCpp, setDraftCitiCpp],
                    ].map(([label, value, setter]) => (
                      <label key={label as string} className="grid gap-1 min-w-0">
                        <span className="text-sm text-zinc-500">{label as string}</span>
                        <input
                          className="w-full min-w-0 rounded-xl border border-zinc-200 bg-white px-3 py-2 outline-none"
                          type="number"
                          step="0.05"
                          value={value as number}
                          onChange={(e) => (setter as (n: number) => void)(Number(e.target.value) || 0)}
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-200 p-4">
                  <h3 className="mb-3 font-medium">Optimizer</h3>
                  <div className="grid gap-3">
                    <label className="grid gap-1">
                      <span className="text-sm text-zinc-500">Max cards allowed</span>
                      <input
                        className="w-full min-w-0 rounded-xl border border-zinc-200 bg-white px-3 py-2 outline-none focus:border-zinc-400"
                        type="number"
                        min={1}
                        max={6}
                        value={draftMaxCardsAllowed}
                        onChange={(e) =>
                          setDraftMaxCardsAllowed(Math.max(1, Math.min(6, Number(e.target.value) || 1)))
                        }
                      />
                    </label>

                    <label className="grid gap-1">
                      <span className="text-sm text-zinc-500">Bilt rent mode</span>
                      <select
                        className="w-full min-w-0 rounded-xl border border-zinc-200 bg-white px-3 py-2 outline-none focus:border-zinc-400"
                        value={draftRentMode}
                        onChange={(e) => setDraftRentMode(e.target.value as RentMode)}
                      >

                        <option value="option_a" disabled={eligibility === "legacy"}>Housing-only (A)</option>
                        <option value="option_b" disabled={eligibility === "refreshed"}>Flexible Bilt Cash (B)</option>
                      </select>
                    </label>
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-200 p-4">
                  <h3 className="mb-3 font-medium">Bilt assumptions</h3>                  <label className="grid gap-2 mb-3 text-sm">Cardholder benefit period
                    <select className="bg-zinc-50 border border-zinc-200 rounded-xl p-2" value={eligibility} onChange={(event) => {
                      const next = event.target.value;
                      setEligibility(next);
                      setDraftRentMode(next === "legacy" ? "option_b" : "option_a");
                    }}>
                      <option value="refreshed">New 2027 account / refreshed benefits</option>
                      <option value="transition">2027 transition year: legacy then refreshed</option>
                      <option value="legacy">Pre-2027 account with timely Flexible opt-out</option>
                    </select>
                  </label>
                  {eligibility === "transition" && <label className="grid gap-2 text-sm mb-3">Complete billing cycles before anniversary (0–12)
                    <input type="number" min={0} max={12} value={draftBenefits.legacyCycles} className="bg-zinc-50 border border-zinc-200 rounded-xl p-2" onChange={(event) => setDraftBenefits({ ...draftBenefits, legacyCycles: Math.max(0, Math.min(12, Math.floor(Number(event.target.value) || 0))) })} />
                    <span className="text-xs text-zinc-500">Selected mode before transition; Housing-only afterward. Equal monthly spend and rent. Assign the anniversary cycle according to your statement.</span>
                  </label>}
                  <div className="space-y-3 mb-3">
                    <div className="text-sm font-medium">Usable credit value ($ for modeled year)</div>
                    <p className="text-xs text-zinc-500">Enter expected savings after restrictions and expiration. Refreshed credits replace old credits and arrive on the anniversary. Transition entries are actual usable amounts from each period, not prorated allowances. Exclude overlapping benefits and cash used for housing points. Defaults to $0.</p>
                    {([
                      ["obsidianValue", "Refreshed Obsidian Bilt Cash", 100, "refreshed"],
                      ["palladiumValue", "Refreshed Palladium Bilt Cash", 600, "refreshed"],
                      ["legacyObsidianValue", "Legacy Obsidian eligible credits", 100, "legacy"],
                      ["legacyPalladiumValue", "Legacy Palladium eligible credits", 600, "legacy"],
                    ] as const).filter(([, , , period]) => eligibility === "transition" || eligibility === period).map(([key, label, cap]) => <label key={key} className="grid gap-1 text-sm">
                      {label} (up to ${cap})
                      <input type="number" min={0} max={cap} value={draftBenefits[key]} className="bg-zinc-50 border border-zinc-200 rounded-xl p-2" onChange={(event) => setDraftBenefits({ ...draftBenefits, [key]: Math.max(0, Math.min(cap, Number(event.target.value) || 0)) })} />
                    </label>)}
                  </div>

                  <div className="space-y-2 text-sm text-zinc-500">
                    <div>Option A tiers: 25% → 0.50×, 50% → 0.75×, 75% → 1.00×, 100% → 1.25×</div>
                    <div>Flexible: 4% Bilt Cash on everyday spend; $30 unlocks 1,000 housing points, capped at 1× housing</div>
                    <div className="text-zinc-500">Shown for transparency only.</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={applyChanges}
                    className="rounded-xl border border-zinc-200 bg-white px-4 py-3 font-medium text-zinc-900 transition hover:bg-zinc-50"
                  >
                    Apply
                  </button>
                  <button
                    type="button"
                    onClick={clearAll}
                    className="rounded-xl border border-zinc-900 bg-zinc-900 px-4 py-3 font-medium text-white transition hover:bg-zinc-800"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              {!best ? (
                <div className="rounded-3xl border border-zinc-200 bg-white p-8 text-zinc-500">
                  Select cards, enter inputs, then click Apply.
                </div>
              ) : (
                <>
                  {bestCore && (
                    <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-soft">
                      <div className="text-sm font-medium uppercase tracking-wide text-zinc-500">Core spend only</div>
                      <div className="mt-2 text-lg font-medium">
                        Best core-spend combo: {bestCore.usedCards.join(", ")} — {fmtMoney(bestCore.coreValue)}/yr
                      </div>
                    </div>
                  )}

                  <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-soft">
                    <div className="text-sm font-medium uppercase tracking-wide text-zinc-500">Optimizer result</div>
                    <div className="mt-2 text-2xl font-semibold">
                      Best combo: {best.usedCards.join(", ")} — {fmtMoney(best.totalValue)}/yr
                    </div>
                    <div className="mt-3 rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-500">
                      Net annual value = value from category spend + modeled Bilt rent value + usable credits − annual fees.
                      Point cards are converted to dollars using your cpp assumptions. Cashback cards are treated as direct dollar value.
                    </div>
                  </div>

                  <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="space-y-6">
                      <Table
                        columns={["Category", "Spend", "Card", "Program", "Rate", "Earned", "Value ($)"]}
                        rows={[
                          ...best.rows.map((r) => ({
                            Category: r.category,
                            Spend: fmtMoney(r.spend),
                            Card: r.card,
                            Program: r.program,
                            Rate: r.rate,
                            Earned: r.earned,
                            "Value ($)": fmtMoney(r.value),
                          })),
                          {
                            Category: "TOTAL (spend categories)",
                            Spend: fmtMoney(CATEGORIES.reduce((sum, c) => sum + spend[c], 0)),
                            Card: "—",
                            Program: "—",
                            Rate: "—",
                            Earned: "—",
                            "Value ($)": fmtMoney(best.coreValue),
                          },
                          {
                            Category: "Rent",
                            Spend: fmtMoney(rent),
                            Card: best.rentValue > 0 ? "Bilt" : "—",
                            Program: best.rentValue > 0 ? "Bilt" : "—",
                            Rate: best.rentValue > 0 ? best.rentModeUsed : "—",
                            Earned: "—",
                            "Value ($)": fmtMoney(best.rentValue),
                          },
                          {
                            Category: "Usable credits", Spend: "—", Card: "—", Program: "Bilt", Rate: "User valuation", Earned: "—", "Value ($)": fmtMoney(best.creditValue),
                          },
                          {
                            Category: "Fees",
                            Spend: "—",
                            Card: best.usedCards.join(", "),
                            Program: "—",
                            Rate: "—",
                            Earned: "—",
                            "Value ($)": best.fees > 0 ? `-${fmtMoney(best.fees)}` : fmtMoney(0),
                          },
                          {
                            Category: "TOTAL NET",
                            Spend: "—",
                            Card: "—",
                            Program: "—",
                            Rate: "—",
                            Earned: "—",
                            "Value ($)": fmtMoney(best.totalValue),
                          },
                        ]}
                      />
                    </div>

                    <div className="mt-6 rounded-3xl border border-zinc-200 bg-white p-6 shadow-soft">
                      <h3 className="text-lg font-semibold">Best allocation</h3>
                      <p className="mt-2 text-sm text-zinc-500">
                        This shows which selected card is assigned to each spend category in the current best net-value setup.
                      </p>

                      <pre className="mt-4 overflow-x-auto rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-700">
                        {JSON.stringify(best.assignment, null, 2)}
                      </pre>

                      <div className="mt-6 space-y-3">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-zinc-500">Spend value (non-rent)</span>
                          <span>{fmtMoney(best.coreValue)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-zinc-500">Modeled rent value</span>
                          <span>
                            {fmtMoney(best.rentValue)} {best.rentModeUsed !== "—" ? `(${best.rentModeUsed})` : ""}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-zinc-500">Annual fees</span>
                          <span>{best.fees > 0 ? `-${fmtMoney(best.fees)}` : fmtMoney(0)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 border-t border-zinc-200 pt-3 text-lg font-semibold">
                          <span>Net annual value</span>
                          <span>{fmtMoney(best.totalValue)}</span>
                        </div>
                      </div>

                      <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
                        {best.rentExplain}
                      </div>

                      {best.nonRentSpendOnBilt > 0 && (
                        <div className="mt-3 text-sm text-zinc-500">
                          Non-rent spend routed to Bilt: {fmtMoney(best.nonRentSpendOnBilt)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-zinc-200 bg-white p-5">
                    <div className="mb-4">
                      <h2 className="text-2xl font-semibold">Top contenders</h2>
                      <p className="mt-2 text-sm text-zinc-500">
                        These are the best distinct card combinations ranked by net annual value.
                        Each row shows the best assignment found for that specific set of cards.
                      </p>
                    </div>

                    <Table
                      columns={[
                        "Net value ($/yr)",
                        "Cards used",
                        "Rent mode",
                        "Dining",
                        "Groceries",
                        "Flights",
                        "Hotels",
                        "Other",
                      ]}
                      rows={scenarios.map((r) => ({
                        "Net value ($/yr)": fmtMoney(r.totalValue),
                        "Cards used": r.usedCards.join(", "),
                        "Rent mode": r.rentModeUsed,
                        Dining: r.assignment.dining,
                        Groceries: r.assignment.groceries,
                        Flights: r.assignment.flights,
                        Hotels: r.assignment.hotels,
                        Other: r.assignment.other,
                      }))}
                    />
                  </div>
                </>
              )}
            </section>
          </div>

          <div className="mt-6 rounded-3xl border border-zinc-200 bg-white p-5">
            <h2 className="mb-4 text-2xl font-semibold">Comparator</h2>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm text-zinc-500">Card A</span>
                <select
                  className="w-full min-w-0 rounded-xl border border-zinc-200 bg-white px-3 py-2 outline-none focus:border-zinc-400"
                  value={cardA}
                  onChange={(e) => setCardA(e.target.value)}
                >
                  {comparatorChoices.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-sm text-zinc-500">Card B</span>
                <select
                  className="w-full min-w-0 rounded-xl border border-zinc-200 bg-white px-3 py-2 outline-none focus:border-zinc-400"
                  value={cardB}
                  onChange={(e) => setCardB(e.target.value)}
                >
                  {comparatorChoices.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {scenarioA && scenarioB && (
              <>
                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <div className="min-w-0 space-y-3 rounded-3xl border border-zinc-200 bg-white p-5 shadow-soft">
                    <h3 className="text-lg font-medium">A — {cardA}</h3>
                    <Table
                      columns={["Category", "Spend", "Rate", "Earned", "Value ($)"]}
                      rows={[
                        ...scenarioA.rows.map((r) => ({
                          Category: r.category,
                          Spend: r.spend,
                          Rate: r.rate,
                          Earned: r.earned,
                          "Value ($)": r.value,
                        })),
                        {
                          Category: "Rent (Option A)",
                          Spend: fmtMoney(rent),
                          Rate: "engine-modeled",
                          Earned: "—",
                          "Value ($)": fmtMoney(scenarioA.rentA),
                        },
                        {
                          Category: "Rent (Option B)",
                          Spend: fmtMoney(rent),
                          Rate: "engine-modeled",
                          Earned: "—",
                          "Value ($)": fmtMoney(scenarioA.rentB),
                        },
                        {
                          Category: "Rent (Used)",
                          Spend: fmtMoney(rent),
                          Rate: scenarioA.usedLabel,
                          Earned: "—",
                          "Value ($)": fmtMoney(scenarioA.usedRent),
                        },
                        {
                          Category: "Fee",
                          Spend: "—",
                          Rate: "—",
                          Earned: "—",
                          "Value ($)": scenarioA.fee > 0 ? `-${fmtMoney(scenarioA.fee)}` : fmtMoney(0),
                        },
                        {
                          Category: "TOTAL NET",
                          Spend: "—",
                          Rate: "—",
                          Earned: "—",
                          "Value ($)": fmtMoney(scenarioA.net),
                        },
                      ]}
                    />
                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
                      {scenarioA.explain}
                    </div>
                  </div>

                  <div className="min-w-0 space-y-3 rounded-3xl border border-zinc-200 bg-white p-5 shadow-soft">
                    <h3 className="text-lg font-medium">B — {cardB}</h3>
                    <Table
                      columns={["Category", "Spend", "Rate", "Earned", "Value ($)"]}
                      rows={[
                        ...scenarioB.rows.map((r) => ({
                          Category: r.category,
                          Spend: r.spend,
                          Rate: r.rate,
                          Earned: r.earned,
                          "Value ($)": r.value,
                        })),
                        {
                          Category: "Rent (Option A)",
                          Spend: fmtMoney(rent),
                          Rate: "engine-modeled",
                          Earned: "—",
                          "Value ($)": fmtMoney(scenarioB.rentA),
                        },
                        {
                          Category: "Rent (Option B)",
                          Spend: fmtMoney(rent),
                          Rate: "engine-modeled",
                          Earned: "—",
                          "Value ($)": fmtMoney(scenarioB.rentB),
                        },
                        {
                          Category: "Rent (Used)",
                          Spend: fmtMoney(rent),
                          Rate: scenarioB.usedLabel,
                          Earned: "—",
                          "Value ($)": fmtMoney(scenarioB.usedRent),
                        },
                        {
                          Category: "Fee",
                          Spend: "—",
                          Rate: "—",
                          Earned: "—",
                          "Value ($)": scenarioB.fee > 0 ? `-${fmtMoney(scenarioB.fee)}` : fmtMoney(0),
                        },
                        {
                          Category: "TOTAL NET",
                          Spend: "—",
                          Rate: "—",
                          Earned: "—",
                          "Value ($)": fmtMoney(scenarioB.net),
                        },
                      ]}
                    />
                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
                      {scenarioB.explain}
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-lg font-medium text-zinc-900">
                  {Math.abs(scenarioB.net - scenarioA.net) < 1e-9
                    ? "Tie: both cards have the same net annual value."
                    : `Winner: ${scenarioB.net > scenarioA.net ? cardB : cardA} by ${fmtMoney(
                        Math.abs(scenarioB.net - scenarioA.net)
                      )}/yr`}
                </div>
              </>
            )}
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-soft">
            <div className="text-sm uppercase tracking-wide text-zinc-500">Bilt Deep Dive</div>
            <h2 className="mt-2 text-3xl font-semibold">Option A vs Option B</h2>
            <p className="mt-3 max-w-4xl text-zinc-600">
              This isolates the Bilt rent math so you can see where each mode wins before factoring in tradeoffs with other cards.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-soft">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-medium text-zinc-900">Monthly rent for Deep Dive</div>
                  <p className="mt-1 text-sm text-zinc-500">
                    Pre-filled from Optimizer annual rent ÷ 12. You can edit this here.
                  </p>
                </div>
                <div className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs text-zinc-600">
                  Editable
                </div>
              </div>

              <div className="mt-4">
                <input
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-2xl font-semibold outline-none focus:border-zinc-400"
                  type="number"
                  value={biltMonthlyRent}
                  onChange={(e) => {
                    setBiltMonthlyRentTouched(true);
                    setBiltMonthlyRent(Math.max(0, Number(e.target.value) || 0));
                  }}
                />
              </div>

              <div className="mt-3 text-xs text-zinc-500">
                Optimizer annual rent: {fmtMoney(rent)} · Default monthly: {fmtMoney(derivedMonthlyRent)}
              </div>

              <button
                type="button"
                className="mt-3 text-sm text-zinc-700 hover:text-zinc-900"
                onClick={() => {
                  setBiltMonthlyRentTouched(false);
                  setBiltMonthlyRent(derivedMonthlyRent);
                }}
              >
                Reset to Optimizer-derived monthly rent
              </button>
            </div>

            <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-soft">
              <div className="text-sm text-zinc-500">Annualized Deep Dive rent</div>
              <div className="mt-2 text-3xl font-semibold">{fmtMoney(biltMonthlyRent * 12)}</div>
            </div>

            <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-soft">
              <div className="text-sm text-zinc-500">First crossover</div>
              <div className="mt-2 text-3xl font-semibold">
                {breakpoint ? fmtMoney(breakpoint.additionalSpend) : "No crossover"}
              </div>
            </div>
            <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-soft">
              <div className="text-sm text-zinc-500">First sampled Flexible lead (monthly spend)</div>
              <div className="mt-2 text-2xl font-semibold">{firstOptionBLead ? fmtMoney(firstOptionBLead.additionalSpend) : "None"}</div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="min-w-0 rounded-3xl border border-zinc-200 bg-white p-5 shadow-soft">
              <h3 className="text-lg font-semibold">Points per dollar of routed Bilt spend</h3>
              <p className="mt-1 text-sm text-zinc-500">
                Shows Bilt points that each option generates per dollar of additional non-rent spend.
              </p>

              <div className="mt-4 h-[420px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={biltDeepDiveRaw} margin={{ top: 20, right: 24, left: 16, bottom: 64 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                    <XAxis
                      dataKey="additionalSpend"
                      tickFormatter={(v: number) => fmtMoney(v)}
                      tick={{ fill: "#71717a", fontSize: 12 }}
                      minTickGap={40}
                      interval="preserveStartEnd"
                      angle={-15}
                      textAnchor="end"
                      height={56}
                    />
                    <YAxis
                      tick={{ fill: "#71717a", fontSize: 12 }}
                      domain={[0, 1.5]}
                      tickFormatter={(v: number) => `${v.toFixed(2)}x`}
                      width={40}
                    />
                    <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e4e4e7",
                      borderRadius: 12,
                      color: "#18181b",
                    }}
                    formatter={(value, name) => {
                      const num = Number(value);
                      const label =
                        String(name);

                      return [`${num.toFixed(2)}x`, label];
                    }}
                    labelFormatter={(label) => `Monthly spend: ${fmtMoney(Number(label))}`}
                  />
                    <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: 8 }} />
                    <ReferenceLine y={1} stroke="#a1a1aa" strokeDasharray="4 4" />
                    <Line type="stepAfter" dataKey="optionAMultiplier" name="Option A multiplier" stroke="#2563eb" strokeWidth={3} dot={false} />
                    <Line type="monotone" dataKey="optionBMultiplier" name="Option B multiplier" stroke="#ea580c" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="min-w-0 rounded-3xl border border-zinc-200 bg-white p-5 shadow-soft">
              <h3 className="text-lg font-semibold">Bilt points: Option A vs Option B</h3>
              <p className="mt-1 text-sm text-zinc-500">
                Compare total Bilt points earned as more non-rent spend is routed to Bilt.
              </p>

              <div className="mt-4 h-[420px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={biltDeepDiveData} margin={{ top: 20, right: 24, left: 16, bottom: 64 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                    <XAxis
                      dataKey="x"
                      tickFormatter={(v: number) => fmtMoney(v)}
                      tick={{ fill: "#71717a", fontSize: 12 }}
                      minTickGap={40}
                      interval="preserveStartEnd"
                      angle={-20}
                      textAnchor="end"
                      height={64}
                    />
                    <YAxis
                      tickFormatter={(v: number) => fmtPoints(v)}
                      tick={{ fill: "#71717a", fontSize: 12 }}
                      width={40}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e4e4e7",
                        borderRadius: 12,
                        color: "#18181b",
                      }}
                      formatter={(value, name) => {
                        const num = Number(value);
                        const label = String(name);

                        return [`${fmtPoints(num)} pts`, label];
                      }}
                      labelFormatter={(label) => `Monthly spend: ${fmtMoney(Number(label))}`}
                    />
                    <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: 8 }} />
                    {breakpoint ? (
                    <ReferenceLine
                      x={breakpoint.additionalSpend}
                      stroke="#a1a1aa"
                      strokeDasharray="4 4"
                      label={{
                        value: "Crossover",
                        position: "insideTopLeft",
                        fill: "#71717a",
                        fontSize: 12,
                      }}
                    />
                  ) : null}
                    <Line type="stepAfter" dataKey="optionA" name="Option A points" stroke="#2563eb" strokeWidth={3} dot={false} />
                    <Line type="monotone" dataKey="optionB" name="Option B points" stroke="#ea580c" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-soft">
              <div className="text-sm text-zinc-500">First point Option B leads</div>
              <div className="mt-2 text-3xl font-semibold">
                {firstOptionBLead ? fmtMoney(firstOptionBLead.additionalSpend) : "Never"}
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-soft">
              <div className="text-sm text-zinc-500">Option A retakes lead</div>
              <div className="mt-2 text-3xl font-semibold">
                {breakpoint ? fmtMoney(breakpoint.additionalSpend) : "Never"}
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-soft">
              <div className="text-sm text-zinc-500">Largest Option B advantage</div>
              <div className="mt-2 text-3xl font-semibold">
                {maxOptionBLead ? fmtPoints(Math.abs(maxOptionBLead.diff)) : "0"}
              </div>
            </div>
          </div>

          <Table
            columns={[
              "Monthly non-rent spend to Bilt",
              "Option A Points",
              "Option B Points",
              "A Multiplier",
              "B Multiplier",
              "Winner",
              "Diff (A - B)",
            ]}
            rows={biltDeepDiveRaw.map((d) => ({
              "Monthly non-rent spend to Bilt": fmtMoney(d.additionalSpend),
              "Option A Points": fmtPoints(d.optionAPoints),
              "Option B Points": fmtPoints(d.optionBPoints),
              "A Multiplier": d.optionAMultiplier == null ? "—" : `${d.optionAMultiplier.toFixed(2)}x`,
              "B Multiplier": d.optionBMultiplier == null ? "—" : `${d.optionBMultiplier.toFixed(2)}x`,
              Winner:
                d.optionAPoints === d.optionBPoints
                  ? "Tie"
                  : d.optionAPoints > d.optionBPoints
                  ? "Option A"
                  : "Option B",
              "Diff (A - B)": fmtPoints(d.diff),
            }))}
          />

          <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-soft">
            <h3 className="text-xl font-semibold">Assumptions</h3>
            <div className="mt-4 space-y-2 text-sm text-zinc-500">
              <div>Option A tiers: 25% → 0.50×, 50% → 0.75×, 75% → 1.00×, 100% → 1.25×</div>
              <div>Flexible: 4% Bilt Cash on everyday spend; $30 unlocks 1,000 housing points, capped at 1× housing</div>
              <div>
                This tab is explanatory. The optimizer tab is what determines whether routing extra spend to Bilt is actually
                worth it versus Venture X, Amex Gold, or other cards.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </main>
);
}
