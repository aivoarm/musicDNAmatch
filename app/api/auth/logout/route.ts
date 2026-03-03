import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const cookieStore = await cookies();

    // Clear all auth-related cookies
    cookieStore.delete("google_access_token");
    cookieStore.delete("google_refresh_token");
    cookieStore.delete("google_user");
    cookieStore.delete("google_oauth_state");

    const site_url = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    return NextResponse.json({
        success: true,
        message: "Logged out successfully",
        redirect: site_url
    });
}
