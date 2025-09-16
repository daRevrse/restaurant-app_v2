export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
  },
  MENU: {
    CATEGORIES: "/categories",
    DISHES: "/dishes",
  },
  TABLES: {
    LIST: "/tables",
    SESSIONS: "/tables/session",
  },
  ORDERS: {
    CREATE: "/orders",
    BY_STATUS: "/orders/status",
    BY_TABLE: "/orders/table",
    UPDATE_STATUS: "/orders/:id/status",
  },
  USERS: {
    PROFILE: "/users/profile",
    LIST: "/users",
  },
};

export const ORDER_STATUSES = [
  { value: "pending", label: "En attente", color: "orange" },
  { value: "confirmed", label: "Confirmée", color: "blue" },
  { value: "preparing", label: "En préparation", color: "purple" },
  { value: "ready", label: "Prête", color: "green" },
  { value: "served", label: "Servie", color: "cyan" },
  { value: "completed", label: "Terminée", color: "gray" },
  { value: "cancelled", label: "Annulée", color: "red" },
];

export const TABLE_STATUSES = [
  { value: "free", label: "Libre", color: "green" },
  { value: "occupied", label: "Occupée", color: "blue" },
  { value: "reserved", label: "Réservée", color: "orange" },
  { value: "cleaning", label: "Nettoyage", color: "purple" },
  { value: "out_of_service", label: "Hors service", color: "red" },
];

export const USER_ROLES = [
  { value: "customer", label: "Client" },
  { value: "waiter", label: "Serveur" },
  { value: "kitchen", label: "Cuisine" },
  { value: "admin", label: "Administrateur" },
];

export const SOCKET_EVENTS = {
  // Événements reçus
  NEW_ORDER: "newOrder",
  ORDER_STATUS_UPDATE: "orderStatusUpdate",
  ORDER_READY: "orderReady",
  TABLE_STATUS_UPDATE: "tableStatusUpdate",

  // Événements émis
  AUTHENTICATE: "authenticate",
  JOIN_TABLE: "joinTable",
  ORDER_PLACED: "orderPlaced",
};

export const LOCAL_STORAGE_KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  CART: "cart",
  TABLE_SESSION: "tableSession",
  USER_PREFERENCES: "userPreferences",
};

export const NOTIFICATION_TYPES = {
  SUCCESS: "success",
  INFO: "info",
  WARNING: "warning",
  ERROR: "error",
};
