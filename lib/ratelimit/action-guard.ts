import { headers } from "next/headers";
import { rateLimiter, getClientIp } from "./limiter";
import { RateLimitTier } from "./types";

export interface ActionRateLimitOptions {
    actionName: string;
    userId?: string | null;
    tier?: RateLimitTier;
    customLimit?: number;
    customWindow?: number;
}

export async function checkActionRateLimit({
    actionName,
    userId,
    tier = "api",
    customLimit,
    customWindow,
}: ActionRateLimitOptions): Promise<{
    allowed: boolean;
    error: string | null;
    retryAfter: number;
}> {
    let ip = "127.0.0.1";
    try {
        const headerList = await headers();
        ip = getClientIp(headerList);
    } catch {
        // When invoked outside Next.js request context (e.g. tests)
    }

    const result = await rateLimiter.check({
        tier,
        route: `action:${actionName}`,
        ip,
        userId,
        customLimit,
        customWindow,
    });

    if (!result.success) {
        return {
            allowed: false,
            error: `Rate limit exceeded. Please wait ${result.retryAfter}s before retrying.`,
            retryAfter: result.retryAfter,
        };
    }

    return {
        allowed: true,
        error: null,
        retryAfter: 0,
    };
}
