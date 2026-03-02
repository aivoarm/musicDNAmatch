import { getTokens } from "@/lib/spotify";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
        console.error("Spotify Auth Error from Query:", error);
        return NextResponse.redirect("http://127.0.0.1:3000/?error=" + error);
    }

    if (!code) {
        return NextResponse.redirect("http://127.0.0.1:3000/");
    }

    try {
        const tokens = await getTokens(code);

        if (tokens.error) {
            console.error("Spotify Token Exchange Failed:", tokens.error, tokens.error_description);
            return NextResponse.redirect("http://127.0.0.1:3000/?error=auth_failed");
        }

        console.log("Attaching spotify_access_token to redirect response...");

        // Redirect to 127.0.0.1 explicitly so cookie domain matches
        const response = NextResponse.redirect("http://127.0.0.1:3000/broadcast");

        response.cookies.set("spotify_access_token", tokens.access_token, {
            httpOnly: true,
            secure: false,
            maxAge: tokens.expires_in || 3600,
            path: "/",
            sameSite: "lax",
        });

        if (tokens.refresh_token) {
            response.cookies.set("spotify_refresh_token", tokens.refresh_token, {
                httpOnly: true,
                secure: false,
                maxAge: 60 * 60 * 24 * 30,
                path: "/",
                sameSite: "lax",
            });
        }

        return response;
    } catch (err) {
        console.error("Critical Auth Callback Exception:", err);
        return NextResponse.redirect("http://127.0.0.1:3000/");
    }
}
