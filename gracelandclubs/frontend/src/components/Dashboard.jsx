import React, { useState, useEffect } from "react";

const API_BASE_URL = "http://127.0.0.1:8000/api"; // Adjust as needed

// Mock data for development
const mockUserData = {
    id: 1,
    username: "johndoe",
    email: "johndoe@example.com",
    age: 25,
    activity_level: "Moderate",
    weight: 175,
    clubs: [
        {
            id: 101,
            name: "Programming Club",
            description: "A club for coding enthusiasts.",
            imageurl: "https://example.com/programming_club.jpg"
        },
        {
            id: 102,
            name: "AI & Machine Learning",
            description: "Exploring the world of AI.",
            imageurl: "https://example.com/ai_club.jpg"
        }
    ]
};

const Dashboard = ({ setCurrentPage }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedClub, setSelectedClub] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setCurrentPage("login");
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/user/`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setUser(data);
                } else {
                    throw new Error("Failed to fetch user data");
                }
            } catch (err) {
                console.warn("API request failed, using mock data...");
                setUser(mockUserData); // ✅ Use mock data
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    if (loading) return <p>Loading...</p>;

    return (
        <div>
            <h2>Welcome, {user?.username}!</h2>
            <p>Email: {user?.email}</p>
            <p>Age: {user?.age}</p>
            <p>Activity Level: {user?.activity_level}</p>

            <h3>Your Clubs:</h3>
            <ul style={{ listStyleType: "none", padding: 0 }}>
                {user?.clubs?.map((club) => (
                    <li
                        key={club.id}
                        style={{
                            cursor: "pointer",
                            padding: "10px",
                            borderBottom: "1px solid #ddd",
                            color: "#007BFF"
                        }}
                        onClick={() => setSelectedClub(club)}
                    >
                        {club.name}
                    </li>
                ))}
            </ul>

            {selectedClub && (
                <div style={{ marginTop: "20px", padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }}>
                    <h3>{selectedClub.name}</h3>
                    <p>{selectedClub.description}</p>
                    <img src={selectedClub.imageurl} alt={selectedClub.name} width="150" />
                </div>
            )}
        </div>
    );
};

export default Dashboard;

