import { useContext } from "react";
import { CartContext } from "../../context/CartContext";

export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useContext(CartContext);

  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value);
    if (isNaN(newQuantity) || newQuantity < 1) return;
    if (newQuantity > item.stock) {
      alert(`Only ${item.stock} units available in stock`);
      return;
    }
    updateQuantity(item.id, newQuantity);
  };

  const subtotal = item.price * item.quantity;

  return (
    <div className="cart-item">
      <div className="cart-item-info">
        <h4>{item.name}</h4>
        <p className="cart-item-price">₹{item.price.toFixed(2)}</p>
      </div>
      <div className="cart-item-controls">
        <input
          type="number"
          min="1"
          value={item.quantity}
          onChange={handleQuantityChange}
          className="quantity-input"
        />
        <button
          onClick={() => removeFromCart(item.id)}
          className="remove-btn"
        >
          Remove
        </button>
      </div>
      <div className="cart-item-subtotal">
        ₹{subtotal.toFixed(2)}
      </div>
    </div>
  );
}
