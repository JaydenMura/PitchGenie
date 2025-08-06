import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const {
      clientName,
      company,
      project,
      details,
      tone,
      language,
      deliverables,
      timeline,
      pricing,
      goal,
      cta,
      proposalType,
      industry,
      templateStyle,
    } = await req.json();

    if (!clientName || !company || !project || !details) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Dynamic Template Style Instructions
    let templateInstruction = "";
    switch (templateStyle) {
      case "Minimalist":
        templateInstruction = `Keep it concise. Use bullet points, short sentences, and a clean, simple structure. Avoid long paragraphs.`;
        break;
      case "Creative":
        templateInstruction = `Be engaging and persuasive. Add storytelling elements, attention-grabbing language, and use markdown headings for emphasis. Make it visually appealing.`;
        break;
      default: // Standard
        templateInstruction = `Follow a formal, professional structure with clear headings and detailed explanations.`;
    }

    const basePrompt = `
You are an expert business proposal writer.
Write a compelling proposal for the following project:

Client: ${clientName}
Company: ${company}
Project: ${project}
Details: ${details}

Tone: ${tone}
Language: ${language}
${deliverables ? `Deliverables: ${deliverables}` : ""}
${timeline ? `Timeline: ${timeline}` : ""}
${pricing ? `Pricing: ${pricing}` : ""}
${goal ? `Goal: ${goal}` : ""}
${cta ? `Call-to-Action: ${cta}` : ""}
Proposal Type: ${proposalType || "General"}
Industry: ${industry || "General"}
Template Style: ${templateStyle || "Standard"}

IMPORTANT:
- Write ONLY in ${language}.
- Apply the chosen Template Style: ${templateInstruction}
- Include the following sections: Introduction, Deliverables, Timeline, Pricing, and CTA.
`;

    // Version A
    const completionA = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: `${basePrompt}\n\nGenerate Version A.` }],
      temperature: 0.7,
    });

    const outputA = completionA.choices[0].message?.content || "Failed to generate Version A.";

    // Version B
    const completionB = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: `${basePrompt}\n\nGenerate Version B with noticeable variation.` }],
      temperature: 0.9,
    });

    const outputB = completionB.choices[0].message?.content || "Failed to generate Version B.";

    return NextResponse.json({ outputA, outputB });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate proposals" },
      { status: 500 }
    );
  }
}
