import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ROOT = path.resolve("./");
const DATA_FILE = path.join(ROOT, "data", "videos.json");
const UPLOAD_DIR = path.join(ROOT, "public", "uploads");


/* =========================
   DELETE /api/videos/:id
   ========================= */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!fs.existsSync(DATA_FILE)) {
    return NextResponse.json({ error: "No videos data" }, { status: 404 });
  }

  const videos = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  const index = videos.findIndex((v: any) => v.id === params.id);

  if (index === -1) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  const video = videos[index];

  // Delete video file
  if (video.url) {
    const filename = video.url.replace("/uploads/", "");
    const filePath = path.join(UPLOAD_DIR, filename);

    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.warn("Failed to delete video file:", err);
        // We still continue and delete the JSON entry
      }
    }

  }

  // Remove from JSON
  videos.splice(index, 1);
  fs.writeFileSync(DATA_FILE, JSON.stringify(videos, null, 2));

  return NextResponse.json({ ok: true });
}

/* =========================
   PATCH /api/videos/:id
   ========================= */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!fs.existsSync(DATA_FILE)) {
    return NextResponse.json({ error: "No videos data" }, { status: 404 });
  }

  const updates = await req.json();
  const videos = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));

  const video = videos.find((v: any) => v.id === params.id);
  if (!video) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  // Allow only safe fields to be updated
  if (typeof updates.caption === "string") {
    video.caption = updates.caption;
  }

  if (typeof updates.scheduledAt === "string" || updates.scheduledAt === null) {
    video.scheduledAt = updates.scheduledAt || undefined;
    video.status = updates.scheduledAt ? "scheduled" : "draft";
  }

  fs.writeFileSync(DATA_FILE, JSON.stringify(videos, null, 2));

  return NextResponse.json({ ok: true, video });
}
