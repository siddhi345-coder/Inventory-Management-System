import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const SalesBarChart = ({ data = [] }) => {
  // Use real data if provided, otherwise use empty array
  const chartData = data.length > 0 ? data : [
    { month: "No data", sales: 0, revenue: 0 }
  ];

  return (
    <div className="chart-container sales-chart">
      <h3>Sales Overview</h3>
      {chartData[0].sales === 0 && chartData[0].month === "No data" ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
          No sales data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "#fff", 
                border: "1px solid #e5e7eb",
                borderRadius: "8px"
              }}
              formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
            />
            <Legend />
            <Bar dataKey="sales" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default SalesBarChart;