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
      model: "gpt-5-mini",
      input: prompt,
      max_output_tokens: 800,
      reasoning: { effort: "medium" },
      text: { verbosity: "low" },
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "TrimPlan",
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              sets: {
                type: "array",
                maxItems: 5,
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    multiplier: {
                      type: "integer",
                      minimum: 1,
                      maximum: 20,
                    },
                    combination: {
                      type: "object",
                      additionalProperties: {
                        type: "integer",
                        minimum: 0,
                        maximum: 99,
                      },
                    },
                  },
                  required: ["multiplier", "combination"],
                },
              },
            },
            required: ["sets"],
          },
        },
      },
    });

    const suggestion = completion.output?.[0]?.parsed ?? { sets: [] };

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
        `${index + 1}. id=${roll.id}, width=${roll.width}mm, required_tons=${roll.tons}`
    )
    .join("\n");

  return `You are an expert paper mill planner.
Deckle range per set: ${deckle.min}mm to ${deckle.max}mm for mill ${mill}.

Each set contains integer roll quantities. Multiplier means how many times to repeat the set.
Constraints:
- Deckle sum = Σ(width_mm × quantity) must be within the range.
- Produced tons for roll i = width_mm/1000 × 9000m ×  (substance/1000) × quantity.
- Match required_tons for each roll as closely as possible without going under when feasible.
- Use ≤ 5 sets and keep multipliers ≤ 10.

Required roll data:
${rollDescription}

Return ONLY valid JSON matching this exact schema:
{"sets":[{"multiplier":number,"combination":{"roll_0":number,"roll_1":number,...}}]}
Example:
{"sets":[{"multiplier":2,"combination":{"roll_0":3,"roll_1":1}}]}

If no feasible plan exists, return {"sets":[]}.
`;
}


