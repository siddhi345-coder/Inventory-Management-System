import { useEffect, useState } from "react";
import Layout from "../../components/layout/Layout";
import StatCard from "../../components/dashboard/StatCard";
import SalesBarChart from "../../components/charts/SalesBarChart";
import TopProductsPieChart from "../../components/charts/TopProductsPieChart";
import QuickActions from "../../components/dashboard/QuickActions";
import ActivityList from "../../components/dashboard/ActivityList";
import {
  getDashboardStats,
  getSalesChartData,
  getTopProducts,
} from "../../services/dashboardService";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    stockValue: 0,
    monthlySales: 0,
    lowStockAlerts: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch dashboard stats
      const statsData = await getDashboardStats();
      setStats({
        totalProducts: statsData.totalProducts || 0,
        stockValue: statsData.stockValue || 0,
        monthlySales: statsData.monthlySales || 0,
        lowStockAlerts: statsData.lowStockAlerts || 0,
      });

      // Fetch chart data
      const chartDataResult = await getSalesChartData();
      setChartData(chartDataResult || []);

      // Fetch top products
      const topProductsResult = await getTopProducts();
      setTopProducts(topProductsResult || []);
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Layout>
      <div className="admin-dashboard">
        {error && <div className="error-banner">{error}</div>}

        {/* Page Header */}
        <div className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back! Here's your business overview</p>
          </div>
          <div className="header-actions">
            <input
              type="text"
              placeholder="Search..."
              className="search-box"
            />
            <button className="btn-secondary" onClick={fetchDashboardData}>
              📅 Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards Grid */}
        {!loading && (
          <div className="stats-grid">
            <StatCard
              title="Total Products"
              value={stats.totalProducts}
              color="#3b82f6"
              icon="📦"
              trend={`${stats.totalProducts} items in inventory`}
            />
            <StatCard
              title="Stock Value"
              value={formatCurrency(stats.stockValue)}
              color="#10b981"
              icon="💰"
              trend={`Total inventory value`}
            />
            <StatCard
              title="Monthly Sales"
              value={formatCurrency(stats.monthlySales)}
              color="#f59e0b"
              icon="📈"
              trend={`Sales this month`}
            />
            <StatCard
              title="Low Stock Alerts"
              value={stats.lowStockAlerts}
              color="#ef4444"
              icon="⚠️"
              trend={`Items below threshold`}
            />
          </div>
        )}

        {/* Charts Section */}
        <div className="charts-section">
          <SalesBarChart data={chartData} />
          <TopProductsPieChart data={topProducts} />
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Activity Section */}
        <ActivityList />
      </div>
    </Layout>
  );
};

export default AdminDashboard;