import React, { useState } from "react";
import "./Sidebar.css";

const Sidebar = ({ items = [], activeItem, onItemSelect }) => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); // ✅ Remove authentication token
    window.location.href = "/login"; // ✅ Redirect to login page
  };

  return (
    <div className={`sidebar ${!isOpen ? "sidebar-closed" : ""}`}>
      <button className="sidebar__button" onClick={toggleSidebar}>
        {isOpen ? "<" : ">"}
      </button>
      <ul>
        {items.map((item, index) => (
          <li
            key={index}
            className={`sidebar__listItem ${activeItem === item ? "active" : ""}`}
            onClick={() => onItemSelect(item)}
          >
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <button className="sidebar__logout-button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default Sidebar;
