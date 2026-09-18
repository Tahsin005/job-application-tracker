import { RateLimiterAdapter, RateLimitResult, RateLimitTier } from "./types";
import { IoRedisRateLimiterAdapter } from "./adapters/ioredis-adapter";
import { getTierConfig } from "./tiers";

export function getClientIp(
    source:
        | { headers: { get(name: string): string | null } }
        | { get(name: string): string | null }
): string {
    const headers =
        "headers" in source && source.headers
            ? source.headers
            : (source as { get(name: string): string | null });

    const xForwardedFor = headers.get("x-forwarded-for");
    if (xForwardedFor) {
        const firstIp = xForwardedFor.split(",")[0].trim();
        if (firstIp) return firstIp;
    }

    return (
        headers.get("cf-connecting-ip") ||
        headers.get("x-real-ip") ||
        "127.0.0.1"
    );
}

export function generateRateLimitKey({
    tier,
    route,
    ip,
    userId,
}: {
    tier: RateLimitTier;
    route: string;
    ip: string;
    userId?: string | null;
}): string {
    const normalizedRoute = route.replace(/^\/+|\/+$/g, "").replace(/\//g, ":") || "root";
    const identifier = userId ? `user:${userId}` : `ip:${ip}`;
    return `ratelimit:${tier}:${normalizedRoute}:${identifier}`;
}

export class RateLimiter {
    private adapter: RateLimiterAdapter;

    constructor(adapter?: RateLimiterAdapter) {
        this.adapter = adapter || new IoRedisRateLimiterAdapter();
    }

    async check({
        tier,
        route,
        ip,
        userId,
        customLimit,
        customWindow,
    }: {
        tier: RateLimitTier;
        route: string;
        ip: string;
        userId?: string | null;
        customLimit?: number;
        customWindow?: number;
    }): Promise<RateLimitResult> {
        const config = getTierConfig(tier);
        const limit = customLimit ?? config.limit;
        const windowSeconds = customWindow ?? config.windowSeconds;
        const key = generateRateLimitKey({ tier, route, ip, userId });

        return this.adapter.consume(key, limit, windowSeconds);
    }

    async reset(key: string): Promise<void> {
        if (this.adapter.reset) {
            await this.adapter.reset(key);
        }
    }
}

// Global default singleton instance
export const rateLimiter = new RateLimiter();
