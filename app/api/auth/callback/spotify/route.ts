import { getTokens } from "@/lib/spotify";
import { NextResponse } from "next/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    const isProduction = process.env.NODE_ENV === "production";

    if (error) {
        console.error("Spotify Auth Error from Query:", error);
        return NextResponse.redirect(`${SITE_URL}/?error=` + error);
    }

    if (!code) {
        return NextResponse.redirect(`${SITE_URL}/`);
    }

    try {
        const tokens = await getTokens(code);

        if (tokens.error) {
            console.error("Spotify Token Exchange Failed:", tokens.error, tokens.error_description);
            return NextResponse.redirect(`${SITE_URL}/?error=auth_failed`);
        }

        console.log("Attaching spotify_access_token to redirect response...");

        const response = NextResponse.redirect(`${SITE_URL}/broadcast`);

        response.cookies.set("spotify_access_token", tokens.access_token, {
            httpOnly: true,
            secure: isProduction,
            maxAge: tokens.expires_in || 3600,
            path: "/",
            sameSite: "lax",
        });

        if (tokens.refresh_token) {
            response.cookies.set("spotify_refresh_token", tokens.refresh_token, {
                httpOnly: true,
                secure: isProduction,
                maxAge: 60 * 60 * 24 * 30,
                path: "/",
                sameSite: "lax",
            });
        }

        return response;
    } catch (err) {
        console.error("Critical Auth Callback Exception:", err);
        return NextResponse.redirect(`${SITE_URL}/`);
    }
}
