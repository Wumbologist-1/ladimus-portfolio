import type { AnswerClaim, EvidenceChunk, SynthesisPlan } from "./contracts.ts";

type Support = { id: string; status: string; facts: string[] };
type Passage = { text: string; support: Support[]; topics?: string[] };
const employment = {
  id: "employment-romtech-devops-2026--1", status: "documented_experience",
  facts: [
    "DevOps Engineer at ROM Technologies, Inc.; 2026-03 – 2026-09.",
    "Designed, built, deployed, operated, and hardened AI-enabled engineering and production-automation systems spanning Microsoft Teams workflows, backend services, Azure cloud environments, GitHub-native developer tooling, Android testing, device operations, observability, and software delivery.",
    "Owned and troubleshot separate development and production Azure Container App/API/middleware environments.",
    "Architected GitHub-native agentic PR review/repair and AI-assisted testing workflows.",
    "Built CI/CD-integrated AI risk analysis while retaining deterministic rule-backed authority for consequential gates.",
  ],
};

// Reviewed editorial units, each gated by exact public facts AND maturity. The
// provider arranges these units; citation validity alone never authorizes prose.
// Changing a source fact disables its passage until that editorial unit is reviewed.
export const editorialPassages: Passage[] = [
  {
    text: "Luis's RAG work includes ROMGuide, a built internal-support prototype, and Ladimus Agent, a public open-source project. Both have documented retrieval-grounded answering experience, but their maturity and usage boundaries differ. The useful comparison is how each connects answers to evidence, rather than treating both as employer-wide production deployments.",
    topics: ["rag"], support: [
      { id: "system-romguide--1", status: "prototype_built", facts: ["Built a FastAPI-based internal troubleshooting and knowledge-access prototype using LLM integration, local document retrieval, Chroma vector storage, and RAG architecture.", "source traceability"] },
      { id: "project-ladimus-agent--2", status: "public_open_source", facts: ["refusal when evidence is absent", "Documented capability: Retrieval-Augmented Generation (RAG) (hands-on professional prototype and public project)."] },
    ],
  },
  {
    text: "Luis's documented scope extends beyond traditional DevOps into backend implementation, production automation, and AI-assisted developer tooling. His official ROMTech title was DevOps Engineer. In that role, he built and operated systems across Teams workflows, APIs and middleware, Azure environments, PR review and repair, and Android testing. The distinction is concrete ownership of the software and its operating environment, rather than a broader title inferred from the tools he used.",
    support: [employment], topics: ["broader_scope"],
  },
  {
    text: "At ROMTech, Luis built AI-enabled engineering and production-automation systems while holding the official title DevOps Engineer. His work connected Teams operations workflows to backend services, Azure environments, GitHub-native developer tooling, and Android testing. He also owned separate development and production API and middleware environments. That connects implementation with delivery and operation: the documented scope includes building the systems, deploying them, troubleshooting them, and hardening their behavior.",
    support: [employment], topics: ["romtech"],
  },
  {
    text: "Luis has built AI-assisted engineering workflows as well as production automation. At ROMTech, his documented work included GitHub-native PR review and repair, Android testing, and CI/CD risk analysis. The important boundary is that AI-assisted work and production operation are separate claims: the evidence below identifies each system's maturity rather than treating every prototype, design, or validated workflow as a broadly deployed product.",
    support: [employment], topics: ["ai_systems", "agentic_ai"],
  },
  {
    text: "His production Azure work joined platform ownership to the backend services running on it. He managed separate development and production API and middleware stacks in Azure Container Apps, including container images, revisions, health verification, traffic, rollback readiness, deployment recovery, and release validation. These are concrete operating responsibilities: checking whether a release is healthy, controlling its traffic, and maintaining a recovery path belong alongside deployment itself.",
    support: [{ id: "system-azure-environments--1", status: "production_verified", facts: ["Managed separate production and development API/middleware service stacks using Azure Container Apps and container images, including revisions, health verification, traffic, rollback readiness, deployment recovery, and release validation."] }],
  },
  {
    text: "The built and validated AI Code Gating workflow makes the distinction between AI assistance and engineering authority explicit. Luis integrated GitHub Actions, Azure OpenAI, repository policy, changed-file and PR-diff context, risk checks, diagnostics, and review artifacts. AI output stayed advisory; only deterministic, high-confidence rules controlled consequential blocking behavior, and human reviewers retained authority. Its significance is a review workflow with inspectable context and defined decision boundaries, rather than an AI opinion promoted into a release gate.",
    support: [{ id: "system-ai-code-gating--1", status: "built_and_validated", facts: [
      "Created a CI/CD-integrated review workflow using GitHub Actions, Azure OpenAI, repository policy/configuration, changed-file and PR-diff context, deterministic risk checks, diagnostics, labels, and review artifacts.",
      "AI output remained advisory.", "Only deterministic/high-confidence rule-backed conditions controlled consequential blocking behavior.", "Human reviewers retained authority.",
    ] }],
  },
  {
    text: "The Android Test Agent was live validated with merged components. Luis built repository-aware workflows that classify PR changes into deterministic routes and generate test-only candidate patches using repository-native context. Validation, diagnostics, and fail-closed safeguards are part of the workflow. That places generated tests inside an engineering process that checks the proposed changes; the documented maturity remains live validation with merged components, rather than a claim that every testing capability was deployed company-wide.",
    support: [{ id: "system-android-test-agent--1", status: "live_validated_with_merged_components", facts: ["Built repository-aware Android test-generation workflows that classify PR changes into deterministic routes and generate test-only candidate patches with repository-native context, validation, diagnostics, and fail-closed safeguards."] }],
  },
  {
    text: "PR Assistant connects agent orchestration to reviewable engineering changes. Its documented design routes work to specialists, prepares exact code and test previews, requires approval, checks current repository state, and applies only approved immutable previews before controlled commit-back and fresh review. The system is production-onboarded with adoption limits. That qualification matters: the evidence supports an onboarded workflow with explicit safety boundaries, not unrestricted autonomous editing or company-wide adoption.",
    support: [{ id: "system-pr-assistant--1", status: "production_onboarded_with_adoption_limits", facts: ["Designed a single developer-facing orchestration and safety layer that reviews pull requests, routes work to specialist capabilities, prepares exact reviewable code/test changes, requires approval, validates current repository state, applies only approved immutable previews, and performs controlled commit-back and fresh re-review."] }],
  },
  {
    text: "PR Assistant's production-onboarded work, with adoption limits, also documents structured generation, validation-driven correction, evidence provenance, human approval, and fail-closed safeguards. These capabilities describe the reliability layer around AI output: evaluating what was generated, retaining its supporting evidence, and keeping approval and failure handling in the workflow. They establish hands-on safety and developer-tooling experience without implying that the assistant had unrestricted authority or broad adoption.",
    support: [{ id: "system-pr-assistant--5", status: "production_onboarded_with_adoption_limits", facts: [
      "Documented capability: Structured generation / validation-driven correction (hands-on professional).", "Documented capability: AI output evaluation and safety controls (hands-on professional and open-source).", "Documented capability: Evidence provenance (hands-on).", "Documented capability: Human-in-the-loop approval (hands-on).", "Documented capability: Fail-closed safeguards (hands-on).",
    ] }],
  },
  {
    text: "The approval boundary is reinforced by explicit human approval, targeted validation, controlled commit-back, fresh review, head-SHA binding, source and content hashes, and stale-head rejection. In the production-onboarded PR Assistant, with adoption limits, these controls bind a reviewed change to repository state rather than assuming that an earlier preview is still safe to apply. They give concrete substance to the distinction between proposing a change and authorizing it.",
    support: [{ id: "system-pr-assistant--2", status: "production_onboarded_with_adoption_limits", facts: ["explicit human approval", "targeted validation", "controlled commit-back", "fresh-review convergence", "head-SHA binding", "source/content hashes", "stale-head rejection"] }],
  },
  {
    text: "The same PR Assistant evidence includes manifest integrity, file-scope enforcement, source-provenance separation, tamper detection, deterministic current-head verification, bounded model-call budgets, and narrow validation-driven correction. These are checks around what a proposed change contains, where it may act, and which repository state it targets. The system remains production-onboarded with adoption limits; the controls do not establish company-wide usage or an absence of all possible failures.",
    support: [{ id: "system-pr-assistant--3", status: "production_onboarded_with_adoption_limits", facts: ["manifest integrity", "file-scope enforcement", "source-provenance separation", "tamper detection", "deterministic current-head verification", "bounded model-call budgets", "narrow validation-driven corrective generation"] }],
  },
  {
    text: "ROMGuide is a built internal-support RAG prototype. Luis combined a FastAPI backend, LLM integration, local-document retrieval, and Chroma vector storage to support troubleshooting and knowledge access. The engineering emphasis was grounded answers, inspectable retrieval, and source traceability. That gives a concrete example of backend implementation joined to source-grounded AI, while preserving the evidence boundary: a working prototype is not proof of production adoption or company-wide deployment.",
    support: [{ id: "system-romguide--1", status: "prototype_built", facts: ["Built a FastAPI-based internal troubleshooting and knowledge-access prototype using LLM integration, local document retrieval, Chroma vector storage, and RAG architecture.", "grounded answers over unconstrained generation", "inspectable retrieval", "source traceability", "clear distinction between prototype evidence and production adoption"] }],
  },
  {
    text: "Ladimus Agent is his public, open-source retrieval-grounded assistant. It uses a controlled knowledge base, displays supporting evidence and citations, and refuses unsupported answers. Its local-first stack includes FastAPI, ChromaDB, and Ollama local models. The design connects retrieval to an inspectable answer boundary: what the assistant can substantiate determines what it can answer. This is public project evidence, distinct from a claim of employer-wide production deployment.",
    support: [{ id: "project-ladimus-agent--1", status: "public_open_source", facts: ["Local-first retrieval-grounded assistant over a controlled knowledge base that displays evidence/citations and refuses unsupported answers.", "FastAPI", "ChromaDB", "Ollama/local models"] }],
  },
  {
    text: "Ladimus Agent provides a second, public open-source example of retrieval-grounded answering. Its documented behavior includes refusing answers when evidence is absent and keeping private or employer material outside the knowledge boundary. The public-readiness run recorded 17 of 17 passing tests, with compile, frontend, whitespace, and employer-hygiene checks also passing. These are documented validation results for the public project, not a claim of current production adoption inside an employer.",
    support: [{ id: "project-ladimus-agent--2", status: "public_open_source", facts: ["refusal when evidence is absent", "security/hygiene boundaries excluding private/employer material", "17/17 tests passed in the documented public-readiness run", "compile/frontend/whitespace/employer-hygiene checks passed", "Documented capability: Retrieval-Augmented Generation (RAG) (hands-on professional prototype and public project)."] }],
  },
  {
    text: "Ladimus Review is a public open-source code review and repair platform organized around evaluating whether AI-generated changes are safe to trust. Its architecture includes provider-agnostic review and remediation, finding-aware risk scoring, immutable recommendations, SHA-256 evidence, reviewed-HEAD and configuration binding, and exact-byte patch application. These choices connect AI-assisted engineering to provenance and reproducible application of reviewed changes; public project evidence does not imply employer-wide production adoption.",
    support: [{ id: "project-ladimus-review--1", status: "public_open_source", facts: ["Evaluation-first AI code review and repair platform focused on whether generated engineering changes are safe to trust.", "provider-agnostic review/remediation architecture", "finding-aware risk scoring", "immutable recommendations", "SHA-256 evidence", "reviewed-HEAD/config binding", "exact-byte patch application"] }],
  },
  {
    text: "Luis also designed a broader agentic operating model across DevOps, QA, compliance, support, PR risk, testing, deployment readiness, and SRE triage. It included reusable policies, prompt libraries, validation artifacts, escalation notes, runbooks, and approval boundaries. This is designed, not deployed work. It demonstrates the documented scope of his systems design while remaining separate from the production, live-validated, and built-prototype evidence elsewhere in the portfolio.",
    support: [{ id: "system-agentic-operating-model--1", status: "designed_not_deployed", facts: ["Designed a broader operating model spanning DevOps, QA, compliance, support, PR risk, test generation, deployment readiness, and SRE log/code triage, with reusable policies, prompt libraries, validation artifacts, escalation notes, runbooks, and approval boundaries."] }],
  },
  {
    text: "Luis's production automation has documented usage and reboot outcomes: 7,156 bot requests, with later internal usage exceeding 11,000 requests. Of 414 completed reboot workflows, 412 succeeded and two failed, for a 99.52% success rate. The evidence also records 98 support claims. These measurements establish usage and workflow outcomes; they do not establish audited financial savings, and recorded support claims should not be interpreted as successfully resolved support incidents.",
    topics: ["impact"], support: [{ id: "system-genie-swopsbot--3", status: "production_verified", facts: ["documented bot requests: 7156.", "completed reboot workflows: 414.", "successful reboots: 412.", "failed reboots: 2.", "reboot success rate percent: 99.52.", "support claims recorded: 98.", "later internal requests: exceeded 11,000."] }],
  },
  {
    text: "He made the Teams platform's production activity inspectable through a Grafana dashboard for operational troubleshooting and business-facing measurement. The dashboard covered request volume, deduplicated submissions, reboot outcomes and success rate, support workflow activity, API traffic, and log volume. That connects operational automation to a way of examining its usage and reliability. The dashboard evidence supports what was measured, rather than an inferred cost-saving or incident-resolution claim.",
    support: [{ id: "system-genie-observability--1", status: "production_verified", facts: ["Built a Grafana dashboard for operational troubleshooting and business-facing measurement of the Teams automation platform.", "request volume", "deduplicated submissions", "reboot outcomes and success rate", "support workflow activity", "API traffic", "log volume"] }],
  },
  {
    text: "The Teams operations platform connects Luis's backend implementation to production workflows. He rebuilt and productionized a company-used platform joining Teams interactions to C#/.NET APIs, middleware, device-management providers, batch and device actions, support handoffs, and production logging. This is production-verified work: the evidence describes a production platform connecting user requests to backend and device actions, rather than only an isolated API or an AI demonstration.",
    support: [{ id: "system-genie-swopsbot--1", status: "production_verified", facts: ["Rebuilt and productionized a company-used Microsoft Teams operations platform connecting user workflows to C#/.NET APIs, middleware services, device-management providers, batch/device actions, support handoffs, and production logging."] }],
  },
];

