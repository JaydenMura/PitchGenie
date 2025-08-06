import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const {
      recipientName,
      context,
      previousInteraction,
      tone,
      language,
      templateStyle,
      cta,
    } = await req.json();

    if (!recipientName || !context) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    // Shared base instructions with explicit Template Style rules
    const basePrompt = `
You are an expert in professional email communication. Write a follow-up email that is polite, professional, and persuasive based on these details:

- Recipient Name: ${recipientName}
- Context: ${context}
${previousInteraction ? `- Previous Interaction: ${previousInteraction}` : ""}
${cta ? `- Call to Action: ${cta}` : ""}
${templateStyle ? `- Template Style: ${templateStyle}` : ""}
- Tone: ${tone}
- Language: ${language}

### Template Style Rules:
- Standard: Traditional follow-up format, clear subject, greeting, and closing.
- Minimalist: Extremely brief, skips fluff, straight to the point.
- Creative: Conversational, adds warmth or unique phrasing to engage.

Instructions:
- Entire email MUST be in ${language}.
- Include a subject line and a greeting.
- Make it sound natural, not robotic.
- Apply the chosen Template Style strictly in tone and structure.
`;

    const versionAPrompt = `${basePrompt}
### Version A:
- Short and concise follow-up.
- Emphasize professionalism and directness.
`;

    const versionBPrompt = `${basePrompt}
### Version B:
- Add a more engaging or creative twist.
- Use light personalization to make it relatable.
`;

    // Generate A
    const completionA = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an expert email follow-up copywriter." },
        { role: "user", content: versionAPrompt },
      ],
      temperature: 0.7,
    });

    // Generate B
    const completionB = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an expert email follow-up copywriter." },
        { role: "user", content: versionBPrompt },
      ],
      temperature: 0.7,
    });

    const outputA =
      completionA.choices[0].message?.content || "Failed to generate Version A.";
    const outputB =
      completionB.choices[0].message?.content || "Failed to generate Version B.";

    return NextResponse.json({ outputA, outputB });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate follow-up email" },
      { status: 500 }
    );
  }
}
