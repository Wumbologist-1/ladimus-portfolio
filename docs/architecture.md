# Ladimus Portfolio architecture — v0.6.3

## Application and trust boundaries

One Next.js App Router application, with TypeScript strict mode and no component,
AI SDK, animation, or database dependency added. `/`, `/work`,
`/projects/ladimus-review`, and `/ask` are prerendered. `POST /api/ask` is a dynamic
Node server endpoint. The portfolio content remains server-rendered and usable
without JavaScript. The version label is Portfolio Build 0.6.3.

The existing v0.5 Living Interface remains the foundation. Ask Ladimus adds small
client boundaries for the console and launcher; the root layout and route content
remain Server Components. The drawer console is dynamically imported when opened.
Provider code and corpus imports live behind the server-only API boundary. No
career index, embeddings, provider SDK, credential, or internal prompt is imported
by a client component.

## Visual runtime

The interface has three coordinated layers: restrained structural rails and
section frames; deterministic local topology with primary anchors, checkpoints,
and branching subsystem chains; graph-connected traveling energy with checkpoint
handoffs and destination framing. Metallic surfaces, directional lighting, quieter
cross-cluster connections, a layered Core shell, and mobile-specific compositions
reinforce that hierarchy.

Fine pointers affect a bounded local field. Per-node offsets settle with time-based
damping at depth-dependent speeds, with small displacement, secondary energy along
adjacent graph edges, and a restrained local light field. Nodes do not capture or
follow the pointer across the page. Coarse pointers use compact graphs and native
taps. Decorative taps reject interactive targets, text, scrolling, drags, long
presses, cancellation, and selected text. No preventDefault, pointer capture,
custom cursor, or scroll hijacking is used.

Project cards and CTA/profile links activate nearby clusters on hover and keyboard
focus. IntersectionObserver triggers a bounded arrival illumination, without React
state per frame. The Core remains semantic static SVG geometry with metallic
shells, control rings, checkpoint gates, short route geometry, and a compact mobile
presentation. These are conceptual engineering motifs, not live telemetry.

All canvases retain one shared requestAnimationFrame scheduler. Fixed dispatched
signal slots remain two on compact devices and four on desktop; connected routes
expire after 2.8 seconds. Node counts remain 18 compact and 39 desktop. DPR,
backing-store area, visibility, hidden-tab suspension, adaptive downgrade, cleanup,
and persistent session Pause/Resume behavior are retained. Pause suppresses input
and semantic events as well as ambient motion. Mobile motion control occupies a
reserved sticky-header slot, with safe-area padding and anchor-scroll clearance.

## Semantic event bridge

`features/living-interface/event-bridge.ts` accepts bounded application events:
`query:start`, `retrieval:start`, `retrieval:complete`, `generation:start`,
`response:complete`, and `response:error`. React owns application state; Canvas
owns only its bounded rendering response. Actual retrieval record IDs map
consistently to authored evidence clusters. No evidence IDs means no evidence
illumination. Failure, unavailable generation, refusal, and no evidence clear the
success target. Generation energizes the Core; completed grounded selection
settles it into a quieter evidence state. The bridge carries at most five IDs and
listeners unsubscribe during renderer cleanup.

## Ask Ladimus experience

`/ask` combines a dedicated career intelligence console with a concise architecture
case study. The homepage and Work route include Ask Ladimus as an engineering
project. A labelled header launcher opens a native modal dialog without changing
the current route. Native modal behavior supplies focus containment and Escape;
closing restores the launcher focus. Queries abort on console disposal and have a
client timeout. The form has a real label, 600-character limit, visible focus,
comfortable mobile textarea, disabled duplicate submission, status announcements,
evidence links, follow-up prompts, and explicit failure states.

The API returns newline-delimited JSON pipeline events. Retrieval and generation
states originate from server work, not animated timers. Evidence arrives as a
retrieval result before final selection. The UI does not stream unvalidated answer
tokens: all selected statements are validated before publication. A screen reader
receives polite phase/completion changes rather than token-by-token announcements.
No-evidence, refusal, partial coverage, unavailable provider, timeout, busy service,
invalid question, and rate limit all have readable text states.

## Public corpus and offline ingestion

The human-approved v1 corpus supplied for this release supersedes raw-resume
ingestion. It is the canonical source for this release. The source bundle remains
under ignored `scratch/ask-ladimus-career-corpus-v1/`; ZIP files and raw sources are
not committed. Split source files were audited and compared with the consolidated
JSON before integration. `private/`, environment files, `scratch/`, and `work/` are
ignored, while the safe `.env.example` convention is retained.

