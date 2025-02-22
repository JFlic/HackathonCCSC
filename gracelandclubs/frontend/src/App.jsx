import { useState, useEffect } from "react"; // ✅ Added missing import
import "./App.css";
import LoginRegister from "./components/LoginRegister"; // Login Page
import Dashboard from "./components/Dashboard"; // ✅ Import Dashboard component

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState("login"); // Default page

  // ✅ Function to check authentication state
  const checkAuth = () => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token); // Updates based on token presence
    setCurrentPage(token ? "dashboard" : "login"); // Redirect to correct page
  };
  console.log("Current Page:", currentPage);

  // ✅ Run checkAuth when the component mounts
  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <div>
      {currentPage === "login" && (
        <LoginRegister checkAuth={checkAuth} setCurrentPage={setCurrentPage} />
      )}
      {currentPage === "dashboard" && (
        <Dashboard checkAuth={checkAuth} setCurrentPage={setCurrentPage} />
      )}

    </div>
  );
}

export default App;
