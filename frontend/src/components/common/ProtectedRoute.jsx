import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { Loader } from "../ui/Loader";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return <Loader />;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
}
