import { useContext } from "react";
import { CartContext } from "../../context/CartContext";
import CartItem from "./CartItem";

export default function Cart() {
  const { cart, clearCart, getCartTotal, getCartItemCount } = useContext(CartContext);

  if (cart.length === 0) {
    return (
      <div className="cart-container">
        <div className="cart-empty">
          <h3>Your Cart is Empty</h3>
          <p>Add items to create a sale</p>
        </div>
      </div>
    );
  }

  const total = getCartTotal();

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h2>Shopping Cart</h2>
        <span className="cart-count">{getCartItemCount()} items</span>
      </div>

      <div className="cart-items">
        {cart.map((item) => (
          <CartItem key={item.id} item={item} />
        ))}
      </div>

      <div className="cart-summary">
        <div className="summary-row">
          <span>Subtotal:</span>
          <span>₹{total.toFixed(2)}</span>
        </div>
        <div className="summary-row">
          <span>Tax (18%):</span>
          <span>₹{(total * 0.18).toFixed(2)}</span>
        </div>
        <div className="summary-row total">
          <span>Total:</span>
          <span>₹{(total * 1.18).toFixed(2)}</span>
        </div>
      </div>

      <div className="cart-actions">
        <button onClick={clearCart} className="clear-btn">
          Clear Cart
        </button>
      </div>
    </div>
  );
}
