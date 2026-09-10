import type { Project } from "@/features/projects/types";

// Public-safe independent positioning; no unverified delivery claims or URLs.
export const projects = [
  {
    slug: "ladimus-review",
    title: "Ladimus Review",
    summary: "An engineering system focused on a harder problem than generating code: determining when AI-generated engineering output should actually be trusted.",
    category: "AI Engineering / Developer Tooling",
    technologies: [],
    themes: ["Validation", "Deterministic engineering boundaries", "AI-assisted review", "Developer tooling", "Reliability"],
    featured: true,
  },
] as const satisfies readonly Project[];
