import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authkitMiddleware } from "@workos-inc/authkit-nextjs";

/**
 * Middleware: WorkOS AuthKit session management + persistent guest_id cookie.
 */
const workosMiddleware = authkitMiddleware();

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Fast-path for static assets
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon") ||
        pathname.match(/\.(ico|png|jpg|svg|webp|woff2?|css|js|map)$/)
    ) {
        return NextResponse.next();
    }

    // 1. Run WorkOS logic
    // We pass {} as any to satisfy TypeScript for the second argument (options)
    const workosResponse = await workosMiddleware(request, {} as any);

    // 2. Handle redirects (e.g. login required if it was enforced)
    if (workosResponse && workosResponse.status >= 300 && workosResponse.status < 400) {
        return workosResponse;
    }

    // 3. Create/Augment the response
    // If workosResponse is provided, it's already a "pass-through" response with WorkOS headers
    const response = workosResponse || NextResponse.next();

    // 4. Persistence logic: guest_id for anonymous identification
    // Only set if not already present and no other auth exists
    if (!request.cookies.get("guest_id") && !request.cookies.get("google_access_token")) {
        const guestId = crypto.randomUUID();
        // Use Headers.append to ensure compatibility even if response is a standard Response
        response.headers.append(
            'Set-Cookie',
            `guest_id=${guestId}; Max-Age=31536000; Path=/; SameSite=Lax`
        );
    }

    return response;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};
