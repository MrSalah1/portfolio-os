import type { SkillGroup } from "../types/portfolio";

export const technicalSkills: SkillGroup[] = [
  {
    category: "Languages",
    items: ["C++", "Python", "Java", "C#", "Rust", "JavaScript", "SQL"],
  },
  {
    category: "AI & Machine Learning",
    items: [
      "TensorFlow",
      "Keras",
      "PyTorch-style Neural Networks",
      "Agentic AI",
      "NumPy",
      "Model Evaluation (F1, Precision, Recall)",
    ],
  },
  {
    category: "Backend & Web",
    items: ["Django", "Django REST Framework", "Flask", "AJAX", "JavaFX", "Qt"],
  },
  {
    category: "Databases",
    items: ["MySQL", "MS SQL Server", "SQLite", "JDBC", "DAO Pattern"],
  },
  {
    category: "Tools & Practices",
    items: [
      "Git",
      "GitHub",
      "GitLab",
      "Docker",
      "Agile",
      "Scrum",
      "Linux",
      "Qt",
      "JUCE",
    ],
  },
];

export const softSkills: SkillGroup[] = [
  {
    category: "Self-Learning",
    items: [
      "Picks up new languages, frameworks and tools independently, then applies them by building something complete.",
    ],
  },
  {
    category: "Problem Solving",
    items: [
      "Breaks unfamiliar problems into testable steps, and iterates on the parts that do not behave as expected.",
    ],
  },
  {
    category: "Teamwork",
    items: [
      "Contributed to a cross-functional student team at Enactus Cairo University on a project that reached real farmers.",
    ],
  },
  {
    category: "Competitive Programming",
    items: [
      "Competed in the Egyptian Collegiate Programming Contest, ranking 160th of 230 teams at the regional round.",
    ],
  },
  {
    category: "Attention to Detail",
    items: [
      "Reviews generated and written code against explicit standards rather than accepting what is plausible.",
    ],
  },
];

export const spokenLanguages: SkillGroup[] = [
  { category: "Arabic", items: ["Native"] },
  { category: "English", items: ["Proficient"] },
  { category: "German", items: ["Intermediate"] },
];