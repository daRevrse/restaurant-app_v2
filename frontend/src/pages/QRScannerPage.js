import React, { useState, useEffect } from "react";
import { Card, Button, Alert, Typography, Space, Modal, Result } from "antd";
import { CameraOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { scanQRCode } from "../services/tableService";

const { Title, Text } = Typography;

const QRScannerPage = () => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [tableInfo, setTableInfo] = useState(null);
  const navigate = useNavigate();

  // Simulation du scan QR (remplacez par une vraie bibliothèque de scan)
  const handleScan = async () => {
    setScanning(true);
    setError(null);

    try {
      // Simulation d'un scan QR - remplacez par une vraie implémentation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Données QR simulées
      const qrData = {
        tableNumber: 5,
        sessionId: "session-123",
        restaurantId: "restaurant_001",
        timestamp: Date.now(),
      };

      const sessionData = await scanQRCode(JSON.stringify(qrData));
      setTableInfo(sessionData);
      setSuccess(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setScanning(false);
    }
  };

  const handleContinue = () => {
    navigate("/", { replace: true });
  };

  if (success && tableInfo) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: 20,
        }}
      >
        <Card style={{ width: "100%", maxWidth: 400, textAlign: "center" }}>
          <Result
            status="success"
            title="Table connectée !"
            subTitle={
              <div>
                <Text>Vous êtes maintenant connecté à la</Text>
                <br />
                <Text strong style={{ fontSize: 18 }}>
                  Table n°{tableInfo.tableNumber}
                </Text>
                <br />
                <Text type="secondary">
                  Vous pouvez maintenant consulter le menu et passer commande
                </Text>
              </div>
            }
            extra={[
              <Button type="primary" size="large" onClick={handleContinue}>
                Voir le menu
              </Button>,
            ]}
          />
        </Card>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: 20,
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 400,
          textAlign: "center",
        }}
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📱</div>
            <Title level={2}>Scanner QR Code</Title>
            <Text type="secondary">
              Scannez le QR code de votre table pour commencer
            </Text>
          </div>

          {error && (
            <Alert
              message="Erreur de scan"
              description={error}
              type="error"
              showIcon
              action={
                <Button size="small" onClick={() => setError(null)}>
                  Réessayer
                </Button>
              }
            />
          )}

          <div
            style={{
              width: 200,
              height: 200,
              border: "2px dashed #d9d9d9",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
              backgroundColor: scanning ? "#f0f0f0" : "transparent",
            }}
          >
            {scanning ? (
              <div>
                <CameraOutlined style={{ fontSize: 48, color: "#1890ff" }} />
                <div>Scan en cours...</div>
              </div>
            ) : (
              <div style={{ color: "#999" }}>
                <CameraOutlined style={{ fontSize: 48 }} />
                <div>Zone de scan</div>
              </div>
            )}
          </div>

          <Space direction="vertical" style={{ width: "100%" }}>
            <Button
              type="primary"
              size="large"
              icon={<CameraOutlined />}
              onClick={handleScan}
              loading={scanning}
              block
            >
              {scanning ? "Scan en cours..." : "Démarrer le scan"}
            </Button>

            <Button type="link" onClick={() => navigate("/login")}>
              Se connecter avec un compte
            </Button>
          </Space>

          <Text type="secondary" style={{ fontSize: 12 }}>
            Pointez votre caméra vers le QR code de la table
          </Text>
        </Space>
      </Card>
    </div>
  );
};

export default QRScannerPage;
