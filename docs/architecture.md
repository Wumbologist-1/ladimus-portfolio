# Ladimus Portfolio architecture — v0.6.2

## Application and trust boundaries

One Next.js App Router application, with TypeScript strict mode and no component,
AI SDK, animation, or database dependency added. `/`, `/work`,
`/projects/ladimus-review`, and `/ask` are prerendered. `POST /api/ask` is a dynamic
Node server endpoint. The portfolio content remains server-rendered and usable
without JavaScript. The version label is Portfolio Build 0.6.2.

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
Unsupported technology queries do not invoke a model to invent a positive answer;
they explain the evidence limit and can show adjacent Azure/container evidence.
Seniority, years, graduation dates, broad adoption, ROI, and training claims receive
explicit qualification. Duration is not inferred by the runtime.

## Retrieval and grounding

`retrieveEvidence()` combines deterministic lexical scoring, weighted title/alias
metadata, intent hints, and evidence-linked skills. Named-system questions may
retrieve several detail chunks, while overview queries diversify records. Top-K
is capped at five. Empty or unmatched questions return no supporting evidence.
There is no vector database or semantic embedding index in v0.6. This is lexical
plus structured-metadata hybrid ranking, not a claim of vector search. It works
without any provider credential. Only selected chunks, not the entire corpus, are
sent to generation.

`generateGroundedAnswer()` is the isolated provider boundary. In v0.6.1,
`createSynthesisPlan()` makes reviewed editorial passages available only when all
of their exact supporting facts and maturity statuses exist in retrieved chunks.
The model selects and organizes these cohesive passages through
`{answer:[{text,evidence_ids}],follow_ups:string[]}`. This changes the editorial
layer without changing retrieval, top-K, the public corpus, or the visual runtime.

`groundAnswer()` rejects unknown fields, invented or non-retrieved IDs, missing
supporting IDs, altered prose, duplicate passages, unapproved follow-ups, excessive
units, and answers over 5,000 characters. An existing citation does not authorize
an arbitrary claim. Unsupported prose rejects the whole response; no fabricated
support or silent factual repair is attempted. Updating corpus facts or maturity
disables dependent editorial passages until they are reviewed. This deliberately
uses a closed editorial vocabulary rather than claiming deterministic semantic
entailment of unrestricted LLM prose. Narrow topics without a reviewed passage
retain an exact-fact fallback with title and maturity labels.

Explanatory answers render 2–4 paragraphs where enough evidence exists. Natural
system/project-list questions render a framing paragraph and a concise list.
Direct openings, related engineering themes, concrete ownership and significance,
official titles, and maturity limits are part of the reviewed prose. Metrics are
available only for relevant impact intent. The model selects 2–3 topic-specific,
evidence-supported follow-ups when available. Unsupported technology questions
remain brief and bypass generation. Evidence cards retain the actual source facts,
maturity, and qualifiers; all prose is React text, never raw model HTML.

## API, privacy, and operations

Input is JSON, same-origin when an Origin header is supplied, 3–600 characters,
and at most 4KB of body bytes. Query safety rejects private-data and prompt override
requests before model access. Corpus text is inert evidence, not instructions.
The provider has no tools, filesystem, private documents, or environment access.
Provider failures are sanitized; credentials, internal prompts, stack traces and
configuration are not API response fields. No response cache is used for this release.

### Ask usage telemetry

`recordAskTelemetry()` is a small server-side abstraction. The Hobby deployment
uses one structured `console.info(JSON.stringify(event))` record per completed Ask
attempt, typed `ask_ladimus_query`. The only fields are sanitized `query`, finite
category `intent`, at most five public `evidence_ids`, finite outcome `status`, and
rounded `latency_ms` clamped to 0–60,000. Statuses are `success`, `no_evidence`,
`generation_unavailable`, `provider_error`, `validation_rejected`, and
`rate_limited`. Unsupported experience and privacy refusals are `no_evidence`;
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
buckets; three active requests per instance; five evidence chunks; four explanatory
passages or six list units; 5,000 answer characters; 1,200 completion tokens; 18-second provider
timeout; 25-second client timeout; 30-second route budget. On Vercel, the platform's
`x-vercel-forwarded-for` header identifies callers. Locally requests share a local
bucket. These in-memory controls are per instance, not globally distributed;
complement them with Vercel Firewall limits and provider account spend caps for
larger traffic. Client cancellation aborts the model request.

Required server-only production configuration:

```text
ASK_LADIMUS_API_KEY
ASK_LADIMUS_MODEL
```

Optional `ASK_LADIMUS_API_URL` is a trusted HTTPS OpenAI-compatible Chat Completions
endpoint; the default is `https://api.openai.com/v1/chat/completions`. A configured
model must support JSON mode and `max_completion_tokens`. No model is silently
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
npm.cmd run test:rag
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
