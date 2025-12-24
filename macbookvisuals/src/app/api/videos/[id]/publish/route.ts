import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import type { Video } from "@/app/types";

const ROOT = path.resolve("./");
const DATA_FILE = path.join(ROOT, "data", "videos.json");

/* =========================
   POST /api/videos/:id/publish
   
   This endpoint will eventually:
   1. Upload video to TikTok Content API
   2. Upload video to YouTube Data API
   3. Update video status based on results
   
   For now, it just marks as "published"
   ========================= */
export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  if (!fs.existsSync(DATA_FILE)) {
    return NextResponse.json({ error: "No videos data" }, { status: 404 });
  }

  const videos: Video[] = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  const video = videos.find((v) => v.id === id);

  if (!video) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  console.log("PUBLISH requested for ID:", id);
  console.log("Video filename:", video.filename);
  console.log("TikTok caption:", video.tiktok.caption);
  console.log("YouTube title:", video.youtube.title);

  // TODO: Later i'll implement:
  // 1. const tiktokResult = await publishToTikTok(video);
  // 2. const youtubeResult = await publishToYouTube(video);
  
  // For now, just simulate successful publish
  video.status = "published";
  video.tiktok.status = "published";
  video.tiktok.publishedAt = new Date().toISOString();
  video.youtube.status = "published";
  video.youtube.publishedAt = new Date().toISOString();

  // Save updated video data
  fs.writeFileSync(DATA_FILE, JSON.stringify(videos, null, 2));

  console.log("Video marked as published");
  
  return NextResponse.json({ 
    ok: true, 
    video,
    message: "Video published successfully (placeholder - will integrate with TikTok/YouTube APIs later)"
  });
}