Run the offline publication command only on reviewed public JSON:

```powershell
npm.cmd run career:ingest -- <approved-career-corpus.json> --approved-public
```

The command requires `manifest.public_safe`, scans for private fields and patterns,
normalizes whitelisted public facts, validates schema and IDs, checks skill/hint
references, builds bounded deterministic chunks, and writes only public artifacts
under `src/data/career/`:

- records.json — stable evidence records with title, category, organization,
  timeframe, maturity, evidence level, facts, keywords, and claim limits.
- chunks.json — bounded retrieval units, at most seven statements/1,800 characters.
- skills.json — capabilities mapped to real evidence IDs, including depth labels.
- retrieval-hints.json — intent-to-record relationships and guarded technologies.
- claim-guards.json — original authoritative overclaim and conflict constraints.
- manifest.json — approval flag, counts, version, hash, answer policy, exclusions.

The v1 application corpus contains 24 records and 52 chunks. Detailed implementation,
reliability, ownership, validation, deployment, human approval, and public-safe
metrics are retained. Ingestion excludes arbitrary source notes and metadata,
conflicting education date variants, raw addresses/phones, secrets, source paths,
private operational identifiers and URLs. Privacy failures report no contents.
Human review is still required: pattern checks cannot establish public approval.
There is no runtime PDF parsing, and no raw resume is required for this release.
Future raw documents belong under `private/career/` and must first become reviewed
public JSON through an offline editorial process; automatic raw-resume publication
is deliberately absent.

## Provenance and conflict handling

Primary source provenance: September 2026 AI Engineering Master Resume and August
2026 ROMTech Engineering Impact Dossier; corroboration includes detailed engineering
records, public Ladimus project history, and earlier career material. The approved
bundle's claim guards and provenance were reviewed before promotion.

Canonical ROMTech title is DevOps Engineer, March–September 2026. Shift4 title is
POS Programming CMMT Rep I; title variants aid retrieval but are not generated
facts. SNHU is B.S. Computer Science in progress, with no definitive graduation
date. PR Assistant is production-onboarded with adoption limits. ROMGuide is a
prototype. The AIOps operating model is designed, not deployed. Merged scaffolds
remain scaffolds. Bot usage and reboot success metrics do not imply audited
financial savings or incident-resolution improvements. Historical evidence keeps
its historical label.

AWS, EKS, Bedrock, professional Kubernetes, pgvector, Celery, Redis application
architecture, Pyannote, and professional deployments of LangGraph, AutoGen, CrewAI,
and LangChain are guarded. K8s and Amazon Web Services aliases are guarded too.
Unsupported technologies and compound requirements prepare absence/qualification
context for synthesis. Duration is never inferred from employment dates. Only
private/security requests and requests without usable evidence bypass a configured model.

## Retrieval, active synthesis and verification

Retrieval → Evidence packet → Active synthesis → Claim grounding → Semantic
verification → Verified answer or fail-closed evidence response.

`prepareEvidence()` combines deterministic lexical/metadata ranking, intent hints
and evidence-linked skills. Named systems retain detail chunks; known professional
skills retain capability facts plus implementation context. Lifecycle questions
retrieve complementary design, implementation, operation, recovery and observability
records. Gap retrieval selects relevant cloud, delivery, observability or automation
context and excludes unrelated history. Top-K remains five. No vector database or
embedding index is claimed. Unmatched requests return no evidence.

The packet contains only approved public IDs, titles, categories, organizations,
timeframes, maturity, facts (including Documented capability), and qualifiers.
Linked direct/transferable skills, unsupported requirements, general technology
competencies and claim guards are separate fields. Competencies are not career
facts. Neither provider call receives private documents.

`generateGroundedAnswer()` authors new prose, choosing comparisons, priorities,
relationships and significance. Its contract is
`{style,answer:[{text,kind,evidence_ids}],follow_ups}`; kinds are direct, synthesis,
transferable, limitation and general_technology. The model chooses paragraphs or
an organized list. There is no passage whitelist or exact-prose equality. Follow-ups
remain a small approved, evidence-related question set to avoid unsupported premises.
Gap questions also invoke the generator, explaining absent direct experience,
adjacent evidence and remaining competencies without promoting transferability.

