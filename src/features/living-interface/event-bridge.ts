export type IntelligenceEvent = {
  type: "query:start" | "retrieval:start" | "retrieval:complete" | "generation:start" | "verification:start" | "response:complete" | "response:error";
  evidenceIds?: readonly string[]; success?: boolean;
};
const listeners = new Set<(event:IntelligenceEvent)=>void>();
export function emitIntelligence(event:IntelligenceEvent) {
  const bounded={...event,...(event.evidenceIds ? {evidenceIds:event.evidenceIds.slice(0,5)} : {})};
  for(const listener of listeners) listener(bounded);
}
export function subscribeIntelligence(listener:(event:IntelligenceEvent)=>void) {
  listeners.add(listener); return ()=>{listeners.delete(listener);};
}
export function evidenceCluster(id:string,clusters:number) {
  let hash=0;for(const character of id) hash=(hash*31+character.charCodeAt(0))>>>0;
  return hash%clusters;
}
