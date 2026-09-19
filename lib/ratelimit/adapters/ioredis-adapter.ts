import Redis from "ioredis";
import { RateLimiterAdapter, RateLimitResult } from "../types";
import { MemoryRateLimiterAdapter } from "./memory-adapter";

const SLIDING_WINDOW_LUA = `
local key = KEYS[1]
local limit = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local now = tonumber(ARGV[3])
local member = ARGV[4]
local clearBefore = now - (window * 1000)

redis.call('ZREMRANGEBYSCORE', key, 0, clearBefore)
local currentRequests = redis.call('ZCARD', key)

if currentRequests < limit then
    redis.call('ZADD', key, now, member)
    redis.call('EXPIRE', key, window)
    return {1, limit - currentRequests - 1, window}
else
    local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
    local retryAfter = window
    if oldest and #oldest >= 2 then
        local oldestTime = tonumber(oldest[2])
        retryAfter = math.ceil((oldestTime + (window * 1000) - now) / 1000)
        if retryAfter < 1 then retryAfter = 1 end
    end
    return {0, 0, retryAfter}
end
`;

function resolveRedisConnectionUrl(): string | null {
    if (process.env.REDIS_URL) {
        return process.env.REDIS_URL;
    }

    const restUrl = process.env.UPSTASH_REDIS_REST_URL;
    const restToken = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (restUrl && restToken) {
        try {
            const parsed = new URL(restUrl);
            const host = parsed.hostname;
            return `rediss://default:${encodeURIComponent(restToken)}@${host}:6379`;
        } catch {
            return null;
        }
    }

    return null;
}

export class IoRedisRateLimiterAdapter implements RateLimiterAdapter {
    private client: Redis | null = null;
    private fallbackAdapter: MemoryRateLimiterAdapter = new MemoryRateLimiterAdapter();
    private connectionAttempted = false;

    private getClient(): Redis | null {
        if (this.client) return this.client;
        if (this.connectionAttempted) return null;

        this.connectionAttempted = true;
        const connectionUrl = resolveRedisConnectionUrl();
        if (!connectionUrl) return null;

        try {
            this.client = new Redis(connectionUrl, {
                lazyConnect: true,
                maxRetriesPerRequest: 1,
                connectTimeout: 4000,
                enableReadyCheck: false,
                retryStrategy: (times) => {
                    if (times > 3) return null; // Stop retrying after 3 attempts
                    return Math.min(times * 100, 1000);
                },
            });

            this.client.on("error", (err) => {
                console.warn("[RateLimit IoRedis] Redis connection warning:", err?.message || err);
            });

            return this.client;
        } catch (err) {
            console.warn("[RateLimit IoRedis] Failed to initialize Redis client:", err);
            return null;
        }
    }

    async consume(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
        const client = this.getClient();

        if (!client) {
            return this.fallbackAdapter.consume(key, limit, windowSeconds);
        }

        try {
            if (client.status === "wait") {
                await client.connect();
            }

            const now = Date.now();
            const member = `${now}:${crypto.randomUUID()}`;
            const res = (await client.eval(
                SLIDING_WINDOW_LUA,
                1,
                key,
                limit,
                windowSeconds,
                now,
                member
            )) as [number, number, number];

            const allowed = res[0] === 1;
            const remaining = Number(res[1]) || 0;
            const retryAfter = Number(res[2]) || windowSeconds;

            return {
                success: allowed,
                limit,
                remaining: allowed ? remaining : 0,
                retryAfter: allowed ? 0 : retryAfter,
                resetSeconds: retryAfter,
            };
        } catch (err) {
            console.warn("[RateLimit IoRedis] Redis execution error, using in-memory fallback:", err);
            return this.fallbackAdapter.consume(key, limit, windowSeconds);
        }
    }

    async reset(key: string): Promise<void> {
        const client = this.getClient();
        if (client) {
            try {
                await client.del(key);
            } catch {
                // Ignore reset error
            }
        }
        await this.fallbackAdapter.reset(key);
    }
}
