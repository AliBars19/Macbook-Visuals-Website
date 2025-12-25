// src/app/api/auth/callback/youtube/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const TOKENS_FILE = path.join(process.cwd(), 'data', 'tokens.json');
    
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // Handle user denial
  if (error) {
    console.error('YouTube OAuth error:', error);
    return NextResponse.json(
      { error: 'Authorization denied by user' },
      { status: 400 }
    );
  }

  if (!code) {
    return NextResponse.json(
      { error: 'No authorization code provided' },
      { status: 400 }
    );
  }

  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: 'YouTube credentials not configured' },
      { status: 500 }
    );
  }

  const redirectUri = process.env.NODE_ENV === 'production'
    ? 'https://macbookvisuals.com/api/auth/callback/youtube'
    : 'http://localhost:3000/api/auth/callback/youtube';

  try {
    console.log('Exchanging code for YouTube tokens...');

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code: code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', errorData);
      throw new Error('Failed to exchange code for token');
    }

    const tokens = await tokenResponse.json();

    console.log('YouTube tokens received successfully');

    // Calculate expiration time
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    // Prepare token data
    const youtubeTokenData = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: expiresAt,
      tokenType: tokens.token_type,
    };

    // Ensure data directory exists
    const dataDir = path.dirname(TOKENS_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Load existing tokens file or create new one
    let allTokens: any = {};
    if (fs.existsSync(TOKENS_FILE)) {
      allTokens = JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf-8'));
    }

    // Update YouTube tokens
    allTokens.youtube = youtubeTokenData;

    // Save to file
    fs.writeFileSync(TOKENS_FILE, JSON.stringify(allTokens, null, 2));

    console.log('YouTube tokens saved to:', TOKENS_FILE);

    // Redirect to success page
    return NextResponse.redirect(
      process.env.NODE_ENV === 'production'
        ? 'https://macbookvisuals.com/auth-success?platform=youtube'
        : 'http://localhost:3000/auth-success?platform=youtube'
    );
  } catch (error) {
    console.error('Error during YouTube OAuth:', error);
    return NextResponse.json(
      {
        error: 'Failed to complete authorization',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}