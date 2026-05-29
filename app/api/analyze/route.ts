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
     * AI SALARY ESTIMATION
     * =========================
     */
    const salaryResponse =
      await openai.chat.completions.create({
        model: "gpt-4o-mini",

        messages: [
          {
            role: "system",
            content: `
You are a salary estimation AI for the Turkish software market in 2026.

IMPORTANT:
Use REALISTIC Turkish software salary ranges.

Current estimated monthly salary expectations in Turkey:

- Junior Frontend Developer: 35k - 55k TRY
- Mid Frontend Developer: 60k - 100k TRY
- Senior Frontend Developer: 100k - 180k TRY

- Junior QA Engineer: 35k - 50k TRY
- Mid QA Engineer: 55k - 90k TRY
- Senior QA Engineer: 90k - 160k TRY

- Full Stack Developer: 70k - 150k TRY
- DevOps Engineer: 90k - 180k TRY
- Backend Developer: 65k - 140k TRY

Rules:
- Technologies like React, Next.js, AWS, Docker, Kubernetes, TypeScript increase salary.
- English level and certifications increase salary.
- Strong portfolios increase salary.
- Never return unrealistically low salaries for experienced developers.

Return ONLY valid JSON.

Example:
{
  "minSalary": 70000,
  "maxSalary": 110000,
  "avgSalary": 85000,
  "currency": "TRY",
  "marketLevel": "High"
}

${rawText}
`
          }
        ],

        temperature: 0.4,
      });

    let salaryData: any = {};

    try {
      salaryData = JSON.parse(
        salaryResponse.choices[0].message.content || "{}"
      );
    } catch {
      salaryData = {};
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
     * =========================
     * FIX WEAKNESSES
     * =========================
     */
    const fixedWeaknesses =
      (analysis?.weaknesses || []).filter(
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

        salary: {
          min:
            salaryData?.minSalary || 0,

          max:
            salaryData?.maxSalary || 0,

          avg:
            salaryData?.avgSalary || 0,

          currency:
            salaryData?.currency || "TRY",

          marketLevel:
            salaryData?.marketLevel || "Medium"
        },

        ai: {
          certificates: safeCertificates,

          role:
            aiData?.role || "",

          seniority:
            aiData?.seniority || "",

          suggestions: safeSuggestions,

          salary: salaryData || {}
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