import React, { useState, useEffect } from "react";
import "./AddEventForm.css";

const AddEventForm = ({ initialDate, onAddEvent, onClose }) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(initialDate || "");
  const [description, setDescription] = useState("");

  // Update the date when the initialDate prop changes.
  useEffect(() => {
    setDate(initialDate || "");
  }, [initialDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEvent = { title, date, description };
    onAddEvent(newEvent);
    setTitle("");
    setDate("");
    setDescription("");
    onClose();
  };

  return (
    <div className="add-event-form-overlay">
      <div className="add-event-form-container">
        {/* Close button on the top-right */}
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <form onSubmit={handleSubmit}>
          <h2>Add Event</h2>
          <label htmlFor="title">Title:</label>
          <input
            id="title"
            type="text"
            placeholder="Meeting with team..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <label htmlFor="date">Date:</label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            placeholder="Add details here..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <button type="submit">Add Event</button>
        </form>
      </div>
    </div>
  );
};

export default AddEventForm;
