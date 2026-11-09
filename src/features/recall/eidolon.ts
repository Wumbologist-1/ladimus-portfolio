import type { RecallRelease } from "./release";

// Public-safe facts from the signed Android RC23 handoff. This candidate has
// NO public asset, authorization or download. Legacy proof cannot authorize it.
export const eidolonRelease: RecallRelease = {
  version: "0.7.0-qa", build: 23, channel: "internal-qa", platform: "android",
  filename: "recall-0.7.0-eidolon-preview-build23-qa-arm64-x86_64.apk",
  bytes: 576152284,
  sha256: "7d1148e2199b56a08927fe09da517c06055bcea31e84d58da7794118d3dbbf82",
  minAndroid: "7.0", architectures: ["arm64-v8a", "x86_64"],
  downloadUrl: null, publicDownloadApproved: false, releaseGatesApproved: false,
  publicQaAuthorization: null, assetVerification: null,
  signatureVerification: {
    sha256: "7d1148e2199b56a08927fe09da517c06055bcea31e84d58da7794118d3dbbf82",
    certificateSha256: "e28c77cccb4d589fb1963f5159bd9b42fad66637532129d840edd8ecebcd42d5",
    checkedAt: "2026-11-08",
  },
};

export const eidolonCheckpoint = "bae2c463839bfee7b56049f727192e11a5fb7931";

export const vaultEnvironments = [
  {id: "core", name: "Ladimus Core", mood: "Platinum edges. Emerald energy.", description: "Metallic silver-green, sculpted light and a deep black foundation. The signature Ladimus atmosphere.", alt: "Original Ladimus Core artwork with metallic emerald ribbons over black.", tone: "#91edbb"},
  {id: "castle", name: "Castle Night", mood: "A quieter kind of wonder.", description: "A moonlit castle silhouette, cool nighttime surfaces and a dark fantasy horizon.", alt: "Original Castle Night artwork with a castle beneath a moonlit night sky.", tone: "#b9c4ff"},
  {id: "sunset", name: "Pixel Sunset", mood: "Small pixels. Lasting warmth.", description: "A pixel-art sunset above water. Nostalgic color, reflected light and a warmer place to remember.", alt: "Original Pixel Sunset artwork with warm sunset colors reflected on water.", tone: "#ffc78f"},
  {id: "aurora", name: "Aurora Vault", mood: "Let the northern lights in.", description: "Emerald aurora ribbons above a dark landscape. A little of the extraordinary, close at hand.", alt: "Original Aurora Vault artwork with green northern lights over a dark landscape.", tone: "#93eddb"},
] as const;
