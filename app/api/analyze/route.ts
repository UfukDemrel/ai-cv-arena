import { NextRequest, NextResponse } from "next/server";
import { parseCV } from "@/lib/cv/parser";
import { analyzeCV } from "@/lib/cv/analyzer";
import { openai } from "@/lib/openai";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    /**
     * BODY
     */
    const body = await req.json();

    const rawText = body?.text || "";
    const job = body?.jobDescription || "";

    if (!rawText || rawText.trim().length < 10) {
      return NextResponse.json(
        {
          success: false,
          error: "No CV text provided",
        },
        { status: 400 }
      );
    }

    /**
     * =========================
     * PARSE CV
     * =========================
     */
    const parsed = parseCV(rawText);

    /**
     * =========================
     * AI EXTRACTION
     * =========================
     */
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are an ATS resume analyzer.

Return ONLY valid JSON.

Example:
{
  "certificates": [
    "ISTQB Certified Tester Foundation Level"
  ],
  "role": "Frontend Developer",
  "seniority": "Mid-Level"
}
`
        },
        {
          role: "user",
          content: `
Analyze this CV:

${rawText}

Extract:
- certificates
- role
- seniority
`
        }
      ],
      temperature: 0.2,
    });

    let aiData: any = {};

    try {
      aiData = JSON.parse(
        aiResponse.choices[0].message.content || "{}"
      );
    } catch {
      aiData = {};
    }

    /**
     * =========================
     * ANALYSIS
     * =========================
     */
    const analysis = analyzeCV(parsed, job);

    /**
     * =========================
     * RESPONSE
     * =========================
     */
    return NextResponse.json({
      success: true,
      result: {
        ...parsed,
        ...analysis,

        certificates: aiData?.certificates || [],

        role:
          aiData?.role ||
          analysis?.role ||
          "Unknown",

        seniority:
          aiData?.seniority ||
          analysis?.seniority ||
          "Junior",
      },
    });

  } catch (err: any) {
    console.error("CV ANALYSIS ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        error: err?.message || "Server error",
      },
      { status: 500 }
    );
  }
}