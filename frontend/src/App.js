import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout, Spin } from "antd";

import "./App.css";
import AppSidebar from "./components/common/AppSidebar";
import AppHeader from "./components/common/AppHeader";
import LoginPage from "./pages/LoginPage";
import QRScannerPage from "./pages/QRScannerPage";
import ProtectedRoute from "./components/common/ProtectedRoute";
import CustomerDashboard from "./components/customer/CustomerDashboard";
import AdminDashboard from "./components/admin/AdminDashboard";
import WaiterDashboard from "./components/waiter/WaiterDashboard";
import KitchenDashboard from "./components/kitchen/KitchenDashboard";
import { AppProvider, useApp } from "./contexts/AppContext";
import { useResponsive } from "./hooks/useResponsive";

const { Content } = Layout;

const AppContent = () => {
  const { auth } = useApp();
  const { isMobile } = useResponsive();
  const [collapsed, setCollapsed] = useState(isMobile);

  const handleToggle = () => {
    setCollapsed(!collapsed);
  };

  if (auth.loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spin size="large" tip="Chargement..." />
      </div>
    );
  }

  return (
    <Router>
      <Layout style={{ minHeight: "100vh" }}>
        {auth.isAuthenticated && (
          <AppSidebar collapsed={collapsed} onCollapse={setCollapsed} />
        )}

        <Layout>
          {auth.isAuthenticated && (
            <AppHeader collapsed={collapsed} onToggle={handleToggle} />
          )}

          <Content
            style={{
              margin: auth.isAuthenticated ? "24px 16px" : 0,
              padding: auth.isAuthenticated ? 24 : 0,
              minHeight: 280,
              background: auth.isAuthenticated ? "#f0f2f5" : "#fff",
              overflow: "initial",
            }}
          >
            <Routes>
              {/* Routes publiques */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/scan" element={<QRScannerPage />} />

              {/* Routes par rôle - Customer */}
              <Route
                path="/"
                element={
                  <ProtectedRoute roles={["customer"]}>
                    <CustomerDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Routes par rôle - Admin */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute roles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Routes par rôle - Waiter */}
              <Route
                path="/waiter/*"
                element={
                  <ProtectedRoute roles={["waiter", "admin"]}>
                    <WaiterDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Routes par rôle - Kitchen */}
              <Route
                path="/kitchen/*"
                element={
                  <ProtectedRoute roles={["kitchen", "admin"]}>
                    <KitchenDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Route par défaut - Redirection basée sur le rôle */}
              <Route
                path="*"
                element={
                  <ProtectedRoute>
                    <div>Page non trouvée</div>
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
