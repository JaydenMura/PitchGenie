import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const {
      objection,
      product,
      tone,
      language,
      context,
      templateStyle,
    } = await req.json();

    if (!objection || !product) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const basePrompt = `
You are an expert sales professional skilled in objection handling.
Create TWO different, high-quality responses (A and B) to the following objection:

Objection: ${objection}
Product/Service: ${product}
Tone: ${tone}
Language: ${language}
${context ? `Additional Context: ${context}` : ""}
${templateStyle ? `Template Style: ${templateStyle}` : ""}

### Template Style Rules:
- Standard: Clear, professional, well-structured response.
- Minimalist: Short, no fluff, addresses objection directly.
- Creative: Persuasive, adds unique phrasing and relatability.

INSTRUCTIONS:
- Each response must be written entirely in ${language}.
- Do NOT mix languages.
- Make responses empathetic, solution-oriented, and persuasive.
- Response A: Direct and professional.
- Response B: Creative or persuasive twist.
`;

    const versionAPrompt = `${basePrompt}
### Response A:
- Be concise, solution-focused, and confident.
`;

    const versionBPrompt = `${basePrompt}
### Response B:
- Use creative tone, empathetic language, and add engaging phrasing.
`;

    // Generate A
    const completionA = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a skilled objection handler." },
        { role: "user", content: versionAPrompt },
      ],
      temperature: 0.7,
    });

    // Generate B
    const completionB = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a skilled objection handler." },
        { role: "user", content: versionBPrompt },
      ],
      temperature: 0.7,
    });

    const outputA =
      completionA.choices[0].message?.content || "Failed to generate Response A.";
    const outputB =
      completionB.choices[0].message?.content || "Failed to generate Response B.";

    return NextResponse.json({ outputA, outputB });
  } catch (error) {
    console.error("Error generating objection responses:", error);
    return NextResponse.json(
      { error: "Failed to generate objection responses" },
      { status: 500 }
    );
  }
}
