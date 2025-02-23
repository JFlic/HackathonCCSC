import React, { useState } from "react";
import "./Sidebar.css";
import { FaHome, FaCalendarAlt, FaUser, FaBars, FaRegCircle, FaMoneyBill } from "react-icons/fa";

const Sidebar = ({ items = ["Home", "Calendar", "Budget", "Funding"], activeItem, onItemSelect }) => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(prev => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // Map each label to the correct icon
  const getIconForLabel = (label) => {
    switch (label) {
      case "Home":
        return <FaHome />;
      case "Calendar":
        return <FaCalendarAlt />;
      case "Budget":
        return <FaUser />;s
      case "Funding":
        return <FaMoneyBill />;
      default:
        return <FaRegCircle />;
    }
  };

  // If items are strings, convert them to objects with an icon using our helper
  const formattedItems = items.map(item =>
    typeof item === "string" ? { label: item, icon: getIconForLabel(item) } : item
  );

  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <div className="sidebar__header">
        <button className="sidebar__toggle" onClick={toggleSidebar}>
          <FaBars />
        </button>
      </div>
      <ul className="sidebar__list">
        {formattedItems.map((item, index) => (
          <li
            key={index}
            className={`sidebar__item ${activeItem === item.label ? "active" : ""}`}
            onClick={() => onItemSelect(item.label)}
          >
            <div className="sidebar__icon">{item.icon}</div>
            {isOpen && <span className="sidebar__label">{item.label}</span>}
          </li>
        ))}
      </ul>
      <div className="sidebar__footer">
        <button className="sidebar__logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
