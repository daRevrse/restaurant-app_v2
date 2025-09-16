import React from "react";
import { Routes, Route } from "react-router-dom";
import { Row, Col, Card, Statistic, Typography } from "antd";
import {
  ShoppingOutlined,
  UserOutlined,
  DollarCircleOutlined,
  RiseOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

const AdminDashboard = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminHome />} />
      <Route path="/categories" element={<div>Gestion des catégories (à implémenter)</div>} />
      <Route path="/dishes" element={<div>Gestion des plats (à implémenter)</div>} />
      <Route path="/orders" element={<div>Gestion des commandes (à implémenter)</div>} />
      <Route path="/tables" element={<div>Gestion des tables (à implémenter)</div>} />
      <Route path="/users" element={<div>Gestion des utilisateurs (à implémenter)</div>} />
      <Route path="/stats" element={<div>Statistiques (à implémenter)</div>} />
      <Route path="/settings" element={<div>Paramètres (à implémenter)</div>} />
    </Routes>
  );
};

const AdminHome = () => {
  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Title level={2}>📊 Dashboard Administration</Title>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Commandes aujourd'hui"
              value={23}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Chiffre d'affaires"
              value={45678}
              prefix={<DollarCircleOutlined />}
              suffix="FCFA"
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Utilisateurs actifs"
              value={156}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Croissance"
              value={11.28}
              precision={2}
              valueStyle={{ color: "#3f8600" }}
              prefix={<RiseOutlined />}
              suffix="%"
            />
          </Card>
        </Col>

        <Col span={24}>
          <Card title="Activité récente" loading>
            <p>Graphiques et tableaux des activités récentes...</p>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;