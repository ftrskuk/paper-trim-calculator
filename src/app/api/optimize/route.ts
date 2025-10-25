import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

type OptimizeRequestBody = {
  mill: string;
  deckle: { min: number; max: number };
  requiredRolls: Array<{ id: string; width: number; tons: number }>;
};

export async function POST(request: NextRequest) {
  const body = (await request.json()) as OptimizeRequestBody;

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured" },
      { status: 500 }
    );
  }

  if (!body?.requiredRolls?.length) {
    return NextResponse.json(
      { error: "No required rolls provided" },
      { status: 400 }
    );
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const prompt = buildPrompt(body);

  try {
    const completion = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
      max_output_tokens: 800,
      temperature: 0.3,
    });

    const text = completion.output_text();
    const suggestion = parseResponse(text);

    return NextResponse.json(suggestion);
  } catch (error) {
    console.error("OpenAI optimization error", error);
    return NextResponse.json(
      { error: "Failed to process optimization" },
      { status: 500 }
    );
  }
}

function buildPrompt({
  mill,
  deckle,
  requiredRolls,
}: OptimizeRequestBody) {
  const rollDescription = requiredRolls
    .map(
      (roll, index) =>
        `${index + 1}. width=${roll.width}mm, required_tons=${roll.tons} (id=${roll.id})`
    )
    .join("\n");

  return `You are assisting a paper mill planner. Deckle range: ${deckle.min}mm to ${deckle.max}mm for mill ${mill}.
Required rolls (with ids):
${rollDescription}

Propose up to 5 set combinations. Each set must respect the deckle range when summing widths.
Return JSON with structure: {"sets":[{"multiplier":number,"combination":{"roll-id":quantity,...}}]}
Do not include commentary. If impossible, return {"sets":[]}.
`;
}

function parseResponse(text: string) {
  try {
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error("No JSON found in response");
    }
    const jsonString = text.slice(jsonStart, jsonEnd + 1);
    const parsed = JSON.parse(jsonString);

    if (!Array.isArray(parsed.sets)) {
      return { sets: [] };
    }

    const sanitizedSets = parsed.sets
      .map((set: unknown) => {
        if (
          typeof set !== "object" ||
          set === null ||
          Array.isArray(set) ||
          typeof (set as { combination?: unknown }).combination !== "object"
        ) {
          return null;
        }

        const multiplierValue = Number((set as { multiplier?: unknown }).multiplier) || 1;
        const combinationEntries = Object.entries(
          (set as { combination: Record<string, unknown> }).combination
        )
          .map(([rollId, qty]) => [rollId, Number(qty) || 0])
          .filter(([, qty]) => qty > 0);

        if (!combinationEntries.length) {
          return null;
        }

        return {
          multiplier: multiplierValue,
          combination: Object.fromEntries(combinationEntries) as Record<string, number>,
        };
      })
      .filter((set): set is { multiplier: number; combination: Record<string, number> } =>
        Boolean(set)
      );

    return { sets: sanitizedSets };
  } catch (error) {
    console.error("Failed to parse OpenAI response", error);
    return { sets: [] };
  }
}

