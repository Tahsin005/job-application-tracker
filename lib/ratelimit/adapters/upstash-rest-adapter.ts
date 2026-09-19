import { redis } from "../../upstash/redis";
import { RateLimiterAdapter, RateLimitResult } from "../types";

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

export class UpstashRestRateLimiterAdapter implements RateLimiterAdapter {
    async consume(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
        if (!redis) {
            console.error("[RateLimit UpstashRest] Redis client is not initialized, failing closed.");
            return {
                success: false,
                limit,
                remaining: 0,
                retryAfter: windowSeconds,
                resetSeconds: windowSeconds,
            };
        }

        try {
            const now = Date.now();
            const member = `${now}:${crypto.randomUUID()}`;
            const res = (await redis.eval(
                SLIDING_WINDOW_LUA,
                [key],
                [limit, windowSeconds, now, member]
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
            console.error("[RateLimit UpstashRest] Redis execution error, failing closed:", err);
            return {
                success: false,
                limit,
                remaining: 0,
                retryAfter: windowSeconds,
                resetSeconds: windowSeconds,
            };
        }
    }

    async reset(key: string): Promise<void> {
        if (redis) {
            try {
                await redis.del(key);
            } catch {
                // Ignore reset error
            }
        }
    }
}
