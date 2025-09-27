// Tiny in-memory TTL cache (for hackathon demo)
export class LRU<K, V> {
    private store = new Map<K, { v: V; exp: number }>();
    constructor(private max = 200, private ttlMs = 60_000) {}
    get(k: K): V | undefined {
        const hit = this.store.get(k);
        if (!hit) {
            return undefined;
        }
        
        if (Date.now() > hit.exp) {
            this.store.delete(k);
            return undefined;
        }
        // refresh LRU
        this.store.delete(k); this.store.set(k, { v: hit.v, exp: hit.exp });
        return hit.v;
    }
    set(k: K, v: V) {
        if (this.store.size >= this.max) {
            const first = this.store.keys().next().value;
            if (first !== undefined) {
                this.store.delete(first);
            }
        }
        this.store.set(k, { v, exp: Date.now() + this.ttlMs });
    }
}