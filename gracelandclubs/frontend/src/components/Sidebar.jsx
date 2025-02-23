import React, { useState } from "react";
import "./Sidebar.css";

const Sidebar = ({ items = [], activeItem, onItemSelect }) => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
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
            className="sidebar__listItem"
            onClick={() => onItemSelect(item)}
          >
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
