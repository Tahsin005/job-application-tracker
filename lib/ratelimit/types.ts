export type RateLimitTier = "auth" | "sensitive" | "api" | "global";

export interface RateLimitTierConfig {
    limit: number;
    windowSeconds: number;
}

export interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    retryAfter: number; // in seconds
    resetSeconds: number;
}

export interface RateLimiterAdapter {
    consume(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult>;
    reset?(key: string): Promise<void>;
}
