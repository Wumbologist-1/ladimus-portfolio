// Bounded, per-instance protection. Vercel edge/firewall limits should complement
// this in multi-instance deployments; this map is deliberately not presented as global.
export function createLimiter(limit = 8, windowMs = 60000) {
  const buckets = new Map<string,{count:number,expires:number}>();
  return {
    take(key:string,now = Date.now()) {
      for (const [id,bucket] of buckets) if (bucket.expires <= now) buckets.delete(id);
      const current = buckets.get(key);
      if (current && current.count >= limit) return Math.max(1,Math.ceil((current.expires-now)/1000));
      if (!current && buckets.size >= 2000) return 60;
      buckets.set(key,{count:(current?.count ?? 0)+1,expires:current?.expires ?? now+windowMs}); return 0;
    },
  };
}
