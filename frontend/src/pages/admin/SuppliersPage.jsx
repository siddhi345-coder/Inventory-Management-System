import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import Layout from "../../components/layout/Layout";
import Card from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { getSuppliers, addSupplier, updateSupplier, deleteSupplier, getSupplierProducts, getProductSuppliers } from "../../services/supplierService";

export default function SuppliersPage() {
  const { user } = useAuth();
  const isReadOnly = user?.role === "admin";
  const isManager = user?.role === "manager";
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", address: "" });
  const [error, setError] = useState("");

  // drill-down state
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [supplierProducts, setSupplierProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productSuppliers, setProductSuppliers] = useState([]);
  const [loadingProductSuppliers, setLoadingProductSuppliers] = useState(false);

  useEffect(() => { fetchSuppliers(); }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const data = await getSuppliers();
      setSuppliers(data || []);
    } catch (e) {
      console.error("Error fetching suppliers:", e);
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSupplierClick = async (supplier) => {
    if (selectedSupplier?.id === supplier.id) {
      setSelectedSupplier(null); setSupplierProducts([]); setSelectedProduct(null); setProductSuppliers([]);
      return;
    }
    setSelectedSupplier(supplier); setSelectedProduct(null); setProductSuppliers([]);
    setLoadingProducts(true);
    try { setSupplierProducts(await getSupplierProducts(supplier.id)); }
    catch { setSupplierProducts([]); }
    finally { setLoadingProducts(false); }
  };

  const handleProductClick = async (product) => {
    if (selectedProduct?.id === product.id) {
      setSelectedProduct(null); setProductSuppliers([]);
      return;
    }
    setSelectedProduct(product);
    setLoadingProductSuppliers(true);
    try { setProductSuppliers(await getProductSuppliers(product.id)); }
    catch { setProductSuppliers([]); }
    finally { setLoadingProductSuppliers(false); }
  };

  const validateForm = () => {
    const email = formData.email.trim();
    const phone = formData.phone.replace(/\D/g, "");
    if (!formData.name.trim()) { setError("Please enter supplier name"); return false; }
    if (!email) { setError("Please enter supplier email"); return false; }
    if (!email.toLowerCase().endsWith("@gmail.com")) { setError("Email must end with @gmail.com"); return false; }
    if (phone.length !== 10) { setError("Phone number must be 10 digits"); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validateForm()) return;
    try {
      const payload = {
        ...formData,
        phone: formData.phone.replace(/\D/g, ""),
      };
      if (editingId) {
        await updateSupplier(editingId, payload);
      } else {
        await addSupplier(payload);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: "", email: "", phone: "", address: "" });
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Failed to save supplier");
    } finally {
      fetchSuppliers();
    }
  };

  const handleEditClick = (supplier) => {
    setFormData({ name: supplier.name, email: supplier.email || "", phone: supplier.phone || "", address: supplier.address || "" });
    setEditingId(supplier.id);
    setShowForm(true);
    setError("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this supplier?")) return;
    try {
      await deleteSupplier(id);
      fetchSuppliers();
    } catch (e) {
      setError("Failed to delete supplier");
    }
  };

  const handleAddClick = () => {
    setFormData({ name: "", email: "", phone: "", address: "" });
    setEditingId(null);
    setError("");
    setShowForm(true);
  };

  const columns = [
    { key: "id", label: "ID" },
    {
      key: "name",
      label: "Name",
      render: (val, supplier) =>
        isManager ? (
          <span
            onClick={() => handleSupplierClick(supplier)}
            style={{ color: '#2563eb', cursor: 'pointer', fontWeight: 600 }}
          >
            {val} {selectedSupplier?.id === supplier.id ? '▲' : '▼'}
          </span>
        ) : val,
    },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "address", label: "Address" },
  ];

  if (!isReadOnly) {
    columns.push({
      key: "actions",
      label: "Actions",
      render: (_, supplier) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => handleEditClick(supplier)}
            style={{ padding: "6px 12px", background: "#3498db", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(supplier.id)}
            style={{ padding: "6px 12px", background: "#e74c3c", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            Delete
          </button>
        </div>
      ),
    });
  }

  return (
    <Layout>
      <div className="page-header">
        <h1>Suppliers Management</h1>
        <p>Manage supplier details, track supplier contacts, and monitor orders.</p>
      </div>

      {showForm && (
        <Card style={{ marginBottom: "24px" }}>
          <h2>{editingId ? "Edit Supplier" : "Add New Supplier"}</h2>
          {error && <div style={{ color: "red", marginBottom: "16px" }}>{error}</div>}
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
            <Input label="Supplier Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="supplier@gmail.com" />
            <Input label="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} placeholder="Enter 10 digit phone number" required />
            <Input label="Address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
            <div style={{ display: "flex", gap: "12px" }}>
              <Button type="submit" text={editingId ? "Update Supplier" : "Save Supplier"} />
              <Button type="button" onClick={() => { setShowForm(false); setEditingId(null); setError(""); }} text="Cancel" style={{ backgroundColor: "#6b7280" }} />
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <h2>Supplier List</h2>
            <p>View all registered suppliers and their contact details.</p>
          </div>
          {!isReadOnly && <Button onClick={handleAddClick} text="+ Add Supplier" />}
        </div>
        {isReadOnly && (
          <div style={{ marginBottom: "16px", padding: "12px", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "8px" }}>
            <strong>View only mode:</strong> adding, editing, and deleting suppliers is disabled for this role.
          </div>
        )}
        {loading ? (
          <p>Loading suppliers...</p>
        ) : suppliers.length === 0 ? (
          <p>No suppliers found.</p>
        ) : (
          <Table columns={columns} data={suppliers} />
        )}
      </Card>

      {/* Manager drill-down: products for selected supplier */}
      {isManager && selectedSupplier && (
        <Card style={{ marginTop: '24px' }}>
          <h2 style={{ marginBottom: 4 }}>Products supplied by <span style={{ color: '#2563eb' }}>{selectedSupplier.name}</span></h2>
          <p style={{ margin: '0 0 16px', color: '#999', fontSize: 13 }}>Click a product to see all its suppliers</p>
          {loadingProducts ? <p>Loading...</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  {['Product', 'Category', 'Brand', 'Price', 'Last Purchase'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 14px', color: '#555' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {supplierProducts.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: 20, textAlign: 'center', color: '#999' }}>No products found</td></tr>
                ) : supplierProducts.map(p => (
                  <tr
                    key={p.id}
                    onClick={() => handleProductClick(p)}
                    style={{ borderBottom: '1px solid #e2e8f0', cursor: 'pointer', background: selectedProduct?.id === p.id ? '#f0fdf4' : 'white' }}
                  >
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: '#16a34a' }}>
                      {p.name} {selectedProduct?.id === p.id ? '▲' : '▼'}
                    </td>
                    <td style={{ padding: '10px 14px', color: '#555' }}>{p.category || '—'}</td>
                    <td style={{ padding: '10px 14px', color: '#555' }}>{p.brand || '—'}</td>
                    <td style={{ padding: '10px 14px', color: '#555' }}>₹{Number(p.price).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '10px 14px', color: '#555' }}>
                      {p.last_purchase_date ? new Date(p.last_purchase_date).toLocaleDateString('en-IN') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {/* Manager drill-down: suppliers for selected product */}
      {isManager && selectedProduct && (
        <Card style={{ marginTop: '24px' }}>
          <h2 style={{ marginBottom: 4 }}>Suppliers for <span style={{ color: '#16a34a' }}>{selectedProduct.name}</span></h2>
          <p style={{ margin: '0 0 16px', color: '#999', fontSize: 13 }}>Preferred = most purchases</p>
          {loadingProductSuppliers ? <p>Loading...</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  {['Supplier', 'Phone', 'Email', 'Price', 'Purchases', 'Status'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 14px', color: '#555' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {productSuppliers.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: 20, textAlign: 'center', color: '#999' }}>No supplier data found</td></tr>
                ) : productSuppliers.map((s, i) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid #e2e8f0', background: i === 0 ? '#fefce8' : 'white' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>{s.name}</td>
                    <td style={{ padding: '10px 14px', color: '#555' }}>{s.phone || '—'}</td>
                    <td style={{ padding: '10px 14px', color: '#555' }}>{s.email || '—'}</td>
                    <td style={{ padding: '10px 14px', color: '#555' }}>₹{Number(s.price).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '10px 14px', color: '#555' }}>{s.purchase_count}</td>
                    <td style={{ padding: '10px 14px' }}>
                      {i === 0
                        ? <span style={{ background: '#fef9c3', color: '#854d0e', padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>⭐ Preferred</span>
                        : <span style={{ background: '#f1f5f9', color: '#475569', padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>Alternative</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}
    </Layout>
  );
}
