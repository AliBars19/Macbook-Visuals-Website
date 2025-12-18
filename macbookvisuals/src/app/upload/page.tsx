"use client";

import { useRef, useState } from "react";

export default function UploadPage() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Used to reset the file input
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const upload = async () => {
    if (!files || files.length === 0 || isUploading) return;

    setIsUploading(true);
    setMessage("");

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }
      }

      // Clear state after success
      setFiles(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setMessage("Upload complete! Check your dashboard.");
    } catch (err) {
      console.error(err);
      setMessage("Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className="upload-page">
      <div className="upload-card">
        <h1>Upload Videos</h1>

        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          multiple
          disabled={isUploading}
          onChange={(e) => setFiles(e.target.files)}
        />

        {files && (
          <p className="upload-message">
            {files.length} file{files.length > 1 ? "s" : ""} selected
          </p>
        )}

        <button
          onClick={upload}
          disabled={isUploading || !files || files.length === 0}
          className={isUploading ? "upload-btn loading" : "upload-btn"}
        >
          {isUploading ? (
            <>
              <span className="spinner" />
              Uploading…
            </>
          ) : (
            "Upload"
          )}
        </button>

        {message && <p className="upload-message">{message}</p>}
      </div>
    </main>
  );
}
  