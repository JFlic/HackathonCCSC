import React, { useState, useEffect } from "react";
import "./Email.css";

const API_BASE_URL = "http://127.0.0.1:8000/api";

const Email = ({ user }) => {
  const [members, setMembers] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [addingMember, setAddingMember] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token || !user || !user.club_list || user.club_list.length === 0) {
        console.warn("⚠️ No token or user club found");
        setLoading(false);
        return;
      }

      const clubName = encodeURIComponent(user.club_list[0].name);
      const requestUrl = `${API_BASE_URL}/clubs/${clubName}/members/`;

      try {
        const response = await fetch(requestUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (!response.ok) throw new Error("Failed to fetch club members");

        setMembers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching club members:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [user]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
  
    const token = localStorage.getItem("token"); 
    if (!token) {
      console.warn("⚠️ No authentication token found! Redirecting to login...");
      return;
    }
  
    try {
      const response = await fetch(`${API_BASE_URL}/search-users/?query=${encodeURIComponent(searchQuery)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, 
        },
      });
  
      if (!response.ok) throw new Error("Failed to search users");
  
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };
  
  const handleAddMember = async (email) => {
    setAddingMember(true);
    const token = localStorage.getItem("token");
    if (!token) return;

    const clubName = encodeURIComponent(user.club_list[0].name);
    const requestUrl = `${API_BASE_URL}/clubs/${clubName}/add-member/`;

    try {
      const response = await fetch(requestUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw new Error("Failed to add member");

      setMembers((prev) => [...prev, { email }]);
      setSearchResults((prev) => prev.filter((u) => u.email !== email));
    } catch (error) {
      console.error("Error adding member:", error);
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (email) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const clubName = encodeURIComponent(user.club_list[0].name);
    const requestUrl = `${API_BASE_URL}/clubs/${clubName}/members/`;

    try {
      const response = await fetch(requestUrl, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw new Error("Failed to remove member");

      setMembers((prevMembers) => prevMembers.filter((u) => u.email !== email));
    } catch (error) {
      console.error("Error removing member:", error);
    }
  };

  const handleEmailClick = () => {
    const bccList = members.map(user => user.email).join(','); // Creates a string of all emails separated by commas
    const subject = encodeURIComponent("Club Announcement");
    const encodedMessage = encodeURIComponent(message);
    window.location.href = `mailto:?bcc=${bccList}&subject=${subject}&body=${encodedMessage}`;
  };

  return (
    <div className="email-container">
      <h2>Email Announcements</h2>

      {loading ? (
        <p>Loading members...</p>
      ) : members.length === 0 ? (
        <p>No members found.</p>
      ) : (
        <>
          <ul className="members-list">
            {members.map((user) => (
              <li key={user.email} className="member-item">
                {user.email}
                <button className="remove-button" onClick={() => handleRemoveMember(user.email)}>Remove</button>
              </li>
            ))}
          </ul>

          <div className="search-container">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button onClick={handleSearch}>Search</button>
          </div>

          <ul className="search-results">
            {searchResults.map((user) => (
              <li key={user.email}>
                {user.email}
                <button onClick={() => handleAddMember(user.email)} disabled={addingMember}>Add</button>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Email Form */}
      <textarea
        className="email-textarea"
        placeholder="Write your message here..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button onClick={handleEmailClick} className="email-button">
        Send Email
      </button>
    </div>
  );
};

export default Email;
