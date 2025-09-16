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
} from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import { useForm } from "../hooks/useForm";
import { loginValidator } from "../utils/validation";
import { handleApiError } from "../utils/errorHandler";

const { Title, Text } = Typography;

const LoginPage = () => {
  const { auth } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("login");
  const [error, setError] = useState(null);

  // Redirection si déjà connecté
  useEffect(() => {
    if (auth.isAuthenticated) {
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [auth.isAuthenticated, navigate, location]);

  // Formulaire de connexion
  const loginForm = useForm(
    {
      username: "",
      password: "",
    },
    loginValidator
  );

  // Formulaire d'inscription
  const registerForm = useForm({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleLogin = async (values) => {
    try {
      setError(null);
      await auth.login(values);
      // Redirection automatique via useEffect
    } catch (error) {
      console.error("Erreur login:", error);
      setError(error.message || "Erreur de connexion");
    }
  };

  const handleRegister = async (values) => {
    try {
      setError(null);

      if (values.password !== values.confirmPassword) {
        setError("Les mots de passe ne correspondent pas");
        return;
      }

      const { confirmPassword, ...registerData } = values;
      await auth.register(registerData);
      // Redirection automatique via useEffect
    } catch (error) {
      console.error("Erreur inscription:", error);
      setError(error.message || "Erreur lors de l'inscription");
    }
  };

  const LoginForm = () => (
    <Form
      name="login"
      onFinish={loginForm.handleSubmit(handleLogin)}
      autoComplete="off"
      layout="vertical"
      size="large"
    >
      <Form.Item
        name="username"
        rules={[{ required: true, message: "Nom d'utilisateur requis" }]}
      >
        <Input
          prefix={<UserOutlined />}
          placeholder="Nom d'utilisateur"
          value={loginForm.values.username}
          onChange={loginForm.handleChange}
          onBlur={loginForm.handleBlur}
        />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          block
          loading={loginForm.isSubmitting}
        >
          Se connecter
        </Button>
      </Form.Item>
    </Form>
  );

  const RegisterForm = () => (
    <Form
      name="register"
      onFinish={registerForm.handleSubmit(handleRegister)}
      autoComplete="off"
      layout="vertical"
      size="large"
    >
      <Form.Item
        name="username"
        rules={[{ required: true, message: "Nom d'utilisateur requis" }]}
      >
        <Input
          prefix={<UserOutlined />}
          placeholder="Nom d'utilisateur"
          value={registerForm.values.username}
          onChange={registerForm.handleChange}
          onBlur={registerForm.handleBlur}
        />
      </Form.Item>

      <Form.Item
        name="email"
        rules={[
          { required: true, message: "Email requis" },
          { type: "email", message: "Email invalide" },
        ]}
      >
        <Input
          prefix={<MailOutlined />}
          placeholder="Email"
          value={registerForm.values.email}
          onChange={registerForm.handleChange}
          onBlur={registerForm.handleBlur}
        />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[{ required: true, message: "Mot de passe requis" }]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Mot de passe"
          value={registerForm.values.password}
          onChange={registerForm.handleChange}
          onBlur={registerForm.handleBlur}
        />
      </Form.Item>

      <Form.Item
        name="confirmPassword"
        rules={[{ required: true, message: "Confirmation requise" }]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Confirmer mot de passe"
          value={registerForm.values.confirmPassword}
          onChange={registerForm.handleChange}
          onBlur={registerForm.handleBlur}
        />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          block
          loading={registerForm.isSubmitting}
        >
          S'inscrire
        </Button>
      </Form.Item>
    </Form>
  );

  if (auth.loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Spin size="large" />
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
          boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🍽️</div>
          <Title level={2} style={{ margin: 0 }}>
            Restaurant Manager
          </Title>
          <Text type="secondary">
            Bienvenue ! Connectez-vous pour continuer
          </Text>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
            closable
            onClose={() => setError(null)}
          />
        )}

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          centered
          items={[
            {
              key: "login",
              label: "Connexion",
              children: <LoginForm />,
            },
            {
              key: "register",
              label: "Inscription",
              children: <RegisterForm />,
            },
          ]}
        />

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            En vous connectant, vous acceptez nos conditions d'utilisation
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
