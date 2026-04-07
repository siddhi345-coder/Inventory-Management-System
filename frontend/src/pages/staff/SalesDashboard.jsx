import { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import StatCard from "../../components/dashboard/StatCard";
import { getSales } from "../../services/salesService";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";

export default function SalesDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) fetchSales();
  }, [user?.id, location.state?.refresh, location.key]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const all = await getSales();
      const uid = Number(user.id);
      const mine = (all || []).filter((s) => Number(s.created_by) === uid);
      setSales(mine);
    } catch (e) {
      console.error("Failed to fetch sales:", e);
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = sales.reduce((sum, s) => sum + parseFloat(s.total_amount || 0), 0);
  const avgOrder = sales.length ? totalRevenue / sales.length : 0;
  const fmt = (v) => `₹${v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <Layout>
      <div className="dashboard-container">
        <div className="page-header">
          <div>
            <h1>Sales Dashboard</h1>
            <p>Welcome {user?.name} — your sales overview</p>
          </div>
          <button onClick={() => navigate("/sales/create")} className="create-sale-btn">
            + Create Sale
          </button>
        </div>

        <div className="stats-grid">
          <StatCard title="Total Sales" value={sales.length} color="#4CAF50" icon="🛒" />
          <StatCard title="Total Revenue" value={fmt(totalRevenue)} color="#2196F3" icon="💰" />
          <StatCard title="Total Orders" value={sales.length} color="#FF9800" icon="📦" />
          <StatCard title="Avg Order Value" value={fmt(avgOrder)} color="#9C27B0" icon="📊" />
        </div>

        <div className="dashboard-content">
          <div className="recent-sales">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0 }}>My Sales</h3>
              <button
                onClick={fetchSales}
                style={{ padding: "6px 14px", background: "#3b82f6", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px" }}
              >
                🔄 Refresh
              </button>
            </div>
            {loading ? (
              <p>Loading...</p>
            ) : sales.length === 0 ? (
              <p className="no-data">No sales yet — create your first sale!</p>
            ) : (
              <table className="sales-table">
                <thead>
                  <tr>
                    <th>Sale ID</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr key={sale.id}>
                      <td>#{sale.id}</td>
                      <td>{new Date(sale.sale_date).toLocaleDateString("en-IN")}</td>
                      <td>{sale.customer_name || "N/A"}</td>
                      <td>{fmt(parseFloat(sale.total_amount || 0))}</td>
                      <td><span className="badge badge-success">Completed</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
