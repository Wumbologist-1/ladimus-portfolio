# Build 27 — unannounced public QA preview

Founder authorization: Build 27 Production QA Distribution directive, 2026-11-12, explicitly approves this exact APK and production portfolio deployment. The previous Android handoff withheld APK publication; this version-bound directive supersedes that restriction for Build 27 only. It does not approve a general beta announcement, physical Gate B or Google Play.

## Exact identity

- APK recall-0.7.0-platinum-ascension-build27-final-qa-arm64-x86_64.apk, 566,966,197 bytes.
- SHA-256 ff775627bc973ea29f2bdabdb365f6b270eb9b32c4a0f5002ac6d9faedfa0862.
- Original QA certificate e28c77cccb4d589fb1963f5159bd9b42fad66637532129d840edd8ecebcd42d5, verified again with Android apksigner. No rebuild, modification or re-signing.
- Android source 9a26ee2cd13191302548031b794e3b9cdf4eb020; software evidence 1057c4b. Package engineering.ladimus.recall.qa.ascension; 0.7.0-qa/code 27; API 24 minimum, ARM64/x86_64.

## Hosting and policy

Existing public binary repository Wumbologist-1/recall-android-releases (ID 1437656193), separate immutable prerelease v0.7.0-qa.27, release 443635280, APK asset 741502254. Only the exact APK and its checksum were uploaded. Prerelease/latest=false; no separate announcement was sent. Historical APK releases, private founder repository/access and the existing two immutable model ZIPs/notices remain unchanged. The APK is not committed to the portfolio.

The new platinum-release.ts record has its own explicit version/build/hash authorization, measured hosted verification and original signer. All identity fields, the approved URL and certificate are checked before enabling the CTA. Existing RC23, Build 26 and Luminance authorization functions are unchanged. Both broader public-beta approval flags remain false; software Gate A GREEN does not set physical Gate B or general beta approval.

A complete anonymous hosted download must match exact bytes/hash before source enables the CTA. The slow sequential verifier was superseded by resumable anonymous byte-range verification: every exact HTTP206 range/length is checked, then all bytes are hashed in order. No partial/range-only hash is substituted for the complete APK SHA-256. Receipts in build27-distribution/ record public GitHub release metadata, provider digest, anonymous status/content-disposition/length/hash and date. No signed CDN query, credential or private vault/report is published. The stable public GitHub asset link initiates download directly; the portfolio does not proxy the 566 MB binary or require an account.

## Site changes and privacy

Existing EIDOLON layout/artwork/interactivity are preserved. Primary hero and release-panel CTAs say Download Recall for Android. Both identify Platinum Ascension / Build 27 / Android QA Preview and pending founder hardware acceptance. The current installation guide requires compatible same-package/signer in-place upgrade, no uninstall/data clearing, preserved Play Protect and original-memory checks. Historical Build 26 guidance remains collapsed and explicitly version-specific.

Settings → Platinum AI installs Visual Understanding and Visual Memory Search with explicit consent. Approved gigabyte packages remain on their existing models-only release; no duplicate upload. Public provenance, Apache-2.0 and privacy links are provided. Current Build 27 copy discloses Android INTERNET permission, GitHub IP/download metadata, default unmetered consent and offline installed inference. It does not repeat Build 26's no-INTERNET statement as current. The 6 GB advanced tier/resources and Essential/Balanced fallback remain explicit. No universal zero-network or physical performance claim is made.

## Qualification and rollback

Run focused release-policy/rendered UI regressions, TypeScript, ESLint and production build. Check the actual production Git SHA/deployment ID and anonymous page/asset responses, instructions/QA labels/model links, and existing work/Review/Ask routes. Browser runtime capture failures must be reported separately; HTTP/rendered-markup proof is not claimed as visual or phone installation acceptance.

To disable the website action, clear the Build 27 downloadUrl/assetVerification and deploy a corrective main commit. This does not revoke already distributed copies or a known immutable release URL. Do not silently replace this asset, inherit old proof for another version, broaden a private release's visibility or change model assets. A future candidate needs its own explicit authorization and verification. Founder physical Z Fold 7 acceptance remains pending.
