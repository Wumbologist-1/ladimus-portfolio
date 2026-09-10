type PublicProfile = {
  name: string;
  githubUrl: `https://${string}`;
  linkedinUrl: `https://${string}`;
  email: string;
  resumeUrl: `https://${string}` | `/${string}` | null;
};

// Populate only with verified, approved public details.
export const profile: PublicProfile = {
  name: "Luis Tomassini",
  githubUrl: "https://github.com/Wumbologist-1",
  linkedinUrl: "https://linkedin.com/in/luis-tomassini-wumbologist",
  email: "luis.tomassini.laddie@gmail.com",
  resumeUrl: null,
};

export const contactLinks = [
  { id: "linkedin", label: "LinkedIn", href: profile.linkedinUrl },
  { id: "github", label: "GitHub", href: profile.githubUrl },
  { id: "email", label: "Email", href: `mailto:${profile.email}` },
  { id: "resume", label: "Résumé", href: profile.resumeUrl },
] as const;

export const site = {
  name: "Ladimus Engineering",
  logo: { src: "/images/Ladimus_logo.png", width: 1052, height: 215 },
  buildLabel: "0.3",
  title: "Ladimus Engineering | Luis Tomassini",
  description: "Luis Tomassini’s independent work in AI engineering, agentic systems, DevOps/platform engineering, developer tooling, automation, and software engineering. Open to opportunities.",
  navigation: [
    { label: "Work", href: "/work" },
    { label: "About", href: "/#about" },
    { label: "GitHub", href: profile.githubUrl },
    { label: "Contact", href: "/#contact" },
  ],
  hero: {
    eyebrow: "Independent engineering",
    headline: "AI / DEVOPS ENGINEERING",
    introduction: "Building reliable AI systems, developer tooling, automation, and engineering infrastructure.",
    identity: "Ladimus Engineering is my independent engineering work — from software and delivery infrastructure to agentic systems.",
    status: "Open to opportunities",
    disciplines: ["AI engineering", "DevOps / platform", "Developer tooling", "Automation", "Software engineering"],
  },
  focus: [
    { title: "AI Engineering", description: "Connecting AI capability with engineering discipline.", items: ["Agentic systems", "LLM integrations", "RAG / retrieval", "Validation-oriented AI tooling"] },
    { title: "DevOps & Platform Engineering", description: "Making delivery repeatable and developers more effective.", items: ["CI/CD", "Infrastructure automation", "GitHub workflows", "Developer experience"] },
    { title: "Software Engineering", description: "Clear architecture. Testable behavior. Maintainable systems.", items: ["Python & TypeScript", "APIs / backend systems", "Testing", "Software architecture"] },
  ],
  about: {
    title: "A systems perspective. An engineer’s mindset.",
    description: "My engineering path runs from DevOps through automation and developer tooling into AI engineering and agentic systems. The connecting thread is making complex work more reliable, repeatable, and understandable.",
    detail: "Ladimus is where I pursue that work independently: exploring how software is built, how it is delivered, and how we decide whether to trust it.",
    progression: ["DevOps", "Automation", "Developer tooling", "AI engineering", "Agentic systems"],
  },
  contact: {
    title: "Let’s build something that holds up.",
    description: "Open to opportunities in AI engineering, DevOps / platform engineering, and software engineering. If your team values thoughtful tooling, automation, and reliable systems, let’s connect.",
  },
} as const;
