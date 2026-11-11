# Build 26 restricted founder distribution

Founder authorization: Build 26 production founder-distribution directive, continued after the usage-limit interruption. This authorizes the website integration and private artifact delivery only. Gate A is GREEN within the Android team's software scope. Gate B requires founder Galaxy Z Fold 7 hardware acceptance. No public-beta authorization is present.

## Artifact and host

The exact qualified APK is version 0.7.0-qa, code 26, package `engineering.ladimus.recall.qa.ascension`, 566701644 bytes, SHA-256 `e252bf8f9bfe9cd661cadeb9df38ad44e8b2ee5ff06f1767916c4332a21fa94d`. Its QA certificate is `e28c77cccb4d589fb1963f5159bd9b42fad66637532129d840edd8ecebcd42d5`. Android aapt and apksigner were rerun on the supplied binary: API24 minimum, target36, ARM64/x86_64 and the original signer match. The APK was not rebuilt, modified or re-signed.

`Wumbologist-1/recall-founder-qa` is a dedicated private repository. Its collaborator inventory contains only its owner, Wumbologist-1. Repository release immutability was enabled before publication. Tag `v0.7.0-founder-qa.26` is a private immutable prerelease, release ID 441207676, APK asset ID 733988433. Its assets include the exact APK, checksums, a scoped identity JSON and the founder installation guide. The Android source/evidence finalization commit is `42f9efa2f8eae71d28e84aa05ec55d967fdf9cc7`.

An entire authenticated hosted APK download was independently hashed and measured; both match the supplied artifact. Anonymous HEAD, GET and range requests against the release page, direct asset URL, release API and asset API each returned 404 without APK bytes. GitHub's upload digest was also checked but was not treated as a substitute for downloading the full asset.

## Website boundary

The website has no founder session, token, proxy or private-object cache. Its CTA enters GitHub's normal login flow with a fixed same-host return path to the versioned private release. GitHub enforces repository access, including on the underlying asset and API. Public release metadata and the login URL confer no artifact permission. No signed object URL or credential is placed in source, HTML or client bundles.

`founder-release.ts` represents restricted-founder distribution separately from the legacy public release. It checks the fixed Build26 identity, fixed repository/tag, software/hardware gate state and measured private/immutable delivery record before producing a CTA. Missing proof, mismatched artifact fields, public or unknown channels and missing host protections fail closed. This build-time verification record does not replace GitHub ACL enforcement. Keep the artifact repository private and do not add collaborators without fresh founder authorization.

The existing `release.ts` and its legacy v0.6 proof, signature and founder authorization remain byte-for-byte unchanged. Historical RC23 remains unavailable and cannot inherit legacy authorization. Public beta stays false. The showcased historical images retain their build labels; no new app screenshot or physical acceptance is invented. Build26's maintained SQLCipher provider and remaining hardware/SDK/recovery limitations replace obsolete current-release claims.

## Models and installation

The approved Qwen3-VL and EmbeddingGemma ZIPs were reused. ZIP sizes/hashes, exact manifests and every GGUF payload were verified against the catalog inside the supplied signed Build26 APK. Pinned upstream publisher/conversion cards declare Apache-2.0. Unmodified model cards, full license text, component manifests and provenance notices accompany any private pack release. Model availability is displayed separately; pending hosting does not block Essential/Balanced or the core APK. No weights are committed to this repository.

The mobile guide at `/projects/recall#founder-installation` covers GitHub authentication, exact identity, Android download/install-source prompts, compatible in-place upgrades and the hardware checklist. Never recommend uninstalling, clearing data, bypassing authentication or disabling Play Protect. Optional models require approved pairs, the supported 6GB tier, current memory reserve and roughly 7GB working storage. Source Review remains supported; experimental conversation/image chat is disabled.

## Operations

Production uses the existing main-to-Vercel Git integration. No environment variables, DNS, ownership or new paid service is required. GitHub releases support files below 2GiB; each staged asset is within that limit. This uses release assets, not Git LFS, Actions artifacts or Vercel Blob. See [GitHub release storage documentation](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases).

For a future artifact, obtain fresh restricted distribution authorization and create a new immutable tag. Verify its complete authenticated download and anonymous refusal before changing the fixed website identity and proof. Never overwrite this release or attach legacy authorization to a new build. For shutdown, remove the website CTA and revoke private repository access as appropriate; a website rollback alone cannot revoke a previously authorized downloaded copy.

Existing portfolio dependency advisories, favicon 404 and Node engine/configuration mismatch remain separate baseline issues. They are not changed by this focused integration. This task does not requalify Android software or perform Gate B.
