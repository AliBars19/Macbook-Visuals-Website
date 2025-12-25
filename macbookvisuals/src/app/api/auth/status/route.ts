// src/app/api/auth/status/route.ts
import { NextResponse } from 'next/server';
import { loadTokens } from '@/utils/tokenManager';

/**
 * GET /api/auth/status
 * Check if user is authenticated with YouTube or TikTok
 */
export async function GET() {
  try {
    const tokens = loadTokens();
    
    const hasYouTube = !!tokens.youtube;
    const hasTikTok = !!tokens.tiktok;
    const authenticated = hasYouTube || hasTikTok;

    return NextResponse.json({
      authenticated,
      platforms: {
        youtube: hasYouTube,
        tiktok: hasTikTok,
      },
    });
  } catch (error) {
    console.error('Error checking auth status:', error);
    return NextResponse.json({
      authenticated: false,
      platforms: {
        youtube: false,
        tiktok: false,
      },
    });
  }
}