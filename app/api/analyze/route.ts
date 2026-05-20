import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * GLOBAL SKILLS
 */
const GLOBAL_SKILLS = [
  "React",
  "Next.js",
  "Javascript",
  "Typescript",
  "Node.js",
  "Express",
  "Mongodb",
  "Sql",
  "Postgresql",
  "Firebase",
  "Git",
  "Github",
  "Vercel",
  "Tailwind",
  "Css",
  "Html",
  "Python",
  "Laravel",
  "Go",
  "GraphQL",
  "Excel",
  "Figma",
  "Seo",
  "Shopify",
];

/**
 * CERTIFICATES
 */
const CERTIFICATES = [
  "Udemy",
  "Coursera",
  "Google",
  "Microsoft",
  "AWS",
  "Meta",
  "IBM",
  "LinkedIn",
];

/**
 * EXPERIENCE KEYWORDS
 */
const EXPERIENCE_KEYWORDS = [
  "developer",
  "engineer",
  "specialist",
  "manager",
  "intern",
  "frontend",
  "backend",
  "software",
];

function extractSection(text: string, keywords: string[]) {
  const lines = text.split("\n").map(l => l.trim());

  let isTarget = false;
  const result: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();

    // SECTION START
    if (keywords.some(k => line.includes(k.toLowerCase()))) {
      isTarget = true;
      continue;
    }

    // NEXT SECTION GUARD (stop conditions)
    if (
      isTarget &&
      /^[A-Z\s]{3,}$/.test(lines[i]) && // yeni başlık gibi
      !line.includes("http")
    ) {
      break;
    }

    if (isTarget && lines[i].length > 0) {
      result.push(lines[i]);
    }
  }

  return result;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const text = body?.text || "";
    const jobDescription = body?.jobDescription || "";

    if (!text || text.trim().length < 20) {
      return NextResponse.json(
        { success: false, error: "No valid CV text found" },
        { status: 400 }
      );
    }

    const clean = text.toLowerCase().replace(/\s+/g, " ");
    const job = jobDescription.toLowerCase();

    /**
     * =========================
     * ROLE DETECTION
     * =========================
     */
    let role = "General Professional";

    if (clean.includes("react") || clean.includes("frontend")) {
      role = "Frontend Developer";
    } else if (clean.includes("hr") || clean.includes("recruitment")) {
      role = "HR Specialist";
    } else if (clean.includes("figma") || clean.includes("designer")) {
      role = "Designer";
    } else if (clean.includes("seo") || clean.includes("marketing")) {
      role = "Marketing Specialist";
    }

    /**
     * =========================
     * 🔥 FIXED EXPERIENCE LOGIC
     * =========================
     */

    const years = clean.match(/\b(20\d{2}|19\d{2})\b/g)?.map(Number) || [];

    let experienceYears = 0;

    if (years.length >= 2) {
      const sorted = [...new Set(years)].sort((a, b) => a - b);

      const diff = sorted[sorted.length - 1] - sorted[0];

      // 🚨 HARD CLAMP (CRITICAL FIX)
      if (diff >= 0 && diff <= 10) {
        experienceYears = diff;
      } else {
        experienceYears = 0;
      }
    }

    /**
     * fallback (VERY IMPORTANT)
     */
    if (experienceYears === 0) {
      const keywordHits = EXPERIENCE_KEYWORDS.filter((k) =>
        clean.includes(k)
      ).length;

      if (keywordHits >= 6) experienceYears = 4;
      else if (keywordHits >= 3) experienceYears = 2;
      else if (keywordHits >= 1) experienceYears = 1;
    }

    /**
     * =========================
     * SENIORITY
     * =========================
     */
    let seniority = "Junior";

    if (experienceYears >= 5) seniority = "Senior";
    else if (experienceYears >= 2) seniority = "Mid-Level";

    /**
     * =========================
     * COMPANY COUNT (FIXED)
     * =========================
     */
    const companyCount = (
      clean.match(/\b(company|ltd|inc|a\.s\.|corp|co\.)\b/g) || []
    ).length;

    /**
     * =========================
     * SKILLS
     * =========================
     */
    const skills = [...new Set(
      GLOBAL_SKILLS.filter((s) =>
        clean.includes(s.toLowerCase())
      )
    )];

    /**
     * =========================
     * 🔥 FIXED CERTIFICATES (IMPORTANT FIX)
     * =========================
     *
     * OLD PROBLEM:
     * only "certification section split" → often empty
     *
     * NEW:
     * full text scan + flexible match
     */
const certificateSection = extractSection(text, [
  "certificates",
  "certificate",
  "sertifikalar",
  "sertifikalarım",
  "certifications",
]);

const certificates = [
  ...new Set(
    certificateSection
      .join(" ")
      .split(/[,•\-\n]/)
      .map((c) => c.trim())
      .filter((c) =>
        c.length > 2 &&
        CERTIFICATES.some((db) =>
          c.toLowerCase().includes(db.toLowerCase())
        )
      )
  ),
];


    /**
     * =========================
     * SCORE
     * =========================
     */
    let score = 40;
    score += skills.length * 4;
    score += certificates.length * 4;
    score += experienceYears * 2;

    if (clean.length > 1500) score += 10;
    if (job.length > 10) score += 10;

    if (score > 98) score = 98;

    /**
     * JOB MATCH
     */
    let jobMatchScore = 0;

    if (job.length > 10) {
      const matched = skills.filter((s) =>
        job.includes(s.toLowerCase())
      );

      jobMatchScore = Math.round(
        (matched.length / Math.max(1, skills.length)) * 100
      );
    }

    /**
     * SUMMARY
     */
    let summary =
      score >= 85
        ? "Excellent ATS-compatible CV with strong indicators."
        : score >= 70
        ? "Good CV with solid structure."
        : "CV needs improvement.";

    /**
     * STRENGTHS
     */
    const strengths: string[] = [];

    if (skills.length >= 5) strengths.push("Strong skill set");
    if (certificates.length > 0) strengths.push("Certificates detected");
    if (experienceYears >= 2) strengths.push("Professional experience detected");

    /**
     * WEAKNESSES
     */
    const weaknesses: string[] = [];

    if (skills.length < 4) weaknesses.push("Limited skills coverage");
    if (certificates.length === 0) weaknesses.push("No certificates detected");
    if (experienceYears === 0) weaknesses.push("Experience unclear");

    /**
     * FINAL RESULT
     */
    return NextResponse.json({
      success: true,
      result: {
        role,
        seniority,
        experienceYears,
        companyCount,
        score,
        jobMatchScore,
        skills,
        certificates,
        summary,
        strengths,
        weaknesses,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}