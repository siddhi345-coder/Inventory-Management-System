const StatCard = ({ title, value, color, icon, trend }) => {
  return (
    <div className="stat-card" style={{ borderTopColor: color }}>
      <div className="stat-header">
        <h4>{title}</h4>
        <div className="stat-icon" style={{ backgroundColor: `${color}20`, color }}>
          {icon}
        </div>
      </div>
      <div className="stat-value">{value}</div>
      {trend && <p className="stat-trend">{trend}</p>}
    </div>
  );
};

export default StatCard;