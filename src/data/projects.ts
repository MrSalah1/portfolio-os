import type { ProjectRecord } from "../types/portfolio";

/*
  Portfolio projects with their verified public repositories.
  A project only exposes a live demo once a deployed URL is confirmed,
  so the live demo field stays absent until then.

  Two of these were built on top of existing open-source projects. That is
  stated in the description rather than hidden, because presenting someone
  else's repository as original work would be the kind of thing that only
  looks good until it is noticed.
*/
export const projects: ProjectRecord[] = [
  {
    name: "RGB Image Processor",
    date: "February 2026",
    type: "Object-Oriented Programming Course Project",
    technologies: ["C++", "Qt", "CMake"],
    description:
      "A desktop image-processing application built for a CS213 Object-Oriented Programming assignment. Loads, saves and manipulates images through a filter pipeline.",
    features: [
      "Implemented 5+ image filters including blur, sharpen and edge detection.",
      "Bilinear resizing implemented directly rather than delegated to a library.",
      "Supported 10+ image formats with load times under 200ms.",
      "Desktop GUI built with Qt.",
    ],
    links: {
      github: "https://github.com/MrSalah1/RGB-Gulag",
    },
  },
  {
    name: "Ticket Classifier LLM",
    type: "AI Project",
    technologies: [
      "Python",
      "PyTorch",
      "Hugging Face Transformers",
      "Pydantic",
    ],
    description:
      "A Python-based support-ticket classification system that labels tickets by category, sentiment and urgency, then generates a summary.",
    features: [
      "Classifies support tickets into 5 categories, detects 3 sentiment levels and identifies 3 urgency levels.",
      "Custom text-generation pipeline with KV caching, Top-K/Top-P sampling, temperature control and stop-sequence detection.",
      "Pydantic-based structured output validation.",
      "Evaluated on 10 customer support tickets.",
    ],
    links: {},
  },
  {
    name: "Brain Tumor Detection Model",
    type: "AI Project",
    technologies: ["Python", "TensorFlow", "CNN"],
    description:
      "A convolutional neural network that classifies brain tumor MRI images into four categories.",
    features: [
      "Reached 93% test accuracy across 4 categories.",
      "Ran 5+ model experiments using augmentation pipelines.",
      "Selected the top architecture by F1-score, with 94% precision and 92% recall.",
    ],
    links: {},
  },
  {
    name: "Masroofy Financial Tracker",
    date: "June 2026",
    type: "Course Project",
    technologies: ["Java 25", "JavaFX", "SQLite", "JDBC"],
    description:
      "A layered financial desktop application for tracking spending, built on top of an open-source student project (maro3tef/assignment-2-software).",
    features: [
      "Layered architecture with real-time spending limits and threshold alerts.",
      "Dynamic pie-chart dashboards rendered with JavaFX.",
      "DAO and Singleton patterns with manual dependency injection.",
      "Raw SQL executed through JDBC for PIN authentication and transaction CRUD.",
    ],
    links: {
      github: "https://github.com/MrSalah1/Masroofy-SaaS",
    },
  },
  {
    name: "Recipe Finder Web Application",
    date: "June 2026",
    type: "Web Development Course Project",
    technologies: [
      "Python",
      "Django REST Framework",
      "JavaScript",
      "SQLite",
      "AJAX",
    ],
    description:
      "A full-stack MVC recipe web application, built on top of an open-source student project (MazenFahim/RecipeFinder).",
    features: [
      "Role-based session authentication with an admin dashboard.",
      "AJAX-driven dynamic search and favourites filtering.",
      "REST API built with Django REST Framework.",
      "Resolved N+1 query bottlenecks to serve structured recipe data efficiently.",
    ],
    links: {
      github: "https://github.com/MrSalah1/RecipeFinder2",
    },
  },
  {
    name: "SalahOS",
    technologies: ["React", "TypeScript", "Vite", "Tailwind CSS", "CSS"],
    description:
      "SalahOS is this portfolio, designed as a fictional retro operating system rather than a traditional modern portfolio website.",
    features: [
      "Boot sequence, desktop and command bar, with draggable, minimizable and maximizable windows.",
      "Thirteen-command terminal that answers from the same data the windows render.",
      "Desktop icons drawn from 16x16 pixel maps as merged SVG rectangles, with no image assets.",
      "Hand-written stylesheet; no CSS framework and no animation library.",
    ],
    links: {
      github: "https://github.com/MrSalah1/portfolio-os",
    },
  },
];