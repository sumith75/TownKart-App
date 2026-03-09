import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Auth Pages
import Login from "./pages/Login";
import Register from "./pages/Register";

// Customer Pages
import Home from "./pages/Home";
import Store from "./pages/Store";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/Products";
import AdminOrders from "./pages/admin/Orders";

// Delivery Pages
import DeliveryDashboard from "./pages/delivery/Dashboard";

// Components
import ProtectedRoute from "./components/ProtectedRoute";

function getDashboard(role) {
  if (role === "admin") return "/admin";
  if (role === "delivery") return "/delivery";
  return "/";
}

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm font-medium">Loading TownKart...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={user ? <Navigate to={getDashboard(user.role)} replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={getDashboard(user.role)} replace /> : <Register />} />

      {/* Customer Routes */}
      <Route element={<ProtectedRoute allowedRoles={["customer"]} />}>
        <Route path="/" element={<Home />} />
        <Route path="/store/:id" element={<Store />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<Orders />} />
      </Route>

      {/* Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
      </Route>

      {/* Delivery Routes */}
      <Route element={<ProtectedRoute allowedRoles={["delivery"]} />}>
        <Route path="/delivery" element={<DeliveryDashboard />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to={user ? getDashboard(user.role) : "/login"} replace />} />
    </Routes>
  );
}

export default App;