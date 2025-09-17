// frontend/src/components/customer/OrderSuccessModal.js
import React from "react";
import {
  Modal,
  Result,
  Button,
  Card,
  Space,
  Typography,
  Timeline,
  Tag,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CoffeeOutlined,
  CarOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { formatCurrency, formatDateTime } from "../../utils/formatters";

const { Text, Title } = Typography;

const OrderSuccessModal = ({ visible, order, onClose }) => {
  if (!order) return null;

  const getStatusColor = (status) => {
    const colors = {
      pending: "orange",
      confirmed: "blue",
      preparing: "purple",
      ready: "green",
      served: "success",
      cancelled: "error",
    };
    return colors[status] || "default";
  };

  const getStatusText = (status) => {
    const texts = {
      pending: "En attente",
      confirmed: "Confirmée",
      preparing: "En préparation",
      ready: "Prête",
      served: "Servie",
      cancelled: "Annulée",
    };
    return texts[status] || status;
  };

  const timelineItems = [
    {
      color: "green",
      icon: <CheckCircleOutlined />,
      children: (
        <div>
          <Text strong>Commande reçue</Text>
          <br />
          <Text type="secondary">{formatDateTime(order.created_at)}</Text>
        </div>
      ),
    },
    {
      color: order.status === "confirmed" ? "blue" : "gray",
      icon: <ClockCircleOutlined />,
      children: (
        <div>
          <Text strong>Confirmation</Text>
          <br />
          <Text type="secondary">
            {order.status === "confirmed"
              ? "Confirmée par l'équipe"
              : "En cours..."}
          </Text>
        </div>
      ),
    },
    {
      color: ["preparing", "ready", "served"].includes(order.status)
        ? "purple"
        : "gray",
      icon: <CoffeeOutlined />,
      children: (
        <div>
          <Text strong>Préparation</Text>
          <br />
          <Text type="secondary">
            {order.estimated_time
              ? `Temps estimé: ${order.estimated_time} min`
              : "En cours..."}
          </Text>
        </div>
      ),
    },
    {
      color: ["ready", "served"].includes(order.status) ? "green" : "gray",
      icon: <CarOutlined />,
      children: (
        <div>
          <Text strong>Service</Text>
          <br />
          <Text type="secondary">
            {order.status === "ready"
              ? "Prêt à être servi"
              : order.status === "served"
              ? "Servi"
              : "En attente..."}
          </Text>
        </div>
      ),
    },
  ];

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" type="primary" onClick={onClose}>
          Fermer
        </Button>,
      ]}
      width={600}
      centered
    >
      <Result
        status="success"
        title="Commande passée avec succès !"
        subTitle={
          <Space direction="vertical" align="center">
            <Text>
              Votre commande #{order.id?.slice(0, 8)} a été envoyée à la cuisine
            </Text>
            <Tag color={getStatusColor(order.status)} style={{ marginTop: 8 }}>
              {getStatusText(order.status)}
            </Tag>
          </Space>
        }
      />

      {/* Détails de la commande */}
      <Card
        title="Détails de votre commande"
        style={{ marginTop: 20 }}
        size="small"
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          {/* Table info */}
          <Space justify="space-between" style={{ width: "100%" }}>
            <Text strong>Table:</Text>
            <Text>{order.table?.number}</Text>
          </Space>

          {/* Temps estimé */}
          {order.estimated_time && (
            <Space justify="space-between" style={{ width: "100%" }}>
              <Text strong>Temps estimé:</Text>
              <Text>{order.estimated_time} minutes</Text>
            </Space>
          )}

          {/* Montant */}
          <Space justify="space-between" style={{ width: "100%" }}>
            <Text strong>Montant total:</Text>
            <Text strong style={{ fontSize: "16px", color: "#1890ff" }}>
              {formatCurrency(order.total_amount)}
            </Text>
          </Space>

          {/* Instructions spéciales */}
          {order.special_instructions && (
            <div>
              <Text strong>Instructions spéciales:</Text>
              <br />
              <Text type="secondary">{order.special_instructions}</Text>
            </div>
          )}
        </Space>
      </Card>

      {/* Articles commandés */}
      <Card title="Articles commandés" style={{ marginTop: 16 }} size="small">
        <Space direction="vertical" style={{ width: "100%" }}>
          {order.items?.map((item, index) => (
            <div key={index}>
              <Space justify="space-between" style={{ width: "100%" }}>
                <div>
                  <Text strong>{item.dish?.name}</Text>
                  <br />
                  <Text type="secondary">
                    {formatCurrency(item.unit_price)} × {item.quantity}
                  </Text>
                  {item.special_instructions && (
                    <>
                      <br />
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        Note: {item.special_instructions}
                      </Text>
                    </>
                  )}
                </div>
                <Text strong>
                  {formatCurrency(item.unit_price * item.quantity)}
                </Text>
              </Space>
              {index < order.items.length - 1 && (
                <div
                  style={{
                    height: "1px",
                    background: "#f0f0f0",
                    margin: "8px 0",
                  }}
                />
              )}
            </div>
          ))}
        </Space>
      </Card>

      {/* Timeline de progression */}
      <Card
        title="Suivi de votre commande"
        style={{ marginTop: 16 }}
        size="small"
      >
        <Timeline items={timelineItems} />
      </Card>

      {/* Message d'information */}
      <Card
        size="small"
        style={{
          marginTop: 16,
          background: "#f6ffed",
          border: "1px solid #b7eb8f",
        }}
      >
        <Space>
          <HomeOutlined style={{ color: "#52c41a" }} />
          <div>
            <Text strong style={{ color: "#52c41a" }}>
              Restez à votre table
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: "12px" }}>
              Votre serveur vous apportera votre commande dès qu'elle sera
              prête. Vous pouvez continuer à naviguer dans l'application pour
              suivre le statut.
            </Text>
          </div>
        </Space>
      </Card>
    </Modal>
  );
};

export default OrderSuccessModal;
