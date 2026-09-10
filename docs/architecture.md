# Ladimus Portfolio architecture

## Scope

Portfolio v0.3 remains one Next.js App Router application. The homepage, /work,
and /projects/ladimus-review are prerendered Server Component routes. The project
page is a compact editorial overview with three real evidence captures and an
explicitly unpublished video walkthrough slot;
there is no backend, CMS, or deep case-study infrastructure.

## Runtime and dependencies

- Node.js 22.19.0 is the verified local runtime; use the Node 22 line for deployment.
- npm 10.9.3 is the recorded package manager. On this Windows environment use
  `npm.cmd`, because PowerShell's execution policy blocks `npm.ps1`.
- Next.js and React are pinned to compatible stable releases. Direct dependency
  versions and transitive resolutions are recorded in package.json and package-lock.json.
- ESLint 9 is intentional: the React, import, and accessibility plugins used by
  eslint-config-next do not yet declare support for ESLint 10. npm marks ESLint
  9.39.5 as unsupported; track coordinated plugin/framework upgrades to ESLint 10.
- TypeScript 5.9 is intentional: the current typescript-eslint peer range excludes
  TypeScript 7. Keep compiler and lint upgrades coordinated.
- No component framework, CSS framework, animation package, AI SDK, database,
  authentication library, or global state manager is installed.

Use `npm.cmd ci` for repeatable dependency installation from the lockfile. Review
engine and peer requirements when updating packages; do not bypass them with
`--force` or `--legacy-peer-deps`.

## Application structure

```text
src/
  app/                    Route composition, root layout, metadata, 404
  components/
    layout/               Site header and footer
    ui/                   Container, Section, ActionLink
  config/site.ts          Identity, editable hero/profile copy, navigation, links
  content/projects.ts     Repository-owned project records
  content/ladimus-review.ts Editorial principles and media records
  features/projects/
    types.ts              Project, case-study, and media contracts
    project-card.tsx       Shared homepage/work project presentation
    review-visual.tsx      Labelled conceptual validation diagram
    project-media.tsx      Image, captioned video, and placeholder rendering
  styles/
    tokens.css            Shared Ladimus design vocabulary
    globals.css           Reset, base elements, selection, focus
```

Styles live beside components in CSS Modules. Route files compose the page;
shared UI primitives do not import project content or route modules. Add assets
under public/images when real image assets exist. Avoid empty feature scaffolding.

Container owns the shared content width and gutters. Section adds vertical
spacing and requires a labelled heading association. ActionLink uses Next.js Link,
which renders an anchor for navigation, not a button with simulated link behavior.
ProjectCard shares the featured presentation between the homepage and /work.
The current single project uses ReviewVisual, a CSS illustration explicitly labelled
as conceptual rather than a screenshot or evidence of a shipped implementation.

## Server and client components

All authored components are Server Components. The header uses wrapping, visible
links rather than a scripted mobile menu. Fragment links and page navigation work
without application JavaScript. Next.js still supplies its framework runtime.

Add `use client` only at an interaction boundary that requires browser state or
events. Keep that boundary small; do not convert the root layout or static content
to client components to support a local interaction. No context provider is needed.

## Styling and accessibility

CSS custom properties are the source of truth for semantic colors, metallic
treatment, spacing, typography, content widths, radii, elevation, focus, and motion.
Components consume semantic tokens instead of duplicating palette values.
These plain CSS tokens can later be extracted into a shared ecosystem package.

The design retains graphite surfaces, high-contrast text, green primary actions,
cyan focus/labels, and metallic typography. Shared technical-surface and faint-grid
tokens frame cards and the conceptual diagram. The homepage uses a split hero,
radial lighting, and a one-time CSS entrance (700ms) and grid fade (1400ms).
Animations only run with prefers-reduced-motion: no-preference. Card hover movement
is disabled under reduced motion; there are no continuous animations or new packages.

Layouts are mobile-first, with fluid type and spacing, wrapping navigation and
actions, and a two-column profile layout only when space permits. A local system
font stack avoids network font requests. A future licensed self-hosted font can
replace the font tokens; use next/font/local when assets are available.

Accessibility target: WCAG 2.2 AA. The shell includes an English document language,
skip link, focusable main target, labelled navigation, section heading associations,
visible focus rings, semantic lists, and real anchors. Navigation and action links
have at least 44px vertical targets. Reduced-motion preferences disable transition
durations; forced colors retain readable wordmark text. Status information has a
text label rather than relying on its green dot. Contact destinations are real anchors; the résumé is hidden until a verified asset is supplied.

## Project content model

Project includes slug, title, summary, category, technologies, optional status and
themes, featured,
optional local detail URL, optional HTTPS repository/demo URLs, and an optional CaseStudy. CaseStudy starts
with problem, approach, and outcome strings. Do not invent outcomes to fill it.

