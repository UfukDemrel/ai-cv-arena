const ROLE_PATTERNS = [
  "frontend developer",
  "backend developer",
  "software engineer",
  "qa engineer",
  "developer",
  "engineer",
  "manager",
  "specialist",
  "intern",
  "tester"
];

const INVALID_COMPANIES = [
  "istanbul",
  "ankara",
  "adana",
  "turkey",
  "javascript",
  "typescript",
  "react",
  "next",
  "product manager",
  "intern"
];

export function extractCompanies(text: string) {
  const companies: string[] = [];

  const regex =
    /\(([^()]{2,40})\)/g;

  const matches = [...text.matchAll(regex)];

  for (const match of matches) {
    const company = match[1]?.trim();

    if (!company) continue;

    if (
      company.length < 2 ||
      company.length > 40
    ) continue;

    companies.push(company);
  }

  return [...new Set(companies)];
}