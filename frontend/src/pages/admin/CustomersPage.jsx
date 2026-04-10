import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import Layout from "../../components/layout/Layout";
import Card from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { getCustomers, addCustomer, updateCustomer, deleteCustomer } from "../../services/customerService";

export default function CustomersPage() {
  const { user } = useAuth();
  const isReadOnly = user?.role === "admin";
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await getCustomers();
      setCustomers(data || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const email = formData.email.trim();
    const phone = formData.phone.replace(/\D/g, "");

    if (!formData.name.trim()) {
      setError("Please enter customer name");
      return false;
    }

    if (!email) {
      setError("Please enter customer email");
      return false;
    }

    if (!email.toLowerCase().endsWith("@gmail.com")) {
      setError("Customer email must end with @gmail.com");
      return false;
    }

    if (phone.length !== 10) {
      setError("Customer phone number must be 10 digits");
      return false;
    }

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
        await updateCustomer(editingId, payload);
      } else {
        await addCustomer(payload);
      }
      setShowForm(false);
      setFormData({ name: "", email: "", phone: "" });
      setEditingId(null);
    } catch (error) {
      setError(typeof error === 'string' ? error : 'Failed to save customer');
    } finally {
      fetchCustomers();
    }
  };

  const handleEditClick = (customer) => {
    setFormData({
      name: customer.name,
      email: customer.email || "",
      phone: customer.phone || "",
    });
    setEditingId(customer.id);
    setShowForm(true);
    setError("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;
    try {
      await deleteCustomer(id);
      fetchCustomers();
    } catch (err) {
      alert(typeof err === 'string' ? err : 'Failed to delete customer');
    }
  };

  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
  ];

  if (!isReadOnly) {
    columns.push({
      key: "actions",
      label: "Actions",
      render: (_, customer) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => handleEditClick(customer)}
            style={{
              padding: "6px 12px",
              background: "#3498db",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(customer.id)}
            style={{
              padding: "6px 12px",
              background: "#e74c3c",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
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
        <h1>Customers Management</h1>
      </div>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <h2>Customer List</h2>
            <p>View all customers registered in the system.</p>
          </div>
          {!isReadOnly && (
            <Button
              onClick={() => {
                setFormData({ name: "", email: "", phone: "" });
                setEditingId(null);
                setError("");
                setShowForm(true);
              }}
              text="+ Add Customer"
            />
          )}
        </div>
        {isReadOnly && (
          <div style={{ marginBottom: '16px', padding: '12px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px' }}>
            <strong>View only mode:</strong> adding, editing, and deleting customers is disabled for this role.
          </div>
        )}

        {showForm && (
          <Card style={{ marginBottom: "24px" }}>
            {error && <div style={{ color: "red", marginBottom: "16px" }}>{error}</div>}
            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
              <Input
                label="Customer Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="customer@gmail.com"
              />
              <Input
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                placeholder="Enter 10 digit phone number"
                required
              />
              <div style={{ display: "flex", gap: "12px" }}>
                <Button type="submit" text={editingId ? "Update Customer" : "Save Customer"} />
                <Button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setError("");
                    setFormData({ name: "", email: "", phone: "" });
                    setEditingId(null);
                  }}
                  text="Cancel"
                  style={{ backgroundColor: "#6b7280" }}
                />
              </div>
            </form>
          </Card>
        )}

        {loading ? (
          <p>Loading customers...</p>
        ) : customers.length === 0 ? (
          <p>No customers found.</p>
        ) : (
          <Table columns={columns} data={customers} />
        )}
      </Card>
    </Layout>
  );
}
