export function calculateSeniority(
  experienceYears: number,
  text: string,
  skillsCount: number
) {
  const lower = text.toLowerCase();

  const seniorSignals = ["senior", "lead", "principal", "architect", "head"];
  const midSignals = ["engineer", "developer", "specialist", "mid"];
  const juniorSignals = ["intern", "junior", "trainee", "assistant"];

  const hasSenior = seniorSignals.some(k => lower.includes(k));
  const hasMid = midSignals.some(k => lower.includes(k));
  const hasJunior = juniorSignals.some(k => lower.includes(k));

  let score = 0;

 // experience weight (GÜNCELLENDİ)
  if (experienceYears >= 4) score += 3;   // 4+ → Senior güçlü sinyal
  else if (experienceYears >= 2) score += 2;
  else if (experienceYears >= 1) score += 1;

  // skills impact
  if (skillsCount >= 10) score += 2;
  else if (skillsCount >= 5) score += 1;

  // title impact
  if (hasSenior) score += 3;
  if (hasMid) score += 2;
  if (hasJunior) score -= 1;

  // FINAL RULE (GÜNCELLENDİ)
  if (experienceYears >= 4 || score >= 6) return "Senior";
  if (experienceYears >= 2) return "Mid-Level";
  return "Junior";
}