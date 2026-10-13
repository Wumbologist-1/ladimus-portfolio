import type { EvidencePacket, AnswerClaim, AnswerStyle, ClaimKind } from "./contracts.ts";

export type ValidationCode = "invalid_structure" | "uncited_person_claim" | "unsupported_date" | "unsupported_technology" | "unsupported_number" | "unsupported_duration" | "unsupported_title" | "guarded_technology" | "maturity_upgrade" | "forbidden_claim" | "known_skill_false_negative" | "invalid_citations" | "answer_too_large" | "invalid_follow_up" | "invalid_verification" | "unsupported_semantics";
export class SynthesisValidationError extends Error {
  code:ValidationCode; atom?:string; unit?:number;
  constructor(code:ValidationCode,atom?:string,unit?:number) {
    super(code);this.code=code;
    if(atom&&/^\d{1,12}(?:\.\d{1,5})?$/.test(atom)) this.atom=atom;
    if(unit!==undefined&&Number.isInteger(unit)&&unit>=0&&unit<8) this.unit=unit;
  }
}
const reject = (code:ValidationCode="invalid_structure",atom?:string,unit?:number): never => { throw new SynthesisValidationError(code,atom,unit); };
const object = (value:unknown):value is Record<string,unknown> => Boolean(value&&typeof value==="object"&&!Array.isArray(value));
const kinds=new Set<ClaimKind>(["direct","synthesis","transferable","limitation","general_technology"]);
const escape=(s:string)=>s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
const has=(text:string,term:string)=>new RegExp(`(?<![a-z0-9])${escape(term)}(?![a-z0-9])`,"i").test(text);
const numbers=(s:string)=>s.replace(/(?<=\d),(?=\d)/g,"").match(/(?<![a-z])\d+(?:\.\d+)?(?:%?)(?![a-z])/gi)?.map(n=>n.replace(/%$/,""))??[];
// Negative qualifications can name a requested tool/title/duration. They do
// not authorize a positive assertion elsewhere in the paragraph. The verifier
// still evaluates their meaning and the full compound requirement response.
function negative(clause:string,term:string) {
  const occurrences=[...clause.matchAll(new RegExp(escape(term),"gi"))];
  return occurrences.length>0&&occurrences.every(match=>{
    const at=match.index;
    const before=clause.slice(Math.max(0,at-100),at), after=clause.slice(at+term.length,at+term.length+100);
    return /(?:\bno\b|\bnot\b(?! only)|\bnever\b|\bwithout\b|(?:doesn|hasn|haven|isn|aren|wasn|weren).t|cannot|can.t|neither|lack(?:s|ing)?|insufficient|unestablished|unsupported)[^;.!?]*$/i.test(before)
      || /^[^;.!?]*(?:not (?:(?:a|an|yet|currently|directly|professionally|been|explicitly)\s+){0,3}(?:established|documented|supported|demonstrated|verified|proven|evidenced|substantiated)|unestablished|unsupported|absent|unverified|unproven|missing|not equivalent)/i.test(after);
  });
}
// A guarded tool can be the target of a comparison or learning requirement.
// Naming that target is not equivalent to claiming Luis has used it. Explicit
// experience/proficiency/use assertions remain forbidden in every unit kind.
function qualifiedTechnologyReference(clause:string,term:string,packet:EvidencePacket) {
  if(negative(clause,term)) return true;
  if(!packet.technology_context.some(t=>t.name.toLowerCase()===term.toLowerCase()||has(t.requirements,term))) return false;
  const name=escape(term);
  const attributed=new RegExp(`(?:\\b(?:uses?|used|knows?|knew|adopted|integrated|implemented|deployed|managed|operated|mastered|configured|provisioned)\\s+(?:professional(?:ly)?\\s+)?${name}|\\b(?:experience|experienced|expertise|proficiency|skilled|proficient|built|builds?|configured|provisioned|work(?:ed|ing)?)\\s+(?:professionally\\s+)?(?:with|in|using|on)\\s+${name}|${name}[- ](?:experience|expertise|proficiency)|\\b(?:expert|proficient)\\b.{0,25}${name})`,"i");
  if(attributed.test(clause)) return false;
  return /transfer|adjacent|background|competenc|learning|remaining gap|(?:would|still|need).{0,40}(?:learn|demonstrate|establish)|(?:based|specific) role/i.test(clause);
}
function validateCriticalClaims(claim:AnswerClaim, packet:EvidencePacket) {
  const cited=packet.items.filter(i=>claim.evidence_ids.includes(i.id));
  const source=cited.map(i=>[i.title,i.organization.replace(/ROM Technologies(?:, Inc\.)?/i,"ROMTech"),i.timeframe,...i.facts].join(" ")).join(" ");
  const sourceNumbers=new Set(numbers(source));
  const linkedSkills=[...packet.direct_skills,...packet.transferable_skills].filter(s=>s.evidence_ids.some(id=>claim.evidence_ids.includes(id))).map(s=>s.skill).join(" ");
  if(!cited.length) {
    if(/\b(?:Luis|Tomassini|he|his|him|candidate)\b/i.test(claim.text)) reject("uncited_person_claim");
    return; // General technology knowledge is explicitly separate from career facts.
  }
  const clauses=claim.text.split(/(?<=[.!?])\s+|;|\bbut\b|\bhowever\b/i);
  for(const clause of clauses) {
    const months=["January","February","March","April","May","June","July","August","September","October","November","December"];
    for(const date of clause.matchAll(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(20\d{2})\b/gi)) {
      const month=String(months.findIndex(m=>m.toLowerCase()===date[1]?.toLowerCase())+1).padStart(2,"0");
      if(!has(source,date[0])&&!source.includes(`${date[2]}-${month}`)) reject("unsupported_date");
    }
    for(const token of clause.matchAll(/\b[A-Z][a-z]+(?:[A-Z][a-zA-Z0-9]+)+\b/g)) {
      if(token[0]!=="DevOps"&&!has(source+" "+linkedSkills,token[0])&&!qualifiedTechnologyReference(clause,token[0],packet)) reject("unsupported_technology");
    }
    // Public citation identifiers carry digits but are not numeric career
    // claims. Ignore only exact IDs already cited by this unit, never unknown
    // IDs or arbitrary numeric text (metrics/durations still require support).
    const factualText=claim.evidence_ids.reduce((text,id)=>text.replaceAll(id," "),clause)
      .replace(/\[(\d{1,2})\]/g,(reference,index)=>claim.evidence_ids.includes(packet.items[Number(index)-1]?.id??"")?" ":reference);
    for(const n of numbers(factualText)) {
      if(!sourceNumbers.has(n)&&!(packet.unsupported_requirements.length>0&&numbers(packet.question).includes(n)&&negative(clause,n))) reject("unsupported_number",n);
    }
    for(const match of clause.matchAll(/\b(?:\d{1,2}|one|two|three|four|five|six|seven|eight|nine|ten|several|many)\s+years?\b/gi)) {
      if(!negative(clause,match[0])&&!has(source,match[0])) reject("unsupported_duration");
    }
    // Seniority guards are case-insensitive: typography cannot authorize a title.
    for(const match of clause.matchAll(/\b(?:senior|principal|staff|lead|chief)\s+(?:[a-z]+\s+){0,3}(?:engineer|officer)\b/gi)) {
      if(!negative(clause,match[0])&&!cited.some(i=>i.category==="employment"&&has(i.title,match[0]))) reject("unsupported_title");
    }
    for(const match of clause.matchAll(/\b(?:(?:Senior|Principal|Staff|Lead|Chief)\s+(?:[A-Za-z]+\s+){0,3}(?:Engineer|Officer)|(?:Platform|Software|Machine Learning|AI|DevOps|Systems|Backend|QA|Data|Security|Cloud) Engineer|(?:[A-Z][A-Za-z]+\s+){0,3}(?:Analyst|Manager|Director|Architect|Officer))\b/g)) {
      if(!negative(clause,match[0])&&!cited.some(i=>i.category==="employment"&&has(i.title,match[0]))) reject("unsupported_title");
    }
    for(const term of packet.guarded_technologies) {
      if(has(clause,term)&&!qualifiedTechnologyReference(clause,term,packet)) reject("guarded_technology");
    }
    for(const term of packet.known_technologies.flatMap(s=>s.split(/\s*\/\s*/)).filter(s=>s.length>1)) {
      if((term!=="Go"||/\bGo\b/.test(clause))&&has(clause,term)&&!has(source+" "+linkedSkills,term)&&!qualifiedTechnologyReference(clause,term,packet)) reject("unsupported_technology");
    }
    if(/\b(?:deployed|productionized|production(?: service| platform| system| adoption| deployment)|(?:used|ran|runs|running|served|operat(?:es|ed|ing)).{0,55} in production)\b/i.test(clause)) {
      const allowed=cited.some(i=>["production_verified","production_onboarded_with_adoption_limits","documented_experience"].includes(i.maturity));
      if(!allowed&&!negative(clause,(/deployed|productionized|production/i.exec(clause)?.[0]??"production"))) reject("maturity_upgrade");
      for(const item of cited.filter(i=>/prototype|designed_not_deployed|merged_foundation|scaffold/.test(i.maturity))) {
        if((has(clause,item.title)||has(clause,item.title.split(" ")[0]!))&&!negative(clause,"production")&&!negative(clause,"deployed")) reject("maturity_upgrade");
      }
    }
    if(cited.every(i=>i.maturity==="designed_not_deployed")&&/\b(?:built|implemented|deployed|operated)\b/i.test(clause)&&!negative(clause,(/built|implemented|deployed|operated/i.exec(clause)?.[0]??"built"))) reject("maturity_upgrade");
    for(const term of ["company-wide","audited financial savings","ROI","foundation-model training"]) {
      if(has(clause,term)&&!negative(clause,term)) reject("forbidden_claim");
    }
    for(const skill of packet.direct_skills.filter(s=>/hands-on professional/i.test(s.level))) {
      if(has(clause,skill.skill)&&/(?:no|not|insufficient|lack).{0,65}(?:professional|experience|evidence)|(?:experience|evidence).{0,65}not (?:documented|established)/i.test(clause)) reject("known_skill_false_negative");
    }
  }
}

