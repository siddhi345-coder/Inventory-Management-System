import { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import { getProducts } from "../../services/productService";
import { submitRequest } from "../../services/requestService";
import { useAuth } from "../../hooks/useAuth";

export default function UserDashboard() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); // selected product
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.category || "").toLowerCase().includes(search.toLowerCase())
  );

  const openModal = (product) => {
    setModal(product);
    setQuantity(1);
    setNote("");
  };

  const handleRequest = async () => {
    if (quantity < 1) return;
    setSubmitting(true);
    try {
      await submitRequest({ product_id: modal.id, quantity, note });
      setToast("Request submitted successfully!");
      setModal(null);
      setTimeout(() => setToast(""), 3000);
    } catch {
      setToast("Failed to submit request.");
      setTimeout(() => setToast(""), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const fmt = (v) =>
    `₹${parseFloat(v).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  return (
    <Layout>
      <div className="dashboard-container">
        <div className="page-header">
          <div>
            <h1>Product Catalog</h1>
            <p>Welcome {user?.name} — browse and request products</p>
          </div>
        </div>

        <input
          type="text"
          placeholder="Search by name, brand or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginBottom: 20, padding: "10px 14px", width: "100%", maxWidth: 400, borderRadius: 8, border: "1px solid #ddd", fontSize: 14 }}
        />

        {loading ? (
          <p>Loading products...</p>
        ) : filtered.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
            {filtered.map((p) => (
              <div key={p.id} style={{ background: "#fff", borderRadius: 10, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 13, color: "#888" }}>{p.category} · {p.brand}</div>
                <div style={{ fontWeight: 600, fontSize: 16 }}>{p.name}</div>
                <div style={{ color: "#2196F3", fontWeight: 700, fontSize: 18 }}>{fmt(p.selling_price)}</div>
                <div style={{ fontSize: 13, color: p.stock_quantity > 0 ? "#4CAF50" : "#f44336" }}>
                  {p.stock_quantity > 0 ? `In Stock: ${p.stock_quantity}` : "Out of Stock"}
                </div>
                <button
                  onClick={() => openModal(p)}
                  style={{ marginTop: 8, padding: "8px 0", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 600 }}
                >
                  Request Product
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Request Modal */}
        {modal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 360, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
              <h3 style={{ marginBottom: 4 }}>Request Product</h3>
              <p style={{ color: "#555", marginBottom: 16 }}>{modal.name} — {fmt(modal.selling_price)}</p>

              <label style={{ fontSize: 13, fontWeight: 600 }}>Quantity</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                style={{ display: "block", width: "100%", padding: "8px 10px", margin: "6px 0 14px", borderRadius: 7, border: "1px solid #ddd", fontSize: 14 }}
              />

              <label style={{ fontSize: 13, fontWeight: 600 }}>Note (optional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Any specific requirements..."
                style={{ display: "block", width: "100%", padding: "8px 10px", margin: "6px 0 16px", borderRadius: 7, border: "1px solid #ddd", fontSize: 14, resize: "none" }}
              />

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={handleRequest}
                  disabled={submitting}
                  style={{ flex: 1, padding: "10px 0", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 7, fontWeight: 600, cursor: "pointer" }}
                >
                  {submitting ? "Submitting..." : "Submit Request"}
                </button>
                <button
                  onClick={() => setModal(null)}
                  style={{ flex: 1, padding: "10px 0", background: "#f1f5f9", color: "#333", border: "none", borderRadius: 7, fontWeight: 600, cursor: "pointer" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {toast && (
          <div style={{ position: "fixed", bottom: 24, right: 24, background: "#323232", color: "#fff", padding: "12px 20px", borderRadius: 8, fontSize: 14, zIndex: 2000 }}>
            {toast}
          </div>
        )}
      </div>
    </Layout>
  );
}
