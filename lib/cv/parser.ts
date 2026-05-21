import { extractCompanies } from "./companyExtractor";

/**
 * =========================
 * SKILLS
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

/**
 * =========================
 * EXPERIENCE KEYWORDS
 * =========================
 */
const EXPERIENCE_KEYWORDS = [
  "developer", "engineer", "specialist", "manager",
  "intern", "frontend", "backend", "software"
];

/**
 * =========================
 * CERT KEYWORDS
 * =========================
 */
const CERT_KEYWORDS = [
  "certification", "certificate", "certified",
  "course", "training", "bootcamp",
  "udemy", "coursera", "aws", "google", "microsoft", "ibm", "linkedin"
];

/**
 * =========================
 * NORMALIZE
 * =========================
 */
function normalize(text: string) {
  return text
    .replace(/\u0000/g, "")
    .replace(/\r/g, "\n")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * =========================
 * SMART SPLIT
 * =========================
 */
function smartSplit(text: string) {
  return text
    .split(/\n|•|–|-|\||,/g)
    .map(t => t.trim())
    .filter(Boolean);
}

/**
 * =========================
 * EXPERIENCE ENGINE (FIXED)
 * =========================
 */
function extractExperienceYears(text: string) {
  const lower = text.toLowerCase();

  let total = 0;

  /**
   * 1. SADECE WORK EXPERIENCE RANGE'LERİ
   * 2020 - 2023 / 2020–Present gibi
   */
  const ranges = text.match(
    /(20\d{2})\s*[-–]\s*(20\d{2}|present|current)/gi
  );

  if (ranges) {
    for (const r of ranges) {
      const years = r.match(/20\d{2}/g);

      if (years && years.length === 2) {
        const start = Number(years[0]);
        const end = Number(years[1]);

        if (end > start && end - start <= 20) {
          total += end - start;
        }
      } else if (r.toLowerCase().includes("present")) {
        const start = Number(years?.[0]);
        if (start) {
          const now = new Date().getFullYear();
          total += now - start;
        }
      }
    }
  }

  /**
   * 2. JOB TITLE HEURISTIC (backup)
   */
  const jobHits = [
    "developer",
    "engineer",
    "specialist",
    "intern",
    "manager",
    "frontend",
    "backend"
  ].filter(k => lower.includes(k)).length;

  let estimated = 0;

  if (jobHits >= 6) estimated = 5;
  else if (jobHits >= 4) estimated = 3;
  else if (jobHits >= 2) estimated = 2;
  else if (jobHits >= 1) estimated = 1;

  /**
   * 3. FINAL FIX (IMPORTANT)
   * - MAX değil SUM değil → "en mantıklı" olanı al
   */
  const final = Math.max(total, estimated);

  /**
   * 4. SAFETY LIMIT
   */
  return Math.min(final, 40);
}

/**
 * =========================
 * CERT EXTRACTION (CLEAN)
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

  // fallback
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
  const lines = smartSplit(text);

  /**
   * COMPANIES
   */
  const companies = extractCompanies(rawText);

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

  return {
    skills,
    certificates,
    experienceYears,
    companies,
    companyCount: companies.length
  };
}