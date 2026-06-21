import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { zipCode, schoolName } = body as { zipCode?: string; schoolName?: string };

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      suggestions: ["Downtown", "North Side", "Westside", "Riverside", "East End"],
    });
  }

  try {
    // Dynamic import to avoid bundling issues if package not present
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `A student commutes to ${schoolName ?? "a local school"}${zipCode ? ` near zip code ${zipCode}` : ""}. List 5 common residential neighborhood names that students might live in near this area. Return ONLY a JSON array of strings, e.g. ["Downtown", "Oak Park", "Riverside"]. Short names only, no descriptions.`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json", temperature: 0.7 },
    });
    const suggestions = JSON.parse(response.text ?? "[]") as unknown;
    return NextResponse.json({
      suggestions: Array.isArray(suggestions) ? (suggestions as string[]).slice(0, 5) : [],
    });
  } catch {
    return NextResponse.json({
      suggestions: ["Downtown", "North Side", "Westside", "Riverside", "East End"],
    });
  }
}
