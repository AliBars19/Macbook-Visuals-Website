"use client";

import { useState, useEffect } from "react";
import type { Video } from "../types";

interface VideoCardProps {
  video: Video;
  onSave: (updated: Video) => void;
  onPublish: (videoId: string) => void;
  onPublishYouTube: (videoId: string) => void;
  onPublishBoth: (videoId: string) => void;
  onDelete: (videoId: string) => void;
}

export default function VideoCard({
  video,
  onSave,
  onPublish,
  onPublishYouTube,
  onPublishBoth,
  onDelete,
}: VideoCardProps) {
  const [editing, setEditing] = useState(false);
  const [caption, setCaption] = useState(video.tiktok.caption);
  const [scheduledAt, setScheduledAt] = useState(video.scheduledAt || "");
  const [videoError, setVideoError] = useState<string | null>(null);

  useEffect(() => {
    // Debug logging
    console.log('=== VIDEO DEBUG INFO ===');
    console.log('Raw URL:', video.url);
    console.log('Encoded URL:', encodeURI(video.url));
    console.log('Manual encode:', video.url.replace(/ /g, '%20'));
    console.log('Filename:', video.filename);
    console.log('========================');
  }, [video]);

  const handleSave = () => {
    const updated = {
      ...video,
      tiktok: { ...video.tiktok, caption },
      scheduledAt,
    };
    onSave(updated);
    setEditing(false);
  };

  const tiktokPublished = video.tiktok.status === "published";
  const youtubePublished = video.youtube.status === "published";
  const bothPublished = tiktokPublished && youtubePublished;

  // Use API route to stream video
  const videoSrc = `/api/videos/stream/${encodeURIComponent(video.filename)}`;
  const altSrc = video.url.replace(/ /g, '%20');

  return (
    <div className="card video-card">
      {/* Video Preview with Debug Info */}
      <div className="video-thumb">
        <video 
          src={videoSrc}
          controls
          preload="metadata"
          style={{ width: "100%", maxHeight: "300px" }}
          onLoadStart={() => console.log('Video loading started')}
          onLoadedMetadata={() => console.log('Video metadata loaded')}
          onCanPlay={() => console.log('Video can play')}
          onError={(e) => {
            const error = (e.target as HTMLVideoElement).error;
            const errorMsg = error ? 
              `Error Code: ${error.code}, Message: ${error.message}` : 
              'Unknown error';
            console.error('=== VIDEO LOAD ERROR ===');
            console.error('Error:', errorMsg);
            console.error('Tried URL:', videoSrc);
            console.error('Alt URL:', altSrc);
            console.error('========================');
            setVideoError(errorMsg);
          }}
        />
        {videoError && (
          <div style={{
            padding: '12px',
            background: '#ff0050',
            color: 'white',
            fontSize: '11px',
            borderRadius: '8px',
            marginTop: '8px',
            fontFamily: 'monospace'
          }}>
            <strong>Video Load Error:</strong><br/>
            {videoError}<br/><br/>
            <strong>Tried URL:</strong><br/>
            {videoSrc}<br/><br/>
            <strong>Alt URL:</strong><br/>
            {altSrc}
          </div>
        )}
      </div>

      {/* Filename & Status */}
      <div className="video-meta">
        <p className="video-filename">{video.filename}</p>
        <span className={`status status-${video.status}`}>{video.status}</span>
      </div>

      {/* Platform Status */}
      <div style={{ display: 'flex', gap: '8px', fontSize: '13px', marginTop: '8px' }}>
        <span style={{ 
          padding: '4px 8px', 
          borderRadius: '6px', 
          background: tiktokPublished ? '#12351a' : '#333',
          color: tiktokPublished ? '#8bff9c' : '#888'
        }}>
          {tiktokPublished ? '✓' : '○'} TikTok
        </span>
        <span style={{ 
          padding: '4px 8px', 
          borderRadius: '6px', 
          background: youtubePublished ? '#12351a' : '#333',
          color: youtubePublished ? '#8bff9c' : '#888'
        }}>
          {youtubePublished ? '✓' : '○'} YouTube
        </span>
      </div>

      {/* Error Messages */}
      {video.tiktok.error && (
        <div style={{ fontSize: '12px', color: '#ff6b81', marginTop: '8px' }}>
          TikTok: {video.tiktok.error}
        </div>
      )}
      {video.youtube.error && (
        <div style={{ fontSize: '12px', color: '#ff6b81', marginTop: '8px' }}>
          YouTube: {video.youtube.error}
        </div>
      )}

      {/* Edit Mode */}
      {editing ? (
        <div>
          <div className="field">
            <span>Caption</span>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
            />
          </div>

          <div className="field">
            <span>Schedule (optional)</span>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </div>

          <div className="video-actions">
            <button className="btn primary" onClick={handleSave}>
              Save
            </button>
            <button className="btn outline" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          {/* Caption Display */}
          <div className="field">
            <span>Caption</span>
            <p style={{ 
              margin: '4px 0 0', 
              fontSize: '13px', 
              color: '#ccc',
              whiteSpace: 'pre-wrap'
            }}>
              {caption}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="video-actions" style={{ flexDirection: 'column', gap: '8px' }}>
            {!bothPublished && (
              <>
                {/* TikTok Button */}
                {!tiktokPublished && (
                  <button 
                    className="btn primary" 
                    onClick={() => onPublish(video.id)}
                    style={{
                      width: '100%',
                      background: 'linear-gradient(to right, #00f5ff, #ff0050)',
                      border: 'none'
                    }}
                  >
                    📱 Post to TikTok
                  </button>
                )}

                {/* YouTube Button */}
                {!youtubePublished && (
                  <button 
                    className="btn primary" 
                    onClick={() => onPublishYouTube(video.id)}
                    style={{
                      width: '100%',
                      background: '#FF0000',
                      border: 'none'
                    }}
                  >
                    📺 Publish to YouTube
                  </button>
                )}

                {/* Publish Both */}
                {!tiktokPublished && !youtubePublished && (
                  <button 
                    className="btn primary" 
                    onClick={() => onPublishBoth(video.id)}
                    style={{
                      width: '100%',
                      background: 'linear-gradient(to right, #6366f1, #8b5cf6)',
                      border: 'none'
                    }}
                  >
                    🚀 Publish Both
                  </button>
                )}
              </>
            )}

            {/* Edit & Delete */}
            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
              <button 
                className="btn outline" 
                onClick={() => setEditing(true)}
                style={{ flex: 1 }}
              >
                Edit
              </button>
              <button 
                className="btn outline" 
                onClick={() => onDelete(video.id)}
                style={{ flex: 1 }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}