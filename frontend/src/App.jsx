import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import "./styles/global.css";
import "./styles/layout.css";
import "./styles/dashboard.css";
import "./styles/admin-dashboard.css";
import "./styles/auth.css";
import "./styles/cart.css";
import "./styles/product-table.css";
import "./styles/recent-sales.css";
import "./styles/create-sale.css";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppRoutes />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;