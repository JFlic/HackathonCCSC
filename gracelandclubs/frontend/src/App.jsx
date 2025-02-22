import { useState } from 'react'

import './App.css'
import LoginRegister from "./components/LoginRegister"; // Login Page

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState("login"); // Default page

  // ✅ Function to check authentication state
  const checkAuth = () => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token); // Updates based on token presence
    setCurrentPage(token ? "dashboard" : "login"); // Redirect to correct page
  };

  // ✅ Run checkAuth when the component mounts
  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <div>
      {/* Conditional Rendering Based on Authentication & Navigation */}
      {currentPage === "login" && <LoginRegister checkAuth={checkAuth} setCurrentPage={setCurrentPage} />}
      {currentPage === "dashboard" && <Dashboard checkAuth={checkAuth} setCurrentPage={setCurrentPage} />}
      {currentPage === "main" && (
        <>
          <MainMenu />
          <QueryForm />
        </>
      )}
    </div>
  );
}

export default App;
