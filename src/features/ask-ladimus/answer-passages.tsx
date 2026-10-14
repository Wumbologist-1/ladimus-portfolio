import type { AnswerClaim, AnswerStyle, Evidence } from "./contracts";

export function AnswerPassages({claims, style, evidence, id}: {claims: AnswerClaim[]; style: AnswerStyle; evidence: Evidence[]; id: string}) {
  function passage(claim: AnswerClaim, index: number) {
    return <>{claim.text}{claim.evidence_ids.map(evidenceId => {
      const number = evidence.findIndex(e => e.id === evidenceId) + 1;
      return <a key={evidenceId} href={`#${id}-${evidenceId}`} aria-label={`Evidence ${number} for passage ${index+1}`}>[{number}]</a>;
    })}</>;
  }
  if (!claims.length) return null;
  if (style === "list") return <><p data-answer-kind={claims[0]!.kind}>{passage(claims[0]!,0)}</p>{claims.length>1 && <ul>{claims.slice(1).map((claim,index)=><li key={index} data-answer-kind={claim.kind}>{passage(claim,index+1)}</li>)}</ul>}</>;
  return <>{claims.map((claim,index)=><p key={index} data-answer-kind={claim.kind}>{passage(claim,index)}</p>)}</>;
}
