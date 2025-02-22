import React, { useState } from "react";
import "./LoginRegister.css"; // ✅ Import the new CSS file

const LoginRegister = ({ checkAuth, setCurrentPage }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
    age: 25,
    weight: 70,
    height: 175,
    vegan: false,
    vegetarian: false,
    activity_level: "Moderately Active",
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
        age: Number(formData.age) || null, // Ensure valid number
        weight: Number(formData.weight) || null,
        height: Number(formData.height) || null,
        vegan: Boolean(formData.vegan), // Ensure boolean values
        vegetarian: Boolean(formData.vegetarian),
        activity_level: formData.activity_level,
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

            {/* ✅ Age Input */}
            <label>Age:</label>
            <input
              type="number"
              name="age"
              min="18"
              max="100"
              value={formData.age}
              onChange={handleChange}
              required
            />

            {/* ✅ Weight Input */}
            <label>Weight (kg):</label>
            <input
              type="number"
              name="weight"
              min="40"
              max="150"
              value={formData.weight}
              onChange={handleChange}
              required
            />

            {/* ✅ Height Input */}
            <label>Height (cm):</label>
            <input
              type="number"
              name="height"
              min="140"
              max="210"
              value={formData.height}
              onChange={handleChange}
              required
            />

            {/* ✅ Vegan & Vegetarian Checkboxes */}
            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="vegan"
                  checked={formData.vegan}
                  onChange={handleChange}
                />
                Vegan
              </label>
              <label>
                <input
                  type="checkbox"
                  name="vegetarian"
                  checked={formData.vegetarian}
                  onChange={handleChange}
                />
                Vegetarian
              </label>
            </div>

            {/* ✅ Activity Level Selector */}
            <label>Activity Level:</label>
            <select name="activity_level" value={formData.activity_level} onChange={handleChange}>
              <option value="Sedentary">Sedentary (Little to no exercise)</option>
              <option value="Lightly Active">Lightly Active (1-3 days per week)</option>
              <option value="Moderately Active">Moderately Active (3-5 days per week)</option>
              <option value="Very Active">Very Active (6-7 days per week)</option>
              <option value="Super Active">Super Active (Intense exercise every day)</option>
            </select>
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
