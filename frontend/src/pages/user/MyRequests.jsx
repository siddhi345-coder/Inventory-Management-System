import { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import { getMyRequests } from "../../services/requestService";

const statusColor = { pending: "#FF9800", approved: "#4CAF50", rejected: "#f44336" };

export default function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyRequests()
      .then(setRequests)
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (v) =>
    `₹${parseFloat(v).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  return (
    <Layout>
      <div className="dashboard-container">
        <div className="page-header">
          <h1>My Requests</h1>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : requests.length === 0 ? (
          <p>You have not submitted any requests yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="sales-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Brand</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Note</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.product_name}</td>
                    <td>{r.brand}</td>
                    <td>{fmt(r.selling_price)}</td>
                    <td>{r.quantity}</td>
                    <td>{r.note || "—"}</td>
                    <td>
                      <span style={{ background: statusColor[r.status], color: "#fff", padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600 }}>
                        {r.status}
                      </span>
                    </td>
                    <td>{new Date(r.created_at).toLocaleDateString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
