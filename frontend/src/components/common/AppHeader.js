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
} from "@ant-design/icons";
import { useApp } from "../../contexts/AppContext";
import { useResponsive } from "../../hooks/useResponsive";

const { Header } = Layout;
const { Text } = Typography;

const AppHeader = ({ collapsed, onToggle }) => {
  const { auth, cart } = useApp();
  const { isMobile } = useResponsive();

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
      onClick: auth.logout,
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
          <Text strong style={{ fontSize: 18 }}>
            Restaurant Manager
          </Text>
          {!isMobile && (
            <Text type="secondary" style={{ marginLeft: 16 }}>
              {getRoleDisplayName(auth.user?.role)}
            </Text>
          )}
        </div>
      </div>

      {/* Partie droite */}
      <Space size="middle">
        {/* Notifications */}
        <Badge count={0} size="small">
          <Button
            type="text"
            icon={<BellOutlined />}
            style={{ border: "none" }}
          />
        </Badge>

        {/* Panier (pour les clients) */}
        {auth.user?.role === "customer" && (
          <Badge count={cart.itemCount} size="small">
            <Button
              type="text"
              icon={<ShoppingCartOutlined />}
              style={{ border: "none" }}
            />
          </Badge>
        )}

        {/* Menu utilisateur */}
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
          <Space style={{ cursor: "pointer" }}>
            <Avatar
              size="small"
              icon={<UserOutlined />}
              src={auth.user?.avatar}
            />
            {!isMobile && <Text>{auth.user?.username}</Text>}
          </Space>
        </Dropdown>
      </Space>
    </Header>
  );
};

const getRoleDisplayName = (role) => {
  const roleNames = {
    customer: "Client",
    waiter: "Serveur",
    kitchen: "Cuisine",
    admin: "Administrateur",
  };
  return roleNames[role] || role;
};

export default AppHeader;
