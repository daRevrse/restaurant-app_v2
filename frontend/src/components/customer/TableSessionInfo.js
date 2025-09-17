// frontend/src/components/customer/TableSessionInfo.js
import React from "react";
import { Space, Typography, Tag, Tooltip } from "antd";
import {
  TableOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { formatDateTime } from "../../utils/formatters";

const { Text } = Typography;

const TableSessionInfo = ({ session }) => {
  if (!session) return null;

  const sessionDuration = Date.now() - session.timestamp;
  const durationMinutes = Math.floor(sessionDuration / (1000 * 60));

  return (
    <Space size="middle">
      {/* Numéro de table */}
      <Space size="small">
        <TableOutlined style={{ color: "#1890ff" }} />
        <Text strong>Table {session.tableNumber}</Text>
      </Space>

      {/* Durée de session */}
      <Tooltip
        title={`Session démarrée à ${formatDateTime(session.timestamp)}`}
      >
        <Space size="small">
          <ClockCircleOutlined style={{ color: "#52c41a" }} />
          <Text type="secondary">
            {durationMinutes < 60
              ? `${durationMinutes}min`
              : `${Math.floor(durationMinutes / 60)}h ${
                  durationMinutes % 60
                }min`}
          </Text>
        </Space>
      </Tooltip>

      {/* Statut */}
      <Tag color="processing" icon={<UserOutlined />}>
        Session active
      </Tag>
    </Space>
  );
};

export default TableSessionInfo;
