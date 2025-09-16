import React, { useState } from "react";
import { Layout, Menu } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import {
  DashboardOutlined,
  MenuOutlined,
  ShoppingOutlined,
  UserOutlined,
  TableOutlined,
  BarChartOutlined,
  CoffeeOutlined,
  HistoryOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useApp } from "../../contexts/AppContext";
import { useResponsive } from "../../hooks/useResponsive";

const { Sider } = Layout;

const AppSidebar = () => {
  const { auth } = useApp();
  const { isMobile } = useResponsive();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(isMobile);

  // Menus par rôle
  const getMenuItems = () => {
    const role = auth.user?.role;

    switch (role) {
      case "customer":
        return [
          {
            key: "/",
            icon: <MenuOutlined />,
            label: "Menu",
            onClick: () => navigate("/"),
          },
          {
            key: "/orders",
            icon: <ShoppingOutlined />,
            label: "Mes commandes",
            onClick: () => navigate("/orders"),
          },
          {
            key: "/history",
            icon: <HistoryOutlined />,
            label: "Historique",
            onClick: () => navigate("/history"),
          },
        ];

      case "waiter":
        return [
          {
            key: "/waiter",
            icon: <DashboardOutlined />,
            label: "Dashboard",
            onClick: () => navigate("/waiter"),
          },
          {
            key: "/waiter/tables",
            icon: <TableOutlined />,
            label: "Gestion Tables",
            onClick: () => navigate("/waiter/tables"),
          },
          {
            key: "/waiter/orders",
            icon: <ShoppingOutlined />,
            label: "Commandes",
            onClick: () => navigate("/waiter/orders"),
          },
        ];

      case "kitchen":
        return [
          {
            key: "/kitchen",
            icon: <CoffeeOutlined />,
            label: "Commandes Cuisine",
            onClick: () => navigate("/kitchen"),
          },
          {
            key: "/kitchen/ready",
            icon: <CheckCircleOutlined />,
            label: "Plats Prêts",
            onClick: () => navigate("/kitchen/ready"),
          },
        ];

      case "admin":
        return [
          {
            key: "/admin",
            icon: <DashboardOutlined />,
            label: "Dashboard",
            onClick: () => navigate("/admin"),
          },
          {
            key: "/admin/menu",
            icon: <MenuOutlined />,
            label: "Gestion Menu",
            onClick: () => navigate("/admin/menu"),
          },
          {
            key: "/admin/orders",
            icon: <ShoppingOutlined />,
            label: "Toutes Commandes",
            onClick: () => navigate("/admin/orders"),
          },
          {
            key: "/admin/tables",
            icon: <TableOutlined />,
            label: "Gestion Tables",
            onClick: () => navigate("/admin/tables"),
          },
          {
            key: "/admin/users",
            icon: <UserOutlined />,
            label: "Utilisateurs",
            onClick: () => navigate("/admin/users"),
          },
          {
            key: "/admin/analytics",
            icon: <BarChartOutlined />,
            label: "Analytics",
            onClick: () => navigate("/admin/analytics"),
          },
          {
            key: "/admin/settings",
            icon: <SettingOutlined />,
            label: "Paramètres",
            onClick: () => navigate("/admin/settings"),
          },
        ];

      default:
        return [];
    }
  };

  const selectedKey = location.pathname;

  return (
    <Sider
      collapsible={!isMobile}
      collapsed={collapsed}
      onCollapse={setCollapsed}
      width={256}
      style={{
        overflow: "auto",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <div
          style={{
            color: "#fff",
            fontSize: collapsed ? 16 : 20,
            fontWeight: "bold",
          }}
        >
          {collapsed ? "R" : "🍽️ Restaurant"}
        </div>
      </div>

      {/* Menu de navigation */}
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        items={getMenuItems()}
        style={{ borderRight: 0 }}
      />
    </Sider>
  );
};

export default AppSidebar;
