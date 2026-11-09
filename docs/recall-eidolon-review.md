# Project EIDOLON portfolio review

Status: **ready for local founder review; not deployed or pushed**. Review branch `feat/recall-eidolon-showcase`, based on `8535693feb541446f10dd183d47200a70c9866d8`. The Android checkpoint remains `bae2c463839bfee7b56049f727192e11a5fb7931`; this task does not modify or requalify the Android app.

## What changed

The existing `/projects/recall` route now introduces Recall v0.7 / Project EIDOLON. A silver/emerald hero frames an authentic historical application capture, followed by editorial Vision and pixel-retrieval stories, an interactive four-environment Vault Studio, Source Review, a native architecture narrative and an explicit release boundary. The original site shell, metallic Ladimus wordmark, URLs, homepage architecture, Ladimus Review and Ask Ladimus implementation are retained. Featured/work discovery reads updated Recall metadata and an explicitly historical v0.6 capture.

Only Vault Studio adds a small client boundary: four ordinary keyboard-operable pressed buttons select one image and description. No animation or UI dependency was added. Original app artwork was converted to WebP without resizing or changing aspect; all six new media files total934,820bytes. Next Image handles responsive loading. Nonselected theme images are not rendered up front; body content remains server-rendered. Motion is a restrained entrance that respects reduced motion. Mobile imagery preserves the artwork rather than cropping away the scene.

## Release and factual integrity

- RC23 is **internal / controlled QA only**, with no download URL, public asset proof or authorization. It has a distinct typed identity in `src/features/recall/eidolon.ts`; changing its channel or attaching legacy evidence cannot authorize it.
- Existing `src/features/recall/release.ts` is byte-for-byte unchanged. Its v0.6 build6 public experimental QA authorization, signature and complete-download integrity records are preserved. A fresh anonymous HEAD returned200 with564,963,288bytes. This is a reachability check, not a new complete binary/signature verification; the older complete identity evidence remains dated2026-10-30.
- The legacy download appears only inside its own explicitly labelled disclosure, with version-specific limitations. It is not labelled EIDOLON. No RC23 APK, model ZIP, internal host path or new public download URL is exposed.
- Source Review is described as locating saved passages and opening originals, not enabled advanced generative conversation or factual verification. Base features, separate approved optional packs and unavailable features have distinct explanations.
- The child/yellow-raincoat example is historical build10. Its displayed capture contains an edited/reviewed version2 description, not untouched model output. RC23's separate bicycle/stone-wall generated description is attributed separately. The wrong-dog-caption retrieval story accounts for the newly imported duplicate ranked first and earlier original ranked second.
-156 Android host tests and native/app acceptance are **reported Android handoff results**, not Android tests rerun by this portfolio task.6GB advanced and4GB bundled-core emulator observations are not universal memory requirements, phone performance or broad accuracy measurements.

## Media provenance

`docs/recall-eidolon-media.json` measures each source/derivative and states what it proves. Four WebPs derive from the app's original generated Core/Castle/Sunset/Aurora artwork. The hero is explicitly a portfolio composition containing an unchanged build10 screenshot. A separate unchanged build14 screenshot shows historical visual retrieval. The seven older Luminance PNGs and their hash inventory remain untouched. No stock imagery, fabricated Android screen or replacement logo was added. No FLAG_SECURE change occurred. RC23's Android graphical readability remains unverified, independently of this website's visual QA.

## Validation

-379/379 existing and expanded Node tests passed, including identity-bound fail-closed download behavior, cross-version authorization refusal, actual rendered page boundaries, historical-media integrity and initial theme controls.
- Production Next.js build passed, all existing routes retained. TypeScript and ESLint passed. The repository defines no formatter command/configuration; no global formatting rewrite was applied. `git diff --check` is part of final source review.
- Actual headless Edge rendered360,390,430,768,1024 and1440px viewports; innerWidth was measured, with no page overflow. Desktop/mobile screenshots and all four theme captures were produced. Touch targets meet44px; keyboard Tab/Space selection and visible focus were checked.200% root text sizing, reduced motion, valid anchor targets, no-JavaScript content and all shared routes were checked.
- The only APK anchor in the rendered page is the separately labelled v0.6 release. The actual page, not merely metadata, was checked.
- An axe-core WCAG2A/AA/2.1AA scan found no confirmed violations. Gradient text/background contrast requires manual review; this is not a WCAG conformance certification. ARIA labels on two explanatory groups were corrected after review. Visual inspection and conservative color-pair checks cover the relevant text and atmospheric surfaces.
- No new application runtime dependencies or changes to the lockfile, Vercel config, global layout/navigation, Ask implementation or Ladimus Review source. Verification tooling was isolated outside the app.

Failures and warnings remain recorded: an initial strict indexed-access type error was repaired with a bounded default environment; a Next prerender mkdir was denied by the sandbox and the same build passed outside it. Browser review caught clipping of the display-title dot at200% text, corrected by reducing the mobile minimum display size. The existing public favicon returns404; it is retained as a known baseline warning rather than being silently counted as a new-page success. CUA could not initialize (kernel-assets OS error3); headless Edge supplied the actual website inspection and captures.

## Open gates

The Android candidate still includes unsupported OpenSSL3.3.2; physical-device security, hardware-backed biometric qualification and current Android graphical readability remain incomplete. Advanced conversation is disabled; no recovery/export exists. The page makes these limits visible.

The unchanged portfolio dependency baseline also reports13 npm audit findings (8moderate,4high,1critical), including Next16.3.4. No audit-fix/lockfile or unrelated dependency upgrade was attempted in this page scope. Dependency remediation needs its own reviewed change before production promotion. Existing Vercel configuration reports Node24 while package engines request22; local validation used Node22.19.0/npm10.9.3. No Vercel configuration or deployment was changed.

## Founder review

Current local production preview: **http://127.0.0.1:3123/projects/recall** (loopback only).

To restart from this checkout in PowerShell:

    Set-Location 'C:\Users\luist\Documents\Codex\2026-10-31\files-pasted-by-the-user-recall\work\ladimus-portfolio'
    npm ci
    npm run build
    npm run start -- --hostname 127.0.0.1 --port 3123

Use Node22 as declared by the repository. Dependencies are already installed in the prepared checkout; no provider secrets are required for Recall. Review Vision, the wrong-caption example, all four theme buttons, Source Review, engineering and release gates. At360/390px verify text and controls. Open the legacy disclosure and confirm its CTA saysv0.6; do not infer approval for RC23. Visit `/`, `/work`, `/projects/ladimus-review` and `/ask` to inspect preservation.

Visual proof is in the task outputs: `eidolon-1440.png`, `eidolon-390.png`, `eidolon-360.png`, `eidolon-768.png`, `eidolon-font-200.png`, `eidolon-studio-*.png`. `portfolio-browser-acceptance.json` records actual dimensions/interaction results and limitations. They prove website rendering, not Android UI qualification.

Next single milestone: founder review of this local implementation, followed by separately authorized dependency remediation/deployment decisions. No merge to main, remote push, Vercel deployment, GitHub Release change, APK publication or model-pack upload was performed. Stop here.