`groundAnswer()` checks strict structure, retrieved citation membership, nonempty
career citations, uniqueness, output bounds and high-risk claim atoms. Official
titles require cited employment metadata; durations cannot be inferred;
numbers, metrics and dates need cited support. Guarded/unestablished technology
attribution and maturity upgrades reject the answer. Negative qualifications can
name unsupported requirements. General knowledge cannot become uncited career
evidence. Guarded tool references can describe a target role, transferability or learning
requirements; that is distinct from claiming existing use/proficiency. Explicit
positive tool-experience assertions remain forbidden even in transferable units.
Numeric/proper-token checks are conservative, not a complete entailment
algorithm for arbitrary natural language.

`verifyGroundedAnswer()` makes a separate bounded call with the original question,
completed units, exact packet and guards. Its only output is
`{claims:[{index,supported,evidence_ids}]}`. `verifyVerdict()` requires every unit
exactly once, true verdicts and unchanged citation sets. It cannot rewrite text,
add evidence or partially approve an answer. Every material factual statement,
scope, ownership, maturity and compound requirement must pass. This model gate
supplements deterministic authority; it is not a formal proof of truth.

A deterministic or semantic rejection permits one fresh corrective synthesis,
with a server-owned bounded failure code/unit and optional numeric atom, followed
by a fresh verdict. Correction also receives the structurally validated
prior draft, explicitly treated as rejected output rather than evidence. That draft
is never logged or displayed unless a new synthesis and verdict both pass. At most
two generation and two verification calls share one deadline. Provider errors and
cancellation fail closed. No rejected output or hidden reasoning is returned.
Retrieved evidence stays inspectable if generation or verification is unavailable.

Authority is explicit: retrieval determines available career facts; the generator
determines prose and supported analysis; deterministic guards constrain critical
claims; the verifier assesses semantic support. Visitors see citations, source
facts, maturity and qualifiers. Prose renders as React text, never model HTML.
Grounding verdict events contain only support status and server-owned bounded validation codes, never rejected prose or reasoning. Real stream events drive Understanding, Retrieving, Grounding, Synthesizing,
Verifying and Response states without artificial delays or reasoning text.
Verification also uses the existing bounded Living Interface event bridge.

## API, privacy, and operations

Input is JSON, same-origin when an Origin header is supplied, 3–600 characters,
and at most 4KB of body bytes. Query safety rejects private-data and prompt override
requests before model access. Corpus text is inert evidence, not instructions.
The provider has no tools, filesystem, private documents, or environment access.
Provider failures are sanitized; credentials, internal prompts, stack traces and
configuration are not API response fields. No response cache is used for this release.

### Ask usage telemetry

`recordAskTelemetry()` is a small server-side abstraction. The Hobby deployment
uses structured `console.info(JSON.stringify(event))` records for actual bounded
pipeline stages and one completion, typed `ask_ladimus_query`. Fields are sanitized `query`, finite
category `intent`, at most five public `evidence_ids`, finite outcome `status`, and
rounded `latency_ms` clamped to 0–60,000, and optional finite `stage`. Stages are
`policy_refusal`, `retrieval_only`, `generation_started`, `generation_completed`,
`verification_passed`, `verification_failed`, `corrective_generation`, and
`answer_completed`. Stage records contain no model reasoning or failure payload. Statuses are `success`, `no_evidence`,
`generation_unavailable`, `provider_error`, `validation_rejected`, and
`rate_limited`. Privacy refusals are `no_evidence`; verified gap answers are `success`, and
unsupported generated claims finish as `validation_rejected`;
privacy requests have a `private` intent and their text is omitted entirely.
Rate-limited requests record an empty query without reading the rejected body.
Malformed or origin-rejected requests are not logged.

`sanitizeQuery()` redacts email addresses, phone-like strings, common API keys,
bearer tokens, JWTs, labeled credentials, long opaque tokens, and URLs (including
query strings, fragments, and credentials). It removes control characters,
bounds logged questions to 240 characters, and omits excessive input over 2,048
characters. It is a conservative heuristic, not a promise that arbitrary prose
cannot contain personal information. The subordinate input disclosure explains
privacy redaction, absence of visitor identifiers in these events, and asks
visitors to avoid personal details and secrets.

The provider interface receives the sanitized, whitelisted event; it never gets
a raw query or request object. Telemetry does not collect IPs, persistent visitor
IDs, fingerprints, authentication identifiers, or geolocation, and does not join
request metadata to query content. The existing ephemeral IP rate limiter remains
separate. No prompts, provider payloads, policy text, retrieved excerpts, or private
corpus fields are logged. Runtime log retention/access are managed by Vercel;
this release adds no database or visitor-profile store. Both synchronous provider
throws and asynchronous rejections are swallowed, and telemetry is never awaited
on the answer path.

