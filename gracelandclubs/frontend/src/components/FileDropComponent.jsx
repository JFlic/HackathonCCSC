import React, { useState, useCallback } from "react";
import "./FileDropComponent.css";
import { renderAsync } from "docx-preview";

const API_BASE_URL = "http://127.0.0.1:8000/api";

const FileDropComponent = ({ preview, onUploadComplete }) => {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  // Preview states
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewText, setPreviewText] = useState(null);
  const [docxHtml, setDocxHtml] = useState("");

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      const selectedFile = e.dataTransfer.files[0];
      processFile(selectedFile);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      processFile(selectedFile);
    }
  };

  const processFile = (file) => {
    setFile(file);
    setError(null);
    setAnalysis(null);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    } else if (file.type.startsWith("text/")) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewText(reader.result);
      reader.readAsText(file);
    } else if (file.name.toLowerCase().endsWith(".docx")) {
      handleDocxPreview(file);
    }
  };

  const handleDocxPreview = async (docxFile) => {
    try {
      const arrayBuffer = await docxFile.arrayBuffer();
      const container = document.createElement("div");
      await renderAsync(arrayBuffer, container);
      setDocxHtml(container.innerHTML);
    } catch (err) {
      setError("Failed to render DOCX preview");
    }
  };

  const handleUpload = useCallback(async () => {
    if (!file) {
      setError("No file selected.");
      return;
    }

    setUploading(true);
    setError(null);
    setAnalysis(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found.");
      }

      const response = await fetch(`${API_BASE_URL}/analyze-form/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Upload failed: ${response.status}`);
      }

      const data = await response.json();
      setAnalysis(data);
      if (onUploadComplete) onUploadComplete();
    } catch (error) {
      setError(error.message);
    } finally {
      setUploading(false);
    }
  }, [file, onUploadComplete]);

  return (
    <div className={`file-drop-container ${preview ? "preview-mode" : ""}`}>
      <h2>Drop your form below for AI Analysis</h2>
      
      <div
        className={`file-drop-area ${dragOver ? "drag-over" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {file ? <p>{file.name}</p> : <p>Drag & drop or click to select a file</p>}
        <input type="file" className="file-input" onChange={handleFileSelect} />
      </div>

      {file && (
        <button className="upload-button" onClick={handleUpload} disabled={uploading}>
          {uploading ? "Analyzing..." : "Analyze Form"}
        </button>
      )}

      {previewUrl && <div className="file-preview"><img src={previewUrl} alt="Preview" /></div>}
      {previewText && <div className="file-preview-text"><pre>{previewText}</pre></div>}
      {docxHtml && <div className="docx-preview-container" dangerouslySetInnerHTML={{ __html: docxHtml }} />}

      {error && <p className="error">Error: {error}</p>}
      
      {analysis && (
        <div className="analysis-results">
          <h3>AI Analysis Report</h3>
          <h4>Issues:</h4>
          <ul>
            {analysis.issues && analysis.issues.length > 0 ? (
              analysis.issues.map((issue, idx) => <li key={idx}>{issue}</li>)
            ) : (
              <li>No issues detected.</li>
            )}
          </ul>
          <h4>Recommendations:</h4>
          <ul>
            {analysis.recommendations && analysis.recommendations.length > 0 ? (
              analysis.recommendations.map((rec, idx) => <li key={idx}>{rec}</li>)
            ) : (
              <li>No recommendations provided.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileDropComponent;
