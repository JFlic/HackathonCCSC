import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import ClubFinance from "./ClubFinance";
import Sidebar from "./Sidebar";
import Calendar from "./Calendar";
import FileDropComponent from "./FileDropComponent";
import UserBanner from "./UserBanner";
import Email from "./Email";
import LoginRegister from "./LoginRegister";

const API_BASE_URL = "http://127.0.0.1:8000/api";
const SIDEBAR_ITEMS = ["Home", "Calendar", "Budget", "Funding"];

const Dashboard = ({ setCurrentPage }) => {
  const [activePage, setActivePage] = useState("Home");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
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

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        setUser(data);
        setIsAuthenticated(true);
      } catch (err) {
        console.warn("API request failed, redirecting to login...", err);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return <p className="loading-text">Loading...</p>;
  }

  if (!isAuthenticated) {
    return (
      <LoginRegister
        checkAuth={() => setIsAuthenticated(true)}
        setCurrentPage={setCurrentPage}
      />
    );
  }

  // For safety, pick the first club if it exists
  const club = user?.club_list?.[0];

  return (
    <div className="dashboard-container">
      {/* Top Banner */}
      <UserBanner user={user} setActivePage={setActivePage} />

      {/* Body: Sidebar + Content */}
      <div className="dashboard-body">
        <Sidebar
          items={SIDEBAR_ITEMS}
          activeItem={activePage}
          onItemSelect={setActivePage}
        />

        {/* Main content area */}
        <div className="dashboard-content">
          {activePage === "Home" ? (
            <div className="dashboard-home">
              <div className="dashboard-main-column">
                {/* Force preview mode here */}
                {club && <Calendar user={user} preview />}
                <Email user={user} />
              </div>
              <div className="dashboard-side-components">
                {/* Force preview mode here */}
                {club && <ClubFinance club={club} preview setActivePage={setActivePage} />}
                <FileDropComponent preview  />
        
              </div>
            </div>
          ) : activePage === "Calendar" && club ? (
            /* Force preview mode here too */
            <Calendar user={user}  />
          ) : activePage === "Budget" && club ? (
            /* Force preview mode here too */
            <ClubFinance club={club}  setActivePage={setActivePage} />

          ) : activePage === "Funding" ? (
            <FileDropComponent preview setActivePage={setActivePage} />
          ) : (
            <div>Page not found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
