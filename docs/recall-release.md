# Recall portfolio and distribution handoff

The portfolio integration is prepared for review, not production publication.
Recall is the third typed project after Ladimus Review and Ask Ladimus. The page
at `/projects/recall` is server-rendered, uses shared layout/tokens, and includes one
authentic synthetic-data emulator capture. It does not add Recall to Ask Ladimus's
career corpus or change that feature's configuration, prompts, API or interface.

## Review locally

On `feat/recall-portfolio-integration`, run:

```powershell
npm.cmd run dev -- --hostname localhost --port 3103
```

Open `http://localhost:3103/projects/recall`, `/work` and `/`. Use **localhost**
consistently: Next's local canonical request origin uses that host, and the existing
Ask API correctly rejects a mismatched `127.0.0.1` Origin. Do not weaken the API's
origin check to accommodate a preview URL.

Check desktop and narrow/mobile layouts, focus, disclosure controls and the real
image. The current Android control must say **Download not available**. No APK
should be downloaded. Review the full page before approving any website deployment.
Pushing a branch can trigger Vercel preview deployment; do not push/merge/deploy
without the founder's requested review and authorization. Production remains on
the existing release until explicitly approved.

## Current source of truth

`src/features/recall/release.ts` holds the package identity, channel, URL,
verification record and approval flags. The download UI and stage text consume it.
The current local APK was checked using SHA-256 and Android `aapt dump badging`.
Identity verification does not certify security or approve public distribution.

Current state: `internal-qa`, no hosted URL, no hosted-asset verification, no public
download approval and no release-gate approval. Known native cryptography and
physical-device qualification blockers remain. The supplied development README
reports 65 host tests and native emulator validation; those tests were not rerun
as part of the website task. ARM64 was compiled/inspected, not physically qualified.

Only the approved synthetic-data screenshot is included in `public/images/recall/`.
The APK, model weights, source ZIP, signing keys, keystores, private test data and
internal security reports must not enter this repository or a website deployment.

## Connect a restricted tester download

Recommended hosting: GitHub Releases in a **separate private binary-only repository**,
with read access granted only to approved testers. This preserves application-source
privacy. No repository or release has been created and no binary has been uploaded.
Do not assume that an obscure URL or an unlisted public release restricts access.

1. Obtain authorization for the release repository and specific tester distribution.
2. Upload only the verified QA APK to that private repository's versioned release.
   Do not attach the source archive, signing material, security report or private data.
3. Verify that unauthenticated/unapproved users cannot retrieve the APK, and that
   an approved tester can sign in and download the actual package. Check its full
   byte size, SHA-256 and Android package/version/ABI information after download.
4. Set `downloadUrl` to the **actual stable HTTPS APK asset URL**, ending in the
   exact filename. Do not use a source-archive URL, local path, credential-bearing
   URL or temporary signed/query-token URL in public source.
5. Set `assetVerification` with the tested URL, filename, bytes, SHA-256, version,
   build, ISO `checkedAt` time and `access: "restricted"`. Keep `channel: "internal-qa"`,
   `publicDownloadApproved: false` and `releaseGatesApproved: false`.
6. Run `node --test tests/recall.test.mjs`, typecheck, lint and build; review the UI
   and test access as an approved tester before authorizing website deployment.

The link then reads **Download QA for approved testers**. Authentication and tester
authorization must be enforced by the binary host, not by an obscured client button.
The gate binds verification to identity and URL; changing any of those fields
disables the link until a matching verification record is supplied.

If no authorized host exists, leave the current disabled state. The exact remaining
publication step is to provision the authorized restricted release, upload this APK,
verify access plus downloaded identity, and configure those manifest fields.
There is no functioning external tester download until those steps are completed.

## Approve a future public beta

Resolve the release's documented security and physical-device gates, obtain explicit
founder authorization and retain the approval evidence in the appropriate private
release process. Do not commit internal security evidence to this public website.
Verify a deliberately public, versioned APK asset and bind it in `assetVerification`
with `access: "public"`. Only then set `channel: "public-beta"`,
`releaseGatesApproved: true` and `publicDownloadApproved: true`. All conditions must
agree before a public action is enabled. Website production deployment requires its
own explicit approval. Neither this document nor the UI is release approval.

## Update to Recall v0.6 or later

Start with the new package's measured version/build, filename, byte size, SHA-256,
minimum Android and ABIs. Reset `downloadUrl` and `assetVerification` to null and
both approval flags to false. Verify the new package and hosting/access from scratch.
Select its actual channel, fill the new proof only after verification, and follow
the appropriate restricted/public process above. An old verification record cannot
authorize a changed version, build, filename, hash, size or URL.

No product-page rewrite is needed to switch the download action or metadata.
Review product claims and security limitations against the new release separately;
do not silently promote roadmap items to implemented features. Use real new media
only after checking it contains approved synthetic content.

## Host availability and installation

The website renders locally stored metadata and never proxies the APK, polls the
host or adds download tracking. An enabled link opens the host in a separate tab;
host unavailability leaves the product page usable. There is no paid storage or
new external service dependency in this implementation.

Installation guidance keeps Android protections enabled, explains per-source
installation permission, and asks testers to stop when Android blocks a package.
It does not instruct anyone to disable Play Protect. Google Play remains a future
goal, and checksum identity is never presented as proof of software safety.
