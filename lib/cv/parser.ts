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

const CERT_KEYWORDS = [
  "certification", "certificate", "certified",
  "course", "training", "bootcamp",
  "udemy", "coursera", "aws", "google", "microsoft", "ibm", "linkedin"
];

/**
 * =========================
 * CAREER INSIGHTS (NEW)
 * =========================
 */

function getCareerInsights(text: string) {
  const lower = text.toLowerCase();

  /**
   * ROLE DETECTION (daha güçlü)
   */
  const roleMap = [
    { key: "qa", value: "QA Engineer" },
    { key: "frontend", value: "Frontend Developer" },
    { key: "backend", value: "Backend Developer" },
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
   * EXPERIENCE LEVEL (gerçek sinyal)
   * - "present", "junior", "senior" kelimeleri önemli
   */
  let level = "Junior";

  if (lower.includes("senior") || lower.includes("sr")) {
    level = "Senior";
  } else if (lower.includes("mid") || lower.includes("intermediate")) {
    level = "Mid";
  } else if (lower.includes("junior") || lower.includes("intern")) {
    level = "Junior";
  }

  /**
   * fallback: experience pattern varsa güçlendir
   */
  const experienceBlocks =
    text.match(/20\d{2}\s*[-–]\s*(20\d{2}|present|current)/gi) || [];

  if (experienceBlocks.length >= 3 && level === "Mid-Level") {
    level = "Mid";
  }

  if (experienceBlocks.length >= 5) {
    level = "Senior";
  }

  /**
   * DOMAIN DETECTION (daha net)
   */
  let domain = "General Development";

  if (lower.includes("qa")) domain = "Quality Assurance";
  else if (lower.includes("react") || lower.includes("frontend"))
    domain = "Frontend Development";
  else if (lower.includes("node") || lower.includes("backend"))
    domain = "Backend Development";
  else if (lower.includes("aws") || lower.includes("docker"))
    domain = "DevOps / Cloud";

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

  const ranges = text.match(/(20\d{2})\s*[-–]\s*(20\d{2}|present|current)/gi);

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

function extractCertificates(text: string, lines: string[]) {
  const certs: string[] = [];
  const lower = text.toLowerCase();

  const certIndex = lower.indexOf("cert");

  if (certIndex !== -1) {
    const block = text.slice(certIndex, certIndex + 800);
    const parts = block.split(/\n|•|-|\||,/g);

    for (const p of parts) {
      const cleaned = p.trim();

      if (
        cleaned.length > 3 &&
        cleaned.length < 80 &&
        !cleaned.toLowerCase().includes("skills") &&
        !cleaned.toLowerCase().includes("experience") &&
        !cleaned.toLowerCase().includes("education")
      ) {
        certs.push(cleaned);
      }
    }
  }

  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    if (CERT_KEYWORDS.some(k => lowerLine.includes(k))) {
      const cleaned = line.trim();

      if (cleaned.length > 3 && cleaned.length < 80) {
        certs.push(cleaned);
      }
    }
  }

  return [...new Set(certs)];
}

/**
 * =========================
 * MAIN PARSER
 * =========================
 */

export function parseCV(rawText: string) {
  const text = normalize(rawText);
  const clean = text.toLowerCase();
  const lines = splitLines(text);

  /**
   * SKILLS
   */
  const skills = [
    ...new Set(
      GLOBAL_SKILLS.filter(s => clean.includes(s.toLowerCase()))
    )
  ];

  /**
   * EXPERIENCE
   */
  const experienceYears = extractExperienceYears(text);

  /**
   * CERTIFICATES
   */
  const certificates = extractCertificates(text, lines);

  /**
   * CAREER INSIGHTS (NEW UI FRIENDLY DATA)
   */
  const careerInsights = getCareerInsights(text);

  return {
    skills,
    certificates,
    experienceYears,
    careerInsights
  };
}