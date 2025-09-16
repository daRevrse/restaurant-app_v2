// frontend/src/pages/QRScannerPage.js
import React, { useState } from "react";
import {
  Card,
  Typography,
  Button,
  Input,
  Space,
  Alert,
  Result,
  Divider,
} from "antd";
import {
  QrcodeOutlined,
  CameraOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useApp } from "../contexts/AppContext";

const { Title, Text } = Typography;

const QRScannerPage = () => {
  const [scannedData, setScannedData] = useState(null);
  const [manualInput, setManualInput] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { auth } = useApp();

  // Simuler le scan d'un QR code
  const handleManualInput = () => {
    if (!manualInput.trim()) {
      setError("Veuillez entrer un code de table");
      return;
    }

    try {
      // Simuler la validation du QR code
      const tableData = {
        tableNumber: manualInput,
        restaurantId: "restaurant_001",
        sessionId: `session_${Date.now()}`,
        timestamp: Date.now(),
      };

      setScannedData(tableData);
      setError(null);
    } catch (err) {
      setError("Code invalide");
    }
  };

  const handleJoinTable = () => {
    if (scannedData) {
      // Rediriger vers le menu avec les infos de table
      navigate(
        `/?table=${scannedData.tableNumber}&session=${scannedData.sessionId}`
      );
    }
  };

  const handleStartCamera = () => {
    // Pour l'instant, simuler un scan réussi
    const mockQRData = {
      tableNumber: "5",
      restaurantId: "restaurant_001",
      sessionId: `session_${Date.now()}`,
      timestamp: Date.now(),
    };

    setTimeout(() => {
      setScannedData(mockQRData);
      setError(null);
    }, 1000);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f0f2f5",
        padding: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 400,
          textAlign: "center",
        }}
      >
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={{ position: "absolute", top: 16, left: 16 }}
        />

        <div style={{ marginBottom: 24 }}>
          <QrcodeOutlined style={{ fontSize: 48, color: "#1890ff" }} />
          <Title level={2} style={{ marginTop: 16 }}>
            Scanner QR Code
          </Title>
          <Text type="secondary">
            Scannez le QR code sur votre table pour commencer à commander
          </Text>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            style={{ marginBottom: 16 }}
            closable
            onClose={() => setError(null)}
          />
        )}

        {!scannedData ? (
          <Space direction="vertical" style={{ width: "100%" }}>
            <Button
              type="primary"
              size="large"
              icon={<CameraOutlined />}
              onClick={handleStartCamera}
              block
            >
              Ouvrir la caméra
            </Button>

            <Divider>ou</Divider>

            <Space.Compact style={{ width: "100%" }}>
              <Input
                placeholder="Entrer le numéro de table"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onPressEnter={handleManualInput}
              />
              <Button type="primary" onClick={handleManualInput}>
                Valider
              </Button>
            </Space.Compact>

            {!auth.isAuthenticated && (
              <div style={{ marginTop: 24, textAlign: "left" }}>
                <Alert
                  message="Info"
                  description={
                    <div>
                      <p>
                        Vous pouvez aussi vous connecter pour accéder
                        directement au menu :
                      </p>
                      <Button type="link" onClick={() => navigate("/login")}>
                        Se connecter
                      </Button>
                    </div>
                  }
                  type="info"
                  showIcon
                />
              </div>
            )}
          </Space>
        ) : (
          <Result
            status="success"
            title="QR Code scanné !"
            subTitle={`Table ${scannedData.tableNumber} - Restaurant`}
            extra={[
              <Button type="primary" key="join" onClick={handleJoinTable}>
                Voir le menu
              </Button>,
              <Button key="retry" onClick={() => setScannedData(null)}>
                Scanner à nouveau
              </Button>,
            ]}
          />
        )}

        <div style={{ marginTop: 24, fontSize: "12px", color: "#8c8c8c" }}>
          <Text type="secondary">
            Astuce : Entrez simplement un numéro (ex: 5) pour tester
            l'application
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default QRScannerPage;
