import React, { useState, useCallback, useEffect } from "react";
import "./FileDropComponent.css";
import { renderAsync } from "docx-preview";

const API_BASE_URL = "http://127.0.0.1:8000/api";

const FileDropComponent = ({ preview, setActivePage, onUploadComplete }) => {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  // Preview states
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewText, setPreviewText] = useState(null);
  const [docxHtml, setDocxHtml] = useState("");

  // If in preview mode, immediately switch to the full File Drop page.
  useEffect(() => {
    if (preview && setActivePage) {
      setActivePage("Funding");
    }
  }, [preview, setActivePage]);

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

  // Automatically trigger upload when a file is selected
  const handleUpload = useCallback(async () => {
    if (!file) {
      setError("No file selected.");
      return;
    }

    setUploading(true);
    setError(null);
    setAnalysis(null);

    // Simulated fake response using setTimeout
    setTimeout(() => {
      const fakeResponse = {
        issues: [
          "The document contains passive voice in multiple sections.",
          "Some sentences exceed 30 words, making readability difficult.",
          "Detected missing citations in Section 2.3 and Section 4.1.",
          "The formatting of bullet points is inconsistent.",
        ],
        recommendations: [
          "Rewrite long sentences to improve readability.",
          "Use active voice where possible for better clarity.",
          "Add citations for unsupported claims in Sections 2.3 and 4.1.",
          "Standardize bullet point formatting for consistency.",
        ],
        summary:
          "The document is well-structured but has some readability issues and citation gaps. Improvements in clarity and formatting are recommended.",
        confidence_score: 87.5,
      };

      setAnalysis(fakeResponse);
      setUploading(false);
      if (onUploadComplete) onUploadComplete();
    }, 2000);
  }, [file, onUploadComplete]);

  useEffect(() => {
    if (file) {
      handleUpload();
    }
  }, [file, handleUpload]);

  // Render full mode UI since preview is not needed (it auto-switches)
  return (
    <div className={`file-drop-container ${dragOver ? "drag-over" : ""}`}>
      <h2>Drop your form below for AI Analysis</h2>

      <div
        className="file-drop-area"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {file ? <p>{file.name}</p> : <p>Drag & drop or click to select a file</p>}
        <input type="file" className="file-input" onChange={handleFileSelect} />
      </div>

      {previewUrl && (
        <div className="file-preview">
          <img src={previewUrl} alt="Preview" />
        </div>
      )}
      {previewText && (
        <div className="file-preview-text">
          <pre>{previewText}</pre>
        </div>
      )}
      {docxHtml && (
        <div
          className="docx-preview-container"
          dangerouslySetInnerHTML={{ __html: docxHtml }}
        />
      )}

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
          <h4>Summary:</h4>
          <p>{analysis.summary}</p>
          <h4>Confidence Score:</h4>
          <p>{analysis.confidence_score}%</p>
        </div>
      )}
    </div>
  );
};

export default FileDropComponent;
