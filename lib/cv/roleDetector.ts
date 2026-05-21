export function detectRole(text: string, skills: string[]) {
  const clean = text.toLowerCase();
  const skillSet = skills.map(s => s.toLowerCase());

  const score = (keywords: string[]) => {
    return keywords.reduce((acc, k) => {
      if (clean.includes(k) || skillSet.includes(k)) return acc + 1;
      return acc;
    }, 0);
  };

  /**
   * =========================
   * ROLE SCORES (FIXED PRIORITY)
   * =========================
   */
  const roles = [
    {
      name: "QA Engineer",
      keywords: [
        "API","api","python","postman","bug","test case","quality assurance","qa",
        "testing","test","automation","selenium","cypress"
      ],
    },
    {
      name: "Backend Developer",
      keywords: [
        "node","express","api","database","sql","backend","rest","graphql"
      ],
    },
    {
      name: "Frontend Developer",
      keywords: [
        "react","next","frontend","ui","css","html","javascript"
      ],
    },
    {
      name: "Full Stack Developer",
      keywords: [
        "react","node","frontend","backend"
      ],
    },
    {
      name: "DevOps Engineer",
      keywords: [
        "docker","kubernetes","aws","ci","cd","devops","pipeline"
      ],
    },
    {
      name: "Data Analyst",
      keywords: [
        "excel","sql","data","analysis","powerbi","tableau"
      ],
    },
  ];

  let bestRole = "General Software Professional";
  let bestScore = 0;

  for (const role of roles) {
    const s = score(role.keywords);

    if (s > bestScore) {
      bestScore = s;
      bestRole = role.name;
    }
  }

  /**
   * CRITICAL FIX:
   * QA vs Backend conflict çözümü
   */
  const hasQASignals =
    clean.includes("test") ||
    clean.includes("testing") ||
    clean.includes("qa") ||
    clean.includes("automation");

  const hasBackendSignals =
    clean.includes("api") ||
    clean.includes("database") ||
    clean.includes("sql") ||
    clean.includes("backend");

  if (hasQASignals && bestRole === "Backend Developer") {
    return "QA Engineer";
  }

  return bestRole;
}