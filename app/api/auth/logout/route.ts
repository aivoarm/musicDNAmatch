import { signOut } from "@workos-inc/authkit-nextjs";
import { cookies } from "next/headers";
export const runtime = "edge";

export async function GET(request: Request) {
    const { origin } = new URL(request.url);
    const cookieStore = await cookies();

    // Clear application-specific "cache" cookies
    cookieStore.delete("guest_id");
    cookieStore.delete("profile_id");
    cookieStore.delete("has_dna");
    cookieStore.delete("auth_email");
    cookieStore.delete("last_spotify_url");

    return await signOut({ returnTo: origin });
}
