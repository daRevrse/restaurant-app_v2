// frontend/src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import { ConfigProvider } from "antd";
import frFR from "antd/locale/fr_FR";
import App from "./App";
import "./index.css";

// Configuration globale d'Ant Design
const theme = {
  token: {
    colorPrimary: "#1890ff",
    borderRadius: 6,
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  components: {
    Layout: {
      headerBg: "#fff",
      siderBg: "#fff",
    },
    Menu: {
      itemBg: "transparent",
      itemSelectedBg: "#e6f7ff",
      itemHoverBg: "#f0f0f0",
    },
  },
};

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <ConfigProvider
      locale={frFR}
      theme={theme}
      button={{ autoInsertSpace: false }}
    >
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