A future server-side Web Analytics provider on an eligible Pro plan, persistent
store, or private insights dashboard can implement `AskTelemetryProvider.record`
without changing retrieval, generation, or sanitization. This release does not
assume custom Analytics events are available on Hobby. Any future storage provider
must define retention and access boundaries separately; long-running work needs
the hosting platform's background-work lifecycle rather than delaying answers.

Budgets: eight requests/minute per platform IP per instance; 2,000 bounded rate
buckets; three active requests per instance; five evidence chunks; five explanatory
paragraphs or eight list units; 1,800 characters/unit and 5,000 answer characters;
1,700 generation and 1,100 verification completion tokens per call; two generation
and two verification calls maximum; one shared 18-second generation/verification
deadline; 25-second client timeout; 30-second route budget. On Vercel, the platform's
`x-vercel-forwarded-for` header identifies callers. Locally requests share a local
bucket. These in-memory controls are per instance, not globally distributed;
complement them with Vercel Firewall limits and provider account spend caps for
larger traffic. Client cancellation aborts pending provider calls and settles the service even if
a test provider ignores AbortSignal. Provider response reads are capped at 64KB.

Required server-only production configuration:

```text
ASK_LADIMUS_API_KEY
ASK_LADIMUS_MODEL
```

Optional `ASK_LADIMUS_API_URL` is a trusted HTTPS OpenAI-compatible Chat Completions
endpoint; the default is `https://api.openai.com/v1/chat/completions`. A configured
model must support JSON mode and `max_completion_tokens`. GPT-6 Luna uses
`reasoning_effort: low` on both bounded calls; other configured models keep the
existing compatible request contract. This preserves the model and leaves time for
verification/correction. [Official model support](https://developers.openai.com/api/docs/models/gpt-6-luna). No model is silently
chosen. Provider request shape follows the official Chat Completions reference:
https://developers.openai.com/api/reference/resources/chat/subresources/completions/methods/create

Missing configuration leaves the site deployable. Retrieval and evidence inspection
remain usable; generation visibly reports unavailable, with no success styling.
Only `.env.example` exists locally; no live model credential was used in deterministic
tests. Vercel environment-variable presence requires a separate production check.

## Accessibility and performance validation

Keyboard form submission, semantic labels, visible focus, status announcements,
modal Escape, focus restoration, native scrolling, and readable evidence are
implemented. Reduced motion, forced colors and print disable Canvas. Reduced
motion disables CSS animation/transitions. Layout uses minmax(0,...) tracks,
wrapping controls, safe-area drawer padding, a native scrollable dialog, and no
fixed mobile chat bubble. The site remains usable if Ask Ladimus is unavailable.

Required static checks:

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run build
node --test tests/living-interface.test.mjs
node --experimental-strip-types --test tests/ask-ladimus.test.mjs tests/ask-synthesis.test.mjs tests/ask-capability-gap.test.mjs tests/ask-telemetry.test.mjs
git diff --check
```

The deterministic RAG suite tests real retrieval and policy logic and mocks only
the provider boundary. It covers IDs/schema, sanitization, canonical titles,
maturity, skill/hint references, ranking, top-K, no/partial evidence, private and
injection queries, guarded technologies, malformed output, citations, provider
failure/timeouts, API validation, origin/body/query bounds, request limits and
concurrency. Living Interface tests cover the shared scheduler, pointer damping,
taps, compact budgets, semantic events, failure settlement, pause and cleanup.

`tests/browser-intelligence.mjs` supports the production four-route/seven-viewport
matrix, screenshots, drawer Escape/focus restoration, motion pause, evidence,
unsupported/private queries, reduced motion, forced colors, no-JS fallback,
React commits, layout shifts and shared callback measurements with an existing
Chromium CDP endpoint. `ALLOW_LOCAL_QA=1` permits internal localhost QA only; final
acceptance uses the production URL. The retained v0.5 browser suite continues to
cover deeper pointer/touch, remount and cleanup behavior. Browser artifacts remain
ignored. Browser tests must actually run before claiming production acceptance.

## Release

The repository deploys automatically from main through Vercel. Use validated feature
commits, normal pushes and fast-forward merges only. Do not claim live model
functionality before production configuration and tests. Record release SHA and
roll back through `git revert <release-sha>` followed by a normal main push;
never reset shared main. Public logo and verified profile/contact destinations
are retained. Dedicated favicon and video walkthrough remain optional follow-ups.
