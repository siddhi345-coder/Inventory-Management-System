import { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import { getAllRequests, updateRequestStatus } from "../../services/requestService";

const statusColor = { pending: "#FF9800", approved: "#4CAF50", rejected: "#f44336" };

export default function ProductRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await getAllRequests();
      setRequests(data);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async (id, status) => {
    setUpdating(id);
    try {
      await updateRequestStatus(id, status);
      setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
    } catch {
      alert("Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  const fmt = (v) =>
    `₹${parseFloat(v).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  const filtered = filter === "all" ? requests : requests.filter((r) => r.status === filter);

  return (
    <Layout>
      <div className="dashboard-container">
        <div className="page-header">
          <div>
            <h1>Product Requests</h1>
            <p>Review and respond to user product requests</p>
          </div>
          <button onClick={fetchRequests} style={{ padding: "8px 16px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 600 }}>
            🔄 Refresh
          </button>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {["all", "pending", "approved", "rejected"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{ padding: "6px 16px", borderRadius: 20, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13,
                background: filter === f ? "#3b82f6" : "#f1f5f9",
                color: filter === f ? "#fff" : "#333" }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : filtered.length === 0 ? (
          <p>No requests found.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="sales-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>User</th>
                  <th>Product</th>
                  <th>Brand</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Note</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.user_name}</div>
                      <div style={{ fontSize: 12, color: "#888" }}>{r.user_email}</div>
                    </td>
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
                    <td>
                      {r.status === "pending" && (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            disabled={updating === r.id}
                            onClick={() => handleStatus(r.id, "approved")}
                            style={{ padding: "5px 12px", background: "#4CAF50", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                          >
                            Approve
                          </button>
                          <button
                            disabled={updating === r.id}
                            onClick={() => handleStatus(r.id, "rejected")}
                            style={{ padding: "5px 12px", background: "#f44336", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {r.status !== "pending" && <span style={{ color: "#aaa", fontSize: 12 }}>Done</span>}
                    </td>
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
