import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

export async function POST(req: Request) {
    const { spotify_user_id, playlist_id, limit = 5, offset = 0 } = await req.json();

    if (!spotify_user_id) {
        return NextResponse.json({ error: "No Spotify ID provided" }, { status: 400 });
    }

    try {
        // We trigger the Python script with limit and offset support
        // args: [script_path, user_id, optional_playlist_id, limit, offset]
        const args = [
            path.join(process.cwd(), 'lib/spotify_public.py'),
            spotify_user_id,
            playlist_id || "None",
            limit.toString(),
            offset.toString()
        ];

        const pythonProcess = spawn('python3', args, {
            env: { ...process.env, PATH: process.env.PATH }
        });

        return new Promise<NextResponse>((resolve) => {
            let result = "";
            let error = "";

            pythonProcess.stdout.on('data', (data) => {
                result += data.toString();
            });

            pythonProcess.stderr.on('data', (data) => {
                error += data.toString();
            });

            pythonProcess.on('close', (code) => {
                if (code !== 0) {
                    console.error("Python Error:", error);
                    resolve(NextResponse.json({ error: "Failed to fetch Spotify signal: " + (error || "Unknown exit") }, { status: 500 }));
                } else {
                    try {
                        const data = JSON.parse(result);
                        if (data.error) {
                            resolve(NextResponse.json({ error: data.error }, { status: 400 }));
                        } else {
                            resolve(NextResponse.json({
                                spotify_user_id,
                                ...data,
                                count: data.playlists?.length || data.tracks?.length || 0
                            }));
                        }
                    } catch (e) {
                        resolve(NextResponse.json({ error: "Data parsing error across protocol: " + result }, { status: 500 }));
                    }
                }
            });
        });
    } catch (err) {
        return NextResponse.json({ error: "Internal scan failure" }, { status: 500 });
    }
}
