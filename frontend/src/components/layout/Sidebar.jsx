import { Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const Sidebar = () => {
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const isStaff = user?.role === 'staff';
  const isManager = user?.role === 'manager';
  const isUser = user?.role === 'user';

  const isActive = (path) => location.pathname === path;

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <h2>📱 IMS</h2>
        <p>Inventory Management</p>
      </div>

      <nav className="sidebar-nav">
        {!isUser && (
          <div className="nav-section">
            <h4>Main</h4>
            <Link
              to="/dashboard"
              className={`nav-link ${isActive("/dashboard") ? "active" : ""}`}
            >
              <span className="nav-icon">📊</span>
              Dashboard
            </Link>
          </div>
        )}

        {isUser && (
          <div className="nav-section">
            <h4>Catalog</h4>
            <Link to="/user/dashboard" className={`nav-link ${isActive("/user/dashboard") ? "active" : ""}`}>
              <span className="nav-icon">🖥️</span>Products
            </Link>
            <Link to="/user/requests" className={`nav-link ${isActive("/user/requests") ? "active" : ""}`}>
              <span className="nav-icon">📋</span>My Requests
            </Link>
          </div>
        )}

        {isStaff && (
          <div className="nav-section">
            <h4>Sales</h4>
            <Link to="/sales/create" className={`nav-link ${isActive("/sales/create") ? "active" : ""}`}>
              <span className="nav-icon">🛒</span>Create Sale
            </Link>
            <Link to="/sales" className={`nav-link ${isActive("/sales") ? "active" : ""}`}>
              <span className="nav-icon">📦</span>My Sales
            </Link>
            <Link to="/requests" className={`nav-link ${isActive("/requests") ? "active" : ""}`}>
              <span className="nav-icon">📋</span>Product Requests
            </Link>
          </div>
        )}

        {isManager && (
          <div className="nav-section">
            <h4>Management</h4>
            <Link to="/products" className={`nav-link ${isActive("/products") ? "active" : ""}`}>
              <span className="nav-icon">🖥️</span>Products
            </Link>
            <Link to="/manager/suppliers" className={`nav-link ${isActive("/manager/suppliers") ? "active" : ""}`}>
              <span className="nav-icon">🏢</span>Suppliers
            </Link>
            <Link to="/manager/sales" className={`nav-link ${isActive("/manager/sales") ? "active" : ""}`}>
              <span className="nav-icon">🛒</span>Sales
            </Link>
          </div>
        )}

        {!isStaff && !isManager && !isUser && (
          <div className="nav-section">
            <h4>Management</h4>
            <Link
              to="/products"
              className={`nav-link ${isActive("/products") ? "active" : ""}`}
            >
              <span className="nav-icon">🖥️</span>
              Products
            </Link>
            <Link
              to="/customers"
              className={`nav-link ${isActive("/customers") ? "active" : ""}`}
            >
              <span className="nav-icon">👥</span>
              Customers
            </Link>
            <Link
              to="/suppliers"
              className={`nav-link ${isActive("/suppliers") ? "active" : ""}`}
            >
              <span className="nav-icon">🏢</span>
              Suppliers
            </Link>
            <Link
              to="/purchases"
              className={`nav-link ${isActive("/purchases") ? "active" : ""}`}
            >
              <span className="nav-icon">📩</span>
              Purchases
            </Link>
          </div>
        )}


      </nav>

      <div className="sidebar-footer">
        <p>©2026 Laptop IMS</p>
      </div>
    </div>
  );
};

export default Sidebar;