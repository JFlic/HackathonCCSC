import React, { useState, useCallback } from "react";
import "./FileDropComponent.css";
import { renderAsync } from "docx-preview";
import dotenv from ".env";

dotenv.config();

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

  const handleUpload = useCallback(async () => {
    if (file) {
      setUploading(true);
      setError(null);
      setCorrections(null);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const fileText = await file.text(); // Read the file as text
        const criteria = `Ensure the funding request form meets the following criteria:
          - Specifies whether the club is asking for one-time or recurring funding.
          - Every box on the form is filled out.
          - Includes an alternative source of funding.
          - The appropriation benefits a large number of people.
          - No transportation or gas money reimbursement requests.
          - Includes a specific date for when the money will be spent.
          - The appropriation request description should explain how the club will be advertised to campus.`;

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              { role: "system", content: "You are an AI that reviews funding request forms based on strict criteria." },
              { role: "user", content: `${criteria}\n\nHere is the funding request form:\n\n${fileText}` },
            ],
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setCorrections(data.choices[0].message.content);

        if (onUploadComplete) {
          onUploadComplete();
        }
      } catch (error) {
        console.error("Upload failed:", error);
        setError("Upload failed: " + error.message);
      } finally {
        setUploading(false);
      }
    }
  }, [file, onUploadComplete]); // Dependencies for useCallback

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
        {file && (
          <button className="upload-button" onClick={handleUpload}>
            Upload File
          </button>
        )}
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
  }

export default FileDropComponent;
