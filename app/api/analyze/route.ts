import { NextRequest, NextResponse } from "next/server";
import { parseCV } from "@/lib/cv/parser";
import { analyzeCV } from "@/lib/cv/analyzer";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const rawText = body?.text || "";
    const job = body?.jobDescription || "";

    if (!rawText || rawText.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: "No CV text provided" },
        { status: 400 }
      );
    }

    /**
     * 1. PARSE CV (SECTION SPLITTING)
     * - skills
     * - experience
     * - education
     * - certifications
     * - hobbies
     */
    const parsed = parseCV(rawText);

    console.log("=== PARSED CV ===");
    console.log(parsed);

    /**
     * 2. ANALYZE CV (SMART LOGIC)
     * - role detection
     * - seniority
     * - experience years
     * - scoring
     */
    const analysis = analyzeCV(parsed, job);

    console.log("=== ANALYSIS ===");
    console.log(analysis);

    /**
     * 3. RESPONSE
     */
    return NextResponse.json({
      success: true,
      result: {
        ...parsed,
        ...analysis,
      },
    });

  } catch (err: any) {
    console.error("CV ANALYSIS ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        error: err.message || "Server error",
      },
      { status: 500 }
    );
  }
}