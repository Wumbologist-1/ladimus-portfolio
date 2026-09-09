export type CaseStudy = {
  problem: string;
  approach: string;
  outcome: string;
};

export type Project = {
  slug: string;
  title: string;
  summary: string;
  category: string;
  technologies: readonly string[];
  status: "planned" | "in-progress" | "released";
  featured: boolean;
  repositoryUrl?: `https://${string}`;
  demoUrl?: `https://${string}`;
  caseStudy?: CaseStudy;
};
