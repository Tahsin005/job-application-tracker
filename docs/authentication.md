# Authentication & Session Management

This document details the authentication architecture using **Better Auth**, MongoDB session persistence, route protection proxy, and client session integration.

---

## 1. Better Auth Configuration (`lib/auth/auth.ts`)

The application uses **Better Auth v1.6** with the MongoDB adapter.

```ts
// lib/auth/auth.ts
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { betterAuth } from "better-auth";
import connectDB from "../db";
import { initializeUserBoard } from "../init-user-board";

const mongooseInstance = await connectDB();
const client = mongooseInstance.connection.getClient();
const db = client.db();

export const auth = betterAuth({
    database: mongodbAdapter(db, {
        client,
    }),
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 60 * 60, // 1 hour edge cache
        },
    },
    emailAndPassword: {
        enabled: true,
    },
    databaseHooks: {
        user: {
            create: {
                after: async (user) => {
                    if (user.id) {
                        await initializeUserBoard(user.id);
                    }
                },
            },
        },
    },
});
```

### Key Highlights:
1. **MongoDB Adapter**: Directly connects using the existing Mongoose client connection.
2. **Session Cookie Cache**: Caches session verification on edge cookies for 1 hour to prevent redundant database lookups on every request.
3. **Automatic Workspace Provisioning**: The `databaseHooks.user.create.after` hook creates the user's initial board and standard columns immediately upon signup.

---

## 2. Route Protection Proxy (`proxy.ts`)

In Next.js 16, route guarding is configured via `proxy.ts` (the modern routing proxy pattern):

```ts
// proxy.ts
export default async function proxy(request: NextRequest) {
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
    } catch {
        if (isProtectedRoute) {
            return NextResponse.redirect(new URL("/sign-in", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

- **Protected Routes (`/dashboard`)**: Redirects unauthenticated visitors to `/sign-in`.
- **Guest-Only Routes (`/sign-in`, `/sign-up`)**: Redirects already authenticated users to `/dashboard`.

---

## 3. Client Session & Navbar Skeleton (`components/navbar.tsx`)

Client-side components consume session state via `useSession()` from `lib/auth/auth-client.ts`:

```tsx
// components/navbar.tsx
const { data: session, isPending } = useSession();
```

### Layout Shift Prevention:
While `isPending` is true, the navbar renders an accessible Shadcn `<Skeleton>` placeholder. This prevents flash of unauthenticated content (FOUC) or sudden UI layout shifts when the session resolves.

---

## 4. Server Actions & Session Verification

Every mutating Server Action (`createJobApplication`, `updateJobApplication`, `deleteJobApplication`, `getUserBoard`) in `lib/actions/job-applications.ts` begins with strict session verification:

```ts
const session = await getSession();

if (!session?.user) {
    return { error: "Unauthorized", data: null };
}
```

Any attempt to manipulate or read boards or job applications belonging to another `userId` is strictly rejected with `{ error: "Unauthorized" }`.
