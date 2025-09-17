// frontend/src/pages/QRScannerPage.js - Version finale avec nouvelles routes
import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Typography,
  Button,
  Input,
  Space,
  Alert,
  Result,
  Divider,
  Spin,
  Modal,
} from "antd";
import {
  QrcodeOutlined,
  CameraOutlined,
  ArrowLeftOutlined,
  StopOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import * as tableService from "../services/tableService";

const { Title, Text } = Typography;

const QRScannerPage = () => {
  const [scannedData, setScannedData] = useState(null);
  const [manualInput, setManualInput] = useState("");
  const [error, setError] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { auth } = useApp();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  // Nettoyer les ressources au démontage
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setCameraActive(false);
  };

  const startCamera = async () => {
    try {
      setLoading(true);
      setError(null);

      // Demander l'accès à la caméra
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Caméra arrière si disponible
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);

        // Commencer le scan automatique
        startScanning();
      }
    } catch (error) {
      console.error("Erreur accès caméra:", error);
      setError("Impossible d'accéder à la caméra. Vérifiez les permissions.");
    } finally {
      setLoading(false);
    }
  };

  const startScanning = () => {
    // Scanner toutes les 500ms
    scanIntervalRef.current = setInterval(() => {
      scanQRCode();
    }, 500);
  };

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      // Ici, dans un vrai projet, vous utiliseriez une bibliothèque comme jsQR
      // Pour cette démo, on simule la détection
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

      // Simulation de détection QR (remplacez par jsQR.decode(imageData))
      let darkPixels = 0;
      for (let i = 0; i < imageData.data.length; i += 4) {
        const avg =
          (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) /
          3;
        if (avg < 100) darkPixels++;
      }

      // Si suffisamment de pixels sombres, simuler une détection
      if (darkPixels > imageData.data.length / 16) {
        handleQRDetection({
          tableNumber: "5",
          restaurantId: "restaurant_001",
          sessionId: `session_${Date.now()}`,
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      console.error("Erreur scan:", error);
    }
  };

  const handleQRDetection = (qrData) => {
    stopCamera();
    setScannedData(qrData);
    setError(null);
  };

  const validateTableAvailability = async (tableNumber) => {
    try {
      // Utiliser la nouvelle API pour valider la table
      await tableService.validateTableNumber(tableNumber);
      return true;
    } catch (error) {
      throw error;
    }
  };

  const handleManualInput = async () => {
    if (!manualInput.trim()) {
      setError("Veuillez entrer un numéro de table");
      return;
    }

    setLoading(true);
    try {
      // Valider que la table existe et est libre
      await validateTableAvailability(manualInput);

      const tableData = {
        tableNumber: parseInt(manualInput),
        restaurantId: "restaurant_001",
        sessionId: `manual_${Date.now()}`,
        timestamp: Date.now(),
      };

      setScannedData(tableData);
      setError(null);
    } catch (err) {
      setError(err.message || "Numéro de table invalide");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTable = async () => {
    if (scannedData) {
      try {
        setLoading(true);
        // Utiliser le service pour sauvegarder la session et valider
        const sessionData = await tableService.scanQRCode(scannedData);
        navigate(
          `/table-menu?table=${scannedData.tableNumber}&session=${scannedData.sessionId}`
        );
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRetry = () => {
    setScannedData(null);
    setError(null);
    setManualInput("");
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
          maxWidth: 500,
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
            {/* Caméra */}
            {cameraActive ? (
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    maxWidth: 300,
                    margin: "0 auto",
                    border: "2px solid #1890ff",
                    borderRadius: 8,
                    overflow: "hidden",
                  }}
                >
                  <video
                    ref={videoRef}
                    style={{
                      width: "100%",
                      height: "auto",
                      display: "block",
                    }}
                    playsInline
                    muted
                  />
                  <canvas ref={canvasRef} style={{ display: "none" }} />

                  {/* Overlay de scan */}
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: "80%",
                      height: "80%",
                      border: "2px solid #52c41a",
                      borderRadius: 8,
                      background: "transparent",
                      pointerEvents: "none",
                    }}
                  />
                </div>

                <Space style={{ marginTop: 12 }}>
                  <Button
                    type="danger"
                    icon={<StopOutlined />}
                    onClick={stopCamera}
                  >
                    Arrêter
                  </Button>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    Pointez vers le QR code de votre table
                  </Text>
                </Space>
              </div>
            ) : (
              <Button
                type="primary"
                size="large"
                icon={<CameraOutlined />}
                onClick={startCamera}
                loading={loading}
                block
              >
                {loading ? "Démarrage caméra..." : "Ouvrir la caméra"}
              </Button>
            )}

            <Divider>ou</Divider>

            {/* Saisie manuelle */}
            <Space.Compact style={{ width: "100%" }}>
              <Input
                placeholder="Numéro de table"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onPressEnter={handleManualInput}
                type="number"
                min={1}
                disabled={loading}
              />
              <Button
                type="primary"
                onClick={handleManualInput}
                loading={loading}
              >
                Valider
              </Button>
            </Space.Compact>

            {/* Info pour utilisateurs non connectés */}
            {!auth.isAuthenticated && (
              <div style={{ marginTop: 24, textAlign: "left" }}>
                <Alert
                  message="Accès invité"
                  description={
                    <div>
                      <p>
                        Vous naviguez en mode invité. Vous pouvez aussi vous
                        connecter pour accéder à des fonctionnalités
                        supplémentaires :
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
            title="QR Code détecté !"
            subTitle={
              <div>
                <p>
                  <strong>Table {scannedData.tableNumber}</strong>
                </p>
                <Text type="secondary">
                  Session ID: {scannedData.sessionId.slice(0, 8)}...
                </Text>
              </div>
            }
            extra={[
              <Button
                type="primary"
                key="join"
                onClick={handleJoinTable}
                loading={loading}
                size="large"
              >
                Accéder au menu
              </Button>,
              <Button
                key="retry"
                icon={<ReloadOutlined />}
                onClick={handleRetry}
              >
                Scanner à nouveau
              </Button>,
            ]}
          />
        )}

        <div style={{ marginTop: 24, fontSize: "12px", color: "#8c8c8c" }}>
          <Text type="secondary">
            💡 Pour tester : entrez un numéro de table existant ou utilisez la
            caméra
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default QRScannerPage;
