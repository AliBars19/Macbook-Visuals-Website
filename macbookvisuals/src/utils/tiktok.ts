// src/lib/tiktok.ts (or src/utils/tiktok.ts)
import { getValidTikTokToken } from './tokenManager';
import fs from 'fs';

export interface TikTokPublishResult {
  success: boolean;
  videoId?: string;
  publishId?: string;
  error?: string;
}

/**
 * Publishes video to TikTok with CORRECT chunk handling
 * Merges remainder into last chunk to match total_chunk_count
 */
export async function publishToTikTok(
  videoPath: string,
  caption: string
): Promise<TikTokPublishResult> {
  try {
    console.log('Publishing to TikTok:', videoPath);

    const accessToken = await getValidTikTokToken();
    const videoBuffer = fs.readFileSync(videoPath);
    const videoSize = videoBuffer.length;

    console.log(`Video size: ${(videoSize / 1024 / 1024).toFixed(2)} MB (${videoSize} bytes)`);

    if (videoSize > 287 * 1024 * 1024) {
      throw new Error('Video exceeds 287MB limit');
    }

    // Chunk size: 10MB
    const CHUNK_SIZE = 10 * 1024 * 1024;

    // Total chunks = floor(video_size / chunk_size) as per TikTok docs
    const totalChunkCount = Math.floor(videoSize / CHUNK_SIZE);

    console.log(`Chunk size: ${CHUNK_SIZE} bytes`);
    console.log(`Total chunks: ${totalChunkCount}`);
    console.log(`Remainder bytes: ${videoSize % CHUNK_SIZE}`);

    // Step 1: Initialize upload
    console.log('Initializing upload...');
    
    const initResponse = await fetch('https://open.tiktokapis.com/v2/post/publish/inbox/video/init/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify({
        source_info: {
          source: 'FILE_UPLOAD',
          video_size: videoSize,
          chunk_size: CHUNK_SIZE,
          total_chunk_count: totalChunkCount,
        },
      }),
    });

    const initText = await initResponse.text();
    console.log('Init status:', initResponse.status);

    if (!initResponse.ok) {
      throw new Error(`Init failed: ${initText}`);
    }

    const initData = JSON.parse(initText);
    const uploadUrl = initData.data.upload_url;
    const publishId = initData.data.publish_id;

    console.log('✓ Upload initialized, ID:', publishId);

    // Step 2: Upload chunks
    // Upload exactly totalChunkCount chunks, merging remainder into last chunk
    for (let i = 0; i < totalChunkCount; i++) {
      const start = i * CHUNK_SIZE;
      let end;
      
      // Last chunk: include all remaining bytes
      if (i === totalChunkCount - 1) {
        end = videoSize; // Include remainder
      } else {
        end = (i + 1) * CHUNK_SIZE;
      }
      
      const chunk = videoBuffer.slice(start, end);
      const chunkSize = chunk.length;

      console.log(`Uploading chunk ${i + 1}/${totalChunkCount}: bytes ${start}-${end - 1}/${videoSize} (size: ${chunkSize})`);

      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Range': `bytes ${start}-${end - 1}/${videoSize}`,
          'Content-Length': chunkSize.toString(),
        },
        body: chunk,
      });

      console.log(`Chunk ${i + 1} status:`, uploadResponse.status);

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Chunk ${i + 1} failed (${uploadResponse.status}): ${errorText}`);
      }

      console.log(`✓ Chunk ${i + 1}/${totalChunkCount} uploaded`);
    }

    console.log(`✓ All ${totalChunkCount} chunks uploaded successfully`);

    // Step 3: Publish with caption
    console.log('Publishing video...');
    
    const publishResponse = await fetch('https://open.tiktokapis.com/v2/post/publish/video/publish/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify({
        publish_id: publishId,
        post_info: {
          title: caption.substring(0, 150),
          privacy_level: 'PUBLIC_TO_EVERYONE',
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false,
        },
      }),
    });

    const publishText = await publishResponse.text();
    console.log('Publish status:', publishResponse.status);

    if (!publishResponse.ok) {
      throw new Error(`Publish failed: ${publishText}`);
    }

    console.log('✓ Published! Waiting for TikTok to process...');

    // Step 4: Check status
    let attempts = 0;
    const maxAttempts = 40;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 3000));

      const statusResponse = await fetch('https://open.tiktokapis.com/v2/post/publish/status/fetch/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify({
          publish_id: publishId,
        }),
      });

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        const status = statusData.data.status;

        console.log(`Check ${attempts + 1}/${maxAttempts}: ${status}`);

        if (status === 'PUBLISH_COMPLETE') {
          const videoId = statusData.data.publicaly_available_post_id?.[0] || publishId;
          console.log('✓ TikTok publish complete! Video ID:', videoId);
          
          return {
            success: true,
            videoId: videoId,
            publishId: publishId,
          };
        } else if (status === 'FAILED') {
          const reason = statusData.data.fail_reason || 'Unknown';
          throw new Error(`Publish failed: ${reason}`);
        }
      }

      attempts++;
    }

    return {
      success: false,
      publishId: publishId,
      error: 'Timeout waiting for publish',
    };

  } catch (error) {
    console.error('TikTok error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function getTikTokUserInfo(): Promise<any> {
  try {
    const accessToken = await getValidTikTokToken();

    const response = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get user info');
    }

    const data = await response.json();
    return data.data.user;
  } catch (error) {
    console.error('Error getting TikTok user info:', error);
    throw error;
  }//ssss
}