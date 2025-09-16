// frontend/src/pages/LoginPage.js - Version complète
import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Space,
  Tabs,
  Alert,
  Spin,
  Row,
  Col,
} from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import { useForm } from "../hooks/useForm";
import { loginValidator, registerValidator } from "../utils/validation";
import { handleApiError } from "../utils/errorHandler";

const { Title, Text } = Typography;

const LoginPage = () => {
  const { auth } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("login");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Redirection si déjà connecté
  useEffect(() => {
    if (auth.isAuthenticated) {
      const from =
        location.state?.from?.pathname || getRoleBasedRedirect(auth.user?.role);
      navigate(from, { replace: true });
    }
  }, [auth.isAuthenticated, navigate, location, auth.user]);

  // Fonction pour redirection basée sur le rôle
  const getRoleBasedRedirect = (role) => {
    switch (role) {
      case "admin":
        return "/admin";
      case "waiter":
        return "/waiter";
      case "kitchen":
        return "/kitchen";
      case "customer":
      default:
        return "/";
    }
  };

  // Formulaire de connexion
  const loginForm = useForm(
    {
      username: "",
      password: "",
    },
    loginValidator
  );

  // Formulaire d'inscription
  const registerForm = useForm(
    {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    registerValidator
  );

  const handleLogin = async () => {
    if (!loginForm.validate()) return;

    setLoading(true);
    setError(null);

    try {
      await auth.login(loginForm.values);
      // Redirection gérée par useEffect
    } catch (error) {
      console.error("Erreur login:", error);
      setError(error.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!registerForm.validate()) return;

    if (registerForm.values.password !== registerForm.values.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { confirmPassword, ...registerData } = registerForm.values;
      await auth.register(registerData);
      // Redirection gérée par useEffect
    } catch (error) {
      console.error("Erreur inscription:", error);
      setError(error.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  // Comptes de démonstration
  const demoAccounts = [
    { username: "admin", password: "admin123", role: "Administrateur" },
    { username: "waiter1", password: "waiter123", role: "Serveur" },
    { username: "kitchen1", password: "kitchen123", role: "Cuisine" },
    { username: "customer1", password: "customer123", role: "Client" },
  ];

  const handleDemoLogin = (account) => {
    loginForm.setValues({
      username: account.username,
      password: account.password,
    });
  };

  const tabItems = [
    {
      key: "login",
      label: "Connexion",
      children: (
        <Form layout="vertical" onFinish={handleLogin}>
          <Form.Item
            label="Nom d'utilisateur"
            validateStatus={loginForm.errors.username ? "error" : ""}
            help={loginForm.errors.username}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Entrez votre nom d'utilisateur"
              value={loginForm.values.username}
              onChange={(e) =>
                loginForm.handleChange("username", e.target.value)
              }
              onBlur={() => loginForm.handleBlur("username")}
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Mot de passe"
            validateStatus={loginForm.errors.password ? "error" : ""}
            help={loginForm.errors.password}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Entrez votre mot de passe"
              value={loginForm.values.password}
              onChange={(e) =>
                loginForm.handleChange("password", e.target.value)
              }
              onBlur={() => loginForm.handleBlur("password")}
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              block
            >
              Se connecter
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: "register",
      label: "Inscription",
      children: (
        <Form layout="vertical" onFinish={handleRegister}>
          <Form.Item
            label="Nom d'utilisateur"
            validateStatus={registerForm.errors.username ? "error" : ""}
            help={registerForm.errors.username}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Choisissez un nom d'utilisateur"
              value={registerForm.values.username}
              onChange={(e) =>
                registerForm.handleChange("username", e.target.value)
              }
              onBlur={() => registerForm.handleBlur("username")}
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Email"
            validateStatus={registerForm.errors.email ? "error" : ""}
            help={registerForm.errors.email}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Entrez votre email"
              value={registerForm.values.email}
              onChange={(e) =>
                registerForm.handleChange("email", e.target.value)
              }
              onBlur={() => registerForm.handleBlur("email")}
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Mot de passe"
            validateStatus={registerForm.errors.password ? "error" : ""}
            help={registerForm.errors.password}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Choisissez un mot de passe"
              value={registerForm.values.password}
              onChange={(e) =>
                registerForm.handleChange("password", e.target.value)
              }
              onBlur={() => registerForm.handleBlur("password")}
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Confirmer le mot de passe"
            validateStatus={registerForm.errors.confirmPassword ? "error" : ""}
            help={registerForm.errors.confirmPassword}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirmez votre mot de passe"
              value={registerForm.values.confirmPassword}
              onChange={(e) =>
                registerForm.handleChange("confirmPassword", e.target.value)
              }
              onBlur={() => registerForm.handleBlur("confirmPassword")}
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              block
            >
              S'inscrire
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ];

  if (auth.loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spin size="large" tip="Vérification de l'authentification..." />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <Row gutter={[32, 32]} style={{ width: "100%", maxWidth: "1200px" }}>
        <Col xs={24} lg={12}>
          <Card
            style={{
              width: "100%",
              maxWidth: 400,
              margin: "0 auto",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <Title level={2} style={{ color: "#1890ff", marginBottom: 8 }}>
                🏪 Restaurant
              </Title>
              <Text type="secondary">Système de gestion de restaurant</Text>
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

            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={tabItems}
              centered
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="Comptes de démonstration"
            style={{
              width: "100%",
              maxWidth: 400,
              margin: "0 auto",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              <Text type="secondary">
                Utilisez ces comptes pour tester l'application :
              </Text>

              {demoAccounts.map((account, index) => (
                <Card
                  key={index}
                  size="small"
                  style={{ cursor: "pointer" }}
                  hoverable
                  onClick={() => handleDemoLogin(account)}
                >
                  <Space direction="vertical" size={0}>
                    <Text strong>{account.role}</Text>
                    <Text code>{account.username}</Text>
                    <Text type="secondary">
                      Mot de passe: {account.password}
                    </Text>
                  </Space>
                </Card>
              ))}

              <Alert
                message="Cliquez sur un compte pour remplir automatiquement le formulaire"
                type="info"
                showIcon
                style={{ marginTop: 16 }}
              />
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default LoginPage;
