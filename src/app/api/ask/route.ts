import "server-only";
import chunks from "@/data/career/chunks.json";
import hints from "@/data/career/retrieval-hints.json";
import skills from "@/data/career/skills.json";
import guards from "@/data/career/claim-guards.json";
import { generateGroundedAnswer, providerConfigured } from "@/features/ask-ladimus/provider";
import { createAskHandler } from "@/features/ask-ladimus/handler";
export const runtime = "nodejs";
export const maxDuration = 30;
export const POST = createAskHandler(() => ({chunks,hints:hints.intents,skills:Object.values(skills).flat(),guards,
  guarded:hints.unsupported_or_guarded_terms,configured:providerConfigured(),
  generate:(query,evidence,signal)=>generateGroundedAnswer(query,evidence,guards,signal)}));
