import React from "react";
import "./ClubFinance.css";
import FileDropComponent from "./FileDropComponent";

const ClubFinance = ({ club = {}}) => {
  totalFund = club.totalFund
  currentFund= club.currentFund 
  currentFund= club.purchases
  return (
    <div>
    <div className="club-finance">
      <h2>Club Account</h2>
      <p className="fund-amount">2025 Starting Total: ${totalFund.toFixed(2)}</p>
      <p className="fund-amount">Current Total: ${currentFund.toFixed(2)}</p>
      <h3>Recent Purchases</h3>
      {purchases && purchases.length > 0 ? (
        <ul className="purchase-list">
          {purchases.map((purchase) => (
            <li key={purchase.id} className="purchase-item">
              <span className="purchase-name">{purchase.name}</span>
              <span className="purchase-amount">
                ${purchase.amount.toFixed(2)}
              </span>
              <span className="purchase-date">{purchase.date}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p>No purchases found.</p>
      )}
    </div>

                      <div
                  className="shortcut-card"
                  onClick={() => setActivePage("File")}
                >
                  <FileDropComponent />
                </div>
    </div>
  );
};

export default ClubFinance;
