export const site = {
  name: "Ladimus",
  title: "Ladimus — AI / DevOps Engineering",
  description:
    "Building reliable AI systems, developer tooling, automation, and the engineering infrastructure that connects them.",
  githubUrl: null as string | null,
  navigation: [
    { label: "Work", href: "/#work" },
    { label: "Profile", href: "/#profile" },
  ],
  hero: {
    eyebrow: "AI / DEVOPS ENGINEERING",
    headline: "Engineering systems. Built to hold up.",
    status: "Open to opportunities",
    disciplines: ["Reliable AI", "Developer tooling", "Automation", "Infrastructure"],
  },
  profile: {
    title: "Engineering with a systems perspective.",
    description:
      "AI, delivery pipelines, and developer experience are connected problems. Ladimus brings them together through thoughtful architecture, automation, and validation.",
    resumeNote: "Resume and professional profile details are coming soon.",
  },
} as const;
