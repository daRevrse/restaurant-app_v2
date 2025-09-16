// frontend/src/components/common/AppSidebar.js - Version corrigée
import React, { useState } from "react";
import { Layout, Menu } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import {
  DashboardOutlined,
  MenuOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  TableOutlined,
  BarChartOutlined,
  CoffeeOutlined,
  HistoryOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { useApp } from "../../contexts/AppContext";
import { useResponsive } from "../../hooks/useResponsive";

const { Sider } = Layout;

const AppSidebar = ({ collapsed, onCollapse }) => {
  const { auth } = useApp();
  const { isMobile } = useResponsive();
  const navigate = useNavigate();
  const location = useLocation();

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
          },
          {
            key: "/cart",
            icon: <ShoppingCartOutlined />,
            label: "Panier",
          },
          {
            key: "/orders",
            icon: <ShoppingOutlined />,
            label: "Mes commandes",
          },
          {
            key: "/history",
            icon: <HistoryOutlined />,
            label: "Historique",
          },
        ];

      case "waiter":
        return [
          {
            key: "/waiter",
            icon: <DashboardOutlined />,
            label: "Dashboard",
          },
          {
            key: "/waiter/tables",
            icon: <TableOutlined />,
            label: "Gestion Tables",
          },
          {
            key: "/waiter/orders",
            icon: <ShoppingOutlined />,
            label: "Commandes",
          },
          {
            key: "/waiter/stats",
            icon: <BarChartOutlined />,
            label: "Statistiques",
          },
        ];

      case "kitchen":
        return [
          {
            key: "/kitchen",
            icon: <CoffeeOutlined />,
            label: "Commandes Cuisine",
          },
          {
            key: "/kitchen/ready",
            icon: <CheckCircleOutlined />,
            label: "Plats Prêts",
          },
          {
            key: "/kitchen/history",
            icon: <HistoryOutlined />,
            label: "Historique",
          },
        ];

      case "admin":
        return [
          {
            key: "/admin",
            icon: <DashboardOutlined />,
            label: "Dashboard",
          },
          {
            key: "menu-management",
            icon: <MenuOutlined />,
            label: "Gestion Menu",
            children: [
              {
                key: "/admin/categories",
                label: "Catégories",
              },
              {
                key: "/admin/dishes",
                label: "Plats",
              },
            ],
          },
          {
            key: "/admin/orders",
            icon: <ShoppingOutlined />,
            label: "Commandes",
          },
          {
            key: "/admin/tables",
            icon: <TableOutlined />,
            label: "Tables",
          },
          {
            key: "/admin/users",
            icon: <UserOutlined />,
            label: "Utilisateurs",
          },
          {
            key: "/admin/stats",
            icon: <BarChartOutlined />,
            label: "Statistiques",
          },
          {
            key: "/admin/settings",
            icon: <SettingOutlined />,
            label: "Paramètres",
          },
        ];

      default:
        return [];
    }
  };

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  // Déterminer la clé sélectionnée basée sur l'URL actuelle
  const getSelectedKey = () => {
    const pathname = location.pathname;

    // Pour les sous-menus admin
    if (
      pathname.includes("/admin/categories") ||
      pathname.includes("/admin/dishes")
    ) {
      return pathname;
    }

    return pathname;
  };

  const getOpenKeys = () => {
    const pathname = location.pathname;

    if (
      pathname.includes("/admin/categories") ||
      pathname.includes("/admin/dishes")
    ) {
      return ["menu-management"];
    }

    return [];
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      breakpoint="lg"
      collapsedWidth={isMobile ? 0 : 80}
      style={{
        background: "#fff",
        borderRight: "1px solid #f0f0f0",
      }}
    >
      {/* Logo/Brand */}
      <div
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: "1px solid #f0f0f0",
          background: "#1890ff",
        }}
      >
        {!collapsed ? (
          <div style={{ color: "#fff", fontWeight: "bold", fontSize: "16px" }}>
            Restaurant
          </div>
        ) : (
          <div style={{ color: "#fff", fontWeight: "bold", fontSize: "18px" }}>
            R
          </div>
        )}
      </div>

      {/* Menu de navigation */}
      <Menu
        theme="light"
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        defaultOpenKeys={getOpenKeys()}
        items={getMenuItems()}
        onClick={handleMenuClick}
        style={{ borderRight: 0, height: "calc(100vh - 64px)" }}
      />
    </Sider>
  );
};

export default AppSidebar;
