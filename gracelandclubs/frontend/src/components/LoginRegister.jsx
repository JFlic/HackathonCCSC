import React, { useState } from "react";
import Sidebar from "./Sidebar";
import "./LoginRegister.css";

// Fake user data to use for a successful login
const fakeUser = {
  id: 1,
  username: "johndoe",
  email: "john@example.com",
  club_list: [
    {
      id: 101,
      name: "Chess Club",
      description: "A club for chess enthusiasts.",
      members: [
        { id: 201, name: "Alice" },
        { id: 202, name: "Bob" }
      ],
      finances: {
        balance: 2500,
        income: [
          { source: "Membership Fees", amount: 500 },
          { source: "Sponsorship", amount: 1000 }
        ],
        expenses: [
          { item: "Equipment", amount: 300 },
          { item: "Event Costs", amount: 200 }
        ]
      }
    }
  ]
};

const LoginRegister = ({ checkAuth, setCurrentPage }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
    clubName: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Toggle between register and login views
  const toggleForm = () => {
    setIsRegister(!isRegister);
    setMessage("");
    setFormData({ username: "", email: "", password: "", password2: "", clubName: "" });
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Simulate API call for login or registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Simulate network latency with a timeout
    setTimeout(() => {
      if (isRegister) {
        // Fake registration: ensure all fields are filled and passwords match
        if (!formData.username || !formData.email || !formData.password || !formData.password2 || !formData.clubName) {
          setMessage("❌ Please fill in all fields.");
        } else if (formData.password !== formData.password2) {
          setMessage("❌ Passwords do not match.");
        } else {
          setMessage("✅ Registration successful! Please log in.");
          toggleForm();
        }
      } else {
        // Fake login: check for dummy credentials (you can update this as needed)
        if (formData.username === fakeUser.username && formData.password === "password") {
          // Fake token and user are stored locally
          localStorage.setItem("token", "faketoken123");
          localStorage.setItem("user", JSON.stringify(fakeUser));
          checkAuth();
          setCurrentPage("dashboard");
        } else {
          setMessage("❌ Invalid username or password.");
        }
      }
      setLoading(false);
    }, 1000); // Simulate a 1-second delay
  };

  return (
    <div className="auth-container">
      <Sidebar />

      <h2>{isRegister ? "Register" : "Login"}</h2>

      <form className="auth-form" onSubmit={handleSubmit}>
        {isRegister && (
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        )}

        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        {isRegister && (
          <>
            <input
              type="password"
              name="password2"
              placeholder="Confirm Password"
              value={formData.password2}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="clubName"
              placeholder="Name Your Club"
              value={formData.clubName}
              onChange={handleChange}
              required
            />
          </>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : isRegister ? "Register" : "Login"}
        </button>
      </form>

      {message && <p className={`auth-message ${message.includes("✅") ? "success" : "error"}`}>{message}</p>}

      <button className="toggle-btn" onClick={toggleForm}>
        {isRegister ? "Already have an account? Login" : "Don't have an account? Register"}
      </button>
    </div>
  );
};

export default LoginRegister;
