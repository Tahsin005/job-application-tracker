import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { betterAuth } from "better-auth";
import { captcha } from "better-auth/plugins";
import connectDB from "../db";
import { initializeUserBoard } from "../init-user-board";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const mongooseInstance = await connectDB();
const client = mongooseInstance.connection.getClient();
const db = client.db();

const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
const recaptchaSecretKey = process.env.RECAPTCHA_SECRET_KEY;
const isProduction = process.env.NODE_ENV === "production";
const isRecaptchaConfigured = Boolean(recaptchaSiteKey || recaptchaSecretKey);

if (isProduction) {
    if (!recaptchaSecretKey || !recaptchaSiteKey) {
        throw new Error(
            "[reCAPTCHA] Missing production security configuration: both NEXT_PUBLIC_RECAPTCHA_SITE_KEY and RECAPTCHA_SECRET_KEY must be defined."
        );
    }
} else if (isRecaptchaConfigured && (!recaptchaSecretKey || !recaptchaSiteKey)) {
    throw new Error(
        "[reCAPTCHA] Incomplete configuration: both NEXT_PUBLIC_RECAPTCHA_SITE_KEY and RECAPTCHA_SECRET_KEY must be provided when reCAPTCHA is enabled."
    );
}

export const auth = betterAuth({
    database: mongodbAdapter(db, {
        client,
    }),
    user: {
        additionalFields: {
            isAdmin: {
                type: "boolean",
                required: false,
                defaultValue: false,
                input: false,
            },
            role: {
                type: "string",
                required: false,
                defaultValue: "user",
                input: false,
            },
        },
    },
    trustedOrigins: [
        "https://job-application-tracker-site.vercel.app",
        "https://*.vercel.app",
        "http://localhost:3000",
        ...(process.env.BETTER_AUTH_URL ? [process.env.BETTER_AUTH_URL] : []),
        ...(process.env.NEXT_PUBLIC_BETTER_AUTH_URL ? [process.env.NEXT_PUBLIC_BETTER_AUTH_URL] : []),
    ],
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 60 * 60,
        },
    },
    emailAndPassword: {
        enabled: true,
    },
    plugins: [
        ...(recaptchaSecretKey
            ? [
                captcha({
                    provider: "google-recaptcha",
                    secretKey: recaptchaSecretKey,
                    minScore: 0.5,
                    endpoints: ["/sign-in/email"],
                    expectedAction: "signin",
                }),
                captcha({
                    provider: "google-recaptcha",
                    secretKey: recaptchaSecretKey,
                    minScore: 0.5,
                    endpoints: ["/sign-up/email"],
                    expectedAction: "signup",
                }),
                captcha({
                    provider: "google-recaptcha",
                    secretKey: recaptchaSecretKey,
                    minScore: 0.5,
                    endpoints: ["/request-password-reset"],
                    expectedAction: "reset-password",
                }),
            ]
            : []),
    ],
    databaseHooks: {
        user: {
            create: {
                after: async (user) => {
                    if (user.id) {
                        await initializeUserBoard(user.id);
                    }
                }
            }
        }
    }
});

export async function getSession() {
    const result = await auth.api.getSession({
        headers: await headers(),
    });

    return result;
}

export async function signOut() {
    const result = await auth.api.signOut({
        headers: await headers(),
    });

    if (result.success) {
        redirect("/sign-in");
    }
}
