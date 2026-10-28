import type { Project } from "@/features/projects/types";

// Public-safe independent positioning; no unverified delivery claims or URLs.
export const ladimusReview = {
  slug: "ladimus-review", visual: "review",
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
  slug: "ask-ladimus", visual: "intelligence", title: "Ask Ladimus",
  summary: "A career intelligence interface built around sanitized evidence, bounded retrieval, claim guards, and server-validated answers. Every statement has a source you can inspect.",
  category: "Applied AI / Retrieval Engineering", technologies: ["Next.js", "TypeScript", "RAG"],
  themes: ["Evidence-bound generation", "Sanitized corpus", "Claim guards", "Interactive topology"],
  featured: true, detailUrl: "/ask",
} as const satisfies Project;
export const recall = {
  slug: "recall", visual: "recall", title: "Recall",
  summary: "A private second memory for Android. Save notes, links and PNG screenshots, then find them again with local AI and source-linked search. Actively developed; controlled internal QA only.",
  category: "Consumer Software / On-Device AI", technologies: ["Android", "React Native", "TypeScript", "SQLCipher"],
  themes: ["Android engineering", "Offline AI", "Encrypted local storage", "Screenshot OCR", "Semantic retrieval"],
  status: "internal-qa", featured: true, detailUrl: "/projects/recall",
} as const satisfies Project;
export const projects = [ladimusReview, askLadimus, recall] as const satisfies readonly Project[];
