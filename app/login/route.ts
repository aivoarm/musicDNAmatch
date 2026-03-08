import { getSignInUrl } from "@workos-inc/authkit-nextjs";
export const runtime = "edge";
import { redirect } from "next/navigation";

/**
 * GET /login
 * 
 * Generates a WorkOS AuthKit sign-in URL and redirects the user
 * to the hosted authentication page. Accepts an optional 'email'
 * query param to pre-fill the login screen.
 */
export const GET = async (req: Request) => {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    const signInUrl = await getSignInUrl({
        loginHint: email || undefined,
    });
    return redirect(signInUrl);
};
