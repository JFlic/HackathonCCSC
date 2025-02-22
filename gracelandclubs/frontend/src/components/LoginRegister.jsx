import React, { useState } from "react";
import "./LoginRegister.css"; // ✅ Import the new CSS file

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

  // ✅ Toggle Between Register & Login
  const toggleForm = () => {
    setIsRegister(!isRegister);
    setMessage(""); // Clear messages
  };

  // ✅ Handle Form Input Changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const API_BASE_URL = "http://127.0.0.1:8000/api"; // ✅ Fixed extra space in URL

  // ✅ Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isRegister ? `${API_BASE_URL}/register/` : `${API_BASE_URL}/login/`;

    let requestBody;
    if (isRegister) {
      requestBody = {
        username: formData.username.trim(), // Ensure no trailing spaces
        email: formData.email.trim(),
        password: formData.password,
        password2: formData.password2,
        clubName: formData.clubName
      };
    } else {
      requestBody = {
        username: formData.username.trim(),
        password: formData.password,
      };
    }

    try {
      console.log("Sending JSON Payload:", JSON.stringify(requestBody)); // ✅ Log the request payload

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log("Response JSON:", data); // ✅ Log server response

      if (response.ok) {
        if (!isRegister) {
          localStorage.setItem("token", data.token.access);
          localStorage.setItem("user", JSON.stringify(data.user));
          checkAuth();
          setCurrentPage("dashboard");
        }
        setMessage("Success!");
      } else {
        setMessage(data.error || "Something went wrong.");
      }
    } catch (error) {
      setMessage("Server error. Try again.");
    }
  };

  return (
    <div className="auth-container">
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

        <button type="submit">{isRegister ? "Register" : "Login"}</button>
      </form>
      {message && <p className="auth-message">{message}</p>}
      <button className="toggle-btn" onClick={toggleForm}>
        {isRegister ? "Already have an account? Login" : "Don't have an account? Register"}
      </button>
    </div>
  );
};

export default LoginRegister;
