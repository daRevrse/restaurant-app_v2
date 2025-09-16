import React from "react";
import { Row, Col, Card, Typography, Spin } from "antd";
import { useMenu } from "../../hooks/useMenu";
import SearchBar from "./SearchBar";
import CategoryFilter from "./CategoryFilter";
import DishGrid from "./DishGrid";
import { useApp } from "../../contexts/AppContext";

const { Title } = Typography;

const CustomerDashboard = () => {
  const { auth } = useApp();
  const { categories, dishes, loading } = useMenu();

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" tip="Chargement du menu..." />
      </div>
    );
  }

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Title level={2}>Bienvenue {auth.user?.username} ! 🍽️</Title>
            <p>Découvrez notre délicieux menu et passez votre commande.</p>
          </Card>
        </Col>

        <Col span={24}>
          <SearchBar />
        </Col>

        <Col span={24}>
          <CategoryFilter categories={categories} />
        </Col>

        <Col span={24}>
          <DishGrid dishes={dishes} />
        </Col>
      </Row>
    </div>
  );
};

export default CustomerDashboard;
