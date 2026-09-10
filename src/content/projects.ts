import type { Project } from "@/features/projects/types";

// Public-safe independent positioning; no unverified delivery claims or URLs.
export const ladimusReview = {
  slug: "ladimus-review",
  title: "Ladimus Review",
  summary: "An engineering system focused on a harder problem than generating code: determining when AI-generated engineering output should actually be trusted.",
  category: "AI Engineering / Developer Tooling",
  technologies: [],
  themes: ["Validation", "Deterministic engineering boundaries", "AI-assisted review", "Developer tooling", "Reliability"],
  featured: true,
  detailUrl: "/projects/ladimus-review",
  repositoryUrl: "https://github.com/Wumbologist-1/ladimus-review",
} as const satisfies Project;

export const projects = [ladimusReview] as const satisfies readonly Project[];
