// src/lib/scheduler.ts
import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import type { Video } from '@/app/types';

const DATA_FILE = path.join(process.cwd(), 'data', 'videos.json');


//Checks for videos that need to be published based on their scheduledAt time

async function checkAndPublishScheduledVideos() {
  const now = new Date();
  const timestamp = now.toISOString();
  
  console.log(`[${timestamp}] Checking for scheduled videos...`);

  if (!fs.existsSync(DATA_FILE)) {
    console.log('No videos.json file found');
    return;
  }

  // Load all videos
  const videos: Video[] = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));

  // Find videos scheduled for now or earlier
  const videosToPublish = videos.filter((video) => {
    if (video.status !== 'scheduled' || !video.scheduledAt) {
      return false;
    }

    const scheduledTime = new Date(video.scheduledAt);
    const shouldPublish = scheduledTime <= now;

    if (shouldPublish) {
      console.log(`Found video to publish: ${video.filename} (scheduled for ${video.scheduledAt})`);
    }

    return shouldPublish;
  });

  if (videosToPublish.length === 0) {
    console.log('No videos ready to publish');
    return;
  }

  // Publish each video
  for (const video of videosToPublish) {
    try {
      console.log(`Publishing: ${video.filename}`);
      
      // Call the publish API endpoint
      const response = await fetch(`http://localhost:3000/api/videos/${video.id}/publish`, {
        method: 'POST',
      });

      if (response.ok) {
        console.log(`✓ Successfully published: ${video.filename}`);
      } else {
        console.error(`✗ Failed to publish: ${video.filename}`);
      }
    } catch (error) {
      console.error(`Error publishing ${video.filename}:`, error);
    }
  }
}

/**
 * Starts the scheduler that checks every 5 minutes for videos to publish
 * This ensures videos are published within 5 minutes of their scheduled time
 */
export function startScheduler() {
  // Check every 5 minutes (at :00, :05, :10, :15, :20, etc.)
  cron.schedule('*/5 * * * *', async () => {
    await checkAndPublishScheduledVideos();
  });

  console.log('✓ Scheduler started!');
  console.log('✓ Checking for scheduled videos every 5 minutes');
  console.log('✓ Daily schedule: 12 videos from 11 AM to 11 PM (hourly)');
}

/**
 * For testing: manually trigger the scheduler check
 */
export async function triggerSchedulerCheck() {
  await checkAndPublishScheduledVideos();
}