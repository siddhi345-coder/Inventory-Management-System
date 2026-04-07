import { useState, useEffect } from "react";

import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const QuickActions = () => {
  const { user } = useContext(AuthContext);
  const isStaff = user?.role === "staff";

  const actions = isStaff
    ? [
        {
          id: 1,
          icon: "📦",
          title: "Manage Products",
          description: "Add, edit, and manage product inventory",
          color: "#3b82f6",
        },
        {
          id: 2,
          icon: "🛒",
          title: "Purchase Stock",
          description: "Create new purchase orders",
          color: "#10b981",
        },
        {
          id: 3,
          icon: "📊",
          title: "View Reports",
          description: "Check sales and inventory reports",
          color: "#f59e0b",
        },
        {
          id: 4,
          icon: "⚠️",
          title: "Low Stock Alerts",
          description: "Review items with low inventory",
          color: "#ef4444",
        },
      ]
    : [];

  if (!isStaff) {
    return null;
  }

  return (
    <div className="quick-actions">
      <h3>Quick Actions</h3>
      <div className="actions-grid">
        {actions.map((action) => (
          <button
            key={action.id}
            className="action-button"
            style={{ borderTopColor: action.color }}
          >
            <div className="action-icon">{action.icon}</div>
            <h4>{action.title}</h4>
            <p>{action.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
