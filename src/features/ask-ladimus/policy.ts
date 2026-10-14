import { normalizeQuery } from "./query-language.ts";
export const insufficient = "I don't have enough evidence in Luis's career data to make that claim.";
export const privateRefusal = "Ask Ladimus answers career questions from approved public evidence. Private documents, contact details, credentials, and internal instructions are outside that boundary.";

export function unsupportedAssertions(query:string, guarded:Record<string,string>) {
  const q=normalizeQuery(query);
  const tools=Object.keys(guarded).filter(t=>new RegExp(`\\b${t.toLowerCase()}\\b`).test(q));
  const claims:string[]=tools.map(t=>`professional ${t} experience`);
  const duration=/\b(\d{1,2}|one|two|three|four|five|six|seven|eight|nine|ten)\s+years?\b/.exec(q)?.[1];
  if(duration) claims.push(`${duration} years of professional${tools.length?` ${tools.join("/")}`:""} experience`);
  const senior=/\bsenior\s+(?:(machine learning|ai|software|devops|backend|platform)\s+)?engineer\b/.exec(q);
  if(senior) claims.push(`Senior ${senior[1]?senior[1].split(" ").map(w=>w==="ai"?"AI":w[0]!.toUpperCase()+w.slice(1)).join(" ")+" ":""}Engineer as ${/romtech|rom technologies/.test(q)?"Luis's ROMTech":"Luis's official"} title`);
  if(/company.wide|production.wide/.test(q)) claims.push("company-wide production adoption");
  if(/(?:financial|audited).*savings|\broi\b/.test(q)) claims.push("audited financial savings or ROI");
  if(/train.{0,20}(?:foundation|model)|foundation model/.test(q)) claims.push("foundation-model training experience");
  const bounded=[...new Set(claims)].slice(0,8);
  return bounded.length?`The evidence does not establish ${bounded.join("; ")}.${claims.length>8?" Additional requested claims remain unverified.":""}`:"";
}

export function queryPolicy(query: string, guarded: Record<string,string>) {
  const normalized = normalizeQuery(query);
  if (/(?:ignore|override|bypass|disregard).{0,60}(?:instruction|rules|policy)|(?:reveal|print|show|give|output|expose).{0,80}(?:raw resume|entire resume|hidden|system prompt|environment|secret|token|api key)|(?:home|street|phone|salary|compensation|severance|unemployment|social security)|(?:invent|fabricate|pretend|make up).{0,80}(?:luis|experience|engineer|claim)/i.test(normalized)) return { kind: "private" as const, message: privateRefusal };
  const terms = Object.keys(guarded).filter(term => new RegExp(`\\b${term.toLowerCase()}\\b`).test(normalized));
  if (terms.length) return { kind: "unsupported" as const, message: `I don't have enough evidence in Luis's career data to claim professional experience with ${terms.join(", ")}. ${unsupportedAssertions(query,guarded)} Documented adjacent cloud and container work is available below.` };
  const assertions=unsupportedAssertions(query,guarded);
  if(assertions&&/\b(?:say|claim|state|assert|write|present|tell)\b/i.test(normalized)) return {kind:"qualified" as const,message:assertions};
  if (/senior|financial savings|company.wide|roi|foundation model|train.{0,20}model|years.{0,30}(?:experience|professional)|how (?:long|much).{0,30}experience|all.{0,30}(?:agents|deployed)|(?:when.{0,30}graduat|graduat.{0,20}(?:date|when|2027|2028))/i.test(normalized)) return { kind: "qualified" as const, message: `${unsupportedAssertions(query,guarded)} The evidence has limits: no senior title, inferred years of expertise, company-wide adoption, audited savings, foundation-model training, or definitive graduation date is asserted. System maturity is shown with each source.`.trim() };
  return { kind: "public" as const, message: "" };
}

export function parseQuery(body: unknown) {
  if (!body || typeof body !== "object" || !("query" in body) || typeof body.query !== "string") return null;
  const query = body.query.trim();
  if (query.length < 3 || query.length > 600 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(query)) return null;
  return query;
}
