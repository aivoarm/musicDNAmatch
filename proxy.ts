import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authkitMiddleware } from "@workos-inc/authkit-nextjs";

/**
 * Proxy (Middleware in Next.js 16): Handles WorkOS AuthKit and persistent guest_id.
 */
let workosMiddleware: any;

try {
    // Initialize the WorkOS middleware
    workosMiddleware = authkitMiddleware();
} catch (e) {
    console.error("WorkOS Middleware initialization error:", e);
}

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Fast-path for static assets or internal Next.js requests
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon") ||
        pathname.match(/\.(ico|png|jpg|svg|webp|woff2?|css|js|map)$/)
    ) {
        return NextResponse.next();
    }

    let response: NextResponse | Response;

    if (workosMiddleware) {
        try {
            // 1. Run WorkOS logic
            const workosResponse = await workosMiddleware(request, {} as any);

            // 2. If it's a redirect or significant response, return it directly
            if (workosResponse && workosResponse.status >= 300 && workosResponse.status < 400) {
                return workosResponse;
            }

            // Use the workosResponse if valid, else go next
            response = workosResponse || NextResponse.next();
        } catch (e) {
            console.error("WorkOS Proxy execution error:", e);
            response = NextResponse.next();
        }
    } else {
        response = NextResponse.next();
    }

    // 3. Persistence logic: guest_id for anonymous identification
    try {
        if (!request.cookies.get("guest_id") && !request.cookies.get("google_access_token")) {
            // Robust ID generation (works in Node and Edge)
            const guestId = (typeof crypto !== "undefined" && "randomUUID" in crypto)
                ? crypto.randomUUID()
                : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

            // Safer way to add a cookie to any Response/NextResponse
            response.headers.append(
                "Set-Cookie",
                `guest_id=${guestId}; Max-Age=31536000; Path=/; SameSite=Lax`
            );
        }
    } catch (e) {
        console.error("Guest ID Persistence error:", e);
    }

    return response;
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};
