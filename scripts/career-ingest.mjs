import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { normalizeCorpus, chunkRecords, assertPublicSafe } from '../src/features/ask-ladimus/corpus.ts';

// Publication is an explicit offline operation over a human-approved JSON source.
// Raw resume ingestion never automatically publishes facts.
const input = process.argv[2];
if (!input || !process.argv.includes('--approved-public')) throw Error('Usage: npm run career:ingest -- <approved career-corpus.json> --approved-public');
const source = JSON.parse(await readFile(resolve(input), 'utf8'));
if (source.manifest?.public_safe !== true) throw Error('A reviewed public-safe source is required');
assertPublicSafe(source);
const records = normalizeCorpus(source);
const ids = new Set(records.map(r => r.id));
for (const skill of Object.values(source.skills).flat()) {
  if (!skill.evidence_ids.every(id => ids.has(id))) throw Error('Unresolved skill evidence reference');
}
for (const hint of source.retrieval_hints.intents) {
  if (!hint.evidence_ids.every(id => ids.has(id))) throw Error('Unresolved retrieval evidence reference');
}
const chunks = chunkRecords(records);
const out = resolve('src/data/career'); await mkdir(out,{recursive:true});
const files = {
  'records.json': records, 'chunks.json': chunks, 'skills.json': source.skills,
  'claim-guards.json': source.claim_guards, 'retrieval-hints.json': source.retrieval_hints,
  'manifest.json': { version: source.manifest.corpus_version, approvedPublic: true, records:records.length, chunks:chunks.length,
    sha256: createHash('sha256').update(JSON.stringify(records)).digest('hex'),
    answerPolicy: source.manifest.answer_policy, privacyExclusions: source.manifest.privacy_exclusions },
};
for (const [name,value] of Object.entries(files)) { assertPublicSafe(value); await writeFile(resolve(out,name),JSON.stringify(value,null,2)+'\n'); }
console.log(`Validated ${records.length} public records; wrote ${chunks.length} bounded evidence chunks. Private contents were not logged.`);
