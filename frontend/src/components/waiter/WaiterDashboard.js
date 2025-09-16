import React from "react";
import { Routes, Route } from "react-router-dom";
import { Row, Col, Card, Statistic, Typography, List, Badge } from "antd";
import {
  TableOutlined,
  ShoppingOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

const WaiterDashboard = () => {
  return (
    <Routes>
      <Route path="/" element={<WaiterHome />} />
      <Route path="/tables" element={<div>Gestion des tables (à implémenter)</div>} />
      <Route path="/orders" element={<div>Commandes en cours (à implémenter)</div>} />
      <Route path="/stats" element={<div>Mes statistiques (à implémenter)</div>} />
    </Routes>
  );
};

const WaiterHome = () => {
  // Données d'exemple
  const pendingOrders = [
    { id: 1, table: 5, items: "2 plats", time: "5 min" },
    { id: 2, table: 3, items: "1 plat", time: "12 min" },
    { id: 3, table: 7, items: "3 plats", time: "8 min" },
  ];

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Title level={2}>👨‍💼 Dashboard Serveur</Title>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tables occupées"
              value={8}
              prefix={<TableOutlined />}
              suffix="/ 15"
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Commandes en attente"
              value={5}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Commandes servies"
              value={12}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Commandes total"
              value={18}
              prefix={<ShoppingOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Commandes en attente">
            <List
              size="small"
              dataSource={pendingOrders}
              renderItem={(order) => (
                <List.Item>
                  <List.Item.Meta
                    title={`Table ${order.table}`}
                    description={order.items}
                  />
                  <Badge count={order.time} style={{ backgroundColor: '#fa8c16' }} />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Plan des tables" loading>
            <p>Plan interactif des tables du restaurant...</p>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default WaiterDashboard;