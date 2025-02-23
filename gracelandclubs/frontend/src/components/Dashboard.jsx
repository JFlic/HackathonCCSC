import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import ClubFinance from "./ClubFinance";
import Sidebar from "./Sidebar";
import Calendar from "./Calendar";
import FileDropComponent from "./FileDropComponent";

const API_BASE_URL = "http://127.0.0.1:8000/api"; // Adjust as needed

// Mock data for development
const mockUserData = {
  id: 1,
  username: "Programming Club",
  email: "johndoe@example.com",
  age: 25,
  activity_level: "Moderate",
  weight: 175,
  clubs: [
    {
      id: 101,
      name: "Programming Club",
      description: "A club for coding enthusiasts.",
      imageurl: "https://example.com/programming_club.jpg",
    },
    {
      id: 102,
      name: "AI & Machine Learning",
      description: "Exploring the world of AI.",
      imageurl: "https://example.com/ai_club.jpg",
    },
  ],
};

const items = ["Home", "About", "Services", "Contact"];

const Dashboard = ({ setCurrentPage }) => {
  // Dummy finance data moved inside the component
  const [financeData] = useState({
    fund: 10000.0,
    purchases: [
      { id: 1, name: "Soccer Ball", amount: 50, date: "2023-02-15" },
      { id: 2, name: "Team Jerseys", amount: 300, date: "2023-02-20" },
      { id: 3, name: "Snacks", amount: 20, date: "2023-03-01" },
      { id: 4, name: "Water Bottles", amount: 100, date: "2023-03-05" },
    ],
  });

  // Compute current funds: total fund minus the sum of purchase amounts
  const totalFund = financeData.fund;
  const totalPurchases = financeData.purchases.reduce(
    (sum, purchase) => sum + purchase.amount,
    0
  );
  const currentFund = totalFund - totalPurchases;

  // Dashboard state
  const [activeItem, setActiveItem] = useState("Home");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedClub, setSelectedClub] = useState(null);

  const handleItemSelect = (item) => {
    setActiveItem(item);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setCurrentPage("login");
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/user/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          throw new Error("Failed to fetch user data");
        }
      } catch (err) {
        console.warn("API request failed, using mock data...");
        setUser(mockUserData); // Use mock data on error
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [setCurrentPage]);

  if (loading) return <p className="loading-text">Loading...</p>;

  return (
    <div className="dashboard-container">
      <Sidebar
        items={items}
        activeItem={activeItem}
        onItemSelect={handleItemSelect}
      />

      <div className="dashboard-content">
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
            <li key={club.id} onClick={() => setSelectedClub(club)}>
              {club.name}
            </li>
          ))}
        </ul>

        <Calendar />

        {selectedClub && (
          <div className="club-card">
            <h3>{selectedClub.name}</h3>
            <p>{selectedClub.description}</p>
            <img src={selectedClub.imageurl} alt={selectedClub.name} />
          </div>
        )}
      </div>
   {/* ClubFinance component with total and current funds */}
  <div>
  <ClubFinance
          totalFund={totalFund}
          currentFund={currentFund}
          purchases={financeData.purchases}
        />
      <FileDropComponent />

  </div>
  
    </div>
  );
};

export default Dashboard;
