import type { Project } from "@/features/projects/types";

// The portfolio itself is the first real project. Add verified links when public.
export const projects = [
  {
    slug: "ladimus-portfolio",
    title: "Ladimus Portfolio",
    summary:
      "The public front door to the Ladimus engineering ecosystem. A foundation for sharing systems, decisions, and the work behind them.",
    category: "Platform / Developer experience",
    technologies: ["Next.js", "TypeScript", "CSS Modules"],
    status: "in-progress",
    featured: true,
  },
] as const satisfies readonly Project[];
