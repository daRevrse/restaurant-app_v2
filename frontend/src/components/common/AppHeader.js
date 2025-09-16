// frontend/src/components/common/AppHeader.js - Version avec import corrigé
import React from "react";
import {
  Layout,
  Avatar,
  Dropdown,
  Space,
  Badge,
  Button,
  Typography,
} from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { useApp } from "../../contexts/AppContext";
import { useResponsive } from "../../hooks/useResponsive";
import { useNavigate } from "react-router-dom";

const { Header } = Layout;
const { Text } = Typography;

const AppHeader = ({ collapsed, onToggle }) => {
  const { auth, cart } = useApp();
  const { isMobile } = useResponsive();
  const navigate = useNavigate();

  const handleMenuClick = ({ key }) => {
    switch (key) {
      case "profile":
        navigate("/profile");
        break;
      case "settings":
        navigate("/settings");
        break;
      case "logout":
        auth.logout();
        break;
      default:
        break;
    }
  };

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Mon profil",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Paramètres",
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Se déconnecter",
    },
  ];

  return (
    <Header
      style={{
        padding: "0 24px",
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid #f0f0f0",
      }}
    >
      {/* Partie gauche */}
      <div style={{ display: "flex", alignItems: "center" }}>
        {isMobile && (
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={onToggle}
            style={{ marginRight: 16 }}
          />
        )}
        <div>
          <Typography.Title level={4} style={{ margin: 0, color: "#1890ff" }}>
            Restaurant
          </Typography.Title>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {auth.user?.role === "admin" && "Administration"}
            {auth.user?.role === "waiter" && "Service"}
            {auth.user?.role === "kitchen" && "Cuisine"}
            {auth.user?.role === "customer" && "Client"}
          </Text>
        </div>
      </div>

      {/* Partie droite */}
      <Space size="middle">
        {/* Panier pour les clients */}
        {auth.user?.role === "customer" && cart && (
          <Badge count={cart.totalItems} showZero>
            <Button
              type="text"
              icon={<ShoppingCartOutlined />}
              onClick={() => navigate("/cart")}
            >
              {!isMobile && "Panier"}
            </Button>
          </Badge>
        )}

        {/* Notifications */}
        <Badge count={0}>
          <Button type="text" icon={<BellOutlined />} />
        </Badge>

        {/* Menu utilisateur */}
        <Dropdown
          menu={{
            items: userMenuItems,
            onClick: handleMenuClick,
          }}
          placement="bottomRight"
          arrow
        >
          <Space style={{ cursor: "pointer" }}>
            <Avatar icon={<UserOutlined />} />
            {!isMobile && (
              <div>
                <Text strong>{auth.user?.username}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  {auth.user?.role}
                </Text>
              </div>
            )}
          </Space>
        </Dropdown>
      </Space>
    </Header>
  );
};

export default AppHeader;
