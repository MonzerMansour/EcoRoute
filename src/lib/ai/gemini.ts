import { GoogleGenAI } from "@google/genai";
import type { SeasonSummary, Trip } from "@/lib/types";
import { formatCo2, VEHICLE_SPECS } from "@/core/emissions";
import type { RankedVehiclePlan } from "@/lib/types";

// Models are tried in order until one succeeds. Override the primary choice
// with GEMINI_MODEL. We avoid gemini-2.0-flash by default because some keys
// have a zero free-tier quota for it.
const MODELS: string[] = [
  ...(process.env.GEMINI_MODEL ? [process.env.GEMINI_MODEL] : []),
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash",
];

export function isAiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

function client(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

async function generateJson<T>(prompt: string): Promise<T | null> {
  const ai = client();
  if (!ai) return null;

  for (const model of MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.6,
        },
      });
      const text = response.text;
      if (!text) continue;
      return JSON.parse(text) as T;
    } catch (err) {
      console.error(`[EcoRoute AI] ${model} failed:`, err);
      // Try the next model in the chain.
    }
  }
  return null;
}

export interface SeasonReport {
  headline: string;
  narrative: string;
  topChanges: { title: string; impact: string }[];
  source: "ai" | "fallback";
}

export async function generateSeasonReport(
  summary: SeasonSummary,
): Promise<SeasonReport> {
  const dataContext = {
    totalCo2: formatCo2(summary.totalCo2Kg),
    optimalCo2: formatCo2(summary.optimalTotalCo2Kg),
    baselineCo2: formatCo2(summary.baselineTotalCo2Kg),
    potentialSavings: formatCo2(summary.potentialSavingsKg),
    tripCount: summary.tripCount,
    highestEmittingTrips: summary.rankedTrips.slice(0, 3).map((t) => ({
      name: t.trip.name,
      opponent: t.trip.opponent,
      distanceMiles: t.trip.distanceMiles,
      rosterSize: t.trip.rosterSize,
      co2: formatCo2(t.co2Kg),
    })),
    topRecommendations: summary.recommendations.slice(0, 5).map((r) => ({
      title: r.title,
      detail: r.detail,
      savings: formatCo2(r.co2SavingsKg),
    })),
  };

  const prompt = `You are EcoRoute, an assistant that helps school coaches and athletic directors cut the carbon footprint of team travel.
All emissions numbers below were already computed by a deterministic engine — DO NOT invent or change numbers, only reference the ones provided.
Write encouraging, concrete, plain-English guidance for a coach.

Season data (JSON):
${JSON.stringify(dataContext, null, 2)}

Return ONLY JSON matching this TypeScript type:
{
  "headline": string,            // one punchy sentence summarizing the season footprint
  "narrative": string,           // 2-3 short paragraphs of analysis and encouragement
  "topChanges": { "title": string, "impact": string }[]  // exactly the 3 highest-impact changes, plain English
}`;

  const ai = await generateJson<Omit<SeasonReport, "source">>(prompt);
  if (ai && ai.headline && ai.narrative) {
    return { ...ai, source: "ai" };
  }
  return { ...fallbackReport(summary), source: "fallback" };
}

function fallbackReport(summary: SeasonSummary): Omit<SeasonReport, "source"> {
  const savings = formatCo2(summary.potentialSavingsKg);
  const total = formatCo2(summary.totalCo2Kg);
  return {
    headline: `Your season is on track to emit ${total} from team travel.`,
    narrative: `Across ${summary.tripCount} trips, your current plans total ${total} of CO₂. By matching each trip to its lowest-emission vehicle configuration, you could save about ${savings} without changing a single game on the schedule.\n\nFocus on your highest-emission away games first — small vehicle swaps on long trips deliver the biggest reductions.`,
    topChanges: summary.recommendations.slice(0, 3).map((r) => ({
      title: r.title,
      impact: `Saves ~${formatCo2(r.co2SavingsKg)}`,
    })),
  };
}

export interface TripInsight {
  summary: string;
  recommendation: string;
  source: "ai" | "fallback";
}

export async function generateTripInsight(
  trip: Trip,
  plans: RankedVehiclePlan[],
): Promise<TripInsight> {
  const best = plans[0];
  const dataContext = {
    trip: {
      name: trip.name,
      opponent: trip.opponent,
      distanceMiles: trip.distanceMiles,
      rosterSize: trip.rosterSize,
      chosen: trip.chosenVehicleType
        ? VEHICLE_SPECS[trip.chosenVehicleType].label
        : "none",
    },
    rankedOptions: plans.map((p) => ({
      option: p.label,
      co2: formatCo2(p.co2Kg),
      pctWorseThanBest: p.pctWorseThanBest,
    })),
  };

  const prompt = `You are EcoRoute, helping a coach pick the greenest vehicle setup for one trip.
Do not invent numbers; only use those provided.

Trip data (JSON):
${JSON.stringify(dataContext, null, 2)}

Return ONLY JSON:
{
  "summary": string,         // 1-2 sentences describing the emissions tradeoffs
  "recommendation": string   // 1 sentence telling the coach what to do
}`;

  const ai = await generateJson<Omit<TripInsight, "source">>(prompt);
  if (ai && ai.summary && ai.recommendation) {
    return { ...ai, source: "ai" };
  }
  return {
    summary: best
      ? `The lowest-emission option for this ${trip.distanceMiles}-mile trip is ${best.label} at ${formatCo2(best.co2Kg)} round trip.`
      : "Add roster size and distance to see options.",
    recommendation: best
      ? `Use ${best.label} to minimize this trip's footprint.`
      : "Provide trip details to get a recommendation.",
    source: "fallback",
  };
}
