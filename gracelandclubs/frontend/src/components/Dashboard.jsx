import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import ClubFinance from "./ClubFinance";
import Sidebar from "./Sidebar";
import Calendar from "./Calendar";
import FileDropComponent from "./FileDropComponent";
import UserBanner from "./UserBanner";
import LeaderIntro from "./LeaderIntro";
import Email from "./Email";

const API_BASE_URL = "http://127.0.0.1:8000/api";

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

const SIDEBAR_ITEMS = ["Home", "Calendar", "Account", "File"];

const Dashboard = ({ setCurrentPage }) => {
  const [financeData] = useState({
    fund: 10000.0,
    purchases: [
      { id: 1, name: "Soccer Ball", amount: 50, date: "2023-02-15" },
      { id: 2, name: "Team Jerseys", amount: 300, date: "2023-02-20" },
      { id: 3, name: "Snacks", amount: 20, date: "2023-03-01" },
      { id: 4, name: "Water Bottles", amount: 100, date: "2023-03-05" },
    ],
  });

  const totalFund = financeData.fund;
  const totalPurchases = financeData.purchases.reduce((sum, p) => sum + p.amount, 0);
  const currentFund = totalFund - totalPurchases;

  const [activePage, setActivePage] = useState("Home");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedClub, setSelectedClub] = useState(null);
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(null);
  const [calendarPrepopulatedDay, setCalendarPrepopulatedDay] = useState(null);

  const handleItemSelect = (item) => {
    setActivePage(item);
    if (item !== "Calendar") setCalendarPrepopulatedDay(null);
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
        if (!response.ok) throw new Error("Failed to fetch user data");
        const data = await response.json();
        setUser(data);
      } catch (err) {
        console.warn("API request failed, using mock data...");
        setUser(mockUserData);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [setCurrentPage]);

  if (loading) return <p className="loading-text">Loading...</p>;

  const renderContent = () => {
    switch (activePage) {
      case "Home":
        return (
          <div>
            <UserBanner
              user={user}
              setSelectedClub={setSelectedClub}
              setActivePage={setActivePage}
            />
            <div className="dashboard-home">
              <div className="dashboard-main-column">
                <LeaderIntro />
                <div className="dashboard-calendar">
                  <Calendar
                    preview
                    selectedDay={selectedCalendarDay}
                    onDaySelect={setSelectedCalendarDay}
                  />
                </div>
                <Email />
              </div>
              <div className="dashboard-side-components">
                <div
                  className="shortcut-card"
                  onClick={() => setActivePage("Account")}
>

                  <ClubFinance
                  setActivePage={setActivePage}
                    totalFund={totalFund}
                    currentFund={currentFund}
                    purchases={financeData.purchases}
                    preview
                  />
                </div>

              </div>
              {selectedCalendarDay && (
                <div className="day-modal-overlay animate-fadeIn">
                  <div className="day-modal-container animate-slideUp">
                    <button
                      className="close-button"
                      onClick={() => setSelectedCalendarDay(null)}
                    >
                      X
                    </button>
                    <h2>
                      {`Day ${selectedCalendarDay.date.getDate()} - ${selectedCalendarDay.date.toLocaleDateString()}`}
                    </h2>
                    <p>No events for this day.</p>
                    <button
                      onClick={() => {
                        setCalendarPrepopulatedDay(selectedCalendarDay);
                        setSelectedCalendarDay(null);
                        setActivePage("Calendar");
                      }}
                    >
                      Add Event
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case "Calendar":
        return <Calendar selectedDay={calendarPrepopulatedDay} />;
      case "Account":
        return (
          <ClubFinance
            totalFund={totalFund}
            currentFund={currentFund}
            purchases={financeData.purchases}
          />
        );
      case "File":
        return <FileDropComponent />;
      case "ClubDetail":
        return (
          <div className="club-card">
            <button className="back-button" onClick={() => setActivePage("Home")}>
              Back
            </button>
            <h3>{selectedClub?.name}</h3>
            <p>{selectedClub?.description}</p>
            <img src={selectedClub?.imageurl} alt={selectedClub?.name} />
          </div>
        );
      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <div className="dashboard-container">
      <UserBanner
        user={user}
        setSelectedClub={setSelectedClub}
        setActivePage={setActivePage}
      />
      <Sidebar
        items={SIDEBAR_ITEMS}
        activeItem={activePage}
        onItemSelect={handleItemSelect}
      />
      <div className="dashboard-content">{renderContent()}</div>
    </div>
  );
};

export default Dashboard;
