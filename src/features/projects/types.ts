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
  status?: "planned" | "in-progress" | "released";
  themes?: readonly string[];
  featured: boolean;
  detailUrl?: `/projects/${string}`;
  repositoryUrl?: `https://${string}`;
  demoUrl?: `https://${string}`;
  caseStudy?: CaseStudy;
};

export type ProjectMedia = {
  id: string;
  title: string;
  caption: string;
} & (
  | { kind: "placeholder"; format: string }
  | { kind: "image"; src: `/${string}`; alt: string; width: number; height: number }
  | { kind: "video"; src: `/${string}`; captionsSrc: `/${string}` }
);
