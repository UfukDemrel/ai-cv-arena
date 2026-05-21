import { detectRole } from "./roleDetector";
import { calculateSeniority } from "@/lib/cv/seniority";

export function analyzeCV(data: any, job: string) {
  const jobLower = job.toLowerCase();

  const role = detectRole(JSON.stringify(data), data.skills);

  /**
   * ✅ SENIORITY FIX (BURASI EKSİKTİ)
   */
  const seniority = calculateSeniority(
    data.experienceYears,
    JSON.stringify(data),
    data.skills.length
  );

  // SCORE
  let score = 40;
  score += data.skills.length * 4;
  score += data.certificates.length * 5;
  score += data.experienceYears * 2;

  score = Math.min(score, 98);

  // JOB MATCH
  let jobMatchScore = 0;

  if (jobLower.length > 5) {
    const matched = data.skills.filter((s: string) =>
      jobLower.includes(s.toLowerCase())
    );

    jobMatchScore = Math.round(
      (matched.length / Math.max(1, data.skills.length)) * 100
    );
  }

  // STRENGTHS
  const strengths: string[] = [];

  if (data.skills.length >= 5) strengths.push("Strong skill set");
  if (data.certificates.length > 0) strengths.push("Has certifications");
  if (data.experienceYears >= 2) strengths.push("Experience present");

  // WEAKNESSES
  const weaknesses: string[] = [];

  if (data.skills.length < 4) weaknesses.push("Weak skill coverage");
  if (data.certificates.length === 0) weaknesses.push("No certifications found");
  if (data.experienceYears === 0) weaknesses.push("No clear experience");

  return {
    role,
    seniority, // 🔥 EKLENDİ
    score,
    jobMatchScore,
    strengths,
    weaknesses,
  };
}