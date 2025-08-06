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
      cta,
      referencePoint,
      templateStyle,
    } = await req.json();

    if (!recipientName || !company || !goal) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    // Construct shared instructions with explicit Template Style rules
    const basePrompt = `
You are an expert cold email copywriter. Write a personalized, engaging cold email based on the details provided.
Make the email professional but attention-grabbing, optimized for high response rates.

Details:
- Recipient Name: ${recipientName}
- Company: ${company}
- Goal: ${goal}
- Tone: ${tone}
- Language: ${language}
${cta ? `- Call to Action: ${cta}` : ""}
${referencePoint ? `- Reference Point: ${referencePoint}` : ""}
${templateStyle ? `- Template Style: ${templateStyle}` : ""}

### Template Style Rules:
- Standard: Professional tone, clear structure with subject line, greeting, body, and CTA.
- Minimalist: Very short, bullet points where possible, no fluff, straight to value.
- Creative: Add storytelling, engaging hooks, and persuasive tone while remaining natural.

Instructions:
- Entire email MUST be in ${language}.
- Follow proper email etiquette.
- Include subject line and appropriate greeting.
- Keep it natural, avoid spammy tone.
- Apply the chosen Template Style strictly to structure and tone.
`;

    const versionAPrompt = `${basePrompt}
### Version A:
- Focus on clarity and direct value proposition.
- Make it short and precise.
`;

    const versionBPrompt = `${basePrompt}
### Version B:
- Add a creative or persuasive twist.
- Include a subtle personalization hook.
`;

    // Generate both versions
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a skilled cold email copywriter." },
        { role: "user", content: versionAPrompt },
      ],
      temperature: 0.7,
    });

    const completionB = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a skilled cold email copywriter." },
        { role: "user", content: versionBPrompt },
      ],
      temperature: 0.7,
    });

    const outputA =
      completion.choices[0].message?.content || "Failed to generate Version A.";
    const outputB =
      completionB.choices[0].message?.content || "Failed to generate Version B.";

    return NextResponse.json({ outputA, outputB });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate cold email" },
      { status: 500 }
    );
  }
}
