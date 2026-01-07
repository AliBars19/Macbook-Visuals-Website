// src/app/api/videos/stream/[filename]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = decodeURIComponent(params.filename);
    const videoPath = join(process.cwd(), 'public', 'uploads', filename);
    
    console.log('Streaming video:', videoPath);
    
    const videoBuffer = await readFile(videoPath);
    
    return new NextResponse(videoBuffer, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': videoBuffer.length.toString(),
        'Accept-Ranges': 'bytes',
      },
    });
  } catch (error) {
    console.error('Video stream error:', error);
    return NextResponse.json(
      { error: 'Video not found' },
      { status: 404 }
    );
  }
}