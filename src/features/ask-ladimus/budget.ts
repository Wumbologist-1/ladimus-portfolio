// Server work stays below the 30-second route; clients allow network headroom.
export const askBudget = {totalMs:27000,clientMs:45000,clientInactivityMs:15000,generationMs:14000,verificationMs:10000,correctionGenerationMs:9000,correctionVerificationMs:7000,reserveMs:500} as const;
export type AskStageBudget = {[K in "generationMs"|"verificationMs"|"correctionGenerationMs"|"correctionVerificationMs"|"reserveMs"]:number};
