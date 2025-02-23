import React from "react";
import "./ClubFinance.css";

const ClubFinance = ({ totalFund, currentFund, purchases }) => {
  return (
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
  );
};

export default ClubFinance;
