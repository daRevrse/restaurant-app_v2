export const API_ENDPOINTS = {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
    },
    USERS: {
      PROFILE: '/users/profile',
      LIST: '/users',
    },
    CATEGORIES: {
      LIST: '/categories',
      CREATE: '/categories',
      UPDATE: (id) => `/categories/${id}`,
      DELETE: (id) => `/categories/${id}`,
    },
    DISHES: {
      LIST: '/dishes',
      CREATE: '/dishes',
      UPDATE: (id) => `/dishes/${id}`,
      DELETE: (id) => `/dishes/${id}`,
    },
    ORDERS: {
      LIST: '/orders',
      CREATE: '/orders',
      UPDATE: (id) => `/orders/${id}`,
      UPDATE_STATUS: (id) => `/orders/${id}/status`,
    },
    TABLES: {
      LIST: '/tables',
      CREATE: '/tables',
      UPDATE: (id) => `/tables/${id}`,
      UPDATE_STATUS: (id) => `/tables/${id}/status`,
    },
  };
  
  export const USER_ROLES = {
    ADMIN: 'admin',
    WAITER: 'waiter',
    KITCHEN: 'kitchen',
    CUSTOMER: 'customer',
  };
  
  export const ORDER_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PREPARING: 'preparing',
    READY: 'ready',
    SERVED: 'served',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  };
  
  export const TABLE_STATUS = {
    FREE: 'free',
    OCCUPIED: 'occupied',
    RESERVED: 'reserved',
    CLEANING: 'cleaning',
    OUT_OF_SERVICE: 'out_of_service',
  };
  
  export const PAYMENT_METHODS = {
    CASH: 'cash',
    CARD: 'card',
    MOBILE_MONEY: 'mobile_money',
    BANK_TRANSFER: 'bank_transfer',
  };
  
  export const NOTIFICATION_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
  };
  
  // Configuration générale
  export const APP_CONFIG = {
    API_URL: process.env.REACT_APP_API_URL || '/api',
    SOCKET_URL: process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000',
    UPLOAD_MAX_SIZE: 5 * 1024 * 1024, // 5MB
    PAGINATION_SIZE: 10,
    DEBOUNCE_DELAY: 300,
  };