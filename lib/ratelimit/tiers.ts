import { RateLimitTier, RateLimitTierConfig } from "./types";

export const TIER_CONFIGS: Record<RateLimitTier, RateLimitTierConfig> = {
    auth: {
        limit: 10,
        windowSeconds: 60,
    },
    sensitive: {
        limit: 20,
        windowSeconds: 60,
    },
    api: {
        limit: 100,
        windowSeconds: 60,
    },
    global: {
        limit: 300,
        windowSeconds: 60,
    },
};

export function getTierConfig(tier: RateLimitTier): RateLimitTierConfig {
    return TIER_CONFIGS[tier] || TIER_CONFIGS.global;
}

export function resolveTier(pathname: string): RateLimitTier {
    if (
        pathname.startsWith("/api/auth") ||
        pathname.startsWith("/sign-in") ||
        pathname.startsWith("/sign-up")
    ) {
        return "auth";
    }

    if (pathname.startsWith("/api/ai")) {
        return "sensitive";
    }

    if (pathname.startsWith("/api")) {
        return "api";
    }

    return "global";
}
