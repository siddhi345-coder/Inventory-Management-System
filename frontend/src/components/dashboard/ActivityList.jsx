import { useState, useEffect } from "react";
import { getRecentSales } from "../../services/dashboardService";

const ActivityList = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const data = await getRecentSales();
      const formattedActivities = (data || []).map((sale, index) => ({
        id: sale.id,
        type: sale.type || "sale",
        message: sale.message || `Sale #${sale.id}`,
        timestamp: formatTime(sale.timestamp || sale.sale_date),
        icon: "📤",
        color: "#10b981",
      }));
      setActivities(formattedActivities);
    } catch (error) {
      console.error("Failed to fetch activities:", error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "Just now";
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-IN');
  };

  return (
    <div className="activity-list">
      <div className="activity-header">
        <h3>Recent Sales</h3>
        <a href="#" className="view-all" onClick={(e) => { e.preventDefault(); fetchActivities(); }}>
          Refresh →
        </a>
      </div>
      {loading ? (
        <div style={{ textAlign: "center", padding: "20px", color: "#999" }}>
          Loading activities...
        </div>
      ) : activities.length === 0 ? (
        <div style={{ textAlign: "center", padding: "20px", color: "#999" }}>
          No recent sales
        </div>
      ) : (
        <div className="activities">
          {activities.map((activity) => (
            <div key={activity.id} className="activity-item">
              <div
                className="activity-icon"
                style={{ backgroundColor: `${activity.color}20`, color: activity.color }}
              >
                {activity.icon}
              </div>
              <div className="activity-content">
                <p className="activity-message">{activity.message}</p>
                <span className="activity-time">{activity.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityList;