import { useState, useContext } from "react";
import { CartContext } from "../../context/CartContext";
import { createSale } from "../../services/salesService";
import Cart from "./Cart";
import ProductTable from "../products/ProductTable";
import { useNavigate } from "react-router-dom";

export default function CreateSaleForm() {
  const { cart, clearCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const validate = () => {
    if (!customerName.trim()) { setMessage({ text: "Please enter customer name", type: "error" }); return false; }
    if (!customerEmail.trim()) { setMessage({ text: "Please enter customer email", type: "error" }); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) { setMessage({ text: "Please enter a valid email", type: "error" }); return false; }
    if (customerPhone.replace(/\D/g, "").length !== 10) { setMessage({ text: "Phone must be 10 digits", type: "error" }); return false; }
    if (cart.length === 0) { setMessage({ text: "Cart is empty — add products first", type: "error" }); return false; }
    return true;
  };

  const handleCompleteSale = async () => {
    if (!validate()) return;
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const saleData = {
        customer: {
          name: customerName.trim(),
          email: customerEmail.trim(),
          phone: customerPhone.replace(/\D/g, ""),
        },
        items: cart.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          price: Number(item.price),
        })),
      };
      await createSale(saleData);
      clearCart();
      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
      navigate("/sales", { state: { refresh: Date.now() } });
    } catch (error) {
      setMessage({ text: "Failed: " + (typeof error === "string" ? error : error?.error || error?.message || "Unknown error"), type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-sale-form">
      {message.text && (
        <div className={`message ${message.type === "success" ? "success" : "error"}`}>
          {message.text}
        </div>
      )}

      <div className="sale-container">
        <div className="products-section">
          <ProductTable />
        </div>

        <div className="sale-details">
          <div className="customer-info">
            <h3>Customer Information</h3>
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name"
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="customer@gmail.com"
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Phone *</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="10 digit phone number"
                disabled={loading}
              />
            </div>
          </div>

          <Cart />

          <button
            onClick={handleCompleteSale}
            className="final-checkout-btn"
            disabled={loading || cart.length === 0}
          >
            {loading ? "Processing..." : "Complete Sale"}
          </button>
        </div>
      </div>
    </div>
  );
}
