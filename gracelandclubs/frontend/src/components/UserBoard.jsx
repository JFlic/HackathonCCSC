import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import CustomCalendar from "./CustomCalendar";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./SerpApiEvents.css";

// Custom arrow components for the slider
const NextArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} custom-arrow next-arrow`}
      style={{ ...style, display: "block" }}
      onClick={onClick}
    >
      &#10095;
    </div>
  );
};

const PrevArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} custom-arrow prev-arrow`}
      style={{ ...style, display: "block" }}
      onClick={onClick}
    >
      &#10094;
    </div>
  );
};

const SerpApiEvents = () => {
  const [events, setEvents] = useState([]);
  const [localEvents, setLocalEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localLoading, setLocalLoading] = useState(true);
  const [error, setError] = useState(null);
  const [localError, setLocalError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  // Keep track of the calendar's currently displayed month and year
  const [calendarMonth, setCalendarMonth] = useState(selectedDate.getMonth());
  const [calendarYear, setCalendarYear] = useState(selectedDate.getFullYear());

  // Fetch events from SerpApi
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(
          "https://cors-anywhere.herokuapp.com/https://serpapi.com/search.json?engine=google_events&q=Near+me&api_key=45498cd926ef090168cad4b73f598bcd04b1cbc21347493a9c3db1c1d0d5c957",
          {
            method: "GET",
            mode: "cors",
            credentials: "omit",
          }
        );
        if (!response.ok) {
          throw new Error(`Network error: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        setEvents(data.events_results || []);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Fetch local events from your local host
  useEffect(() => {
    const fetchLocalEvents = async () => {
      try {
        const response = await fetch("http://localhost:3001/events");
        if (!response.ok) {
          throw new Error(`Network error: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        setLocalEvents(data.events_results || []);
      } catch (err) {
        console.error("Error fetching local events:", err);
        setLocalError(err.message);
      } finally {
        setLocalLoading(false);
      }
    };

    fetchLocalEvents();
  }, []);

  // Combine events from both sources
  const combinedEvents = [...events, ...localEvents];

  // Slider settings: 1 row, 3 columns on desktop
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  // Upcoming events for the displayed month that are on or after today.
  const today = new Date();
  const upcomingEvents = combinedEvents.filter((event) => {
    if (event.date && event.date.when) {
      const eventDate = new Date(event.date.when);
      // Check that event is in the calendar's month/year
      const inDisplayedMonth =
        eventDate.getFullYear() === calendarYear && eventDate.getMonth() === calendarMonth;
      // And event is today or later (or if in a future month, include all)
      return inDisplayedMonth && eventDate >= today;
    }
    return false;
  }).sort((a, b) => new Date(a.date.when) - new Date(b.date.when));

  // Function to generate an ICS file and trigger its download
  const handleAddToCalendar = (event) => {
    const title = event.title;
    const description = event.description || "";
    const location = event.address ? event.address.join(", ") : "";
    const startDate = event.date && event.date.when ? new Date(event.date.when) : new Date();
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
    const pad = (n) => (n < 10 ? "0" + n : n);
    const formatDate = (d) =>
      d.getUTCFullYear().toString() +
      pad(d.getUTCMonth() + 1) +
      pad(d.getUTCDate()) +
      "T" +
      pad(d.getUTCHours()) +
      pad(d.getUTCMinutes()) +
      pad(d.getUTCSeconds()) +
      "Z";
    const dtStart = formatDate(startDate);
    const dtEnd = formatDate(endDate);
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      `UID:${new Date().getTime()}@myapp.com`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="events-container">
      <h2 className="events-heading">Local Events Near You</h2>
      {loading ? (
        <p>Loading events...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : events.length === 0 ? (
        <p>No events found.</p>
      ) : (
        <>
          <Slider {...sliderSettings}>
            {events.map((event, index) => (
              <div key={index} className="card-wrapper">
                <div className="card">
                  <div className="card-image">
                    <img
                      src={event.thumbnail}
                      alt={event.title}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://via.placeholder.com/300x180?text=No+Image";
                      }}
                    />
                  </div>
                  <div className="card-content">
                    <h3 className="card-title">{event.title}</h3>
                    <p className="card-date">
                      {event.date && event.date.when ? event.date.when : "No date available"}
                    </p>
                    <p className="card-address">
                      {event.address && event.address.length > 0
                        ? event.address.join(", ")
                        : "No address available"}
                    </p>
                    <a
                      href={event.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="card-link"
                    >
                      More Info
                    </a>
                    <button
                      className="calendar-btn"
                      onClick={() => handleAddToCalendar(event)}
                    >
                      Add to Calendar
                    </button>
                  </div>
                  <div className="card-overlay">
                    <p>
                      {event.description
                        ? event.description
                        : "Click for more details"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
          <div className="slider-indicator">
            Swipe left/right to see more events
          </div>
        </>
      )}

      <h2 className="events-heading">Local Host Events</h2>
      {localLoading ? (
        <p>Loading local events...</p>
      ) : localError ? (
        <p>Error: {localError}</p>
      ) : localEvents.length === 0 ? (
        <p>No local events found.</p>
      ) : (
        <>
          <Slider {...sliderSettings}>
            {localEvents.map((event, index) => (
              <div key={index} className="card-wrapper">
                <div className="card">
                  <div className="card-image">
                    <img
                      src={event.thumbnail}
                      alt={event.title}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://via.placeholder.com/300x180?text=No+Image";
                      }}
                    />
                  </div>
                  <div className="card-content">
                    <h3 className="card-title">{event.title}</h3>
                    <p className="card-date">
                      {event.date && event.date.when
                        ? event.date.when
                        : "No date available"}
                    </p>
                    <p className="card-address">
                      {event.address && event.address.length > 0
                        ? event.address.join(", ")
                        : "No address available"}
                    </p>
                    <a
                      href={event.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="card-link"
                    >
                      More Info
                    </a>
                    <button
                      className="calendar-btn"
                      onClick={() => handleAddToCalendar(event)}
                    >
                      Add to Calendar
                    </button>
                  </div>
                  <div className="card-overlay">
                    <p>
                      {event.description
                        ? event.description
                        : "Click for more details"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
          <div className="slider-indicator">
            Swipe left/right to see more events
          </div>
        </>
      )}

      {/* Custom Calendar Section */}
      <div className="calendar-section">
        <h2 className="calendar-title">Event Calendar</h2>
        <CustomCalendar
          events={combinedEvents}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onMonthChange={(year, month) => {
            setCalendarYear(year);
            setCalendarMonth(month);
          }}
        />
        <div className="upcoming-events">
          <h3>
            Upcoming Events for {new Date(calendarYear, calendarMonth).toLocaleString("default", { month: "long", year: "numeric" })}
          </h3>
          {upcomingEvents.length ? (
            <ul>
              {upcomingEvents.map((event, index) => (
                <li key={index}>
                  <strong>{event.title}</strong> - {event.date && event.date.when ? new Date(event.date.when).toLocaleDateString() : ""}
                  <a href={event.link} target="_blank" rel="noopener noreferrer"> More Info</a>
                </li>
              ))}
            </ul>
          ) : (
            <p>No upcoming events for this month.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SerpApiEvents;
