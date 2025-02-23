import React, { useState } from "react";
import AddEventForm from "./AddEventForm";
import "./Calendar.css";

// Helper: Format a Date object as "YYYY-MM-DD"
const formatDate = (dateObj) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Helper: Get the number of days in a given month (0-indexed month)
const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

// Generate a grid (42 cells) for the calendar view of a given month/year.
const generateCalendarDays = (year, month) => {
  const days = [];

  // First day of the month (0 = Sunday, 6 = Saturday)
  const firstDayOfMonth = new Date(year, month, 1);
  const firstWeekday = firstDayOfMonth.getDay();

  const daysInCurrentMonth = getDaysInMonth(year, month);
  const daysInPrevMonth = getDaysInMonth(
    month === 0 ? year - 1 : year,
    month === 0 ? 11 : month - 1
  );

  // Leading days from previous month
  for (let i = 0; i < firstWeekday; i++) {
    const date = new Date(year, month - 1, daysInPrevMonth - firstWeekday + i + 1);
    days.push({ date, inCurrentMonth: false });
  }

  // Days in current month
  for (let day = 1; day <= daysInCurrentMonth; day++) {
    const date = new Date(year, month, day);
    days.push({ date, inCurrentMonth: true });
  }

  // Trailing days from next month to complete 42 cells
  const remainingCells = 42 - days.length;
  for (let i = 1; i <= remainingCells; i++) {
    const date = new Date(year, month + 1, i);
    days.push({ date, inCurrentMonth: false });
  }

  return days;
};

const Calendar = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [events, setEvents] = useState([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(""); // For pre-populating the form

  // Month names for display
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const calendarDays = generateCalendarDays(currentYear, currentMonth);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  // Open form by clicking a day cell; pre-populate with that date.
  const handleDayClick = (date) => {
    // Only allow adding events to days in the current month
    if (!date) return;
    const dateStr = formatDate(date);
    setSelectedDate(dateStr);
    setShowEventForm(true);
  };

  // Function to add a new event
  const handleAddEvent = (newEvent) => {
    setEvents((prev) => [...prev, newEvent]);
  };

  return (
    <div className="calendar-container">
      <h1>Calendar</h1>

      {/* Month Navigation */}
      <div className="calendar-controls">
        <button onClick={handlePrevMonth}>Previous</button>
        <span>
          {monthNames[currentMonth]} {currentYear}
        </span>
        <button onClick={handleNextMonth}>Next</button>
      </div>

      {/* Optional: Button to open form manually */}
      <button
        className="show-event-form-button"
        onClick={() => {
          setSelectedDate(""); // Clear any pre-selected date
          setShowEventForm(true);
        }}
      >
        Add Event
      </button>

      {/* Render the AddEventForm when needed */}
      {showEventForm && (
        <AddEventForm
          initialDate={selectedDate}
          onAddEvent={handleAddEvent}
          onClose={() => setShowEventForm(false)}
        />
      )}

      {/* Calendar Grid */}
      <div className="calendar-grid">
        {/* Weekday headers */}
        <div className="weekday-header">Sun</div>
        <div className="weekday-header">Mon</div>
        <div className="weekday-header">Tue</div>
        <div className="weekday-header">Wed</div>
        <div className="weekday-header">Thu</div>
        <div className="weekday-header">Fri</div>
        <div className="weekday-header">Sat</div>

        {calendarDays.map((dayObj, idx) => {
          const dateStr = formatDate(dayObj.date);
          const dayEvents = events.filter((event) => event.date === dateStr);
          return (
            <div
              key={idx}
              className={`calendar-day ${
                dayObj.inCurrentMonth ? "current-month" : "other-month"
              }`}
              onClick={() => dayObj.inCurrentMonth && handleDayClick(dayObj.date)}
            >
              <div className="calendar-day-number">
                {dayObj.date.getDate()}
              </div>
              <div className="calendar-events">
                {dayEvents.map((evt, i) => (
                  <div key={i} className="calendar-event">
                    <strong>{evt.title}</strong>
                    {evt.description && <p>{evt.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
