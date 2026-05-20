import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * GLOBAL SKILL DATABASE
 */
const GLOBAL_SKILLS = [
  // software
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
  "Gedux",
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

  // office
  "Excel",
  "Word",
  "Powerpoint",
  "Sap",
  "Erp",

  // design
  "Figma",
  "Photoshop",
  "Illustrator",
  "Canva",
  "Autocad",

  // marketing
  "Seo",
  "Google ads",
  "Meta ads",
  "Social media",

  // hr
  "Recruitment",
  "Human resources",
  "Onboarding",
  "Payroll",

  // ecommerce
  "Shopify",
  "Woocommerce",
  "Wordpress",
  "Ikas",

  // soft skills
  "Leadership",
  "Communication",
  "Teamwork",
  "Problem Solving",
];

/**
 * CERTIFICATES
 */
const CERTIFICATES = [
  "Udemy",
  "Coursera",
  "Google",
  "Microsoft",
  "Aws",
  "Meta",
  "IBM",
  "Linkedin Learning",
];

/**
 * EXPERIENCE KEYWORDS
 */
const EXPERIENCE_KEYWORDS = [
  "Intern",
  "Staj",
  "Developer",
  "Specialist",
  "Manager",
  "Engineer",
  "Assistant",
  "Coordinator",
  "Frontend",
  "Backend",
  "Hr",
  "Software",
  "QA",
  "Product",
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const text = body?.text || "";
    const fileName = body?.fileName || "Unknown CV";
    const jobDescription = body?.jobDescription || "";

    if (!text || text.trim().length < 20) {
      return NextResponse.json(
        {
          success: false,
          error: "No valid CV text found",
        },
        { status: 400 }
      );
    }
    const lowerText = text.toLowerCase();
    const certificationsSection =
      text.split(/certifications|certificates/i)[1] || "";

    const experienceSection =
      text.split(/employment history|experience/i)[1] || "";

    const skillsSection =
      text.split(/skills/i)[1] || "";
    const lowerJob = jobDescription.toLowerCase();

    /**
     * ROLE DETECTION
     */
    let role = "General Professional";

    if (
      lowerText.includes("frontend") ||
      lowerText.includes("react")
    ) {
      role = "Frontend Developer";
    } else if (
      lowerText.includes("human resources") ||
      lowerText.includes("recruitment")
    ) {
      role = "HR Specialist";
    } else if (
      lowerText.includes("designer") ||
      lowerText.includes("figma")
    ) {
      role = "Designer";
    } else if (
      lowerText.includes("marketing") ||
      lowerText.includes("seo")
    ) {
      role = "Marketing Specialist";
    }

    /**
     * EXPERIENCE DETECTION
     */
    /**
     * EXPERIENCE DETECTION
     */

    const experienceYearsRegex =
      experienceSection.match(/20\d{2}/g) || [];

    const experienceYearsUnique = [
      ...new Set(experienceYearsRegex),
    ]
      .map(Number)
      .sort();

    let experienceYears = 0;

    if (experienceYearsUnique.length >= 2) {
      const minYear = Math.min(...experienceYearsUnique);
      const maxYear = Math.max(...experienceYearsUnique);

      experienceYears = maxYear - minYear;

      if (experienceYears > 15) {
        experienceYears = 3;
      }
    }

    /**
     * SENIORITY
     */
    let seniority = "Junior";

    if (experienceYears >= 5) {
      seniority = "Senior";
    } else if (experienceYears >= 2) {
      seniority = "Mid-Level";
    }

    /**
     * COMPANY EXPERIENCE
     */
    const companyMatches =
      experienceSection.match(/\((.*?)\)/g) || [];

    const companyCount = companyMatches.length;

    /**
     * SKILL EXTRACTION
     */
    const skills = GLOBAL_SKILLS.filter((skill) =>
      lowerText.includes(skill.toLowerCase())
    );

    /**
     * CERTIFICATE DETECTION
     */
    const certificates = CERTIFICATES.filter((cert) =>
      certificationsSection
        .toLowerCase()
        .includes(cert.toLowerCase())
    );

    /**
     * MISSING SKILLS
     */
    let missingSkills: string[] = [];

    if (jobDescription.length > 10) {
      missingSkills = GLOBAL_SKILLS.filter(
        (skill) =>
          lowerJob.includes(skill.toLowerCase()) &&
          !skills.includes(skill)
      );
    } else {
      missingSkills = GLOBAL_SKILLS.filter(
        (skill) => !skills.includes(skill)
      ).slice(0, 8);
    }

    /**
     * ATS SCORE
     */
    let score = 40;

    score += skills.length * 4;
    score += certificates.length * 3;
    score += experienceYears * 2;

    if (text.length > 1500) {
      score += 10;
    }

    if (jobDescription.length > 10) {
      score += 10;
    }

    if (score > 98) score = 98;

    /**
     * JOB MATCH SCORE
     */
    let jobMatchScore = 0;

    if (jobDescription.length > 10) {
      const matchedSkills = skills.filter((skill) =>
        lowerJob.includes(skill.toLowerCase())
      );

      jobMatchScore = Math.round(
        (matchedSkills.length /
          Math.max(
            1,
            missingSkills.length + matchedSkills.length
          )) * 100
      );
    }

    /**
     * SUMMARY
     */
    let summary = "";

    if (score >= 85) {
      summary =
        "Excellent ATS-compatible CV with strong professional and technical indicators.";
    } else if (score >= 70) {
      summary =
        "Well-structured CV with good skill coverage and professional experience.";
    } else {
      summary =
        "CV has potential but requires improvements in structure, skills, or keyword optimization.";
    }

    /**
     * STRENGTHS
     */
    const strengths: string[] = [];

    if (skills.length >= 5) {
      strengths.push("Strong skill diversity");
    }

    if (certificates.length > 0) {
      strengths.push("Certificate presence detected");
    }

    if (text.length > 2000) {
      strengths.push("Detailed professional background");
    }

    if (jobMatchScore >= 70) {
      strengths.push("High job description compatibility");
    }

    if (experienceYears >= 3) {
      strengths.push("Professional experience detected");
    }

    if (companyCount >= 2) {
      strengths.push("Multiple company experiences");
    }

    /**
     * WEAKNESSES
     */
    const weaknesses: string[] = [];

    if (missingSkills.length >= 5) {
      weaknesses.push("Important skills appear missing");
    }

    if (certificates.length === 0) {
      weaknesses.push("No certificates detected");
    }

    if (text.length < 1000) {
      weaknesses.push("CV content appears too short");
    }

    if (experienceYears <= 1) {
      weaknesses.push("Limited professional experience");
    }

    /**
     * FINAL RESULT
     */
    const result = {
      role,
      seniority,
      experienceYears,
      companyCount,

      score,
      jobMatchScore,

      skills,
      missingSkills,
      certificates,

      summary,

      strengths,
      weaknesses,
    };

    return NextResponse.json({
      success: true,
      fileName,
      result,
    });

  } catch (err: any) {
    console.error("ANALYZE ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        error: err?.message || "Unexpected server error",
      },
      { status: 500 }
    );
  }
}