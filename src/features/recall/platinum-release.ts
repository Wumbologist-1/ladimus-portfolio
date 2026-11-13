import { recallDownload, type RecallRelease } from "./release";

// Separate, exact-version authorization. Historical Build26/RC23/Luminance records are unchanged.
export const platinumIdentity = {
  version: "0.7.0-qa", build: 27, platform: "android",
  filename: "recall-0.7.0-platinum-ascension-build27-final-qa-arm64-x86_64.apk",
  bytes: 566966197,
  sha256: "ff775627bc973ea29f2bdabdb365f6b270eb9b32c4a0f5002ac6d9faedfa0862",
  minAndroid: "7.0", architectures: ["arm64-v8a", "x86_64"],
} as const;
export const platinumCertificate = "e28c77cccb4d589fb1963f5159bd9b42fad66637532129d840edd8ecebcd42d5";
export const platinumUrl = "https://github.com/Wumbologist-1/recall-android-releases/releases/download/v0.7.0-qa.27/" + platinumIdentity.filename;
export const platinumSourceCommit = "9a26ee2cd13191302548031b794e3b9cdf4eb020";
export const platinumEvidenceCommit = "1057c4b";
export const platinumModelRelease = "https://github.com/Wumbologist-1/recall-android-releases/releases/tag/recall-platinum-models-v1";
export const platinumModelNotices = "https://github.com/Wumbologist-1/recall-android-releases/releases/download/recall-platinum-models-v1/MODEL-NOTICES.md";
export const platinumModelLicense = "https://github.com/Wumbologist-1/recall-android-releases/releases/download/recall-platinum-models-v1/APACHE-2.0.txt";

export const platinumRelease: RecallRelease = {
  ...platinumIdentity, channel: "public-qa", downloadUrl: platinumUrl,
  publicDownloadApproved: false, releaseGatesApproved: false,
  // All 566,966,197 anonymous hosted bytes hashed in order; exact source/signer unchanged.
  assetVerification: {url: platinumUrl, filename: platinumIdentity.filename, bytes: platinumIdentity.bytes, sha256: platinumIdentity.sha256, version: platinumIdentity.version, build: 27, access: "public", checkedAt: "2026-11-13T00:12:41.517445+00:00"},
  publicQaAuthorization: {version: platinumIdentity.version, build: 27, sha256: platinumIdentity.sha256, authorizedAt: "2026-11-12"},
  signatureVerification: {sha256: platinumIdentity.sha256, certificateSha256: platinumCertificate, checkedAt: "2026-11-12"},
};

export function platinumDownload(release: RecallRelease = platinumRelease): string | null {
  if (!release || release.channel !== "public-qa" || release.publicDownloadApproved !== false || release.releaseGatesApproved !== false || release.downloadUrl !== platinumUrl) return null;
  if (Object.entries(platinumIdentity).some(([key, value]) => JSON.stringify(release[key as keyof RecallRelease]) !== JSON.stringify(value))) return null;
  if (release.signatureVerification?.certificateSha256 !== platinumCertificate) return null;
  return recallDownload(release).href;
}
