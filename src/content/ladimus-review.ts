import type { ProjectMedia } from "@/features/projects/types";

// Editorial design principles, not claims of shipped internals or measured outcomes.
export const reviewStory = {
  overview: "Ladimus Review explores the trust boundary around AI-generated engineering output. The focus is validation-oriented AI engineering: using AI assistance while keeping engineering judgment anchored in evidence.",
  problem: "Generating plausible code is only one part of engineering. A convincing explanation does not establish correctness, and a review needs more than confidence in the model’s answer. The harder question is what evidence makes an output acceptable.",
  principles: [
    { title: "Explicit boundaries", copy: "Frame acceptance around defined engineering constraints, rather than the persuasiveness of an AI response." },
    { title: "Evidence-led review", copy: "Separate what can be checked deterministically from what still needs interpretation and engineering judgment." },
    { title: "Useful developer tooling", copy: "Make uncertainty and findings understandable to the engineer responsible for the next decision." },
  ],
  workflow: [
    { title: "Define the question", copy: "Establish what the output is expected to do and which constraints matter." },
    { title: "Seek evidence", copy: "Identify the checks that could support or contradict the proposed output." },
    { title: "Review in context", copy: "Consider AI-assisted findings alongside deterministic evidence and unresolved questions." },
    { title: "Make the decision", copy: "Keep acceptance tied to engineering judgment, including when further work is needed." },
  ],
  stackNote: "Ladimus Review is implemented as a Python CLI tool with Git integration. The verified implementation includes: Python, CLI, Git integration, pytest for testing, Ruff for linting, OpenAI provider support, subprocess/local provider, mock provider, deterministic validation, and Git transaction with rollback behavior.",
} as const;

export const reviewMedia: readonly ProjectMedia[] = [
  { kind: "image", src: "/media/ladimus-review/01-ladimus-review-structured-review.png", alt: "Screenshot showing structured review output with explicit findings and SHA-256-bound patch candidates", width: 747, height: 672, id: "validation", title: "Structured review output", caption: "Ladimus turns review findings into explicit, reviewable evidence and SHA-256-bound patch candidates rather than allowing model output to mutate source directly." },
  { kind: "image", src: "/media/ladimus-review/02-ladimus-review-human-approval.png", alt: "Screenshot showing human-controlled execution where an eligible immutable repair candidate awaits explicit approval", width: 1399, height: 300, id: "review", title: "Human-controlled execution", caption: "Ladimus can produce an eligible immutable repair candidate, but eligibility is not authorization. Source remains untouched until a human explicitly approves the exact candidate." },
  { kind: "image", src: "/media/ladimus-review/03-ladimus-review-fail-closed-authority.png", alt: "Screenshot showing fail-closed execution authority with repository state verification and deterministic validation", width: 1015, height: 858, id: "code", title: "Fail-closed execution authority", caption: "Before an approved repair can change source, Ladimus re-verifies repository state, approval, patch digest, policy, and Git applicability. Failed deterministic validation rolls the change back." },
  { kind: "placeholder", id: "demo", title: "A walkthrough of the work", caption: "Reserved for a captioned project demonstration. No recording is published yet.", format: "Video / demo" },
];
