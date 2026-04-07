import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

const TopProductsPieChart = ({ data = [] }) => {
  // Transform data if needed and get top 5
  const chartData = data.slice(0, 5).map(product => ({
    name: product.name,
    value: product.percentage ? Math.round(product.percentage) : 0,
    totalSold: product.totalSold || 0
  }));

  const COLORS = ["#3b82f6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"];

  return (
    <div className="chart-container pie-chart">
      <h3>Top Selling Products</h3>
      {chartData.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
          No product data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name} ${value > 0 ? value + '%' : ''}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => `${value}%`}
              contentStyle={{ 
                backgroundColor: "#fff", 
                border: "1px solid #e5e7eb",
                borderRadius: "8px"
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default TopProductsPieChart;