export function synthesisIntent(query: string) {
  const q = query.normalize("NFKC").toLowerCase();
  if (/more than|beyond|traditional devops/.test(q)) return "broader_scope";
  if (/measur|metrics|impact|requests|success rate/.test(q)) return "impact";
  if (/rag|retrieval|romguide|ladimus agent|chroma|knowledge/.test(q)) return "rag";
  if (/romtech|rom technologies/.test(q)) return "romtech";
  if (/ai systems/.test(q)) return "ai_systems";
  if (/agent|orchestrat|specialist/.test(q)) return "agentic_ai";
  if (/safe|reliab|approval|validation|trust|ci\/cd|pr assistant|ladimus review/.test(q)) return "ai_safety";
  if (/azure|cloud|deploy|rollback|production/.test(q)) return "production_ownership";
  if (/backend|api|middleware/.test(q)) return "backend";
  if (/android|test/.test(q)) return "android_testing";
  return "career";
}

const followUps = [
  { text: "How did Luis make the PR Assistant safe?", records: ["employment-romtech-devops-2026", "system-pr-assistant"], topics: ["broader_scope", "romtech", "agentic_ai", "ai_systems", "ai_safety"] },
  { text: "What production systems has Luis operated?", records: ["employment-romtech-devops-2026", "system-azure-environments", "system-genie-swopsbot"], topics: ["broader_scope", "romtech", "impact", "production_ownership", "backend"] },
  { text: "How has Luis applied AI inside CI/CD?", records: ["employment-romtech-devops-2026", "system-ai-code-gating", "system-android-test-agent"], topics: ["broader_scope", "romtech", "ai_systems", "ai_safety", "android_testing"] },
  { text: "How does ROMGuide keep answers tied to sources?", records: ["system-romguide"], topics: ["rag", "backend"] },
  { text: "How does Ladimus Agent handle missing evidence?", records: ["project-ladimus-agent"], topics: ["rag", "ai_safety"] },
  { text: "What distinguishes ROMGuide's prototype from Ladimus Agent's public project?", records: ["system-romguide", "project-ladimus-agent"], topics: ["rag"] },
  { text: "What did Luis measure with the Teams automation dashboard?", records: ["system-genie-observability", "system-genie-swopsbot"], topics: ["impact", "production_ownership"] },
  { text: "What limits apply to the reported automation metrics?", records: ["system-genie-swopsbot"], topics: ["impact"] },
  { text: "How did Luis manage Azure release recovery?", records: ["system-azure-environments", "employment-romtech-devops-2026"], topics: ["production_ownership", "backend", "romtech"] },
  { text: "How does Ladimus Review bind changes to reviewed evidence?", records: ["project-ladimus-review"], topics: ["ai_systems", "agentic_ai", "ai_safety"] },
  { text: "What safeguards constrain Android test generation?", records: ["system-android-test-agent"], topics: ["android_testing", "romtech", "ai_safety"] },
];