The featured record describes Ladimus Review using approved public-safe positioning.
Themes are distinct from verified technologies. Status is optional to avoid implying
an unverified release stage. Content uses `satisfies readonly
Project[]` for compile-time checking without a runtime schema dependency. This
does not validate external content: add boundary validation if content later
comes from a CMS or API. Slugs must be unique and URL-safe before detail routing.

The homepage and /work render the single repository-owned record through ProjectCard.
The Ladimus Review route imports that same named record directly. No dynamic lookup,
selector layer, CMS, MDX, or slug router is needed for this single detail page.
Unknown project URLs use the existing 404.

## Project detail and media

/projects/ladimus-review includes overview, problem, design principles, a conceptual
workflow, technology disclosure, and proof/media sections. Per-route titles,
descriptions, Open Graph, and Twitter metadata describe the relevant page.
The story and media records live in content/ladimus-review.ts.
The verified implementation stack and public repository are published alongside
three real captures: structured review, human approval, and fail-closed execution
authority. The detail page's source action uses the project record's repositoryUrl.
Only the video walkthrough remains unpublished; measured outcomes are not claimed.

ProjectMedia is a discriminated union:
- placeholder: format label plus shared id, title, and caption;
- image: local src, meaningful alt text, intrinsic width and height;
- video: local MP4 src and an English WebVTT captionsSrc.

Replace a placeholder record with a real image/video record when approved media is
available. Current captures live under public/media/ladimus-review with matching
root-relative paths. next/image preserves image dimensions; every image also has
a visible, keyboard-accessible link to its original asset in a new tab, with
noopener/noreferrer and an accessible name identifying the capture. Videos use
native controls, preload=none, and a captions track. Figures retain visible captions.
Do not put secrets or proprietary output in public assets. The unpublished video
slot has no fake playback controls or recording.

## Future Ask Ladimus boundary

Reserve features/ask-ladimus for interactive UI and app/api/ask/route.ts for its
server endpoint. Provider credentials and provider-specific code must remain in
server-only modules. The public client must never receive secrets. When implemented,
define validation, streaming, cancellation, errors, rate limits, and operational
budgets at that boundary. No endpoint, provider abstraction, chat UI, or SDK exists
in this foundation.

## Validation and testing strategy

```powershell
npm.cmd run dev
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run build
npm.cmd run start
```

Lint uses Next.js Core Web Vitals and TypeScript flat configs with zero warnings
allowed. Type checking runs Next.js type generation before strict tsc validation,
so it works on a fresh checkout. TypeScript also enables unchecked-index and exact
optional-property checks. Compiler cache output stays under the already-ignored
.next directory. Generated next-env.d.ts is managed by Next.js.

Lint and type checking are separate gates: a production build does not replace
lint. Run all three in future CI with npm ci. Do not ignore build/type errors.

There is currently no custom application logic requiring a unit-test framework.
Add tests for project lookup, publication filtering, or external data validation
when that behavior is introduced. Use browser tests for future interactive flows;
avoid tests that only repeat static JSX or TypeScript field declarations.

For this shell, browser verification should cover small and large viewports,
horizontal overflow, keyboard traversal, skip-link focus, fragment destinations,
404 behavior, reduced motion, and readable color contrast. Automated checks do not
replace a screen-reader review or a complete accessibility audit. Measure real
performance after hosting is selected; no Lighthouse or Web Vitals score is promised.

## Deployment assumptions and deferrals

Host on a platform supporting the standard Next.js Node runtime, with a production
build followed by next start (or the hosting provider's supported adapter).
Current content can be prerendered; static-export-only mode is intentionally not
enabled so a future server endpoint remains possible. No hosting vendor is selected.

No environment variables are required. The root layout provides a descriptive
title, description, Open Graph website metadata, and Twitter summary metadata.
Configure the verified public domain before adding canonical URLs, sitemap,
or absolute social images. No domain is inferred from local development.

Verified brand, public name, GitHub, LinkedIn, email, logo dimensions/path, and
optional résumé are centralized in src/config/site.ts. Profile links use their
verified destinations directly in the current tab; email uses mailto. A null
résumé destination is omitted from the page. The footer edition is 0.3.

The canonical public/images/Ladimus_logo.png is 1052 × 215 pixels (about 4.9:1).
The hero uses next/image with intrinsic dimensions, responsive sizes, and preload.
CSS preserves its aspect ratio and limits its width to 368px. The source asset
is unchanged. Text explicitly identifies Ladimus Engineering and Luis Tomassini.
The wide wordmark is unsuitable for a legible small favicon; a dedicated approved
square icon is a follow-up. No replacement icon is generated. Social metadata
remains text-only pending a suitable social asset and verified production domain.

Identity, contact, and project repository publication gaps are resolved. A résumé,
dedicated icon, video walkthrough, and production domain remain optional follow-ups.
No analytics, dependencies, or Client Components were added.

Deliberate deferrals: extended case-study infrastructure, external integrations, Ask Ladimus,
CI provider setup, analytics, and deployment.
