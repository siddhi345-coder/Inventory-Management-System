import { useState, useEffect } from "react";
import { getSales } from "../../services/salesService";

export default function RecentSales({ staffOnly = false, staffId = null }) {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentSales();
  }, [staffId, staffOnly]);

  const fetchRecentSales = async () => {
    try {
      setLoading(true);
      const data = await getSales({ limit: 50 });
      let filtered = data || [];
      // Use == (loose) to handle string/number mismatch between JWT and DB
      if (staffOnly && staffId) {
        filtered = filtered.filter((sale) => sale.created_by == staffId);
      }
      setSales(filtered);
    } catch (error) {
      console.error("Failed to fetch recent sales:", error);
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading recent sales...</div>;

  return (
    <div className="recent-sales">
      <h3>Recent Sales</h3>
      {sales.length === 0 ? (
        <p className="no-data">No sales found</p>
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
                <td>₹{parseFloat(sale.total_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td><span className="badge badge-success">Completed</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
