import { RateLimiterAdapter, RateLimitResult } from "../types";

export class MemoryRateLimiterAdapter implements RateLimiterAdapter {
    private storage: Map<string, number[]> = new Map();
    private lastSweep: number = Date.now();

    async consume(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
        const now = Date.now();
        const windowMs = windowSeconds * 1000;
        const windowStart = now - windowMs;

        // Periodically evict idle keys every 60 seconds to prevent unbounded memory growth
        if (now - this.lastSweep > 60_000) {
            this.lastSweep = now;
            for (const [storedKey, values] of this.storage.entries()) {
                const active = values.filter((ts) => ts > windowStart);
                if (active.length === 0) {
                    this.storage.delete(storedKey);
                } else {
                    this.storage.set(storedKey, active);
                }
            }
        }

        const timestamps = (this.storage.get(key) || []).filter((ts) => ts > windowStart);

        if (timestamps.length >= limit) {
            const oldestInWindow = timestamps[0];
            const retryAfterMs = oldestInWindow + windowMs - now;
            const retryAfter = Math.max(1, Math.ceil(retryAfterMs / 1000));

            return {
                success: false,
                limit,
                remaining: 0,
                retryAfter,
                resetSeconds: retryAfter,
            };
        }

        timestamps.push(now);
        this.storage.set(key, timestamps);

        return {
            success: true,
            limit,
            remaining: Math.max(0, limit - timestamps.length),
            retryAfter: 0,
            resetSeconds: windowSeconds,
        };
    }

    async reset(key: string): Promise<void> {
        this.storage.delete(key);
    }
}
