import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import type { CommuteEntry } from "@/student/lib/carpools";
import { roundKg } from "@/core/emissions";
import { COMMUTE_CO2_PER_MILE } from "@/core/emissions";

export interface GeminiCluster {
  clusterId: string;
  clusterName: string;
  reason: string;
  members: CommuteEntry[];
  pickupOrder: string[];
  dailySavingsKg: number;
}

interface GeminiClusterRaw {
  clusterName: string;
  reason: string;
  members: string[]; // student names
  pickupOrder: string[];
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as { entries?: CommuteEntry[] };
  const entries: CommuteEntry[] = body.entries ?? [];

  if (entries.length === 0) {
    return NextResponse.json({ clusters: [] });
  }

  // Build a simple list for Gemini — name + location label
  const commuters = entries.map((e) => ({
    name: e.studentName,
    location: e.customNeighborhoodLabel?.trim() || e.neighborhoodId,
    mode: e.commuteMode,
    departureTime: e.departureTime,
  }));

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ clusters: fallbackClusters(entries), source: "fallback" });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are helping group students into carpool clusters for school commutes. All students attend the same school and live in the same general metro area or state.

Here are the students and where they live:
${commuters.map((c, i) => `${i + 1}. ${c.name} — ${c.location}${c.departureTime ? ` (departs ${c.departureTime})` : ""}`).join("\n")}

Group them into carpool clusters of 2–4 people based on geographic proximity — students in the same neighborhood or nearby areas should be grouped together. Students in completely different cities or far-apart areas should be in separate clusters. A student with no nearby neighbors can be a solo cluster.

For each cluster:
- Give it a short descriptive name based on the area (e.g. "Downtown & Midtown", "Westside")
- Explain in one short sentence why these people are grouped together
- List member names
- Suggest a pickup order (farthest from school first is ideal, but use your judgment based on the locations)

Return ONLY valid JSON as an array:
[
  {
    "clusterName": "Area Name",
    "reason": "one sentence explaining proximity",
    "members": ["Name1", "Name2"],
    "pickupOrder": ["Name2", "Name1"]
  }
]`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json", temperature: 0.3 },
    });

    const raw = JSON.parse(response.text ?? "[]") as GeminiClusterRaw[];

    const clusters: GeminiCluster[] = raw.map((c, i) => {
      const members = entries.filter((e) => c.members.includes(e.studentName));
      const soloKg = members.reduce((sum, m) => {
        if (m.commuteMode === "bus") return sum;
        const factor = m.commuteMode === "carpool" ? 0.5 : 1;
        // Use avg distance of 5 miles if no neighborhood data
        return sum + roundKg(5 * COMMUTE_CO2_PER_MILE.solo_car * 2 * factor);
      }, 0);
      const afterKg = roundKg(5 * (COMMUTE_CO2_PER_MILE.solo_car / Math.max(1, members.length)) * 2);
      const dailySavingsKg = roundKg(Math.max(0, soloKg - afterKg));

      return {
        clusterId: `Cluster ${i + 1}`,
        clusterName: c.clusterName,
        reason: c.reason,
        members,
        pickupOrder: c.pickupOrder.filter((name) =>
          members.some((m) => m.studentName === name)
        ),
        dailySavingsKg,
      };
    });

    return NextResponse.json({ clusters, source: "ai" });
  } catch (err) {
    console.error("[EcoRoute] Gemini clustering failed:", err);
    return NextResponse.json({ clusters: fallbackClusters(entries), source: "fallback" });
  }
}

// Simple name-based fallback — groups of up to 4, no geo logic
function fallbackClusters(entries: CommuteEntry[]): GeminiCluster[] {
  const clusters: GeminiCluster[] = [];
  for (let i = 0; i < entries.length; i += 4) {
    const members = entries.slice(i, i + 4);
    clusters.push({
      clusterId: `Cluster ${clusters.length + 1}`,
      clusterName: members.map((m) => m.customNeighborhoodLabel || m.neighborhoodId).join(" & "),
      reason: "Grouped by entry order (AI unavailable).",
      members,
      pickupOrder: members.map((m) => m.studentName),
      dailySavingsKg: 0,
    });
  }
  return clusters;
}
