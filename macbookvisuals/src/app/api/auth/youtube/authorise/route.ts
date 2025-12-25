// src/app/api/auth/youtube/authorize/route.ts
import { NextResponse } from 'next/server';


export async function GET() {
  const clientId = process.env.YOUTUBE_CLIENT_ID;
  
  if (!clientId) {
    return NextResponse.json(
      { error: 'YouTube Client ID not configured' },
      { status: 500 }
    );
  }

  // OAuth scopes needed for YouTube uploads
  const scopes = [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube'
  ].join(' ');

  // Redirect URI (must match what's in Google Cloud Console)
  const redirectUri = process.env.NODE_ENV === 'production'
    ? 'https://macbookvisuals.com/api/auth/callback/youtube'
    : 'http://localhost:3000/api/auth/callback/youtube';

  // Build Google OAuth URL
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', scopes);
  authUrl.searchParams.set('access_type', 'offline'); // Get refresh token
  authUrl.searchParams.set('prompt', 'consent'); // Force consent screen to get refresh token

  console.log('Redirecting to YouTube OAuth:', authUrl.toString());

  // Redirect user to Google login
  return NextResponse.redirect(authUrl.toString());
}