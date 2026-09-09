# Ladimus Portfolio architecture

## Scope

Portfolio v0.1 is one Next.js App Router application. This foundation establishes
the toolchain, a responsive shell, semantic design tokens, a small homepage, and
a typed project content contract. It does not implement full case studies or Ask
Ladimus. The existing README, agent instructions, and ignore rules are preserved.

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
  content/projects.ts    Repository-owned project records
  features/projects/
    types.ts              Project and case-study contracts
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
No generic Surface component is needed by the current single project presentation.

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

The foundation uses graphite surfaces, high-contrast text, a green primary action,
cyan labels and focus rings, and a restrained metallic wordmark. Glow is limited
to the opportunity status dot. There is no continuous animation or glass blur.

Layouts are mobile-first, with fluid type and spacing, wrapping navigation and
actions, and a two-column profile layout only when space permits. A local system
font stack avoids network font requests. A future licensed self-hosted font can
replace the font tokens; use next/font/local when assets are available.

Accessibility target: WCAG 2.2 AA. The shell includes an English document language,
skip link, focusable main target, labelled navigation, section heading associations,
visible focus rings, semantic lists, and real anchors. Navigation and action links
have at least 44px vertical targets. Reduced-motion preferences disable transition
durations; forced colors retain readable wordmark text. Status information has a
text label rather than relying on its green dot. Resume availability is stated
explicitly at the linked profile section.

## Project content model

Project includes slug, title, summary, category, technologies, status, featured,
optional HTTPS repository/demo URLs, and an optional CaseStudy. CaseStudy starts
with problem, approach, and outcome strings. Do not invent outcomes to fill it.

The first record describes this repository. Content uses `satisfies readonly
Project[]` for compile-time checking without a runtime schema dependency. This
does not validate external content: add boundary validation if content later
comes from a CMS or API. Slugs must be unique and URL-safe before detail routing.

The current page renders the small project list directly. No selector layer exists
yet because there is no filtering, sorting, or lookup behavior to extract. Introduce
features/projects/queries.ts and meaningful tests when those operations are needed.

## Future project details

Add app/projects/[slug]/page.tsx when real case studies are ready. Resolve a project
by slug, prerender published detail pages, return notFound() for unknown or
unpublished entries, and generate per-project metadata. Keep display components
under features/projects. Add MDX only when authored long-form content requires it.
The current project entry is deliberately not a link to an unimplemented route.

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

No environment variables are required. Configure the verified public domain before
adding canonical URLs, sitemap, robots policy, or absolute social metadata. Supply
approved GitHub and resume destinations through site configuration/content. Until
a GitHub URL is confirmed, its action leads to an explicit availability note.

Deliberate deferrals: final copy, brand font/assets, full project case studies,
external integrations, Ask Ladimus, CI provider setup, analytics, and deployment.
These are follow-up decisions, not hidden placeholder implementations.
