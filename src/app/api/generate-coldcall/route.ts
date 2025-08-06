import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const {
      recipientName,
      company,
      goal,
      tone,
      language,
      context,
      templateStyle,
    } = await req.json();

    if (!recipientName || !company || !goal) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const basePrompt = `
You are an expert sales strategist.
Write a cold call script for the following details:

Recipient Name: ${recipientName}
Recipient Company: ${company}
Goal of the Call: ${goal}
Tone: ${tone}
Language: ${language}

${context ? `Context for the call: ${context}` : ""}

Template Style: ${templateStyle}

### Template Style Rules:
- Standard: Formal, structured with greeting, introduction, value proposition, and CTA.
- Minimalist: Extremely concise, uses bullet points for key lines, minimal fluff.
- Creative: Conversational and engaging, uses storytelling or humor to build rapport.

### Instructions:
- Script must be written in ${language}.
- Maintain a ${tone.toLowerCase()} tone.
- Apply the chosen Template Style strictly when structuring and wording the script.
- Include a strong opening, clear value proposition, and an effective CTA.
- Keep it conversational and easy to deliver over the phone.
`;

    const variationInstruction = `
Now create TWO distinct versions:
1. Version A: Direct and professional.
2. Version B: Creative, slightly informal, more engaging.
`;

    const fullPrompt = `${basePrompt}\n${variationInstruction}`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a highly skilled cold call script writer." },
        { role: "user", content: fullPrompt },
      ],
      temperature: 0.8,
    });

    const responseText =
      completion.choices[0].message?.content || "Failed to generate scripts.";

    const [versionA, versionB] = responseText.split(/2\.\s*Version B:/i);
    const cleanA = versionA.replace(/1\.\s*Version A:/i, "").trim();
    const cleanB = (versionB || "Version B not generated").trim();

    return NextResponse.json({ outputA: cleanA, outputB: cleanB });
  } catch (error) {
    console.error("Error generating cold call script:", error);
    return NextResponse.json(
      { error: "Failed to generate cold call script" },
      { status: 500 }
    );
  }
}
