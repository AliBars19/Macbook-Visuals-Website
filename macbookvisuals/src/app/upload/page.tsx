"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const router = useRouter();
  const [authChecking, setAuthChecking] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  // Check authentication on page load
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/status');
      const data = await response.json();
      
      if (!data.authenticated) {
        // Not logged in, redirect to login
        router.push('/login');
      } else {
        // Authenticated, show upload form
        setAuthChecking(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/login');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setMessage("");
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setMessage("Please select a file");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setMessage("✅ Upload successful!");
        setFile(null);
        
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        const errorData = await response.json();
        setMessage(`❌ Upload failed: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setMessage("❌ Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Show loading while checking auth
  if (authChecking) {
    return (
      <main style={{ padding: '40px', textAlign: 'center' }}>
        <p>Checking authentication...</p>
      </main>
    );
  }

  return (
    <main style={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#1a1a1a',
        border: '1px solid #333',
        borderRadius: '12px',
        padding: '40px',
        maxWidth: '500px',
        width: '100%'
      }}>
        <h1 style={{ marginBottom: '24px' }}>Upload Video</h1>
        
        <form onSubmit={handleUpload}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              color: '#888'
            }}>
              Choose Video (Format: "Song Title - Artist.mp4")
            </label>
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              disabled={uploading}
              style={{
                width: '100%',
                padding: '12px',
                background: '#0a0a0a',
                border: '1px solid #333',
                borderRadius: '6px',
                color: '#fff'
              }}
            />
          </div>

          {file && (
            <div style={{ 
              marginBottom: '20px',
              padding: '12px',
              background: '#0a0a0a',
              borderRadius: '6px',
              fontSize: '14px',
              color: '#888'
            }}>
              Selected: {file.name}
            </div>
          )}

          {message && (
            <div style={{ 
              marginBottom: '20px',
              padding: '12px',
              background: message.includes('✅') ? '#065f46' : '#7f1d1d',
              borderRadius: '6px',
              fontSize: '14px'
            }}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={!file || uploading}
            style={{
              width: '100%',
              padding: '14px',
              background: uploading ? '#555' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: uploading || !file ? 'not-allowed' : 'pointer',
              opacity: uploading || !file ? 0.6 : 1
            }}
          >
            {uploading ? "Uploading..." : "Upload Video"}
          </button>

          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            style={{
              width: '100%',
              marginTop: '12px',
              padding: '14px',
              background: 'transparent',
              color: '#667eea',
              border: '1px solid #667eea',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Back to Dashboard
          </button>
        </form>
      </div>
    </main>
  );
}