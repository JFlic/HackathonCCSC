import React from "react";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./ClubFinance.css";
import FileDropComponent from "./FileDropComponent";

// Register necessary ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const ClubFinance = ({ club = {}, preview = false, setActivePage }) => {
  // Provide default fake data if none is passed in
  const {
    totalFund = 10000,
    currentFund = 8000,
    purchases = [
      { id: 1, name: "Soccer Ball", amount: 50, date: "2023-02-15" },
      { id: 2, name: "Team Jerseys", amount: 300, date: "2023-02-20" },
      { id: 3, name: "Snacks", amount: 20, date: "2023-03-01" },
      { id: 4, name: "Water Bottles", amount: 100, date: "2023-03-05" },
    ],
    spendingChartData = [
      { label: "January", value: 200 },
      { label: "February", value: 350 },
      { label: "March", value: 400 },
    ],
    growthChartData = [
      { label: "Start", value: 10000 },
      { label: "Mid", value: 8500 },
      { label: "End", value: 8000 },
    ],
  } = club;

  // Prepare chart data objects for Chart.js

  // Bar Chart: Spending
  const spendingData = {
    labels: spendingChartData.map((item) => item.label),
    datasets: [
      {
        label: "Spending",
        data: spendingChartData.map((item) => item.value),
        backgroundColor: "rgba(75,192,192,0.6)",
        borderColor: "rgba(75,192,192,1)",
        borderWidth: 1,
      },
    ],
  };

  // Bar Chart: Fund Growth
  const growthData = {
    labels: growthChartData.map((item) => item.label),
    datasets: [
      {
        label: "Fund Growth",
        data: growthChartData.map((item) => item.value),
        backgroundColor: "rgba(153,102,255,0.6)",
        borderColor: "rgba(153,102,255,1)",
        borderWidth: 1,
      },
    ],
  };

  // Pie Chart: Expense Distribution (fake data)
  const pieData = {
    labels: ["Salaries", "Equipment", "Maintenance", "Misc"],
    datasets: [
      {
        label: "Expense Distribution",
        data: [3000, 2000, 1500, 500],
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Line Chart: Fund Over Time (fake data)
  const lineData = {
    labels: ["January", "February", "March", "April", "May"],
    datasets: [
      {
        label: "Fund Over Time",
        data: [10000, 9500, 9000, 8500, 8000],
        fill: false,
        backgroundColor: "rgba(153,102,255,0.6)",
        borderColor: "rgba(153,102,255,1)",
        tension: 0.3,
      },
    ],
  };

  // Chart.js options with maintainAspectRatio set to false
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: { display: false },
    },
  };

  // If in preview mode, show a simplified layout
  if (preview) {
    return (
      <div
        className="club-finance-preview"
        onClick={() => setActivePage && setActivePage("Budget")} // Open the Account page on click
      >
        <h2>Club Budget</h2>
        <div className="preview-fund-details">
          <div>
            <p className="fund-label">Starting Total</p>
            <p className="fund-value">${totalFund.toFixed(2)}</p>
          </div>
          <div>
            <p className="fund-label">Current Total</p>
            <p className="fund-value">${currentFund.toFixed(2)}</p>
          </div>
        </div>
        <h3>Recent Purchases</h3>
        {purchases && purchases.length > 0 ? (
          <ul className="preview-purchase-list">
            {purchases.slice(0, 3).map((purchase) => (
              <li key={purchase.id} className="preview-purchase-item">
                <span>{purchase.name}</span>
                <span>${purchase.amount.toFixed(2)}</span>
              </li>
            ))}
            {purchases.length > 3 && <li>...more</li>}
          </ul>
        ) : (
          <p>No purchases found.</p>
        )}
      </div>
    );
  }

  // Otherwise, show the full version with charts
  return (
    <div className="club-finance">
      <h2>Club Account</h2>
      <div className="fund-details">
        <div className="fund-item">
          <p className="fund-label">Starting Total</p>
          <p className="fund-value">${totalFund.toFixed(2)}</p>
        </div>
        <div className="fund-item">
          <p className="fund-label">Current Total</p>
          <p className="fund-value">${currentFund.toFixed(2)}</p>
        </div>
      </div>

      <h3>Recent Purchases</h3>
      {purchases && purchases.length > 0 ? (
        <ul className="purchase-list">
          {purchases.map((purchase) => (
            <li key={purchase.id} className="purchase-item">
              <span className="purchase-name">{purchase.name}</span>
              <span className="purchase-amount">${purchase.amount.toFixed(2)}</span>
              <span className="purchase-date">{purchase.date}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p>No purchases found.</p>
      )}

      <div
        className="shortcut-card"
        onClick={() => setActivePage && setActivePage("File")}
      >
        <FileDropComponent />
      </div>

      <div className="charts-wrapper">
        <div className="chart-section">
          <h3>Spending Chart</h3>
          <div className="chart">
            <Bar data={spendingData} options={chartOptions} />
          </div>
        </div>
        <div className="chart-section">
          <h3>Fund Growth Chart</h3>
          <div className="chart">
            <Bar data={growthData} options={chartOptions} />
          </div>
        </div>
        <div className="chart-section">
          <h3>Expense Distribution</h3>
          <div className="chart">
            <Pie data={pieData} options={chartOptions} />
          </div>
        </div>
        <div className="chart-section">
          <h3>Fund Over Time</h3>
          <div className="chart">
            <Line data={lineData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubFinance;
