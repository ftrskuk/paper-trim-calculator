import { AISuggestion } from "@/types";

const OPENAI_ROUTE = "/api/optimize";

export async function requestOptimization(payload: {
  mill: string;
  deckle: { min: number; max: number };
  requiredRolls: Array<{ id: string; width: number; tons: number }>;
}) {
  const response = await fetch(OPENAI_ROUTE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to request optimization");
  }

  return (await response.json()) as AISuggestion;
}

