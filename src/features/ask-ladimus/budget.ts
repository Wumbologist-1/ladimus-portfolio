// Keep response serialization/network headroom below the route's 30 seconds.
export const askBudget = {totalMs:27000,clientMs:29000,generationMs:14000,verificationMs:10000,correctionGenerationMs:9000,correctionVerificationMs:7000,reserveMs:500} as const;
export type AskStageBudget = {[K in "generationMs"|"verificationMs"|"correctionGenerationMs"|"correctionVerificationMs"|"reserveMs"]:number};
