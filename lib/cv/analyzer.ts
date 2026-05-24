import { detectRole } from "./roleDetector";
import { calculateSeniority } from "@/lib/cv/seniority";

const JOB_SKILLS = [
  "react",
  "next.js",
  "typescript",
  "javascript",
  "node.js",
  "express",
  "nestjs",
  "mongodb",
  "postgresql",
  "mysql",
  "docker",
  "aws",
  "azure",
  "kubernetes",
  "tailwind",
  "redux",
  "graphql",
  "firebase",
  "python",
  "java",
  "c#",
  ".net",
  "git"
];

export function analyzeCV(data: any, job: string) {

  const jobLower = job.toLowerCase();

  /**
   * ROLE DETECTION
   */
  const role = detectRole(
    JSON.stringify(data),
    data.skills
  );

  /**
   * SENIORITY
   */
  const seniority = calculateSeniority(
    data.experienceYears,
    JSON.stringify(data),
    data.skills.length
  );

  /**
   * ATS SCORE
   */
  let score = 40;

  score += data.skills.length * 4;
  score += data.certificates.length * 5;
  score += data.experienceYears * 2;

  score = Math.min(score, 98);

  /**
   * =========================
   * JOB MATCH
   * =========================
   */

  const requiredSkills = JOB_SKILLS.filter(skill =>
    jobLower.includes(skill.toLowerCase())
  );

  const matchedSkills = requiredSkills.filter(skill =>
    data.skills.some(
      (s: string) =>
        s.toLowerCase() === skill.toLowerCase()
    )
  );

  const missingSkills = requiredSkills.filter(skill =>
    !data.skills.some(
      (s: string) =>
        s.toLowerCase() === skill.toLowerCase()
    )
  );

  let jobMatchScore = 0;

  if (requiredSkills.length > 0) {
    jobMatchScore = Math.round(
      (matchedSkills.length / requiredSkills.length) * 100
    );
  }

  /**
   * =========================
   * STRENGTHS
   * =========================
   */

  const strengths: string[] = [];

  if (data.skills.length >= 5) {
    strengths.push("Strong technical skill coverage");
  }

  if (data.certificates.length > 0) {
    strengths.push("Has certifications");
  }

  if (data.experienceYears >= 2) {
    strengths.push("Experience level is solid");
  }

  if (matchedSkills.length >= 3) {
    strengths.push("Good match with job requirements");
  }

  /**
   * =========================
   * WEAKNESSES
   * =========================
   */

  const weaknesses: string[] = [];

  if (data.skills.length < 4) {
    weaknesses.push("Weak skill coverage");
  }

  if (data.certificates.length === 0) {
    weaknesses.push("No certifications found");
  }

  if (data.experienceYears === 0) {
    weaknesses.push("No clear experience detected");
  }

  if (missingSkills.length >= 3) {
    weaknesses.push("Several required job skills are missing");
  }

  /**
   * =========================
   * AI SUGGESTIONS
   * =========================
   */

  const suggestions: string[] = [];

  if (missingSkills.includes("docker")) {
    suggestions.push(
      "Adding Docker experience could improve ATS ranking."
    );
  }

  if (missingSkills.includes("aws")) {
    suggestions.push(
      "Cloud technologies like AWS are missing."
    );
  }

  if (missingSkills.includes("typescript")) {
    suggestions.push(
      "TypeScript knowledge is highly recommended for this role."
    );
  }

  if (data.experienceYears < 2) {
    suggestions.push(
      "Adding more real-world project experience may strengthen the CV."
    );
  }

  if (data.certificates.length === 0) {
    suggestions.push(
      "Including certifications could improve credibility."
    );
  }

  if (suggestions.length === 0) {
    suggestions.push(
      "CV looks well-optimized for ATS systems."
    );
  }

  /**
   * =========================
   * RETURN
   * =========================
   */

  return {
    role,
    seniority,
    score,
    jobMatchScore,

    matchedSkills,
    missingSkills,

    strengths,
    weaknesses,
    suggestions,
  };
}