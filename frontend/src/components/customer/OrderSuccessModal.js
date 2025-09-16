import React from "react";
import { Modal, Result, Button, Typography, Descriptions } from "antd";
import { CheckCircleOutlined, EyeOutlined } from "@ant-design/icons";
import { formatCurrency, formatDate } from "../../utils/formatters";

const { Text } = Typography;

const OrderSuccessModal = ({ visible, order, onClose }) => {
  if (!order) return null;

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="track" type="primary" icon={<EyeOutlined />}>
          Suivre ma commande
        </Button>,
        <Button key="new" onClick={onClose}>
          Nouvelle commande
        </Button>,
      ]}
      width={500}
      centered
    >
      <Result
        icon={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
        title="Commande confirmée !"
        subTitle={
          <div style={{ textAlign: "left", marginTop: 20 }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Numéro de commande">
                <Text strong>{order.order_number}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Montant total">
                <Text strong style={{ color: "#1890ff" }}>
                  {formatCurrency(order.total_amount)}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Temps estimé">
                <Text>{order.estimated_time || 15} minutes</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Table">
                <Text>Table n°{order.table?.number}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Statut">
                <Text>En préparation</Text>
              </Descriptions.Item>
            </Descriptions>
          </div>
        }
      />
    </Modal>
  );
};

export default OrderSuccessModal;
