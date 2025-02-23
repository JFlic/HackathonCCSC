import React from "react";
import './UserBanner.css'; // Import the CSS file

// Adding a prop parameter to the function
const UserBanner = ({ user }) => {
  return (
    <div className="leader-intro">
      <h1>Welcome, {user}!</h1>
    </div>
  );
};

export default UserBanner;
