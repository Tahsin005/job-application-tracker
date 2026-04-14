import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const isAuthRoute = request.nextUrl.pathname.startsWith("/sign-in") || request.nextUrl.pathname.startsWith("/sign-up");
    const isProtectedRoute = request.nextUrl.pathname.startsWith("/dashboard");

    if (!isAuthRoute && !isProtectedRoute) {
        return NextResponse.next();
    }

    try {
        const response = await fetch(`${request.nextUrl.origin}/api/auth/get-session`, {
            headers: {
                cookie: request.headers.get("cookie") || "",
            },
        });
        
        const session = await response.json().catch(() => null);

        if (isProtectedRoute && !session?.user) {
            return NextResponse.redirect(new URL("/sign-in", request.url));
        }
        if (isAuthRoute && session?.user) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
    } catch (e) {
        if (isProtectedRoute) {
            return NextResponse.redirect(new URL("/sign-in", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
