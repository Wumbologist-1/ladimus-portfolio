# Recall public QA distribution

Founder authorization: Project Luminance v0.6, 2026-10-30. Public experimental synthetic-data-only QA distribution and portfolio production deployment are authorized. This supersedes the earlier review-only handoff. It does not grant beta/production security approval.

The separate public binary repository is https://github.com/Wumbologist-1/recall-android-releases and the prerelease tag is v0.6.0-qa.6. Only the signed APK and checksum were attached. The repository README and public release notes explain limitations and feedback. Recall Android source, keys, private reports and model files are not in the portfolio or the release repository.

## Identity and access

The single source of website release identity is src/features/recall/release.ts. The exact source APK and complete anonymous public download both measured 564963288 bytes and SHA-256 6d806dc0825a9772ec0974668b6a5e656c9bd2ffd5dfa9ed1c8c3a0e32e8c665. Android apksigner verified its dedicated QA signer (certificate SHA-256 e28c77cccb4d589fb1963f5159bd9b42fad66637532129d840edd8ecebcd42d5). Android aapt confirmed package engineering.ladimus.recall.qa.ascension, version 0.6.0-qa, build 6, API24 minimum and arm64-v8a/x86_64.

The public-qa channel requires a matching public download verification, identity-bound founder QA authorization and a matching signature verification record. The UI always supplies the experimental QA notice. Public-beta still independently requires publicDownloadApproved and releaseGatesApproved; both remain false. Unknown channels fail closed. Verification proves identity, not security. The static site links directly to the versioned GitHub APK; it does not proxy the binary or add tracking.

## Testing and future releases

Run npm run typecheck, npm run lint, npm run test:rag, node --experimental-strip-types --test tests/*.test.mjs, and npm run build. Review the real browser at mobile/tablet/desktop widths and inspect the actual innerWidth; a reported override alone does not establish mobile QA. The source screenshot is authentic synthetic emulator content, not a physical-device qualification.

For a later APK, measure package identity and signature again. Reset downloadUrl, assetVerification, publicQaAuthorization and signatureVerification to null, and both broader approval flags to false. Obtain fresh authorization for that exact version/build/hash, publish a separate versioned prerelease and verify a complete anonymous download before updating matching records. Never silently replace a versioned asset. Changing identity invalidates old proof and authorization. Only move to public-beta after its independent release gates and founder approval are complete.

## Disable and rollback

For an urgent download shutdown set channel to unavailable and downloadUrl/assetVerification to null, validate, commit and deploy to main. Remove/disable the public release asset as well if distribution must stop: a site rollback alone does not disable a known GitHub URL. Files already downloaded cannot be recalled. Keep the filename/hash advisory available to affected testers.

Vercel can roll back to the preceding production deployment (previous v0.5 deployment dpl_HeVRJU2GpmSxcy5gVPSN8aJcVFRM, main d74d722) through its rollback action. Inspect the target project first. Vercel rollback can disable automatic production assignment; explicitly restore promotion when resuming normal releases. Prefer a corrective main commit for a manifest-only shutdown.

## Remaining app limitations

Use disposable synthetic information only. Native cryptography maintenance, physical ARM64/Keystore/OEM/lifecycle qualification, resource/thermal/battery behavior and factuality remain incomplete. Full visual comprehension and unrestricted factual answers are unavailable. Migration to production is not guaranteed. Reported 82 host tests are supplied app-development results, not rerun website tests or security certification. Public feedback uses the site's existing verified email with a synthetic/redacted reproduction template. No new backend, account, subscription or analytics was added.

## Luminance media and historical release

Seven unedited standalone D009 PNG captures were copied into public/images/recall/luminance; their byte counts and SHA-256 are recorded in recall-luminance-media.json and checked by tests. Next/Image optimizes their delivery. Only synthetic content is shown. The mistaken final-save.png capture and debug onboarding captures were excluded. Capture protections remained enabled; the engineering report used privileged emulator console captures. No Android application code or protection settings were changed.

The v0.5 prerelease and binary remain unchanged as historical artifacts. Their presence is not a promise of safe downgrade or vault recovery. The current v0.6 manifest uses freshly checked source/download/signature identity and a new identity-bound founder authorization; both production/beta approval flags remain false. If a future artifact publication fails, retain the working prior manifest and label the new distribution pending—never put new metadata above an old binary.
