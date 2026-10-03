import type { ExperienceRecord } from "../types/portfolio";

export const experience: ExperienceRecord[] = [
  {
    role: "AI Training Contributor",
    company: "Outlier AI",
    period: "Sep 2024 - Feb 2025",
    description: "Model training and evaluation for Python code generation",
    responsibilities: [
      "Reviewed 200+ AI-generated Python solutions per month, enforcing PEP 8 standards and improving the correctness of model output.",
      "Designed 50+ coding prompts targeting edge cases, improving model response accuracy across Python generation tasks.",
      "Debugged 100+ AI failure cases and delivered structured feedback that directly informed model retraining cycles.",
    ],
  },
  {
    role: "Project Member",
    company: "Enactus Cairo University",
    period: "Ongoing",
    description: "Student team delivering social-impact projects",
    responsibilities: [
      "Worked in a cross-functional team on an agricultural research initiative developing sustainable pesticide solutions.",
      "The resulting product reached local Egyptian farmers and contributed to increased crop yields.",
    ],
  },
];