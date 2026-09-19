export interface RecaptchaVerifyResult {
    success: boolean;
    score?: number;
    action?: string;
    challengeTs?: string;
    hostname?: string;
    error?: string;
    errorCodes?: string[];
}

export interface VerifyRecaptchaOptions {
    remoteIp?: string;
    minScore?: number;
    expectedAction?: string;
}

export async function verifyRecaptchaToken(
    token: string,
    options?: VerifyRecaptchaOptions | string
): Promise<RecaptchaVerifyResult> {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    // Support legacy signature (token, remoteIp) as well as options object
    const resolvedOptions: VerifyRecaptchaOptions =
        typeof options === "string" ? { remoteIp: options } : options ?? {};
    const { remoteIp, minScore = 0.5, expectedAction } = resolvedOptions;

    if (!secretKey) {
        console.warn("[reCAPTCHA] RECAPTCHA_SECRET_KEY is not configured");
        return {
            success: false,
            error: "reCAPTCHA server configuration is missing",
        };
    }

    if (!token || typeof token !== "string" || !token.trim()) {
        return {
            success: false,
            error: "reCAPTCHA verification token is missing",
        };
    }

    try {
        const bodyParams = new URLSearchParams({
            secret: secretKey,
            response: token.trim(),
        });

        if (remoteIp) {
            bodyParams.append("remoteip", remoteIp);
        }

        const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: bodyParams.toString(),
            cache: "no-store",
        });

        if (!response.ok) {
            return {
                success: false,
                error: `reCAPTCHA verification service returned status ${response.status}`,
            };
        }

        const data = (await response.json()) as {
            success: boolean;
            score?: number;
            action?: string;
            challenge_ts?: string;
            hostname?: string;
            "error-codes"?: string[];
        };

        if (!data.success) {
            return {
                success: false,
                challengeTs: data.challenge_ts,
                hostname: data.hostname,
                errorCodes: data["error-codes"],
                error: "reCAPTCHA verification failed. Please try again.",
            };
        }

        // v3 score evaluation
        if (typeof data.score === "number" && data.score < minScore) {
            return {
                success: false,
                score: data.score,
                action: data.action,
                challengeTs: data.challenge_ts,
                hostname: data.hostname,
                error: "Security verification score too low. Please try again.",
            };
        }

        // v3 action check
        if (expectedAction && data.action && data.action !== expectedAction) {
            return {
                success: false,
                score: data.score,
                action: data.action,
                challengeTs: data.challenge_ts,
                hostname: data.hostname,
                error: "Security verification action mismatch.",
            };
        }

        return {
            success: true,
            score: data.score,
            action: data.action,
            challengeTs: data.challenge_ts,
            hostname: data.hostname,
        };
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Network error verifying reCAPTCHA";
        console.error("[reCAPTCHA] Verification error:", err);
        return {
            success: false,
            error: message,
        };
    }
}
