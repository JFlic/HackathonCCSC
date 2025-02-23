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
  const [selectedDate, setSelectedDate] = useState(""); // For pre-populating AddEventForm

  // States for the day cover modal
  const [showDayCover, setShowDayCover] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null); // holds the day object
  const [selectedEvent, setSelectedEvent] = useState(null); // holds the event object (if clicked)

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

  // When a day cell is clicked, open the day cover modal.
  const handleDayClick = (dayObj) => {
    if (!dayObj || !dayObj.inCurrentMonth) return;
    setSelectedDay(dayObj);
    setSelectedEvent(null);
    setShowDayCover(true);
  };

  // Function to add a new event (called from AddEventForm)
  const handleAddEvent = (newEvent) => {
    setEvents((prev) => [...prev, newEvent]);
  };

  // Get events for a given day (by date string)
  const eventsForDay = (dayObj) => {
    return events.filter((event) => event.date === formatDate(dayObj.date));
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

      {/* Optional: Button to open the AddEventForm manually */}
      <button
        className="show-event-form-button"
        onClick={() => {
          setSelectedDate("");
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
          const dayEvents = eventsForDay(dayObj);
          return (
            <div
              key={idx}
              className={`calendar-day ${
                dayObj.inCurrentMonth ? "current-month" : "other-month"
              } ${selectedDay && formatDate(selectedDay.date) === formatDate(dayObj.date) ? "selected-day" : ""}`}
              onClick={() => handleDayClick(dayObj)}
            >
              <div className="calendar-day-number">
                {dayObj.date.getDate()}
              </div>
              <div className="calendar-events">
                {dayEvents.map((evt, i) => (
                  <div 
                    key={i} 
                    className={`calendar-event ${selectedEvent === evt ? "selected-event" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent day cell click
                      setSelectedEvent(evt);
                    }}
                  >
                    <strong>{evt.title}</strong>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Day Cover Modal */}
      {showDayCover && selectedDay && (
        <div className="day-cover-overlay">
          <div className="day-cover-container">
            <button className="close-button" onClick={() => setShowDayCover(false)}>X</button>
            <h2>Events for {formatDate(selectedDay.date)}</h2>
            <div className="day-events-list">
              {eventsForDay(selectedDay).length > 0 ? (
                eventsForDay(selectedDay).map((evt, i) => (
                  <div 
                    key={i} 
                    className={`day-event ${selectedEvent === evt ? "selected" : ""}`}
                    onClick={() => setSelectedEvent(evt)}
                  >
                    <strong>{evt.title}</strong>
                    {evt.description && <p>{evt.description}</p>}
                  </div>
                ))
              ) : (
                <p>No events for this day.</p>
              )}
            </div>
            <button
              onClick={() => {
                setShowDayCover(false);
                setSelectedDate(formatDate(selectedDay.date));
                setShowEventForm(true);
              }}
            >
              Add Event
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
