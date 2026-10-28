export type RecallRelease = {
  version: string;
  build: number;
  channel: "internal-qa" | "public-qa" | "public-beta" | "unavailable";
  platform: "android";
  filename: string;
  bytes: number;
  sha256: string;
  minAndroid: string;
  architectures: readonly string[];
  downloadUrl: string | null;
  publicDownloadApproved: boolean;
  releaseGatesApproved: boolean;
  publicQaAuthorization: null | {version: string; build: number; sha256: string; authorizedAt: string};
  signatureVerification: null | {sha256: string; certificateSha256: string; checkedAt: string};
  assetVerification: null | {
    url: string; filename: string; bytes: number; sha256: string;
    version: string; build: number; checkedAt: string;
    access: "restricted" | "public";
  };
};

// Identity verified locally with SHA-256 and Android aapt on 2026-10-28.
// This confirms the package, not public-release approval or security qualification.
export const recallRelease: RecallRelease = {
  version: "0.5.0-qa", build: 5, channel: "public-qa", platform: "android",
  filename: "recall-0.5.0-d008-qa-arm64-x86_64.apk",
  bytes: 564631164,
  sha256: "cda186cef81034e2d187dfffec82b507ffe2689aa740aa80a78da3253024be2b",
  minAndroid: "7.0", architectures: ["arm64-v8a", "x86_64"],
  downloadUrl: "https://github.com/Wumbologist-1/recall-android-releases/releases/download/v0.5.0-qa.5/recall-0.5.0-d008-qa-arm64-x86_64.apk", publicDownloadApproved: false, releaseGatesApproved: false,
  assetVerification: {url: "https://github.com/Wumbologist-1/recall-android-releases/releases/download/v0.5.0-qa.5/recall-0.5.0-d008-qa-arm64-x86_64.apk", filename: "recall-0.5.0-d008-qa-arm64-x86_64.apk", bytes: 564631164, sha256: "cda186cef81034e2d187dfffec82b507ffe2689aa740aa80a78da3253024be2b", version: "0.5.0-qa", build: 5, checkedAt: "2026-10-28T21:38:00Z", access: "public"},
  publicQaAuthorization: {version: "0.5.0-qa", build: 5, sha256: "cda186cef81034e2d187dfffec82b507ffe2689aa740aa80a78da3253024be2b", authorizedAt: "2026-10-28"},
  signatureVerification: {sha256: "cda186cef81034e2d187dfffec82b507ffe2689aa740aa80a78da3253024be2b", certificateSha256: "e28c77cccb4d589fb1963f5159bd9b42fad66637532129d840edd8ecebcd42d5", checkedAt: "2026-10-28"},
};

export const publicQaNotice = "Recall is currently available as an experimental Android QA build. It is intended for testing with disposable information only. Security and physical-device validation are still in progress. Do not store personal, financial, medical, or other sensitive information.";

export function recallDownload(release: RecallRelease): {href: string | null; label: string; reason: string} {
  const unavailable = {href: null, label: "Download not available", reason: "A verified tester download has not been published. Public beta access is not open."};
  const proof = release.assetVerification;
  if(release.channel === "unavailable" || !release.downloadUrl || !proof) return unavailable;
  let url: URL;
  try {url = new URL(release.downloadUrl);} catch {return unavailable;}
  if(url.protocol !== "https:" || url.username || url.password || url.search || url.hash || /^(?:localhost|127\.|\[?::1)/i.test(url.hostname)) return unavailable;
  if(!/^[a-zA-Z0-9._-]+\.apk$/.test(release.filename) || !url.pathname.endsWith(`/${release.filename}`)) return unavailable;
  if(!/^[a-f0-9]{64}$/.test(release.sha256) || !Number.isSafeInteger(release.bytes) || release.bytes <= 0 || !Number.isSafeInteger(release.build) || release.build < 1) return unavailable;
  if(proof.url !== release.downloadUrl || proof.filename !== release.filename || proof.sha256 !== release.sha256 || proof.bytes !== release.bytes || proof.version !== release.version || proof.build !== release.build || !Number.isFinite(Date.parse(proof.checkedAt))) return unavailable;
  const authorization = release.publicQaAuthorization, signature = release.signatureVerification;
  if(release.channel === "public-qa" && proof.access === "public" && authorization?.version === release.version && authorization.build === release.build && authorization.sha256 === release.sha256 && Number.isFinite(Date.parse(authorization.authorizedAt)) && signature?.sha256 === release.sha256 && /^[a-f0-9]{64}$/.test(signature.certificateSha256) && Number.isFinite(Date.parse(signature.checkedAt))) return {href: release.downloadUrl, label: "Download Recall for Android — QA", reason: "Experimental public QA · Free · Use disposable synthetic information only. Production security qualification is incomplete."};
  if(release.channel === "internal-qa" && proof.access === "restricted") return {href: release.downloadUrl, label: "Download QA for approved testers", reason: "Restricted distribution. Sign in with your approved tester account. Use disposable test information only."};
  if(release.channel === "public-beta" && proof.access === "public" && release.publicDownloadApproved && release.releaseGatesApproved) return {href: release.downloadUrl, label: "Download Android beta", reason: "Public beta release. Review the release limitations before installing."};
  return unavailable;
}

export const recallFileSize = (bytes: number) => `${(bytes / 1000000).toFixed(1)} MB (${(bytes / 1048576).toFixed(1)} MiB)`;

export function recallReleasePresentation(release: RecallRelease) {
  if(release.channel === "public-qa" && recallDownload(release).href !== null) return {stage: "Public QA — Experimental Testing", access: "A free experimental Android QA package is available below. No account or subscription is required. Use synthetic, disposable test memories only.", notice: publicQaNotice};
  const publicBeta = release.channel === "public-beta" && recallDownload(release).href !== null;
  return {
    stage: publicBeta ? "Public beta" : release.channel === "internal-qa" ? "Internal QA" : "Distribution unavailable",
    access: publicBeta ? "An approved public beta package is available below. Review its release limitations before installing." : "The current testing release is reserved for approved testers using synthetic or disposable information. Public beta download is not open.",
    notice: publicBeta ? "Recall is beta software. Review its limitations and use care when choosing what to save. Release approval is not a guarantee of absolute security." : "Recall is currently in internal QA. Its security architecture is under active validation, and this build should only be used with disposable test information.",
  };
}
