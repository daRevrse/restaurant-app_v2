import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Result, Button } from "antd";
import { useApp } from "../../contexts/AppContext";

const ProtectedRoute = ({ children, roles = [] }) => {
  const { auth } = useApp();
  const location = useLocation();

  // Pas encore chargé
  if (auth.loading) {
    return <div>Chargement...</div>;
  }

  // Non authentifié
  if (!auth.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Vérification des rôles
  if (roles.length > 0 && !roles.includes(auth.user?.role)) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="Désolé, vous n'avez pas l'autorisation d'accéder à cette page."
        extra={
          <Button type="primary" onClick={() => window.history.back()}>
            Retour
          </Button>
        }
      />
    );
  }

  return children;
};

export default ProtectedRoute;
