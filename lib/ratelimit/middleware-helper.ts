import { NextRequest, NextResponse } from "next/server";
import { rateLimiter, getClientIp } from "./limiter";
import { resolveTier } from "./tiers";

export async function checkRouteRateLimit(
    request: NextRequest,
    sessionUser?: { id: string } | null
): Promise<NextResponse | null> {
    const pathname = request.nextUrl.pathname;
    const tier = resolveTier(pathname);
    const ip = getClientIp(request);
    const userId = sessionUser?.id || null;

    const result = await rateLimiter.check({
        tier,
        route: pathname,
        ip,
        userId,
    });

    if (!result.success) {
        return NextResponse.json(
            {
                error: "Too Many Requests",
                message: `Too many requests. Please try again in ${result.retryAfter} seconds.`,
                retryAfter: result.retryAfter,
            },
            {
                status: 429,
                headers: {
                    "Retry-After": String(result.retryAfter),
                    "X-RateLimit-Limit": String(result.limit),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": String(result.resetSeconds),
                },
            }
        );
    }

    return null;
}
