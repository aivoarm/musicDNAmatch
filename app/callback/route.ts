import { handleAuth } from "@workos-inc/authkit-nextjs";
export const runtime = "edge";

/**
 * GET /callback
 * 
 * WorkOS AuthKit callback endpoint.
 * After a user authenticates via Magic Auth (or any method),
 * WorkOS redirects here with an authorization code.
 * 
 * handleAuth() exchanges the code for a session and sets cookies.
 * After success, redirects to /auth/complete to link the profile.
 */
export const GET = handleAuth({ returnPathname: "/auth/complete" });
