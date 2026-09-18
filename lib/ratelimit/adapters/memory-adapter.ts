import { RateLimiterAdapter, RateLimitResult } from "../types";

export class MemoryRateLimiterAdapter implements RateLimiterAdapter {
    private storage: Map<string, number[]> = new Map();

    async consume(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
        const now = Date.now();
        const windowMs = windowSeconds * 1000;
        const windowStart = now - windowMs;

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
