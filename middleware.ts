import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Middleware: ensures every visitor gets a persistent guest_id cookie.
 * This runs on every request before the page/API handler.
 */
export async function middleware(request: NextRequest) {
    const response = NextResponse.next();
    const { pathname, searchParams } = request.nextUrl;

    // Skip static files, _next, and favicon
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon") ||
        pathname.startsWith("/icon") ||
        pathname.match(/\.(ico|png|jpg|svg|webp|woff2?|css|js|map)$/)
    ) {
        return response;
    }

    const guestIdCookie = request.cookies.get("guest_id");
    const hasDnaCookie = request.cookies.get("has_dna");
    const isRestart = searchParams.has("restart");

    // Simplified middleware: persistent guest_id only. 
    // Manual entry on landing page handles existing users.

    // 2. If no guest_id cookie and no google auth, set one
    if (!guestIdCookie && !request.cookies.get("google_access_token")) {
        const guestId = crypto.randomUUID();
        response.cookies.set("guest_id", guestId, {
            maxAge: 60 * 60 * 24 * 365, // 1 year
            path: "/",
            httpOnly: false,
            sameSite: "lax",
        });
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico
         */
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};
