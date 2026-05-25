import { NextRequest, NextResponse } from "next/server";
import { parseCV } from "@/lib/cv/parser";
import { analyzeCV } from "@/lib/cv/analyzer";
import { openai } from "@/lib/openai";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {

    /**
     * =========================
     * BODY
     * =========================
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
     * AI IMPROVEMENTS
     * =========================
     */
    const improvementsResponse =
      await openai.chat.completions.create({
        model: "gpt-4o-mini",

        messages: [
          {
            role: "system",
            content: `
You are an ATS resume improvement expert.

Return ONLY valid JSON.

Example:
{
  "suggestions": [
    "Add measurable achievements.",
    "Include more ATS keywords."
  ]
}
`
          },
          {
            role: "user",
            content: `
Analyze this resume and provide ATS improvement suggestions.

Resume:

${rawText}
`
          }
        ],

        temperature: 0.3,
      });

    let improvementData: any = {};

    try {
      improvementData = JSON.parse(
        improvementsResponse.choices[0].message.content || "{}"
      );
    } catch {
      improvementData = {};
    }

    /**
     * =========================
     * AI SUMMARY
     * =========================
     */
    const summaryResponse =
      await openai.chat.completions.create({
        model: "gpt-4o-mini",

        messages: [
          {
            role: "system",
            content: `
You are a professional ATS resume analyzer.

Write a short professional summary for this CV.

Rules:
- max 3 sentences
- professional tone
- mention strongest technologies
- mention experience level
- mention strongest side of the candidate
`
          },
          {
            role: "user",
            content: rawText
          }
        ],

        temperature: 0.4,
      });

    const aiSummary =
      summaryResponse.choices[0].message.content || "";

    /**
     * =========================
     * ANALYSIS
     * =========================
     */
    const analysis = analyzeCV(parsed, job);

    /**
 * FIX WEAKNESSES
 */
    const fixedWeaknesses = (analysis?.weaknesses || []).filter(
      (w: string) => {
        if (
          aiData?.certificates?.length > 0 &&
          w === "No certifications found"
        ) {
          return false;
        }

        return true;
      }
    );

    /**
     * =========================
     * SAFE FALLBACKS
     * =========================
     */
    const safeCertificates =
      Array.isArray(aiData?.certificates) &&
        aiData.certificates.length > 0
        ? aiData.certificates
        : parsed?.certificates || [];

    const safeSuggestions =
      Array.isArray(improvementData?.suggestions) &&
        improvementData.suggestions.length > 0
        ? improvementData.suggestions
        : analysis?.suggestions || [];

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
        summary: aiSummary,
        weaknesses: fixedWeaknesses,
        certificates: safeCertificates,
        suggestions: safeSuggestions,
        role:
          aiData?.role ||
          analysis?.role ||
          "Unknown",
        seniority:
          aiData?.seniority ||
          analysis?.seniority ||
          "Junior",
        ai: {
          certificates: safeCertificates,
          role:
            aiData?.role || "",
          seniority:
            aiData?.seniority || "",
          suggestions: safeSuggestions
        }
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