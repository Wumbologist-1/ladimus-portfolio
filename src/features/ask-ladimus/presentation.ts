// Text is rendered as prose; only structured evidence_ids produce citations.
export function presentationIssue(text: string): "internal_id_in_prose" | "unsupported_formatting" | "redundant_label" | null {
  if (/[a-z0-9-]+--\d+/i.test(text)) return "internal_id_in_prose";
  if (/\*\*|__|`|~~~|\[[^\]\r\n]*\]|^\s{0,3}#{1,6}(?:\s|$)|\*[^*\n]+\*/m.test(text)) return "unsupported_formatting";
  if (/(?:^|\n)\s*(?:Evidence-derived assessment|Direct evidence|Grounded synthesis|Verified synthesis|Synthesis)\s*:/i.test(text)) return "redundant_label";
  return null;
}
