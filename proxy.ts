import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function proxy(request: NextRequest) {
    const isAuthRoute = request.nextUrl.pathname.startsWith("/sign-in") || request.nextUrl.pathname.startsWith("/sign-up");
    const isProtectedRoute = request.nextUrl.pathname.startsWith("/dashboard");
    const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");

    if (!isAuthRoute && !isProtectedRoute && !isAdminRoute) {
        return NextResponse.next();
    }

    try {
        const response = await fetch(`${request.nextUrl.origin}/api/auth/get-session`, {
            headers: {
                cookie: request.headers.get("cookie") || "",
            },
        });
        
        const session = await response.json().catch(() => null);

        if (isAdminRoute) {
            if (!session?.user) {
                return NextResponse.redirect(new URL("/sign-in", request.url));
            }
            if (!session.user.isAdmin && session.user.role !== "admin") {
                return NextResponse.redirect(new URL("/dashboard", request.url));
            }
            return NextResponse.next();
        }

        if (isProtectedRoute && !session?.user) {
            return NextResponse.redirect(new URL("/sign-in", request.url));
        }
        if (isAuthRoute && session?.user) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
    } catch {
        if (isAdminRoute || isProtectedRoute) {
            return NextResponse.redirect(new URL("/sign-in", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
