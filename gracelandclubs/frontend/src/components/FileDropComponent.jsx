import React, { useState, useEffect } from "react";
import "./FileDropComponent.css";
import { renderAsync } from "docx-preview";

const FileDropComponent = ({ preview }) => {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [corrections, setCorrections] = useState(null);
  const [error, setError] = useState(null);

  // For images or text preview
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewText, setPreviewText] = useState(null);

  // For DOCX preview
  const [docxHtml, setDocxHtml] = useState("");

  // Toggle this flag to false when your API is live.
  const demoMode = true;
  const BACKEND_URL = "http://127.0.0.1:8000/api/upload";

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  /**
   * Generate an HTML preview for .docx files using docx-preview.
   */
  const handleDocxPreview = async (docxFile) => {
    try {
      const arrayBuffer = await docxFile.arrayBuffer();
      const container = document.createElement("div");
      await renderAsync(arrayBuffer, container, undefined, {
        className: "docx",
      });
      setDocxHtml(container.innerHTML);
      // Clear out image/text previews so they don't overlap
      setPreviewUrl(null);
      setPreviewText(null);
    } catch (err) {
      console.error("Error rendering docx preview:", err);
      setDocxHtml("");
    }
  };

  /**
   * When `file` changes, generate a preview.
   */
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      setPreviewText(null);
      setDocxHtml("");
      return;
    }
    console.log("File selected:", file);
    // 1) Check for DOCX (by extension or MIME type).
    if (
      file.name.toLowerCase().endsWith(".docx") ||
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      console.log("DOCX file detected. Rendering with docx-preview...");
      handleDocxPreview(file);
      return;
    }
    // 2) If the file is an image, generate a data URL.
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log("Image preview generated:", reader.result);
        setPreviewUrl(reader.result);
        setPreviewText(null);
        setDocxHtml("");
      };
      reader.readAsDataURL(file);
      return;
    }
    // 3) If the file is a text file, read as text.
    if (file.type.startsWith("text/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log("Text preview generated:", reader.result);
        setPreviewText(reader.result);
        setPreviewUrl(null);
        setDocxHtml("");
      };
      reader.readAsText(file);
      return;
    }
    // 4) Otherwise, not a supported preview type.
    console.log("File type not supported for preview.");
    setPreviewUrl(null);
    setPreviewText(null);
    setDocxHtml("");
  }, [file]);

  /**
   * Automatically upload the file when it is set.
   */
  useEffect(() => {
    if (file) {
      handleUpload();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  const handleUpload = async () => {
    setUploading(true);
    setError(null);
    setCorrections(null);

    if (demoMode) {
      // Simulate an API response in demo mode
      setTimeout(() => {
        const demoResponse = {
          corrections: [
            "Line 3: Replace 'hte' with 'the'.",
            "Line 8: Insert a comma after 'Hello'.",
            "Line 12: Change 'recieve' to 'receive'.",
          ],
        };
        setCorrections(demoResponse.corrections);
        setUploading(false);
      }, 1500);
    } else {
      // Real API call
      const formData = new FormData();
      formData.append("file", file);
      try {
        const response = await fetch(BACKEND_URL, {
          method: "POST",
          body: formData,
        });
        if (!response.ok) {
          throw new Error("File upload failed");
        }
        const data = await response.json();
        setCorrections(data.corrections);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <div className={`file-drop-container ${preview ? "preview-mode" : ""}`}>
      <h2>Drop your file below for corrections</h2>
      <div
        className={`file-drop-area ${dragOver ? "drag-over" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {file ? (
          <p>{file.name}</p>
        ) : (
          <p>Drag & drop your file here, or click to select one</p>
        )}
        <input type="file" className="file-input" onChange={handleFileSelect} />
      </div>

      {/* --- Image preview --- */}
      {previewUrl && (
        <div className="file-preview">
          <img src={previewUrl} alt="File preview" />
        </div>
      )}

      {/* --- Text preview --- */}
      {previewText && (
        <div className="file-preview-text">
          <pre>{previewText}</pre>
        </div>
      )}

      {/* --- DOCX preview (rendered HTML) --- */}
      {docxHtml && (
        <div
          className="docx-preview-container"
          dangerouslySetInnerHTML={{ __html: docxHtml }}
        />
      )}

      {uploading && <p>Uploading file...</p>}
      {error && <p className="error">Error: {error}</p>}

      {corrections && (
        <div className="corrections">
          <h3>Corrections:</h3>
          <pre>{JSON.stringify(corrections, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default FileDropComponent;
