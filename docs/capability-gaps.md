# Ask Ladimus capability gaps and unsupported assertions

Current behavior: **v0.6.3.3 Active Intelligence**. Gap detection and domain retrieval
prepare the packet; the generator authors the answer and a separate verifier
checks it. There is no deterministic gap-answer bypass. Missing provider configuration
preserves evidence and reports unavailable. See [architecture](architecture.md) for
the pipeline, authority boundaries, deadline and correction budget.

The notes below describe the historical v0.6.2 design and its replaced behavior.


This release adds a bounded policy/retrieval path without replacing the provider,
career corpus, core ranker, or visual system. Privacy policy runs first and retains
the exact zero-evidence refusal before capability detection or generation.

`unsupportedAssertions()` reports up to eight unsupported assertion categories
in the same request: guarded professional technologies, explicit numeric/worded
years, unsupported senior titles, broad adoption, savings/ROI, and foundation-model
training. Detection is deliberately bounded rather than an unrestricted natural-
language assertion parser. Extra detected categories receive an explicit unverified
overflow notice. Existing conflict qualifications remain. “Even if the evidence
doesn't support it” never changes the source boundary or invokes a model to invent
a claim. A five-year Kubernetes / Senior Machine Learning Engineer ROMTech request
now explicitly accounts for technology, duration, and title together.

`capabilityTarget()` resolves requested tools against linked skills and aliases,
affirmative chunk facts/keywords, retrieval hints, and guarded terms. A resolvable
direct skill retains ordinary validated synthesis. Guarded terms override apparent
incidental mentions or a contradictory skill mapping. Existing conservative
guarded-tool questions retain their refusal/adjacent evidence behavior; explicit
transfer/role/gap questions may enter the new path. Unfamiliar tools enter it
without needing a provider credential. The API exposes `mode: capability_gap`.

Technology profiles describe general competencies only. Terraform and Pulumi use
the infrastructure domain, ArgoCD delivery, Datadog observability, and Ansible
automation. Each domain selects approved skill-linked and hint-linked records,
then reuses the existing ranker over eligible overview chunks. It excludes retail,
historical employment noise, and unrelated public RAG projects. Five evidence
chunks remain the maximum. Technology names and generic requirements never become
career facts or are appended to the corpus.

The response distinguishes three parts using the existing visual styles:

1. Direct experience is not established by the current public corpus.
2. Transferable background consists of exact approved facts with retrieved IDs,
   official titles, and maturity labels. Relevant DevOps role evidence is retained
   in the summary when available. Adjacent skills are not tool experience or a
   guarantee of readiness.
3. A separate limitations paragraph lists tool-specific learning/evidence gaps.

Gap responses are deterministic. The provider is not invoked, so general model
knowledge cannot authorize claims about Luis or override unsupported assertions.
Known Azure Container Apps, GitHub Actions, FastAPI, Chroma, and ChromaDB questions
continue through ordinary synthesis and its existing validator.

For an arbitrary unfamiliar tool, explicit infrastructure/monitoring/automation
context can select a domain; otherwise the response offers general delivery
background conditionally. It explicitly states that no reviewed competency mapping
exists and that role requirements must be assessed before inferring tool-specific
transferability. This is not a claim to recognize every technology or exhaustively
understand every role. Profiles can be added independently of career evidence.

Telemetry preserves the finite `capability_gap` intent, bounded public evidence
IDs, and current sanitization. The status remains `no_evidence` for the requested
unsupported direct skill, even though adjacent evidence may be displayed. No
general-knowledge profiles or full source facts are logged.

General competency descriptions were checked against primary documentation:

- [Terraform introduction](https://developer.hashicorp.com/terraform/intro)
- [Pulumi concepts](https://www.pulumi.com/docs/iac/concepts/)
- [ArgoCD documentation](https://argo-cd.readthedocs.io/en/stable/)
- [Datadog getting started](https://docs.datadoghq.com/getting_started/application/)
- [Ansible getting started](https://docs.ansible.com/projects/ansible/latest/getting_started/index.html)

The regression suite covers compound claims, each tool family, arbitrary tools,
direct-skill routing, evidence restrictions, general-knowledge separation,
historical/retail suppression, privacy/injection precedence, and telemetry. Existing
privacy/injection tests are unchanged. Build identity: Portfolio Build 0.6.2.
