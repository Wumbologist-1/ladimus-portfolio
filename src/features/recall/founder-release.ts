// Private host access is enforced by GitHub, never by this public metadata.
// The legacy public-QA release and its authorization are deliberately separate.
export const founderIdentity = {
  version: "0.7.0-qa", build: 26,
  filename: "recall-0.7.0-eidolon-finalization-build26-qa-arm64-x86_64.apk",
  bytes: 566701644,
  sha256: "e252bf8f9bfe9cd661cadeb9df38ad44e8b2ee5ff06f1767916c4332a21fa94d",
  package: "engineering.ladimus.recall.qa.ascension",
  certificateSha256: "e28c77cccb4d589fb1963f5159bd9b42fad66637532129d840edd8ecebcd42d5",
  abis: ["arm64-v8a", "x86_64"], minSdk: 24, targetSdk: 36,
  sourceCommit: "42f9efa2f8eae71d28e84aa05ec55d967fdf9cc7",
} as const;

export type FounderRelease = {
  identity: typeof founderIdentity;
  channel: "private-founder-qa";
  gateA: "green-software-qualified";
  gateB: "pending-founder-hardware";
  publicBetaApproved: false;
  repository: string;
  tag: string;
  verification: null | {
    releaseId: number; assetId: number; repositoryPrivate: boolean;
    ownerOnly: boolean; immutable: boolean; authenticatedDownloadSha256: string;
    bytes: number; anonymousDenied: boolean; checkedAt: string;
  };
};

export const founderRelease: FounderRelease = {
  identity: founderIdentity, channel: "private-founder-qa",
  gateA: "green-software-qualified", gateB: "pending-founder-hardware",
  publicBetaApproved: false, repository: "Wumbologist-1/recall-founder-qa",
  tag: "v0.7.0-founder-qa.26", verification: {
    releaseId: 441207676, assetId: 733988433, repositoryPrivate: true,
    ownerOnly: true, immutable: true, anonymousDenied: true,
    authenticatedDownloadSha256: "e252bf8f9bfe9cd661cadeb9df38ad44e8b2ee5ff06f1767916c4332a21fa94d",
    bytes: 566701644, checkedAt: "2026-11-11T03:51:43.310444+00:00",
  },
};

export function founderAccess(release: FounderRelease): {href: string; releaseUrl: string} | null {
  const proof = release.verification, identity = release.identity;
  if (!proof || !identity || release.channel !== "private-founder-qa" ||
      release.gateA !== "green-software-qualified" || release.gateB !== "pending-founder-hardware" ||
      release.publicBetaApproved !== false || release.repository !== "Wumbologist-1/recall-founder-qa" ||
      release.tag !== "v0.7.0-founder-qa.26") return null;
  if (Object.entries(founderIdentity).some(([key, value]) =>
    JSON.stringify(identity[key as keyof typeof identity]) !== JSON.stringify(value))) return null;
  if (proof.repositoryPrivate !== true || proof.ownerOnly !== true || proof.immutable !== true ||
      proof.anonymousDenied !== true || proof.authenticatedDownloadSha256 !== identity.sha256 ||
      proof.bytes !== identity.bytes || !Number.isSafeInteger(proof.releaseId) || proof.releaseId < 1 ||
      !Number.isSafeInteger(proof.assetId) || proof.assetId < 1 || !Number.isFinite(Date.parse(proof.checkedAt))) return null;
  const path = `/${release.repository}/releases/tag/${release.tag}`;
  return {href: `https://github.com/login?return_to=${encodeURIComponent(path)}`, releaseUrl: `https://github.com${path}`};
}
