import { useState, useEffect } from "react"; // ✅ Added missing import
import "./App.css";
import LoginRegister from "./components/LoginRegister"; // Login Page
import Dashboard from "./components/Dashboard"; // ✅ Import Dashboard component
import SerpApiEvents from "./components/UserBoard";
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
     <SerpApiEvents></SerpApiEvents>
    </div>
  );
}

export default App;
