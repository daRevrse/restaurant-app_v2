import React, { createContext, useContext } from "react";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { useSocket } from "../hooks/useSocket";
import { ConfigProvider, notification } from "antd";
import frFR from "antd/locale/fr_FR";

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp doit être utilisé dans AppProvider");
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const auth = useAuth();
  const cart = useCart();
  const socket = useSocket();

  // Configuration des notifications globales
  notification.config({
    placement: "topRight",
    duration: 4.5,
    rtl: false,
  });

  const value = {
    auth,
    cart,
    socket,
  };

  return (
    <AppContext.Provider value={value}>
      <ConfigProvider
        locale={frFR}
        theme={{
          token: {
            colorPrimary: "#3772F1",
            borderRadius: 8,
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial',
          },
        }}
      >
        {children}
      </ConfigProvider>
    </AppContext.Provider>
  );
};
