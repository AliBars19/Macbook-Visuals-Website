// src/lib/tokenManager.ts
import fs from 'fs';
import path from 'path';

const TOKENS_FILE = path.join(process.cwd(), 'data', 'tokens.json');

export interface YouTubeTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  tokenType: string;
}

export interface TikTokTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  tokenType: string;
}

export interface AllTokens {
  youtube?: YouTubeTokens;
  tiktok?: TikTokTokens;
}

/**
 * Load all tokens from file
 */
export function loadTokens(): AllTokens {
  if (!fs.existsSync(TOKENS_FILE)) {
    return {};
  }

  try {
    const data = fs.readFileSync(TOKENS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading tokens:', error);
    return {};
  }
}

/**
 * Save tokens to file
 */
export function saveTokens(tokens: AllTokens): void {
  const dataDir = path.dirname(TOKENS_FILE);
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokens, null, 2));
  console.log('Tokens saved successfully');
}

/**
 * Check if YouTube token is expired
 */
export function isYouTubeTokenExpired(tokens: AllTokens): boolean {
  if (!tokens.youtube) return true;
  
  const expiresAt = new Date(tokens.youtube.expiresAt);
  const now = new Date();
  
  // Consider expired if within 5 minutes of expiration
  const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
  return expiresAt.getTime() - now.getTime() < bufferTime;
}

/**
 * Check if TikTok token is expired
 */
export function isTikTokTokenExpired(tokens: AllTokens): boolean {
  if (!tokens.tiktok) return true;
  
  const expiresAt = new Date(tokens.tiktok.expiresAt);
  const now = new Date();
  
  const bufferTime = 5 * 60 * 1000;
  return expiresAt.getTime() - now.getTime() < bufferTime;
}

/**
 * Refresh YouTube access token using refresh token
 */
export async function refreshYouTubeToken(refreshToken: string): Promise<YouTubeTokens> {
  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('YouTube credentials not configured');
  }

  console.log('Refreshing YouTube access token...');

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('YouTube token refresh failed:', errorData);
    throw new Error('Failed to refresh YouTube token');
  }

  const data = await response.json();

  const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();

  return {
    accessToken: data.access_token,
    refreshToken: refreshToken, // Keep the same refresh token
    expiresAt: expiresAt,
    tokenType: data.token_type,
  };
}

/**
 * Get valid YouTube access token (refreshes if needed)
 */
export async function getValidYouTubeToken(): Promise<string> {
  const tokens = loadTokens();

  if (!tokens.youtube) {
    throw new Error('YouTube not authorized. Please authorize first.');
  }

  // Check if token is expired
  if (isYouTubeTokenExpired(tokens)) {
    console.log('YouTube token expired, refreshing...');
    
    // Refresh the token
    const newTokens = await refreshYouTubeToken(tokens.youtube.refreshToken);
    
    // Save updated tokens
    tokens.youtube = newTokens;
    saveTokens(tokens);
    
    return newTokens.accessToken;
  }

  return tokens.youtube.accessToken;
}

/**
 * Refresh TikTok access token (implement when TikTok is ready)
 */
export async function refreshTikTokToken(refreshToken: string): Promise<TikTokTokens> {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;

  if (!clientKey || !clientSecret) {
    throw new Error('TikTok credentials not configured');
  }

  console.log('Refreshing TikTok access token...');

  const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('TikTok token refresh failed:', errorData);
    throw new Error('Failed to refresh TikTok token');
  }

  const data = await response.json();

  const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: expiresAt,
    tokenType: data.token_type,
  };
}

/**
 * Get valid TikTok access token (refreshes if needed)
 */
export async function getValidTikTokToken(): Promise<string> {
  const tokens = loadTokens();

  if (!tokens.tiktok) {
    throw new Error('TikTok not authorized. Please authorize first.');
  }

  if (isTikTokTokenExpired(tokens)) {
    console.log('TikTok token expired, refreshing...');
    
    const newTokens = await refreshTikTokToken(tokens.tiktok.refreshToken);
    
    tokens.tiktok = newTokens;
    saveTokens(tokens);
    
    return newTokens.accessToken;
  }

  return tokens.tiktok.accessToken;
}