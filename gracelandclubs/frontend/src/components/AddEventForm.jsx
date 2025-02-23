import React, { useState, useEffect } from "react";
import "./AddEventForm.css";

const AddEventForm = ({ initialDate, onAddEvent, onClose }) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(initialDate || "");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (initialDate) {
      setDate(initialDate);
    }
  }, [initialDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEvent = { title, date, description };
    onAddEvent(newEvent);
    // Optionally reset the form:
    setTitle("");
    setDate("");
    setDescription("");
    onClose();
  };

  return (
    <div className="add-event-form-overlay">
      <div className="add-event-form-container">
        <button className="close-button" onClick={onClose}>
          X
        </button>
        <form onSubmit={handleSubmit}>
          <h2>Add Event</h2>
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <label>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <label>Description</label>
          <textarea
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
