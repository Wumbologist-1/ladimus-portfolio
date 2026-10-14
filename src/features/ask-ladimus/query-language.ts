import type { EvidenceChunk, Skill } from "./contracts.ts";

// Interpretation selects evidence. It never adds facts, skill levels or titles.
export function normalizeQuery(value:string):string {
  return value.normalize("NFKC").toLowerCase().replace(/[‘’ʼ]/g,"'")
    .replace(/\b(isn'?t|aren'?t|wasn'?t|weren'?t|doesn'?t|didn'?t|don'?t|hasn'?t|haven'?t|can'?t|won'?t)\b/g,word=>({isnt:"is not",arent:"are not",wasnt:"was not",werent:"were not",doesnt:"does not",didnt:"did not",dont:"do not",hasnt:"has not",havent:"have not",cant:"cannot",wont:"will not"}[word.replace("'","")]!))
    .replace(/[‐‑‒–—-]/g," ").replace(/\bdev\s+ops\b/g,"devops").replace(/\bback\s+end\b/g,"backend")
    .replace(/\bcontinuous integration\s*(?:\/|and|&)\s*continuous delivery\b/g,"ci/cd")
    .replace(/\bci\s*(?:\/|\s)\s*cd\b/g,"ci/cd").replace(/\bai\s*(?:\/|\s)\s*ml\b/g,"ai/ml")
    .replace(/\bgithub (?:action )?workflows\b/g,"github actions")
    .replace(/\bc sharp\b/g,"c#").replace(/\bdotnet\b/g,".net").replace(/\bchroma\b/g,"chromadb")
    .replace(/\bmicrosoft azure\b/g,"azure").replace(/\bk8s\b/g,"kubernetes").replace(/\bamazon web services\b/g,"aws")
    .replace(/\bretrieval augmented generation\b/g,"rag")
    .replace(/\b(?:microsoft )?azure container apps\b|\bcontainer apps\b/g,"azure container apps")
    .replace(/[^a-z0-9+#./'\s]/g," ").replace(/\s+/g," ").trim();
}
const escape=(s:string)=>s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
export const mentionsQueryTerm=(query:string,term:string)=>new RegExp(`(?<![a-z0-9])${escape(normalizeQuery(term))}(?![a-z0-9])`).test(normalizeQuery(query));
const roles=[
  ["AI Platform Engineer",/\bai platform(?: engineer(?:ing)?)?\b/], ["Applied AI Engineer",/\bapplied ai(?: engineer(?:ing)?)?\b/],
  ["Agentic AI Engineer",/\bagentic ai engineer(?:ing)?\b/], ["Generative AI Engineer",/\b(?:generative ai|genai) engineer(?:ing)?\b/],
  ["AI Engineer",/\bai(?:\/ml)? engineer(?:ing)?\b/], ["Backend Software Engineer",/\bbackend software engineer(?:ing)?\b/],
  ["Backend Engineer",/\bbackend engineer(?:ing)?\b/], ["Software Engineer",/\bsoftware engineer(?:ing)?\b/],
  ["DevOps Engineer",/\bdevops(?: engineer(?:ing)?)?\b/], ["Platform Engineer",/\bplatform engineer(?:ing)?\b/],
  ["Cloud Engineer",/\bcloud engineer(?:ing)?\b/], ["Infrastructure Engineer",/\binfrastructure engineer(?:ing)?\b/],
  ["Site Reliability Engineer",/\b(?:sre|site reliability engineer(?:ing)?)\b/], ["Automation Engineer",/\bautomation engineer(?:ing)?\b/],
  ["Developer Productivity Engineer",/\bdeveloper productivity engineer(?:ing)?\b/], ["Developer Tools Engineer",/\bdeveloper tools engineer(?:ing)?\b/],
  ["Quality Engineer",/\bquality engineer(?:ing)?\b/], ["Test Automation Engineer",/\btest automation engineer(?:ing)?\b/],
] as const;
const evaluation=/\b(?:qualifi(?:ed|es|cation|cations)|fit|suitab(?:le|ility)|(?:well )?suited|candidate|align(?:ed|ment|s)?|positioned|prepared|competitive|consider(?:ing|ed)?)\b|\b(?:ready|appropriate|capable) (?:for|of|in)\b|\bworth (?:considering|interviewing)\b|\b(?:should|would|could).{0,35}(?:interview|hire|consider|succeed|work well|handle|perform)\b|\bwhy hire\b/;
const history=/\b(?:official|historical|job) (?:title|role|position)\b|\b(?:was|were|is|worked as|served as|became|promoted to|held the title of|did (?:luis|he) (?:work|serve) as)\s+(?:(?:luis|he|his)\s+)?(?:an?\s+)?(?:(?:senior|principal|staff|lead|chief)\s+)?(?:(?:applied|agentic|generative|ai|platform|software|backend|cloud|infrastructure|devops|automation|quality|test|developer|productivity|tools|site|reliability)\s+){0,4}(?:engineer|sre)\b/;
export function roleTitleMentions(text:string) {
  const titles=roles.map(([title])=>escape(title)).concat("SRE").sort((a,b)=>b.length-a.length);
  return [...text.matchAll(new RegExp(`\\b(?:(?:Senior|Principal|Staff|Lead|Chief)\\s+)?(?:${titles.join("|")})\\b`,"gi"))].map(match=>match[0]);
}
const families={
  depth:/\b(?:deep|deeply|depth|proficien\w*|familiar\w*|practical|professional(?:ly)?|meaningful|substantial|hands on|comfortable with|real world|actual experience|real experience)\b|\b(?:degree|extent|level) of (?:his |her |their )?(?:[a-z/]+ )?(?:experience|exposure)\b|\bhow (?:much experience|experienced|extensively|broadly|strong)\b|\b(?:used in practice|worked with|worked on|actually do with)\b/,
  maturity:/\b(?:production|live|shipped|deployed|released|adoption|adopted|prototype|poc|demo|experimental|experiment|scaffold|validated|tested|merged|onboarded|mature|maturity)\b|\b(?:internal use|used internally|company used|rolled out|proof of concept|design only|designed only|ever (?:get )?used|tools.*get used)\b/,
  ownership:/\b(?:owned|own|ownership|personally|responsib\w*|end to end|full lifecycle|lifecycle|design(?:ed)?|architect(?:ed)?|builds?|built|implement(?:ed)?|deploy(?:ed)?|operate(?:d)?|maintain(?:ed)?|support(?:ed)?|harden(?:ed)?)\b|\bfrom (?:idea|design|development) (?:to|through)\b/,
  fullLifecycle:/\bend to end|full lifecycle|from (?:idea|design) to production|from development through operations\b/,
  impact:/\b(?:impact|results?|outcomes?|metrics?|numbers?|usage|volume|scale|adoption|adopted|requests?|measur\w*|quantitative|success rate|failure rate|business value|operational value|what changed|what improved|accomplish\w*)\b|\bhow much.{0,30}(?:used|adoption)\b/,
  gap:/\b(?:gaps?|missing|unfamiliar|ramp|learning curve|transfer\w*|adjacent|pick up|learn|new to|how relevant|how close)\b|\b(?:has not|does not|never).{0,20}(?:used|have|experience)\b/,
  skeptical:/\b(?:actually|really|basically|mostly|just|ever|real or|his work)\b|\b(?:is|was|does|did) not\b/,
  comparison:/\b(?:compare|comparison|versus|vs|difference|distinguish\w*|differentiate)\b/,
  pattern:/\b(?:similar\w*|common|patterns?|across|consistent\w*|themes?|philosophy|approach|what ties together|what connects)\b/,
  strength:/\b(?:strong(?:est)?|strengths?|weak\w*|thin(?:ner)?|less (?:established|proven)|best area|most experienced|most proven|least established|concerns?|validate during an interview)\b/,
  aiReliability:/\b(?:safe\w*|unsafe|reliab\w*|trust\w*|guardrails?|controls?|safeguards?|boundaries|validation|verification|verified|deterministic|human (?:in the loop|approval)|fail closed|provenance|traceability|ground(?:ed|ing)|authority|autonom\w*|immutable|tamper\w*|repository state|head sha|current head|stale generated)\b/,
  autonomy:/\bautonom\w*|\bmodify.{0,30}code|\bcode.{0,30}modif/,
};
const topics={
  ai:/\b(?:ai|ai\/ml|applied ai|genai|generative ai|llm|language models?)\b/,
  agentic:/\b(?:agents?|agentic|orchestrat\w*|specialist|developer agents|coding agents|code agents)\b/,
  rag:/\b(?:rag|retrieval|knowledge (?:base|retrieval)|source (?:backed|grounded)|citations?|evidence backed|chromadb|romguide|ladimus agent)\b/,
  backend:/\b(?:backend|apis?|rest|services?|middleware|integrations?|fastapi|python|sql|software (?:engineering|development)|application (?:engineering|development))\b|\.net\b|\bc#(?![a-z0-9])/,
  cloud:/\b(?:devops|platform|infrastructure|cloud|azure|containers?|containerized|docker|ci\/cd|pipelines?|github actions|release|deployment|health checks|traffic|revisions|rollback|recovery|observability|monitoring|logs|grafana)\b/,
  testing:/\b(?:testing|tests?|test automation|android|unit testing|instrument(?:ed|ation)|junit|mockito|hilt|uiautomator|orchestrator|gradle|qa|quality|regression)\b/,
};
export function understandQuery(query:string,context:{chunks?:EvidenceChunk[];skills?:Skill[]}={}) {
  const normalized=normalizeQuery(query);
  const signals=Object.fromEntries(Object.entries(families).map(([name,pattern])=>[name,pattern.test(normalized)])) as {[K in keyof typeof families]:boolean};
  const topicSignals=Object.fromEntries(Object.entries(topics).map(([name,pattern])=>[name,pattern.test(normalized)])) as {[K in keyof typeof topics]:boolean};
  const requestedRoles=roles.filter(([name,pattern])=>{
    const scoped=name==="AI Engineer"?normalized.replace(/\b(?:applied|agentic|generative) ai engineer(?:ing)?\b/g,""):name==="Platform Engineer"?normalized.replace(/\bai platform(?: engineer(?:ing)?)?\b/g,""):name==="Software Engineer"?normalized.replace(/\bbackend software engineer(?:ing)?\b/g,""):normalized;
    return pattern.test(scoped);
  }).map(([name])=>name);
  const historicalTitle=/\b(?:official|historical|job) (?:title|role|position)\b/.test(normalized)||requestedRoles.length>0&&history.test(normalized);
  const broaderScope=/more than|beyond|traditional devops|(?:basically|mostly|just).{0,25}devops|devops rather than ai/.test(normalized);
  const person=/\b(?:luis|he|him|his|candidate)\b/.test(normalized);
  const roleAssessment=!historicalTitle&&evaluation.test(normalized)&&(person||requestedRoles.length>0);
  const requestedSkills=(context.skills??[]).filter(s=>[s.skill,...s.skill.split(/\s*\/\s*/)].some(a=>(normalizeQuery(a).length>2||normalizeQuery(a)==="c#")&&mentionsQueryTerm(normalized,a))).map(s=>s.skill);
  const namedEntities=[...new Set((context.chunks??[]).filter(c=>["system","project"].includes(c.category)&&(mentionsQueryTerm(normalized,c.title)||mentionsQueryTerm(normalized,c.recordId.replace(/^(?:system|project)-/,"").replaceAll("-"," ")))).map(c=>c.recordId))];
  const ambiguity=!requestedRoles.length&&!requestedSkills.length&&!namedEntities.length&&!Object.values(topicSignals).some(Boolean)&&/^(?:how (?:deep|strong|mature)(?: was| is)?(?: it| that)?|what about (?:that|it)|was (?:it|this|that) (?:actually )?real|did he|was this actually production)[?. ]*$/.test(normalized);
  const intents=[...(broaderScope?["broader_scope"]:[]),...(signals.impact?["impact"]:[]),...(topicSignals.rag?["rag"]:[]),...(/romtech|rom technologies/.test(normalized)?["romtech"]:[]),...(topicSignals.ai?["ai_systems"]:[]),...(topicSignals.agentic?["agentic_ai"]:[]),...(signals.aiReliability?["ai_safety"]:[]),...(signals.ownership||topicSignals.cloud||signals.maturity?["production_ownership"]:[]),...(topicSignals.backend?["backend"]:[]),...(topicSignals.testing?["android_testing"]:[])];
  const analysisMode=signals.comparison||/across all|shared philosophy/.test(normalized)?"comparison":!historicalTitle&&(roleAssessment||broaderScope||signals.strength||signals.gap||signals.fullLifecycle||/\bownership\b/.test(normalized)||signals.aiReliability&&/trust|autonom/.test(normalized)||signals.skeptical&&(topicSignals.ai||topicSignals.backend||topicSignals.cloud))?"assessment":"synthesis";
  const skillEvidenceQuestion=signals.depth||signals.skeptical||/\b(?:experience|used|evidence)\b/.test(normalized);
  const expansions=[...(signals.ownership&&person&&!namedEntities.length&&!Object.values(topicSignals).some(Boolean)?["engineering architecture agentic backend production ownership"]:[]),...(roleAssessment&&!Object.values(topicSignals).some(Boolean)?["professional engineering agentic backend Azure"]:[]),...(topicSignals.ai?["AI agentic systems"]:[]),...(topicSignals.agentic?["agent orchestration specialist"]:[]),...(signals.aiReliability?["validation approval provenance fail-closed"]:[]),...(topicSignals.rag?["RAG retrieval ROMGuide Ladimus Agent"]:[]),...(topicSignals.backend?["backend API middleware"]:[]),...(signals.impact&&(/\b(?:luis|he|his|him|career|automation|bot)\b/.test(normalized)||Object.values(topicSignals).some(Boolean)||/^which (?:outcomes|results|metrics|numbers)/.test(normalized))?["impact measurable metrics requests"]:[])];
  return {normalized,analysisMode:analysisMode as "synthesis"|"comparison"|"assessment",primaryIntent:intents[0]??"career",secondaryIntents:intents.slice(1),requestedRoles,requestedSkills,namedEntities,roleAssessment,historicalTitle,ambiguity,skillEvidenceQuestion,signals,topics:topicSignals,retrievalQuery:[normalized,...expansions].join(" ")};
}

// Used only for an assessment unit with cited technical premises. Seniority and
// historical assertions never receive a target-role exemption.
export function isTargetRoleContext(clause:string,title:string):boolean {
  const q=normalizeQuery(clause),role=normalizeQuery(title),at=q.indexOf(role);
  if(at<0||/^(?:senior|principal|staff|lead|chief)\b/.test(role))return false;
  const before=q.slice(Math.max(0,at-120),at),after=q.slice(at+role.length);
  if(history.test(q)||/\b(?:official|historical|job) (?:title|role|position)\b/.test(q))return false;
  const futureBridge=/\b(?:qualifi(?:ed|es|cation|cations)|candidate|candidacy|case|suitability|readiness|fit|suited|suitable|positioned|prepared|ready|consider(?:ed|ing)?|competitive|appropriate|align(?:ed|ment|s)?|ramp up)\b.{0,50}\b(?:for|with|in)\s+(?:an?\s+)?(?:(?:ai|applied|backend|software|platform|agentic|generative|cloud|infrastructure)\s+){0,3}$/;
  const leadingTarget=/^for\s+(?:an?\s+)?(?:(?:ai|applied|backend|software|platform|agentic|generative|cloud|infrastructure)\s+){0,3}$/.test(before);
  return (futureBridge.test(before)||leadingTarget)&&/^\s+(?:roles?|positions?|jobs?|opportunities)\b/.test(after);
}

// A question can ask for reasoning "using his documented work". Grammatical
// objects of using/know are not necessarily tool names or capability gaps.
const nonTools=new Set("his her their its our your my him them it this that these those the a an to for from with in on by of as and or but through documented documentation evidence work experience knowledge when where why well more ready familiar sources source record records judgment judgement answer explanation conclusions conclusion what how whether about only available public approved production code system systems role roles engineering design validation safety review process workflow workflows model models platform platforms scale architecture skills operations".split(" "));

export function requestedToolObjects(query:string):string[] {
  const q=normalizeQuery(query);
  return [...q.matchAll(/\b(?:experience\s+(?:with|in|using)|(?:has\s+luis\s+)?used|know|using|uses|transfer\s+to|work(?:ed)?\s+with|(?:familiar|proficient|comfortable)\s+with)\s+(?:(?:the|a|an)\s+)?([a-z][a-z0-9+#.]{1,39})/gi)]
    .map(match=>match[1]!).filter(name=>!nonTools.has(name)).map(name=>new RegExp(escape(name),"i").exec(query)?.[0]??name);
}

export function requestedTechnologyDomain(query:string):"infrastructure"|"delivery"|"observability"|"automation" {
  const q=normalizeQuery(query);
  return /observab|monitor|telemetry|dashboard/.test(q)?"observability":/infrastructure|cloud|iac/.test(q)?"infrastructure":/config|automati|provision/.test(q)?"automation":"delivery";
}
