// frontend/src/pages/TableMenuPage.js
import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Typography,
  Alert,
  Spin,
  Button,
  Space,
  Badge,
  Affix,
} from "antd";
import {
  ShoppingCartOutlined,
  QrcodeOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import { useMenu } from "../hooks/useMenu";
import SearchBar from "../components/customer/SearchBar";
import CategoryFilter from "../components/customer/CategoryFilter";
import DishGrid from "../components/customer/DishGrid";
import CartSidebar from "../components/customer/CartSidebar";
import TableSessionInfo from "../components/customer/TableSessionInfo";

const { Title, Text } = Typography;
const { Content } = Layout;

const TableMenuPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { cart } = useApp();
  const { categories, dishes, loading } = useMenu();
  const [tableSession, setTableSession] = useState(null);
  const [cartVisible, setCartVisible] = useState(false);

  // Initialiser la session de table depuis les paramètres URL ou localStorage
  useEffect(() => {
    const tableNumber = searchParams.get("table");
    const sessionId = searchParams.get("session");

    if (tableNumber && sessionId) {
      // Nouvelle session depuis QR code
      const session = {
        tableId: `table_${tableNumber}`,
        tableNumber: tableNumber,
        sessionId: sessionId,
        timestamp: Date.now(),
      };

      localStorage.setItem("tableSession", JSON.stringify(session));
      setTableSession(session);
    } else {
      // Récupérer session existante
      const savedSession = localStorage.getItem("tableSession");
      if (savedSession) {
        try {
          const session = JSON.parse(savedSession);
          setTableSession(session);
        } catch (error) {
          console.error("Erreur parsing session:", error);
          navigate("/qr-scanner");
        }
      } else {
        navigate("/qr-scanner");
      }
    }
  }, [searchParams, navigate]);

  const handleBackToScanner = () => {
    localStorage.removeItem("tableSession");
    navigate("/qr-scanner");
  };

  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spin size="large" tip="Chargement du menu..." />
      </div>
    );
  }

  if (!tableSession) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Card>
          <Alert
            message="Session de table requise"
            description="Veuillez scanner le QR code de votre table"
            type="warning"
            action={
              <Button
                size="small"
                icon={<QrcodeOutlined />}
                onClick={() => navigate("/qr-scanner")}
              >
                Scanner QR Code
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh", background: "#f0f2f5" }}>
      {/* Header avec info de table */}
      <Affix offsetTop={0}>
        <div
          style={{
            background: "#fff",
            borderBottom: "1px solid #f0f0f0",
            padding: "16px 24px",
          }}
        >
          <Space>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={handleBackToScanner}
            >
              Retour
            </Button>
            <TableSessionInfo session={tableSession} />
          </Space>
        </div>
      </Affix>

      <Content style={{ padding: "24px 24px 100px" }}>
        {/* Header de bienvenue */}
        <Card style={{ marginBottom: 24 }}>
          <Title level={2}>
            Bienvenue à votre table {tableSession.tableNumber} ! 🍽️
          </Title>
          <Text type="secondary">
            Découvrez notre délicieux menu et passez votre commande directement
            depuis votre table.
          </Text>
        </Card>

        {/* Barre de recherche */}
        <Card style={{ marginBottom: 24 }}>
          <SearchBar />
        </Card>

        {/* Filtre par catégorie */}
        <Card style={{ marginBottom: 24 }}>
          <CategoryFilter categories={categories} />
        </Card>

        {/* Grille des plats */}
        <DishGrid dishes={dishes} />
      </Content>

      {/* Bouton flottant du panier */}
      <Affix offsetBottom={20}>
        <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 1000 }}>
          <Badge count={cart.totalItems} showZero>
            <Button
              type="primary"
              size="large"
              icon={<ShoppingCartOutlined />}
              onClick={() => setCartVisible(true)}
              style={{
                height: 56,
                width: 56,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              }}
            />
          </Badge>
        </div>
      </Affix>

      {/* Sidebar du panier */}
      <CartSidebar
        visible={cartVisible}
        onClose={() => setCartVisible(false)}
        tableSession={tableSession}
      />
    </Layout>
  );
};

export default TableMenuPage;
