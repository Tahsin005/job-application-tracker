import { RateLimiterAdapter, RateLimitResult, RateLimitTier } from "./types";
import { IoRedisRateLimiterAdapter } from "./adapters/ioredis-adapter";
import { UpstashRestRateLimiterAdapter } from "./adapters/upstash-rest-adapter";
import { MemoryRateLimiterAdapter } from "./adapters/memory-adapter";
import { getTierConfig } from "./tiers";

function getDefaultAdapter(): RateLimiterAdapter {
    const hasUpstashUrl = Boolean(process.env.UPSTASH_REDIS_REST_URL);
    const hasUpstashToken = Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);

    if (hasUpstashUrl !== hasUpstashToken) {
        throw new Error(
            "[RateLimiter] Incomplete Upstash configuration: both UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set."
        );
    }

    if (hasUpstashUrl && hasUpstashToken) {
        return new UpstashRestRateLimiterAdapter();
    }
    if (process.env.REDIS_URL) {
        return new IoRedisRateLimiterAdapter();
    }
    return new MemoryRateLimiterAdapter();
}

export function getClientIp(
    source:
        | { headers: { get(name: string): string | null } }
        | { get(name: string): string | null }
): string {
    const headers =
        "headers" in source && source.headers
            ? source.headers
            : (source as { get(name: string): string | null });

    const platformIp =
        headers.get("cf-connecting-ip") ||
        headers.get("x-real-ip") ||
        headers.get("x-vercel-forwarded-for");

    if (platformIp) {
        return platformIp.trim();
    }

    const xForwardedFor = headers.get("x-forwarded-for");
    if (xForwardedFor) {
        const parts = xForwardedFor
            .split(",")
            .map((part) => part.trim())
            .filter(Boolean);
        const trustedClientIp = parts[parts.length - 1];
        if (trustedClientIp) return trustedClientIp;
    }

    return "127.0.0.1";
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
        this.adapter = adapter || getDefaultAdapter();
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
