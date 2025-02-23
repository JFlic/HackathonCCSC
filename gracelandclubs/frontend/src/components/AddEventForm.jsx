import React, { useState, useEffect } from "react";
import "./AddEventForm.css";

const AddEventForm = ({ initialData, initialDate, onAddEvent, onClose }) => {
  const [name, setName] = useState("");
  const [date, setDate] = useState(initialDate || "");
  const [description, setDescription] = useState("");

  // ✅ Populate form with existing event data when editing
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setDate(initialData.date || initialDate || "");
      setDescription(initialData.description || "");
    }
  }, [initialData, initialDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const eventDetails = {
      id: initialData?.id,  // ✅ Include ID if editing
      name,
      date,
      description,
    };
    onAddEvent(eventDetails); // ✅ Send back the updated event
    onClose();
  };

  return (
    <div className="add-event-form-overlay">
      <div className="add-event-form-container">
        <button className="close-button" onClick={onClose}>X</button>
        <form onSubmit={handleSubmit}>
          <h2>{initialData ? "Edit Event" : "Add Event"}</h2>
          <label>Title</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
          <button type="submit">{initialData ? "Update Event" : "Add Event"}</button>
        </form>
      </div>
    </div>
  );
};

export default AddEventForm;
