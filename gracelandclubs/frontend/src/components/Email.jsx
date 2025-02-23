import React from "react";
import "./Email.css"; // Import the CSS file

const Email = () => {
  return (
    <div className="email-container">
      <h2>Email Announcements</h2>
      <p>Click here to send an email to all club members</p>
      <button className="email-button">Email Club</button> {/* Button that does nothing */}
    </div>
  );
};

export default Email; 