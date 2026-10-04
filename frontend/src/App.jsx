import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Billing from "./pages/Billing.jsx";
import Categories from "./pages/Categories.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Invoices from "./pages/Invoices.jsx";
import Login from "./pages/Login.jsx";
import Products from "./pages/Products.jsx";
import PurchaseNew from "./pages/PurchaseNew.jsx";
import Reports from "./pages/Reports.jsx";
import Stock from "./pages/Stock.jsx";
import Suppliers from "./pages/Suppliers.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/stock" element={<Stock />} />
          <Route path="/products" element={<Products />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/purchases/new" element={<PurchaseNew />} />
          <Route path="/reports" element={<Reports />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
