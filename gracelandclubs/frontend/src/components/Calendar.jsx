import React, { useState, useEffect, useCallback } from "react";
import AddEventForm from "./AddEventForm";
import "./Calendar.css";

const API_BASE_URL = "http://127.0.0.1:8000/api";

// 🔥 FIX: Use local timezone for formatting dates
const formatDate = (dateObj) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// 🔥 FIX: Generate calendar using local dates instead of UTC
const generateCalendarDays = (year, month) => {
  const days = [];
  const firstDayOfMonth = new Date(year, month, 1);
  const firstWeekday = firstDayOfMonth.getDay(); // 0 (Sunday) to 6 (Saturday)
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // 🔥 FIX: Ensure leading days correctly align the first row
  for (let i = firstWeekday - 1; i >= 0; i--) {
    days.push({ date: new Date(year, month - 1, daysInPrevMonth - i), inCurrentMonth: false });
  }

  // ✅ Add current month days
  for (let day = 1; day <= daysInCurrentMonth; day++) {
    days.push({ date: new Date(year, month, day), inCurrentMonth: true });
  }

  // 🔥 FIX: Ensure the calendar grid always contains **42 days** (6 weeks)
  while (days.length < 42) {
    const nextMonthDay = days.length - daysInCurrentMonth - firstWeekday + 1;
    days.push({ date: new Date(year, month + 1, nextMonthDay), inCurrentMonth: false });
  }

  return days;
};

// test
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
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showEventPopup, setShowEventPopup] = useState(false);
  const [showAddEventForm, setShowAddEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showAllEvents, setShowAllEvents] = useState(false);

  const calendarDays = generateCalendarDays(currentYear, currentMonth);
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const fetchEvents = useCallback(async () => {
    setLoadingEvents(true);
    const token = localStorage.getItem("token");

    if (!token) {
      console.warn("No token found. Redirecting to login...");
      setLoadingEvents(false);
      return;
    }

    let requestUrl;
    if (showAllEvents) {
      requestUrl = `${API_BASE_URL}/events/?year=${currentYear}&month=${currentMonth + 1}`;
    } else {
      if (!user || !user.club_list || user.club_list.length === 0) {
        console.warn("User is not in any clubs.");
        setLoadingEvents(false);
        return;
      }
      const clubName = encodeURIComponent(user.club_list[0].name);
      requestUrl = `${API_BASE_URL}/clubs/${clubName}/${currentYear}/${currentMonth + 1}/events/`;
    }

    try {
      console.log(`Fetching events from: ${requestUrl}`);
      const response = await fetch(requestUrl, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch events");

      let data = await response.json();
      data = data.map(event => ({ ...event, date: event.date.split("T")[0] }));
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoadingEvents(false);
    }
  }, [currentMonth, currentYear, user, showAllEvents]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);
  const addOrUpdateEvent = async (eventData) => {
    const token = localStorage.getItem("token");
    if (!token || !user || !user.club_list.length) return;
  
    const clubName = encodeURIComponent(user.club_list[0].name);
    const requestUrl = eventData.id
      ? `${API_BASE_URL}/events/${eventData.id}/`
      : `${API_BASE_URL}/clubs/${clubName}/${currentYear}/${currentMonth + 1}/events/`;
  
    const method = eventData.id ? "PUT" : "POST";
  
    try {
      const response = await fetch(requestUrl, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(eventData),
      });
  
      if (!response.ok) throw new Error("Failed to save event");
  
      const savedEvent = await response.json();
      savedEvent.date = savedEvent.date.split("T")[0];
  
      setEvents(prev => eventData.id
        ? prev.map(evt => (evt.id === eventData.id ? savedEvent : evt)) // ✅ Update existing event
        : [...prev, savedEvent]); // ✅ Add new event
  
      setShowAddEventForm(false);
      setEditingEvent(null);
    } catch (error) {
      console.error("Error saving event:", error);
    }
  };
  const handlePrevMonth = () => {
    setCurrentMonth(prev => (prev === 0 ? 11 : prev - 1));
    setCurrentYear(prev => (currentMonth === 0 ? prev - 1 : prev));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => (prev === 11 ? 0 : prev + 1));
    setCurrentYear(prev => (currentMonth === 11 ? prev + 1 : prev));
  };

  const handleDayClick = (dayObj) => {
    if (!dayObj.inCurrentMonth) return;
    setSelectedDay(dayObj.date);
    setShowEventPopup(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setShowAddEventForm(true);
  };
  
  const handleClosePopup = () => {
    setShowEventPopup(false);
    setEditingEvent(null);
  };

  const isUserEvent = (event) => user.club_list.some(club => club.name === event.club_name);

  return (
    <div className="calendar-container">
      <h1>Event Calendar</h1>

      <div className="calendar-controls">
        <button onClick={handlePrevMonth}>Previous</button>
        <span>{monthNames[currentMonth]} {currentYear}</span>
        <button onClick={handleNextMonth}>Next</button>
        <button onClick={() => setShowAllEvents(prev => !prev)}>
          {showAllEvents ? "Show My Club Events" : "Show Availability"}
        </button>
      </div>

      <div className="calendar-grid">
        {calendarDays.map((dayObj, idx) => (
          <div key={idx} className={`calendar-day ${dayObj.inCurrentMonth ? "current-month" : "other-month"}`} onClick={() => handleDayClick(dayObj)}>
            <div className="calendar-day-number">{dayObj.date.getDate()}</div>
            <div className="calendar-events">
              {events.filter(evt => evt.date === formatDate(dayObj.date)).map(evt => (
                <div key={evt.id} className={`calendar-event ${isUserEvent(evt) ? "user-event" : "other-club-event"}`}>
                  <strong>{evt.name}</strong>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showEventPopup && selectedDay && (
        <div className="event-popup">
          <div className="popup-content">
            <h2>Events for {formatDate(selectedDay)}</h2>
            {events.filter(evt => evt.date === formatDate(selectedDay)).map(evt => (
              <div key={evt.id} className={`popup-event ${isUserEvent(evt) ? "user-event" : "other-club-event"}`}>
                <strong>{evt.name}</strong>
                <p>{evt.description}</p>
                {isUserEvent(evt) && <button onClick={() => handleEditEvent(evt)}>Edit</button>}
              </div>
            ))}
            <button onClick={() => setShowAddEventForm(true)}>Add Event</button>
            <button onClick={handleClosePopup}>Close</button>
          </div>
        </div>
      )}

{showAddEventForm && (
  <AddEventForm
    initialData={editingEvent}  // ✅ Pass the event being edited
    initialDate={selectedDay}
    onAddEvent={addOrUpdateEvent}
    onClose={() => {
      setShowAddEventForm(false);
      setEditingEvent(null);  // ✅ Reset editing state
    }}
  />
)}
    </div>
  );
};

export default Calendar;
