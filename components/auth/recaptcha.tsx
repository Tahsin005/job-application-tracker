"use client";

import { useEffect, useState, useCallback } from "react";

declare global {
    interface Window {
        grecaptcha?: {
            ready: (callback: () => void) => void;
            execute: (siteKey: string, options: { action: string }) => Promise<string>;
        };
    }
}

/**
 * Hook to execute Google reCAPTCHA v3 score-based actions seamlessly.
 */
export function useRecaptcha() {
    const [isReady, setIsReady] = useState(false);
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    useEffect(() => {
        if (!siteKey || typeof window === "undefined") return;

        if (window.grecaptcha && typeof window.grecaptcha.execute === "function") {
            window.grecaptcha.ready(() => setIsReady(true));
            return;
        }

        const scriptId = "recaptcha-v3-script";
        let script = document.getElementById(scriptId) as HTMLScriptElement | null;

        if (!script) {
            script = document.createElement("script");
            script.id = scriptId;
            script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
            script.async = true;
            script.defer = true;
            document.head.appendChild(script);
        }

        const onLoad = () => {
            if (window.grecaptcha) {
                window.grecaptcha.ready(() => setIsReady(true));
            }
        };

        script.addEventListener("load", onLoad);
        return () => {
            script?.removeEventListener("load", onLoad);
        };
    }, [siteKey]);

    const executeRecaptcha = useCallback(
        async (action: string): Promise<string | null> => {
            if (!siteKey || typeof window === "undefined") {
                console.warn("[reCAPTCHA v3] Missing NEXT_PUBLIC_RECAPTCHA_SITE_KEY");
                return null;
            }

            if (!window.grecaptcha || typeof window.grecaptcha.execute !== "function") {
                const loaded = await new Promise<boolean>((resolve) => {
                    let attempts = 0;
                    const interval = setInterval(() => {
                        attempts++;
                        if (window.grecaptcha && typeof window.grecaptcha.execute === "function") {
                            clearInterval(interval);
                            resolve(true);
                        } else if (attempts > 30) {
                            clearInterval(interval);
                            resolve(false);
                        }
                    }, 100);
                });

                if (!loaded) {
                    console.error("[reCAPTCHA v3] Library failed to load");
                    return null;
                }
            }

            try {
                return await new Promise<string | null>((resolve) => {
                    window.grecaptcha!.ready(async () => {
                        try {
                            const token = await window.grecaptcha!.execute(siteKey, { action });
                            resolve(token);
                        } catch (err) {
                            console.error("[reCAPTCHA v3] Execution error:", err);
                            resolve(null);
                        }
                    });
                });
            } catch (err) {
                console.error("[reCAPTCHA v3] Unexpected error executing reCAPTCHA:", err);
                return null;
            }
        },
        [siteKey]
    );

    return { executeRecaptcha, isReady };
}

/**
 * Standard Google reCAPTCHA v3 branding / legal disclaimer notice.
 */
export function RecaptchaNotice({ className = "" }: { className?: string }) {
    return (
        <p className={`text-center text-[11px] text-gray-500 leading-relaxed ${className}`}>
            Protected by reCAPTCHA. Google{" "}
            <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-gray-700"
            >
                Privacy Policy
            </a>{" "}
            and{" "}
            <a
                href="https://policies.google.com/terms"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-gray-700"
            >
                Terms of Service
            </a>{" "}
            apply.
        </p>
    );
}

// Backward-compatible alias
export const ReCaptcha = RecaptchaNotice;
