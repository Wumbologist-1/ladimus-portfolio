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

export const askLadimus = {
  slug: "ask-ladimus", title: "Ask Ladimus",
  summary: "A career intelligence interface built around sanitized evidence, bounded retrieval, claim guards, and server-validated answers. Every statement has a source you can inspect.",
  category: "Applied AI / Retrieval Engineering", technologies: ["Next.js", "TypeScript", "RAG"],
  themes: ["Evidence-bound generation", "Sanitized corpus", "Claim guards", "Interactive topology"],
  featured: true, detailUrl: "/ask",
} as const satisfies Project;
export const projects = [ladimusReview, askLadimus] as const satisfies readonly Project[];
