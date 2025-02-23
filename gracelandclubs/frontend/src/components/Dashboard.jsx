import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import ClubFinance from "./ClubFinance";
import Sidebar from "./Sidebar";
import Calendar from "./Calendar";
import FileDropComponent from "./FileDropComponent";
import UserBanner from "./UserBanner";
import Email from "./Email";
import LoginRegister from "./LoginRegister"; // ✅ Import LoginRegister for redirection

const API_BASE_URL = "http://127.0.0.1:8000/api";

const Dashboard = ({ setCurrentPage }) => {
  const [activePage, setActivePage] = useState("Home");
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
console.log("Dashboard user" +user)
console.log(user)

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsAuthenticated(false);
        setLoading(false); // Ensure loading stops if no token is found
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

        if (!response.ok) throw new Error("Failed to fetch user data");

        const data = await response.json();
        setUser(data);
        setIsAuthenticated(true);
      } catch (err) {
        console.warn("API request failed, redirecting to login...");
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return <p className="loading-text">Loading...</p>; // Ensure nothing else renders
  }

  return isAuthenticated ? (
    <div className="dashboard-container">
      {/* <UserBanner
        user={user}
        setSelectedClub={user.club_list[0].name}
        setActivePage={setActivePage}
      /> */}
      <Sidebar
        items={["Home", "Calendar", "Account", "File"]}
        activeItem={activePage}
        onItemSelect={setActivePage}
      />
      <div className="dashboard-content">
        {activePage === "Home" && user?.club_list?.length > 0 && (
          <div>
            <UserBanner user={user.club_list[0].name} />
            <div className="dashboard-home">
              <Calendar user={user}></Calendar>
            </div>
            <Email  user={user}/>

          </div>
        )}
{activePage === "Calendar" && user && <Calendar user={user} />}
{activePage === "Account" && <ClubFinance club= {user.club_list[0]} />}
        {activePage === "File" && <FileDropComponent />}
      </div>
    </div>
  ) : (
    <LoginRegister checkAuth={() => setIsAuthenticated(true)} setCurrentPage={setCurrentPage} />
  );
};

export default Dashboard;