export function groundAnswer(output:unknown, packet:EvidencePacket):{claims:AnswerClaim[];followUps:string[];style:AnswerStyle} {
  if(!object(output)||Object.keys(output).some(k=>!["style","answer","follow_ups"].includes(k))||!Array.isArray(output.answer)||!Array.isArray(output.follow_ups)||!["paragraphs","list"].includes(String(output.style))) return reject();
  if(!output.answer.length||output.answer.length>(output.style==="list"?8:5)||output.follow_ups.length>3||output.follow_ups.length<Math.min(2,packet.follow_up_candidates.length)) return reject();
  const ids=new Set(packet.items.map(c=>c.id)), seen=new Set<string>();
  const claims:AnswerClaim[]=output.answer.map((item,index)=>{
    if(!object(item)||Object.keys(item).some(k=>!["text","evidence_ids","kind"].includes(k))||typeof item.text!=="string"||!kinds.has(item.kind as ClaimKind)||!Array.isArray(item.evidence_ids)||item.evidence_ids.length>5) return reject();
    if(!item.text.trim()||item.text.length>1800||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(item.text)||seen.has(item.text)||(!item.evidence_ids.length&&item.kind!=="general_technology")) return reject();
    if(item.evidence_ids.some(id=>typeof id!=="string"||!ids.has(id))||new Set(item.evidence_ids).size!==item.evidence_ids.length) return reject("invalid_citations");
    seen.add(item.text);
    const claim={text:item.text,evidence_ids:item.evidence_ids as string[],kind:item.kind as ClaimKind};
    try {validateCriticalClaims(claim,packet);} catch(cause) {if(cause instanceof SynthesisValidationError) cause.unit=index;throw cause;}
    return claim;
  });
  if(claims.reduce((n,c)=>n+c.text.length,0)>5000) return reject("answer_too_large");
  const followUps=output.follow_ups.map(q=>{
    if(typeof q!=="string"||!packet.follow_up_candidates.includes(q)) return reject("invalid_follow_up");
    return q;
  });
  if(new Set(followUps).size!==followUps.length) return reject();
  return {claims,followUps,style:output.style as AnswerStyle};
}

// The verifier is a verdict-only gate. It cannot alter prose, add sources, or
// partially approve the answer. Each unit must be covered exactly once.
export function verifyVerdict(output:unknown, claims:AnswerClaim[]):void {
  if(!object(output)||Object.keys(output).some(k=>k!=="claims")||!Array.isArray(output.claims)||output.claims.length!==claims.length) return reject("invalid_verification");
  const seen=new Set<number>();
  for(const item of output.claims) {
    if(!object(item)||Object.keys(item).some(k=>!["index","supported","evidence_ids"].includes(k))||!Number.isInteger(item.index)||typeof item.supported!=="boolean"||!Array.isArray(item.evidence_ids)) return reject("invalid_verification");
    const index=item.index as number, claim=claims[index];
    if(!claim||seen.has(index)||new Set(item.evidence_ids).size!==item.evidence_ids.length||item.evidence_ids.length!==claim.evidence_ids.length||item.evidence_ids.some(id=>typeof id!=="string"||!claim.evidence_ids.includes(id))) return reject("invalid_verification");
    seen.add(index);
    if(!item.supported) return reject("unsupported_semantics",undefined,index);
  }
}
