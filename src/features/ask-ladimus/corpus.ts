import type { EvidenceRecord, EvidenceChunk } from "./contracts.ts";

type SourceRecord = Record<string, unknown>;
const strings = (value: unknown): string[] => Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
const text = (value: unknown) => typeof value === "string" ? value.trim() : "";

// Only enumerated public fields become facts. Notes, aliases, source metadata and
// conflicting education dates never enter generation context.
export function normalizeCorpus(source: SourceRecord): EvidenceRecord[] {
  const records: EvidenceRecord[] = [];
  const add = (raw: SourceRecord, category: string) => {
    const title = text(raw.canonical_title) || text(raw.name) || text(raw.program);
    const facts = [text(raw.summary), ...[
      "responsibilities", "technical_scope", "architecture", "safety_controls",
      "design_principles", "observed_dimensions", "impact", "skills_demonstrated",
      "verified_outcomes", "outcomes", "quality_evidence", "engineering_theme", "coursework_evidence",
    ].flatMap(key => typeof raw[key] === "string" ? [text(raw[key])] : strings(raw[key]))]
      .filter(v => v && !v.startsWith("Historical tailored material"));
    if (raw.verified_metrics && typeof raw.verified_metrics === "object") {
      for (const [key, value] of Object.entries(raw.verified_metrics)) {
        if (typeof value === "number" || typeof value === "string") facts.push(`${key.replaceAll("_", " ")}: ${value}.`);
      }
    }
    const organization = text(raw.organization) || text(raw.institution) || "Ladimus Engineering";
    const timeframe = raw.start ? `${text(raw.start)} – ${text(raw.end) || "date not established"}` : typeof raw.year === "number" ? String(raw.year) : "";
    if (category === "employment") facts.unshift(`${title} at ${organization}${timeframe ? `; ${timeframe}` : "; dates not established"}.`);
    if (category === "education") facts.unshift(`${title} at ${organization}, in progress. No definitive graduation date is asserted.`);
    const aliases = [...strings(raw.aliases), ...strings(raw.title_variants)];
    if (organization.startsWith("ROM")) aliases.push("ROMTech");
    if (raw.id === "system-pr-assistant") aliases.push("PR Assistant");
    records.push({ id: text(raw.id), category, title, organization, timeframe,
      status: text(raw.status) || (raw.evidence_level === "historical_variant" ? "historical_variant" : "documented_experience"),
      evidenceLevel: text(raw.evidence_level), facts,
      keywords: aliases, qualifiers: strings(raw.claim_guards) });
  };
  for (const [key, category] of [["employment", "employment"], ["systems", "system"], ["personal_projects", "project"]]) {
    const list = source[key!];
    if (!Array.isArray(list)) throw new Error("Missing public corpus category");
    for (const raw of list) add(raw as SourceRecord, category!);
  }
  const education = source.education_and_certifications as SourceRecord;
  for (const raw of education.education as SourceRecord[]) add(raw, "education");
  for (const [i, raw] of (education.certifications as SourceRecord[]).entries()) {
    add({ ...raw, id: `certification-${i + 1}`, summary: `${text(raw.name)} — ${text(raw.status)}.`, evidence_level: "primary_verified" }, "certification");
  }
  const profile = source.profile as SourceRecord;
  add({ id: "profile-luis", name: text(profile.name), summary: text(profile.public_summary), evidence_level: "corroborated" }, "profile");
  for (const skill of Object.values(source.skills as Record<string, {skill:string;level:string;evidence_ids:string[]}[]>).flat()) {
    for (const id of skill.evidence_ids) {
      const record = records.find(r=>r.id===id);
      if (!record) throw new Error("Unresolved skill evidence reference");
      record.facts.push(`Documented capability: ${skill.skill} (${skill.level}).`);
      record.keywords.push(skill.skill);
    }
  }
  validateRecords(records);
  return records;
}

export function validateRecords(records: EvidenceRecord[]) {
  const ids = new Set<string>();
  for (const record of records) {
    if (!/^[a-z0-9-]+$/.test(record.id) || ids.has(record.id) || !record.title || !record.facts.length || record.facts.some(f => typeof f !== "string" || f.length > 1600)) throw new Error("Invalid public evidence schema");
    ids.add(record.id);
  }
}

export function chunkRecords(records: EvidenceRecord[]): EvidenceChunk[] {
  return records.flatMap(record => {
    const groups: string[][] = []; let group: string[] = []; let length = 0;
    for (const fact of record.facts) {
      if (group.length >= 7 || length + fact.length > 1800) { groups.push(group); group = []; length = 0; }
      group.push(fact); length += fact.length;
    }
    if (group.length) groups.push(group);
    return groups.map((facts, index) => ({ ...record, recordId: record.id, id: `${record.id}--${index + 1}`, facts }));
  });
}

export function assertPublicSafe(value: unknown) {
  const serialized = JSON.stringify(value);
  const forbidden = [
    /\b(?:\+?1[ .-]?)?\(?[2-9]\d{2}\)?[ .-]\d{3}[ .-]\d{4}\b/,
    /\b(?:sk-[A-Za-z0-9_-]{16,}|gh[pousr]_[A-Za-z0-9]{20,}|AKIA[A-Z0-9]{16})\b/,
    /[A-Z]:\\\\(?:Users|Projects)\\\\/i, /-----BEGIN .*PRIVATE KEY-----/,
    /\b\d{1,6}\s+[A-Za-z][A-Za-z .]+\s+(?:Street|Avenue|Road|Lane|Drive|Boulevard)\b/i,
    /https?:\/\/(?!github\.com\/Wumbologist-1\/ladimus-|ladimus-portfolio\.vercel\.app)/i,
  ];
  if (forbidden.some(pattern => pattern.test(serialized))) throw new Error("Public privacy validation failed; contents withheld");
  const walk = (v: unknown) => {
    if (!v || typeof v !== "object") return;
    for (const [key, field] of Object.entries(v)) {
      if (/^(phone|address|salary|compensation|severance|ssn|api_key|access_token|customer_id|device_id|recruiter|application_history)$/i.test(key)) throw new Error("Private field rejected; contents withheld");
      walk(field);
    }
  };
  walk(value);
}
