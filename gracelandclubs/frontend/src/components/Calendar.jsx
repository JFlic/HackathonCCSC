import React, { useState, useEffect } from "react";
import AddEventForm from "./AddEventForm";
import "./Calendar.css";

// Helper: Format a Date object as "YYYY-MM-DD"
const formatDate = (dateObj) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Helper: Get the number of days in a given month (0-indexed)
const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

// Generate a grid (42 cells) for the calendar view of a given month/year.
const generateCalendarDays = (year, month) => {
  const days = [];
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

const Calendar = ({
  preview,
  selectedDay, // Lifted selected day from Dashboard (a full day object)
  onDaySelect, // Callback used in preview mode to lift the day
}) => {
  const isPreview = preview === true;
  const containerClass = isPreview ? "calendar-container preview-mode" : "calendar-container";

  // Full Calendar state (only used in full mode)
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [events, setEvents] = useState([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(""); // Pre-populate AddEventForm

  const calendarDays = generateCalendarDays(currentYear, currentMonth);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

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

  // When a day cell is clicked:
  const handleDayClick = (dayObj) => {
    if (!dayObj || !dayObj.inCurrentMonth) return;
    if (isPreview && onDaySelect) {
      // In preview mode, lift the selected day to Dashboard.
      onDaySelect(dayObj);
    } else {
      // In full mode, open the Add Event form with the day pre-populated.
      setSelectedDate(formatDate(dayObj.date));
      setShowEventForm(true);
    }
  };

  // Filter events for a given day.
  const eventsForDay = (dayObj) => {
    return events.filter((event) => event.date === formatDate(dayObj.date));
  };

  // In full mode, if Dashboard passes a selectedDay, automatically open the Add Event form.
  useEffect(() => {
    if (!isPreview && selectedDay) {
      setSelectedDate(formatDate(selectedDay.date));
      setShowEventForm(true);
    }
  }, [isPreview, selectedDay]);

  return (
    <div className={containerClass}>
      <h1>Calendar</h1>
      {/* Month Navigation */}
      <div className="calendar-controls">
        <button onClick={handlePrevMonth}>Previous</button>
        <span>
          {monthNames[currentMonth]} {currentYear}
        </span>
        <button onClick={handleNextMonth}>Next</button>
      </div>
      {/* Only show Add Event button in full mode if form is not already open */}
      {!isPreview && !showEventForm && (
        <button
          className="show-event-form-button"
          onClick={() => {
            setSelectedDate("");
            setShowEventForm(true);
          }}
        >
          Add Event
        </button>
      )}
      {/* Render AddEventForm if needed (only in full mode) */}
      {!isPreview && showEventForm && (
        <AddEventForm
          initialDate={selectedDate}
          onAddEvent={(newEvent) => {
            setEvents((prev) => [...prev, newEvent]);
          }}
          onClose={() => setShowEventForm(false)}
        />
      )}
      {/* Calendar Grid */}
      <div className="calendar-grid">
        <div className="weekday-header">Sun</div>
        <div className="weekday-header">Mon</div>
        <div className="weekday-header">Tue</div>
        <div className="weekday-header">Wed</div>
        <div className="weekday-header">Thu</div>
        <div className="weekday-header">Fri</div>
        <div className="weekday-header">Sat</div>
        {calendarDays.map((dayObj, idx) => (
          <div
            key={idx}
            className={`calendar-day ${dayObj.inCurrentMonth ? "current-month" : "other-month"}`}
            onClick={() => handleDayClick(dayObj)}
          >
            <div className="calendar-day-number">{dayObj.date.getDate()}</div>
            <div className="calendar-events">
              {eventsForDay(dayObj).map((evt, i) => (
                <div key={i} className="calendar-event">
                  <strong>{evt.title}</strong>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
