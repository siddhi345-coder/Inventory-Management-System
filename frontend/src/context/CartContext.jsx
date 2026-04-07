import React, { createContext, useState, useCallback } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addToCart = useCallback((product, quantity = 1) => {
    const productId = product.id || product._id;
    if (!productId) {
      console.warn("Cannot add product to cart without id", product);
      return;
    }

    const stock = Number(product.stock ?? product.stock_quantity ?? 0);
    const price = Number(product.price ?? product.selling_price ?? 0);

    const normalizedProduct = {
      ...product,
      id: productId,
      price,
      stock,
    };

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => (item.id || item._id) === productId);
      if (existingItem) {
        const newQty = existingItem.quantity + quantity;
        if (newQty > stock) {
          alert(`Only ${stock} units available in stock`);
          return prevCart;
        }
        return prevCart.map((item) =>
          (item.id || item._id) === productId
            ? { ...item, quantity: newQty }
            : item
        );
      }
      if (quantity > stock) {
        alert(`Only ${stock} units available in stock`);
        return prevCart;
      }
      return [...prevCart, { ...normalizedProduct, quantity }];
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const getCartTotal = useCallback(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);

  const getCartItemCount = useCallback(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
