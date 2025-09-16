import React from "react";
import { Row, Col, Card, Spin, Alert } from "antd";
import { useApp } from "../../contexts/AppContext";
import { useMenu } from "../../hooks/useMenu";
import { useResponsive } from "../../hooks/useResponsive";
import CategorySelector from "./CategorySelector";
import MenuGrid from "./MenuGrid";
import CartSidebar from "./CartSidebar";
import SearchBar from "./SearchBar";

const CustomerDashboard = () => {
  const { auth, cart } = useApp();
  const { loading, error } = useMenu();
  const { isMobile } = useResponsive();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Erreur de chargement"
        description="Impossible de charger le menu. Veuillez réessayer."
        type="error"
        showIcon
        style={{ margin: 20 }}
      />
    );
  }

  return (
    <div
      style={{
        padding: isMobile ? 8 : 20,
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Row gutter={[16, 16]}>
        {/* Menu principal */}
        <Col xs={24} lg={18}>
          <Card
            title="Menu du Restaurant"
            size={isMobile ? "small" : "default"}
            style={{ marginBottom: 16 }}
          >
            <SearchBar />
            <CategorySelector />
          </Card>

          <MenuGrid />
        </Col>

        {/* Panier (sidebar sur desktop, modal sur mobile) */}
        <Col xs={24} lg={6}>
          <CartSidebar />
        </Col>
      </Row>
    </div>
  );
};

export default CustomerDashboard;
