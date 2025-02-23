import React, { useState, useEffect } from "react";
import "./CustomCalendar.css";

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysInMonth(year, month) {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = firstDay.getDay();
  const totalCells = 42; // 6 rows * 7 days
  let days = [];
  // pad with nulls for days before the month starts
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }
  // add each day of the month as a Date object
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(new Date(year, month, d));
  }
  // pad remaining cells with null so the grid is complete
  while (days.length < totalCells) {
    days.push(null);
  }
  return days;
}

function isSameDay(d1, d2) {
  return (
    d1 &&
    d2 &&
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

const CustomCalendar = ({ events, selectedDate, onDateChange, onMonthChange }) => {
  const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth());

  useEffect(() => {
    // Update calendar view if selectedDate is in a different month/year.
    if (
      selectedDate.getFullYear() !== currentYear ||
      selectedDate.getMonth() !== currentMonth
    ) {
      setCurrentYear(selectedDate.getFullYear());
      setCurrentMonth(selectedDate.getMonth());
      if (onMonthChange) {
        onMonthChange(selectedDate.getFullYear(), selectedDate.getMonth());
      }
    }
  }, [selectedDate, currentYear, currentMonth, onMonthChange]);

  const days = getDaysInMonth(currentYear, currentMonth);

  const goToPreviousMonth = () => {
    let newMonth = currentMonth - 1;
    let newYear = currentYear;
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    if (onMonthChange) {
      onMonthChange(newYear, newMonth);
    }
  };

  const goToNextMonth = () => {
    let newMonth = currentMonth + 1;
    let newYear = currentYear;
    if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    if (onMonthChange) {
      onMonthChange(newYear, newMonth);
    }
  };

  const handleDayClick = (day) => {
    if (day) {
      onDateChange(day);
    }
  };

  // Check if a day has one or more events
  const hasEvents = (day) => {
    if (!day) return false;
    return events.some((event) => {
      if (event.date && event.date.when) {
        const eventDate = new Date(event.date.when);
        return isSameDay(eventDate, day);
      }
      return false;
    });
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="custom-calendar-container">
      <div className="calendar-header">
        <button className="nav-button" onClick={goToPreviousMonth}>
          &lt;
        </button>
        <div className="month-year">
          {monthNames[currentMonth]} {currentYear}
        </div>
        <button className="nav-button" onClick={goToNextMonth}>
          &gt;
        </button>
      </div>
      <div className="day-names">
        {dayNames.map((dayName, index) => (
          <div key={index} className="day-name">
            {dayName}
          </div>
        ))}
      </div>
      <div className="days-grid">
        {days.map((day, index) => {
          const isSelected = day && isSameDay(day, selectedDate);
          return (
            <div
              key={index}
              className={`day-cell ${isSelected ? "selected" : ""} ${
                day ? "" : "empty"
              }`}
              onClick={() => handleDayClick(day)}
            >
              {day && <span className="day-number">{day.getDate()}</span>}
              {day && hasEvents(day) && <div className="event-indicator"></div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CustomCalendar;