export function createSynthesisPlan(query: string, chunks: EvidenceChunk[]): SynthesisPlan {
  const intent = synthesisIntent(query);
  const namedRecords = [
    [/pr assistant/i, "system-pr-assistant"], [/romguide/i, "system-romguide"],
    [/ladimus agent/i, "project-ladimus-agent"], [/ladimus review/i, "project-ladimus-review"],
  ].filter(([pattern]) => (pattern as RegExp).test(query)).map(([,id]) => id as string);
  const supported = editorialPassages.filter(p => (!p.topics || p.topics.includes(intent)) && (!namedRecords.length || p.support.every(s => namedRecords.some(id => s.id.startsWith(`${id}--`)))) && p.support.every(s => {
    const chunk = chunks.find(c => c.id === s.id);
    return chunk?.status === s.status && s.facts.every(f => chunk.facts.includes(f));
  })).sort((a,b) => Number(Boolean(b.topics)) - Number(Boolean(a.topics)));
  // For subjects without an editorial unit, exact public facts remain a safe
  // fallback. Never pad a narrow answer with unrelated career claims.
  const answer: AnswerClaim[] = supported.map(p => ({ text: p.text, evidence_ids: p.support.map(s => s.id) }));
  if (!answer.length) for (const chunk of chunks) {
    const fact = chunk.facts.find(f => f.length > 60 && !f.startsWith("Documented capability:"));
    if (fact) answer.push({text: `${chunk.title} (${chunk.status.replaceAll("_", " ")}): ${fact}`, evidence_ids: [chunk.id]});
  }
  const records = new Set(chunks.map(c => c.recordId));
  const related = followUps.filter(f => f.topics.includes(intent) && f.records.some(r => records.has(r)) && f.text.toLowerCase() !== query.toLowerCase()).map(f => f.text);
  return {intent, style: /(?:what|which|list).*(?:ai systems|rag systems|projects)|list|examples/i.test(query) ? "list" : "paragraphs", answer: answer.slice(0, 8), follow_ups: related.slice(0, 3)};
}
