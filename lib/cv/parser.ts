/**
 * =========================
 * CONSTANTS
 * =========================
 */

const GLOBAL_SKILLS = [
  "react", "next.js", "vue", "nuxt", "angular", "svelte", "astro",
  "html", "css", "sass", "scss", "tailwind", "bootstrap",

  "node.js", "express", "nestjs", "django", "flask",
  "spring", "laravel", "asp.net", ".net",

  "javascript", "typescript", "python", "java", "c#", "go", "php",

  "sql", "mysql", "postgresql", "mongodb", "firebase", "redis",

  "docker", "kubernetes", "aws", "azure", "gcp",
  "git", "github", "figma", "seo", "shopify"
];

const EXPERIENCE_KEYWORDS = [
  "developer", "engineer", "specialist", "manager",
  "intern", "frontend", "backend", "software", "qa"
];

/**
 * =========================
 * CAREER INSIGHTS
 * =========================
 */

function getCareerInsights(text: string) {
  const lower = text.toLowerCase();
  const experienceYears = extractExperienceYears(text);

  /**
   * ROLE DETECTION
   */
  const roleMap = [
    { key: "qa engineer", value: "QA Engineer" },
    { key: "frontend developer", value: "Frontend Developer" },
    { key: "backend developer", value: "Backend Developer" },
    { key: "full stack", value: "Full Stack Developer" },
    { key: "software engineer", value: "Software Engineer" },
    { key: "developer", value: "Developer" }
  ];

  let topRole = "Unknown";

  for (const r of roleMap) {
    if (lower.includes(r.key)) {
      topRole = r.value;
      break;
    }
  }

  /**
   * LEVEL DETECTION
   */
  let level = "Junior";

  if (experienceYears >= 5) {
    level = "Senior";
  } else if (experienceYears >= 3) {
    level = "Mid-Level";
  }

  // explicit override
  if (lower.includes("senior")) {
    level = "Senior";
  } else if (
    lower.includes("mid-level") ||
    lower.includes("mid level")
  ) {
    level = "Mid-Level";
  }

  /**
   * DOMAIN DETECTION
   */
  let domain = "General Development";

  if (lower.includes("qa")) {
    domain = "Quality Assurance";
  } else if (
    lower.includes("react") ||
    lower.includes("frontend")
  ) {
    domain = "Frontend Development";
  } else if (
    lower.includes("node") ||
    lower.includes("backend")
  ) {
    domain = "Backend Development";
  } else if (
    lower.includes("aws") ||
    lower.includes("docker")
  ) {
    domain = "DevOps / Cloud";
  }

  return {
    topRole,
    level,
    domain
  };
}

/**
 * =========================
 * HELPERS
 * =========================
 */

function normalize(text: string) {
  return text
    .replace(/\u0000/g, "")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

function splitLines(text: string) {
  return text
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);
}

/**
 * =========================
 * EXPERIENCE ENGINE
 * =========================
 */

function extractExperienceYears(text: string) {
  const lower = text.toLowerCase();
  let total = 0;

  const ranges = text.match(
    /(20\d{2})\s*[-–]\s*(20\d{2}|present|current)/gi
  );

  if (ranges) {
    for (const r of ranges) {
      const years = r.match(/20\d{2}/g);

      if (years && years.length === 2) {
        const start = Number(years[0]);
        const end = Number(years[1]);

        if (end > start && end - start <= 50) {
          total += end - start;
        }
      } else if (r.toLowerCase().includes("present")) {
        const start = Number(years?.[0]);

        if (start) {
          total += new Date().getFullYear() - start;
        }
      }
    }
  }

  const jobHits = EXPERIENCE_KEYWORDS.filter(k =>
    lower.includes(k)
  ).length;

  let estimated = 0;

  if (jobHits >= 6) estimated = 5;
  else if (jobHits >= 4) estimated = 3;
  else if (jobHits >= 2) estimated = 2;
  else if (jobHits >= 1) estimated = 1;

  return Math.min(Math.max(total, estimated), 40);
}

/**
 * =========================
 * CERTIFICATES
 * =========================
 */

function extractCertificates(text: string) {
  const lines = splitLines(text);

  const certs: string[] = [];

  const certKeywords = [
    "certification",
    "certifications",
    "certificate",
    "certificates",
    "certified",
    "course",
    "courses",
    "bootcamp",
    "training"
  ];

  const stopKeywords = [
    "experience",
    "education",
    "skills",
    "projects",
    "languages",
    "summary",
    "profile"
  ];

  let insideCertSection = false;

  for (const line of lines) {
    const lower = line.toLowerCase();

    /**
     * SECTION START
     */
    if (
      certKeywords.some(k => lower.includes(k))
    ) {
      insideCertSection = true;

      // section title'ı ekleme
      if (
        lower === "certifications" ||
        lower === "certificates"
      ) {
        continue;
      }
    }

    /**
     * EXIT SECTION
     */
    if (
      insideCertSection &&
      stopKeywords.some(k => lower.includes(k))
    ) {
      break;
    }

    if (!insideCertSection) continue;

    /**
     * CLEAN CERTIFICATE LINE
     */
    const isValid =
      line.length > 5 &&
      line.length < 120 &&
      !line.includes("@") &&
      !line.includes("linkedin.com") &&
      !line.includes("github.com");

    if (isValid) {
      certs.push(line);
    }
  }

  return [...new Set(certs)].slice(0, 10);
}

/**
 * =========================
 * MAIN PARSER
 * =========================
 */

export function parseCV(rawText: string) {
  const text = normalize(rawText);
  const clean = text.toLowerCase();

  /**
   * SKILLS
   */
  const skills = [
    ...new Set(
      GLOBAL_SKILLS.filter(s =>
        clean.includes(s.toLowerCase())
      )
    )
  ];

  /**
   * EXPERIENCE
   */
  const experienceYears = extractExperienceYears(text);

  /**
   * CERTIFICATES
   */
  const certificates = extractCertificates(text);

  /**
   * CAREER INSIGHTS
   */
  const careerInsights = getCareerInsights(text);

  return {
    skills,
    certificates,
    experienceYears,
    careerInsights
  };
}