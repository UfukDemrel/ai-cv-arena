export function detectRole(text: string, skills: string[]) {
  const clean = text.toLowerCase();
  const skillSet = skills.map(s => s.toLowerCase());

  const countMatches = (keywords: string[]) => {
    return keywords.reduce((acc, keyword) => {
      if (
        clean.includes(keyword.toLowerCase()) ||
        skillSet.includes(keyword.toLowerCase())
      ) {
        return acc + 1;
      }

      return acc;
    }, 0);
  };

  /**
   * =========================
   * ROLE DEFINITIONS
   * =========================
   */

  const roleMap = [
    {
      name: "Frontend Developer",
      keywords: [
        "react",
        "next",
        "next.js",
        "frontend",
        "ui",
        "css",
        "html",
        "javascript",
        "typescript",
        "tailwind",
        "redux"
      ]
    },

    {
      name: "Backend Developer",
      keywords: [
        "node",
        "express",
        "nestjs",
        "backend",
        "api",
        "rest",
        "graphql",
        "sql",
        "postgresql",
        "mongodb",
        "database"
      ]
    },

    {
      name: "Full Stack Developer",
      keywords: [
        "react",
        "next",
        "node",
        "express",
        "mongodb",
        "postgresql",
        "frontend",
        "backend"
      ]
    },

    {
      name: "QA Engineer",
      keywords: [
        "qa",
        "testing",
        "automation",
        "selenium",
        "cypress",
        "postman",
        "test case",
        "quality assurance",
        "playwright",
        "jest"
      ]
    },

    {
      name: "DevOps Engineer",
      keywords: [
        "docker",
        "kubernetes",
        "aws",
        "azure",
        "gcp",
        "devops",
        "pipeline",
        "ci/cd",
        "jenkins"
      ]
    },

    {
      name: "Data Analyst",
      keywords: [
        "excel",
        "power bi",
        "tableau",
        "analysis",
        "analytics",
        "sql",
        "data visualization"
      ]
    }
  ];

  /**
   * =========================
   * CALCULATE SCORES
   * =========================
   */

  const scores = roleMap.map(role => ({
    name: role.name,
    score: countMatches(role.keywords)
  }));

  /**
   * =========================
   * FULL STACK BOOST
   * =========================
   */

  const hasFrontend =
    clean.includes("react") ||
    clean.includes("next") ||
    clean.includes("frontend");

  const hasBackend =
    clean.includes("node") ||
    clean.includes("express") ||
    clean.includes("backend") ||
    clean.includes("api");

  if (hasFrontend && hasBackend) {
    return "Full Stack Developer";
  }

  /**
   * =========================
   * SORT BY SCORE
   * =========================
   */

  scores.sort((a, b) => b.score - a.score);

  /**
   * =========================
   * FALLBACK
   * =========================
   */

  if (scores[0].score <= 0) {
    return "General Software Professional";
  }

  return scores[0].name;
}