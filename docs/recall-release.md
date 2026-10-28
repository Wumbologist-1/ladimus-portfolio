# Recall public QA distribution

Founder authorization: Project First Contact, 2026-10-28. Public experimental synthetic-data-only QA distribution and portfolio production deployment are authorized. This supersedes the earlier review-only handoff. It does not grant beta/production security approval.

The separate public binary repository is https://github.com/Wumbologist-1/recall-android-releases and the prerelease tag is v0.5.0-qa.5. Only the signed APK and checksum were attached. The repository README and public release notes explain limitations and feedback. Recall Android source, keys, private reports and model files are not in the portfolio or the release repository.

## Identity and access

The single source of website release identity is src/features/recall/release.ts. The exact source APK and complete anonymous public download both measured 564631164 bytes and SHA-256 cda186cef81034e2d187dfffec82b507ffe2689aa740aa80a78da3253024be2b. Android apksigner verified its dedicated QA signer (certificate SHA-256 e28c77cccb4d589fb1963f5159bd9b42fad66637532129d840edd8ecebcd42d5). Android aapt confirmed package engineering.ladimus.recall.qa.ascension, version 0.5.0-qa, build 5, API24 minimum and arm64-v8a/x86_64.

The public-qa channel requires a matching public download verification, identity-bound founder QA authorization and a matching signature verification record. The UI always supplies the experimental QA notice. Public-beta still independently requires publicDownloadApproved and releaseGatesApproved; both remain false. Unknown channels fail closed. Verification proves identity, not security. The static site links directly to the versioned GitHub APK; it does not proxy the binary or add tracking.

## Testing and future releases

Run npm run typecheck, npm run lint, npm run test:rag, node --experimental-strip-types --test tests/*.test.mjs, and npm run build. Review the real browser at mobile/tablet/desktop widths and inspect the actual innerWidth; a reported override alone does not establish mobile QA. The source screenshot is authentic synthetic emulator content, not a physical-device qualification.

For a later APK, measure package identity and signature again. Reset downloadUrl, assetVerification, publicQaAuthorization and signatureVerification to null, and both broader approval flags to false. Obtain fresh authorization for that exact version/build/hash, publish a separate versioned prerelease and verify a complete anonymous download before updating matching records. Never silently replace a versioned asset. Changing identity invalidates old proof and authorization. Only move to public-beta after its independent release gates and founder approval are complete.

## Disable and rollback

For an urgent download shutdown set channel to unavailable and downloadUrl/assetVerification to null, validate, commit and deploy to main. Remove/disable the public release asset as well if distribution must stop: a site rollback alone does not disable a known GitHub URL. Files already downloaded cannot be recalled. Keep the filename/hash advisory available to affected testers.

Vercel can roll back to the preceding production deployment (pre-Recall dpl_8VtnKQyL5WKY5LL9tXPAj6oqxTok, main da2453b) through its rollback action. Inspect the target project first. Vercel rollback can disable automatic production assignment; explicitly restore promotion when resuming normal releases. Prefer a corrective main commit for a manifest-only shutdown.

## Remaining app limitations

Use disposable synthetic information only. Native cryptography maintenance, physical ARM64/Keystore/OEM/lifecycle qualification, resource/thermal/battery behavior and factuality remain incomplete. Full visual comprehension and unrestricted factual answers are unavailable. Migration to production is not guaranteed. Reported 65 host tests are supplied app-development results, not rerun website tests or security certification. Public feedback uses the site's existing verified email with a synthetic/redacted reproduction template. No new backend, account, subscription or analytics was added.
