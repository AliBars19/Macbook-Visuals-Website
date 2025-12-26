"use client";

import { useState } from "react";
import type { Video } from "../types";

interface VideoCardProps {
  video: Video;
  onSave: (video: Video) => void;
  onPublish: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function VideoCard({ video, onSave, onPublish, onDelete }: VideoCardProps) {
  const [caption, setCaption] = useState(video.tiktok.caption);
  const [scheduledAt, setScheduledAt] = useState(video.scheduledAt || "");
  const [videoError, setVideoError] = useState(false);

  const handleSave = () => {
    const updated: Video = {
      ...video,
      scheduledAt: scheduledAt || undefined,
      tiktok: {
        ...video.tiktok,
        caption: caption,
      },
      youtube: {
        ...video.youtube,
        description: caption, // Keep YouTube description in sync
      },
    };
    onSave(updated);
  };

  const isPublished = video.status === "published";
  const isPartialSuccess = 
    (video.tiktok.status === "published" && video.youtube.status === "failed") ||
    (video.youtube.status === "published" && video.tiktok.status === "failed");

  return (
    <div className="video-card">
      {/* Video Preview */}
      <div className="video-preview">
        {!videoError ? (
          <video 
            controls 
            className="video-player"
            onError={() => setVideoError(true)}
          >
            <source src={video.url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <div style={{
            width: '100%',
            height: '200px',
            background: '#1a1a1a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
            border: '1px solid #333'
          }}>
            <div style={{ textAlign: 'center', color: '#666' }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>🎥</div>
              <div>Video preview unavailable</div>
              <div style={{ fontSize: '12px', marginTop: '5px' }}>
                {video.filename}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filename */}
      <h3 className="video-title">{video.filename}</h3>

      {/* Status Badge */}
      <div style={{ marginBottom: '12px' }}>
        <span style={{
          padding: '4px 12px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '600',
          background: 
            video.status === 'published' ? '#065f46' :
            video.status === 'failed' ? '#7f1d1d' :
            video.status === 'scheduled' ? '#1e3a8a' :
            '#333',
          color:
            video.status === 'published' ? '#10b981' :
            video.status === 'failed' ? '#ef4444' :
            video.status === 'scheduled' ? '#3b82f6' :
            '#888'
        }}>
          {video.status}
        </span>
      </div>

      {/* Platform Status */}
      {(video.tiktok.status || video.youtube.status) && (
        <div style={{ marginBottom: '16px', fontSize: '13px' }}>
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            marginBottom: '4px',
            alignItems: 'center'
          }}>
            <span style={{ 
              color: video.tiktok.status === 'published' ? '#10b981' : 
                     video.tiktok.status === 'failed' ? '#ef4444' : '#888'
            }}>
              {video.tiktok.status === 'published' ? '✓' : 
               video.tiktok.status === 'failed' ? '✗' : '○'} TikTok
            </span>
            {video.tiktok.videoId && (
              <span style={{ fontSize: '11px', color: '#666' }}>
                ({video.tiktok.videoId.substring(0, 8)}...)
              </span>
            )}
          </div>
          <div style={{ 
            display: 'flex', 
            gap: '8px',
            alignItems: 'center'
          }}>
            <span style={{ 
              color: video.youtube.status === 'published' ? '#10b981' : 
                     video.youtube.status === 'failed' ? '#ef4444' : '#888'
            }}>
              {video.youtube.status === 'published' ? '✓' : 
               video.youtube.status === 'failed' ? '✗' : '○'} YouTube
            </span>
            {video.youtube.videoId && (
              <span style={{ fontSize: '11px', color: '#666' }}>
                ({video.youtube.videoId})
              </span>
            )}
          </div>
          
          {/* Show error messages if any */}
          {video.tiktok.error && (
            <div style={{ 
              marginTop: '8px', 
              padding: '8px', 
              background: '#7f1d1d', 
              borderRadius: '4px',
              fontSize: '11px',
              color: '#fca5a5'
            }}>
              TikTok: {video.tiktok.error}
            </div>
          )}
          {video.youtube.error && (
            <div style={{ 
              marginTop: '8px', 
              padding: '8px', 
              background: '#7f1d1d', 
              borderRadius: '4px',
              fontSize: '11px',
              color: '#fca5a5'
            }}>
              YouTube: {video.youtube.error}
            </div>
          )}
        </div>
      )}

      {/* Caption */}
      <label className="label">Caption</label>
      <textarea
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        disabled={isPublished}
        className="textarea"
        rows={3}
      />

      {/* Schedule */}
      <label className="label">Schedule (optional)</label>
      <input
        type="datetime-local"
        value={scheduledAt}
        onChange={(e) => setScheduledAt(e.target.value)}
        disabled={isPublished}
        className="input"
      />

      {/* Buttons */}
      <div className="button-group">
        {!isPublished && (
          <>
            <button onClick={handleSave} className="btn btn-primary">
              Save
            </button>
            <button 
              onClick={() => onPublish(video.id)} 
              className="btn btn-success"
            >
              Publish now
            </button>
          </>
        )}
        
        {/* Show delete button if:
            1. Video failed completely, OR
            2. Only one platform succeeded (partial failure) */}
        {(video.status === 'failed' || isPartialSuccess) && (
          <button 
            onClick={() => {
              if (confirm(`Delete "${video.filename}"?\n\n${
                isPartialSuccess 
                  ? 'Note: This video was published to one platform but failed on the other.' 
                  : 'This video failed to publish.'
              }`)) {
                onDelete(video.id);
              }
            }}
            className="btn btn-danger"
          >
            Delete
          </button>
        )}

        {/* Show retry button for partial failures */}
        {isPartialSuccess && (
          <button 
            onClick={() => onPublish(video.id)} 
            className="btn btn-warning"
            title="Retry publishing to failed platform"
          >
            Retry Failed
          </button>
        )}
      </div>
    </div>
  );
}