import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Dashboard from "../pages/admin/AdminDashboard";
import ProductsPage from "../pages/admin/ProductsPage";
import CustomersPage from "../pages/admin/CustomersPage";
import SuppliersPage from "../pages/admin/SuppliersPage";
import PurchasesPage from "../pages/admin/PurchasesPage";
import ReportsPage from "../pages/admin/ReportsPage";
import SalesDashboard from "../pages/staff/SalesDashboard";
import CreateSalePage from "../pages/staff/CreateSalePage";
import ManagerDashboard from "../pages/manager/ManagerDashboard";
import ManagerSalesPage from "../pages/manager/ManagerSalesPage";
import StockUpdatePage from "../pages/manager/StockUpdatePage";
import UserDashboard from "../pages/user/UserDashboard";
import MyRequests from "../pages/user/MyRequests";
import ProductRequests from "../pages/staff/ProductRequests";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ProtectedRoute from "../components/common/ProtectedRoute";
import RoleProtectedRoute from "../components/common/RoleProtectedRoute";

const DashboardRedirect = () => {
  const { user } = useContext(AuthContext);
  if (user?.role === 'manager') return <Navigate to="/manager/dashboard" replace />;
  if (user?.role === 'user') return <Navigate to="/user/dashboard" replace />;
  if (user?.role === 'staff') return <Navigate to="/sales" replace />;
  return <Dashboard />;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardRedirect />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <ProductsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers"
          element={
            <ProtectedRoute>
              <CustomersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/suppliers"
          element={
            <ProtectedRoute>
              <SuppliersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchases"
          element={
            <ProtectedRoute>
              <PurchasesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={["staff"]}>
                <ReportsPage />
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

        {/* User Routes */}
        <Route path="/user/dashboard" element={<ProtectedRoute><RoleProtectedRoute allowedRoles={["user"]}><UserDashboard /></RoleProtectedRoute></ProtectedRoute>} />
        <Route path="/user/requests" element={<ProtectedRoute><RoleProtectedRoute allowedRoles={["user"]}><MyRequests /></RoleProtectedRoute></ProtectedRoute>} />

        {/* Staff Routes */}
        <Route 
          path="/sales" 
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={["staff"]}>
                <SalesDashboard />
              </RoleProtectedRoute>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/sales/create" 
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={["staff"]}>
                <CreateSalePage />
              </RoleProtectedRoute>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/requests" 
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={["staff", "admin"]}>
                <ProductRequests />
              </RoleProtectedRoute>
            </ProtectedRoute>
          } 
        />

        {/* Manager Routes */}
        <Route
          path="/manager/dashboard"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={["manager"]}>
                <ManagerDashboard />
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/sales"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={["manager"]}>
                <ManagerSalesPage />
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/stock"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={["manager"]}>
                <StockUpdatePage />
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;