export const insufficient = "I don't have enough evidence in Luis's career data to make that claim.";
export const privateRefusal = "Ask Ladimus answers career questions from approved public evidence. Private documents, contact details, credentials, and internal instructions are outside that boundary.";

export function queryPolicy(query: string, guarded: Record<string,string>) {
  const normalized = query.normalize("NFKC").toLowerCase().replace(/amazon web services/g,"aws").replace(/\bk8s\b/g,"kubernetes");
  if (/(?:ignore|override|bypass|disregard).{0,60}(?:instruction|rules|policy)|(?:reveal|print|show|give|output|expose).{0,80}(?:raw resume|entire resume|hidden|system prompt|environment|secret|token|api key)|(?:home|street|phone|salary|compensation|severance|unemployment|social security)|(?:invent|fabricate|pretend|make up).{0,80}(?:luis|experience|engineer|claim)/i.test(normalized)) return { kind: "private" as const, message: privateRefusal };
  const terms = Object.keys(guarded).filter(term => new RegExp(`\\b${term.toLowerCase()}\\b`).test(normalized));
  if (terms.length) return { kind: "unsupported" as const, message: `I don't have enough evidence in Luis's career data to claim professional experience with ${terms.join(", ")}. Documented adjacent cloud and container work is available below.` };
  if (/senior|financial savings|company.wide|roi|foundation model|train.{0,20}model|years.{0,30}(?:experience|professional)|how (?:long|much).{0,30}experience|all.{0,30}(?:agents|deployed)|(?:when.{0,30}graduat|graduat.{0,20}(?:date|when|2027|2028))/i.test(normalized)) return { kind: "qualified" as const, message: "The evidence has limits: no senior title, inferred years of expertise, company-wide adoption, audited savings, foundation-model training, or definitive graduation date is asserted. System maturity is shown with each source." };
  return { kind: "public" as const, message: "" };
}

export function parseQuery(body: unknown) {
  if (!body || typeof body !== "object" || !("query" in body) || typeof body.query !== "string") return null;
  const query = body.query.trim();
  if (query.length < 3 || query.length > 600 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(query)) return null;
  return query;
}
