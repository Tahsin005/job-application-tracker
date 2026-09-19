import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkRouteRateLimit } from "./lib/ratelimit/middleware-helper";

export default async function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const isAuthRoute = pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");
    const isProtectedRoute = pathname.startsWith("/dashboard");
    const isAdminRoute = pathname.startsWith("/admin");

    const cookieHeader = request.headers.get("cookie") || "";
    const hasSessionCookie =
        request.cookies.has("better-auth.session_token") ||
        request.cookies.has("__Secure-better-auth.session_token");

    let session: { user?: { id: string; isAdmin?: boolean; role?: string } } | null = null;

    // Fast-path for protected routes without session cookie: instant edge redirect
    if (isProtectedRoute && !hasSessionCookie) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    if (isAdminRoute && !hasSessionCookie) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    // Only resolve session via sub-request when strictly necessary:
    // 1. Admin routes with session cookie (must verify admin role)
    // 2. Auth routes (sign-in/sign-up) with session cookie (must redirect if already logged in)
    const requiresSessionResolution =
        hasSessionCookie && (isAdminRoute || isAuthRoute);

    if (requiresSessionResolution) {
        try {
            const response = await fetch(`${request.nextUrl.origin}/api/auth/get-session`, {
                headers: {
                    cookie: cookieHeader,
                    "x-forwarded-for": request.headers.get("x-forwarded-for") || "",
                },
            });
            session = await response.json().catch(() => null);
        } catch {
            session = null;
        }
    }

    // 1. Global & Route-Level Rate Limiting (Keyed by IP+Route or User ID if resolved)
    const isExemptFromRateLimit =
        pathname === "/api/auth/get-session" || pathname.startsWith("/api/workers");

    if (!isExemptFromRateLimit) {
        const rateLimitResponse = await checkRouteRateLimit(request, session?.user || null);
        if (rateLimitResponse) {
            return rateLimitResponse;
        }
    }

    // 2. Route Protection & Authorization
    if (isAdminRoute) {
        if (!session?.user) {
            return NextResponse.redirect(new URL("/sign-in", request.url));
        }
        if (!session.user.isAdmin && session.user.role !== "admin") {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
        return NextResponse.next();
    }

    if (isAuthRoute && session?.user) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!api/auth/get-session|api/workers|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
