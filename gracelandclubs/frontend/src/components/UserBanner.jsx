import React from "react";

const UserBanner = ({ user, setSelectedClub, setActivePage }) => {
  return (
    <div>
      <h2>Welcome, {user?.username}!</h2>
      <div className="user-info">
        <p>
          <strong>Email:</strong> {user?.email}
        </p>
        <p>
          <strong>Age:</strong> {user?.age}
        </p>
        <p>
          <strong>Activity Level:</strong> {user?.activity_level}
        </p>
      </div>
      <h3>Your Clubs:</h3>
      <ul className="club-list">
        {user?.clubs?.map((club) => (
          <li
            key={club.id}
            onClick={() => {
              setSelectedClub(club);
              setActivePage("ClubDetail");
            }}
          >
            {club.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserBanner;
