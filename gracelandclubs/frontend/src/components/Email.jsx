import React, { useState } from 'react';
import './Email.css'; // Import the CSS file

const Email = () => {
  // Sample list of users with email attributes
  const [users, setUsers] = useState([
    { name: 'Alice', email: 'alice@example.com' },
    { name: 'Bob', email: 'bob@example.com' },
    { name: 'Charlie', email: 'charlie@example.com' }
  ]);

  // State to hold the message from the text area
  const [message, setMessage] = useState("");

  // Function to open the default email client with a prepared email
  const handleEmailClick = () => {
    const bccList = users.map(user => user.email).join(','); // Creates a string of all emails separated by commas
    const subject = encodeURIComponent("Club Announcement");
    const encodedMessage = encodeURIComponent(message);
    window.location.href = `mailto:?bcc=${bccList}&subject=${subject}&body=${encodedMessage}`;
  };

  return (
    <div className="email-container">
      <h2>Email Announcements</h2>
      <textarea 
        className="email-textarea" 
        placeholder="Write your message here..."
        value={message}
        onChange={e => setMessage(e.target.value)}
      />
      <button onClick={handleEmailClick} className="email-button">Email Club</button>
    </div>
  );
};

export default Email;
