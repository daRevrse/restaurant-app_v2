// frontend/src/App.js - Routes mises à jour pour le système de tables
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout, Spin } from "antd";

import "./App.css";
import AppSidebar from "./components/common/AppSidebar";
import AppHeader from "./components/common/AppHeader";
import LoginPage from "./pages/LoginPage";
import QRScannerPage from "./pages/QRScannerPage";
import TableMenuPage from "./pages/TableMenuPage";
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
              background: auth.isAuthenticated ? "#fff" : "transparent",
            }}
          >
            <Routes>
              {/* Routes publiques */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/qr-scanner" element={<QRScannerPage />} />
              <Route path="/table-menu" element={<TableMenuPage />} />

              {/* Routes protégées pour les clients */}
              <Route
                path="/"
                element={
                  <ProtectedRoute allowedRoles={["customer"]}>
                    <CustomerDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Routes protégées pour les serveurs */}
              <Route
                path="/waiter"
                element={
                  <ProtectedRoute allowedRoles={["waiter", "admin"]}>
                    <WaiterDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/waiter/*"
                element={
                  <ProtectedRoute allowedRoles={["waiter", "admin"]}>
                    <WaiterDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Routes protégées pour la cuisine */}
              <Route
                path="/kitchen"
                element={
                  <ProtectedRoute allowedRoles={["kitchen", "admin"]}>
                    <KitchenDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/kitchen/*"
                element={
                  <ProtectedRoute allowedRoles={["kitchen", "admin"]}>
                    <KitchenDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Routes protégées pour l'admin */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Route de fallback - redirection intelligente */}
              <Route
                path="*"
                element={
                  auth.isAuthenticated ? (
                    // Rediriger selon le rôle si connecté
                    auth.user?.role === "admin" ? (
                      <AdminDashboard />
                    ) : auth.user?.role === "waiter" ? (
                      <WaiterDashboard />
                    ) : auth.user?.role === "kitchen" ? (
                      <KitchenDashboard />
                    ) : (
                      <CustomerDashboard />
                    )
                  ) : (
                    // Rediriger vers QR scanner si non connecté
                    <QRScannerPage />
                  )
                }
              />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Router>
  );
};

const App = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
