import React from "react";
import { Routes, Route } from "react-router-dom";
import { Row, Col, Card, Typography, List, Tag, Button, Progress } from "antd";
import {
  CoffeeOutlined,
  ClockCircleOutlined,
  FireOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const KitchenDashboard = () => {
  return (
    <Routes>
      <Route path="/" element={<KitchenHome />} />
      <Route path="/ready" element={<div>Plats prêts (à implémenter)</div>} />
      <Route path="/history" element={<div>Historique cuisine (à implémenter)</div>} />
    </Routes>
  );
};

const KitchenHome = () => {
  // Données d'exemple
  const orders = [
    {
      id: 1,
      table: 5,
      items: ["Poulet grillé x2", "Salade César x1"],
      status: "preparing",
      estimatedTime: 8,
      priority: "high",
    },
    {
      id: 2,
      table: 3,
      items: ["Pasta végétarienne x1"],
      status: "preparing",
      estimatedTime: 12,
      priority: "normal",
    },
    {
      id: 3,
      table: 7,
      items: ["Burger maison x2", "Frites x2"],
      status: "ready",
      estimatedTime: 0,
      priority: "normal",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'preparing':
        return 'processing';
      case 'ready':
        return 'success';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#ff4d4f';
      case 'normal':
        return '#1890ff';
      default:
        return '#d9d9d9';
    }
  };

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Title level={2}>👨‍🍳 Dashboard Cuisine</Title>
        </Col>

        <Col xs={24} sm={8}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <FireOutlined style={{ fontSize: 24, color: '#fa8c16', marginRight: 16 }} />
              <div>
                <Text type="secondary">En préparation</Text>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#fa8c16' }}>
                  {orders.filter(o => o.status === 'preparing').length}
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <CoffeeOutlined style={{ fontSize: 24, color: '#52c41a', marginRight: 16 }} />
              <div>
                <Text type="secondary">Prêts</Text>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                  {orders.filter(o => o.status === 'ready').length}
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <ClockCircleOutlined style={{ fontSize: 24, color: '#1890ff', marginRight: 16 }} />
              <div>
                <Text type="secondary">Temps moyen</Text>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                  15 min
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="Commandes en cours">
            <List
              dataSource={orders}
              renderItem={(order) => (
                <List.Item
                  actions={[
                    order.status === 'preparing' ? (
                      <Button type="primary" size="small">
                        Marquer prêt
                      </Button>
                    ) : (
                      <Button size="small">Servir</Button>
                    ),
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>Table {order.table}</span>
                        <Tag color={getStatusColor(order.status)}>
                          {order.status === 'preparing' ? 'En préparation' : 'Prêt'}
                        </Tag>
                        {order.priority === 'high' && (
                          <Tag color="red">Urgent</Tag>
                        )}
                      </div>
                    }
                    description={
                      <div>
                        <div>{order.items.join(', ')}</div>
                        {order.status === 'preparing' && (
                          <div style={{ marginTop: 8 }}>
                            <Text type="secondary">Temps restant: {order.estimatedTime} min</Text>
                            <Progress
                              percent={Math.max(0, 100 - (order.estimatedTime * 10))}
                              size="small"
                              status={order.estimatedTime < 5 ? 'exception' : 'active'}
                            />
                          </div>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default KitchenDashboard;