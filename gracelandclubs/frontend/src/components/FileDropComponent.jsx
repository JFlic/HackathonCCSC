import React, { useState, useEffect } from "react";
import "./FileDropComponent.css";
import { renderAsync } from "docx-preview";

const FileDropComponent = ({ preview, onUploadComplete }) => {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [corrections, setCorrections] = useState(null);
  const [error, setError] = useState(null);

  // Preview states
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewText, setPreviewText] = useState(null);
  const [docxHtml, setDocxHtml] = useState("");

  const demoMode = true;
  const BACKEND_URL = "http://127.0.0.1:8000/api/upload";

  // Drag and drop handlers
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
      const selectedFile = e.dataTransfer.files[0];
      processFile(selectedFile);
      e.dataTransfer.clearData();
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      processFile(selectedFile);
    }
  };

  const processFile = (file) => {
    setFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
        storeFileInLocalStorage(file, reader.result);
      };
      reader.readAsDataURL(file);
    } else if (file.type.startsWith("text/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewText(reader.result);
        storeFileInLocalStorage(file, reader.result);
      };
      reader.readAsText(file);
    } else if (file.name.toLowerCase().endsWith(".docx")) {
      handleDocxPreview(file); // Special handling for DOCX files
    }
  };

  const handleDocxPreview = async (docxFile) => {
    try {
      const arrayBuffer = await docxFile.arrayBuffer();
      const container = document.createElement("div");
      await renderAsync(arrayBuffer, container);
      const htmlOutput = container.innerHTML;
      setDocxHtml(htmlOutput);
      storeFileInLocalStorage(docxFile, htmlOutput);
    } catch (err) {
      console.error("Error rendering DOCX preview:", err);
      setError("Failed to render DOCX preview");
    }
  };

  const storeFileInLocalStorage = (file, data) => {
    const fileData = {
      name: file.name,
      type: file.type,
      data: data
    };
    localStorage.setItem("uploadedFile", JSON.stringify(fileData));
  };

  const handleUpload = async () => {
    if (file) { // Check if there's a file to upload
      setUploading(true);
      setError(null);
      setCorrections(null);
  
      const formData = new FormData();
      formData.append("file", file); // Append the file under the key 'file'
  
      try {
        const response = await fetch(BACKEND_URL, {
          method: "POST",
          body: formData,
          // You don't need to explicitly set 'Content-Type': 'multipart/form-data',
          // as the browser will automatically set it, including the boundary parameter.
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        const data = await response.json(); // Assuming the server responds with JSON
        setCorrections(data.corrections); // Process your corrections or other response data
  
        if (onUploadComplete) {
          onUploadComplete(); // Callback function if needed
        }
      } catch (error) {
        console.error("Upload failed:", error);
        setError("Upload failed: " + error.message);
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
        onDrop={handleDrop}>
        {file ? <p>{file.name}</p> : <p>Drag & drop your file here, or click to select one</p>}
        <input type="file" className="file-input" onChange={handleFileSelect} />
      </div>
      {previewUrl && <div className="file-preview"><img src={previewUrl} alt="Preview" /></div>}
      {previewText && <div className="file-preview-text"><pre>{previewText}</pre></div>}
      {docxHtml && <div className="docx-preview-container" dangerouslySetInnerHTML={{ __html: docxHtml }} />}
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
