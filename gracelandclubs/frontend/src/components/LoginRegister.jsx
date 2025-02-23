import React, { useState } from "react";
import Sidebar from "./Sidebar";
import "./LoginRegister.css"; // ✅ Ensure the CSS is imported

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
  const [loading, setLoading] = useState(false); // ✅ Added loading state

  const API_BASE_URL = "http://127.0.0.1:8000/api"; // ✅ No extra spaces

  // ✅ Toggle Between Register & Login
  const toggleForm = () => {
    setIsRegister(!isRegister);
    setMessage(""); // Clear previous messages
    setFormData({ username: "", email: "", password: "", password2: "", clubName: "" }); // Reset fields
  };

  // ✅ Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value.trim() });
  };

  // ✅ Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // ✅ Show loading state
    setMessage(""); // ✅ Clear messages

    const url = isRegister ? `${API_BASE_URL}/register/` : `${API_BASE_URL}/login/`;

    let requestBody = {
      username: formData.username,
      password: formData.password,
    };

    if (isRegister) {
      requestBody = {
        ...requestBody,
        email: formData.email,
        password2: formData.password2,
        clubName: formData.clubName,
      };
    }

    try {
      console.log("📤 Sending JSON Payload:", JSON.stringify(requestBody));

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log("📩 Response JSON:", data);

      if (response.ok) {
        if (isRegister) {
          setMessage("✅ Registration successful! Please log in.");
          toggleForm();
        } else {
          localStorage.setItem("token", data.token.access);
          localStorage.setItem("user", JSON.stringify(data.user));
          checkAuth();
          setCurrentPage("dashboard");
        }
      } else {
        setMessage(data.error || "❌ Something went wrong.");
      }
    } catch (error) {
      console.error("🚨 Server Error:", error);
      setMessage("❌ Server error. Please try again.");
    } finally {
      setLoading(false); // ✅ Stop loading
    }
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
