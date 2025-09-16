import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "antd";
import { AppProvider } from "./contexts/AppContext";
import CustomerDashboard from "./components/customer/CustomerDashboard";
import AdminDashboard from "./components/admin/AdminDashboard";
import WaiterDashboard from "./components/waiter/WaiterDashboard";
import KitchenDashboard from "./components/kitchen/KitchenDashboard";
import AppHeader from "./components/common/AppHeader";
import AppSidebar from "./components/common/AppSidebar";
import LoginPage from "./pages/LoginPage";
import QRScannerPage from "./pages/QRScannerPage";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { useApp } from "./contexts/AppContext";
import "./App.css";

const { Content } = Layout;

const AppContent = () => {
  const { auth } = useApp();

  if (auth.loading) {
    return <div>Chargement...</div>; // Ou un spinner plus joli
  }

  return (
    <Router>
      <Layout style={{ minHeight: "100vh" }}>
        {auth.isAuthenticated && <AppSidebar />}

        <Layout>
          {auth.isAuthenticated && <AppHeader />}

          <Content style={{ margin: 0, overflow: "initial" }}>
            <Routes>
              {/* Routes publiques */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/scan" element={<QRScannerPage />} />

              {/* Routes par rôle */}
              <Route
                path="/"
                element={
                  <ProtectedRoute roles={["customer"]}>
                    <CustomerDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute roles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/waiter/*"
                element={
                  <ProtectedRoute roles={["waiter", "admin"]}>
                    <WaiterDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/kitchen/*"
                element={
                  <ProtectedRoute roles={["kitchen", "admin"]}>
                    <KitchenDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Router>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
