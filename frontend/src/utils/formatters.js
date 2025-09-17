// export const formatCurrency = (amount, currency = "XOF") => {
//   return new Intl.NumberFormat("fr-FR", {
//     style: "currency",
//     currency: currency,
//     minimumFractionDigits: 0,
//   }).format(amount);
// };

// export const formatDate = (date) => {
//   return new Intl.DateTimeFormat("fr-FR", {
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//   }).format(new Date(date));
// };

export const formatOrderStatus = (status) => {
  const statusLabels = {
    pending: "En attente",
    confirmed: "Confirmée",
    preparing: "En préparation",
    ready: "Prête",
    served: "Servie",
    completed: "Terminée",
    cancelled: "Annulée",
  };

  return statusLabels[status] || status;
};

export const getStatusColor = (status) => {
  const statusColors = {
    pending: "orange",
    confirmed: "blue",
    preparing: "purple",
    ready: "green",
    served: "cyan",
    completed: "gray",
    cancelled: "red",
  };

  return statusColors[status] || "default";
};

export const formatTableStatus = (status) => {
  const statusLabels = {
    free: "Libre",
    occupied: "Occupée",
    reserved: "Réservée",
    cleaning: "Nettoyage",
    out_of_service: "Hors service",
  };

  return statusLabels[status] || status;
};

// frontend/src/utils/formatters.js
/**
 * Formatter le prix en devise locale (FCFA pour le Togo)
 */
export const formatCurrency = (amount, currency = "XOF") => {
  if (typeof amount !== "number") {
    amount = parseFloat(amount) || 0;
  }

  // Pour les FCFA (pas de décimales)
  if (currency === "XOF") {
    return new Intl.NumberFormat("fr-TG", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  // Pour autres devises
  return new Intl.NumberFormat("fr-TG", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

/**
 * Formatter une date/heure
 */
export const formatDateTime = (date, options = {}) => {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  const defaultOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  };

  return new Intl.DateTimeFormat("fr-TG", defaultOptions).format(dateObj);
};

/**
 * Formatter une date seulement
 */
export const formatDate = (date) => {
  return formatDateTime(date, {
    hour: undefined,
    minute: undefined,
  });
};

/**
 * Formatter une heure seulement
 */
export const formatTime = (date) => {
  return formatDateTime(date, {
    year: undefined,
    month: undefined,
    day: undefined,
  });
};

/**
 * Formatter une durée en minutes
 */
export const formatDuration = (minutes) => {
  if (!minutes || minutes <= 0) return "0 min";

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}min`;
};

/**
 * Formatter un numéro de téléphone
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return "";

  // Supprimer tous les caractères non numériques
  const cleaned = phone.replace(/\D/g, "");

  // Format pour Togo (+228)
  if (cleaned.startsWith("228") && cleaned.length === 11) {
    return `+228 ${cleaned.slice(3, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(
      7,
      9
    )} ${cleaned.slice(9)}`;
  }

  // Format pour numéro local (8 chiffres)
  if (cleaned.length === 8) {
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(
      4,
      6
    )} ${cleaned.slice(6)}`;
  }

  // Retourner tel quel si format non reconnu
  return phone;
};

/**
 * Formatter un statut pour affichage
 */
export const formatStatus = (status) => {
  const statusLabels = {
    // Statuts de commande
    pending: "En attente",
    confirmed: "Confirmée",
    preparing: "En préparation",
    ready: "Prête",
    served: "Servie",
    cancelled: "Annulée",

    // Statuts de table
    free: "Libre",
    occupied: "Occupée",
    reserved: "Réservée",
    cleaning: "Nettoyage",
    out_of_service: "Hors service",

    // Statuts de paiement
    unpaid: "Non payée",
    paid: "Payée",
    refunded: "Remboursée",

    // Statuts généraux
    active: "Actif",
    inactive: "Inactif",
    enabled: "Activé",
    disabled: "Désactivé",
  };

  return statusLabels[status] || status;
};

/**
 * Formatter un nom pour l'affichage (première lettre en majuscule)
 */
export const formatName = (name) => {
  if (!name) return "";

  return name
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/**
 * Formatter un pourcentage
 */
export const formatPercentage = (value, decimals = 1) => {
  if (typeof value !== "number") {
    value = parseFloat(value) || 0;
  }

  return `${value.toFixed(decimals)}%`;
};

/**
 * Formatter un nombre avec séparateurs de milliers
 */
export const formatNumber = (number) => {
  if (typeof number !== "number") {
    number = parseFloat(number) || 0;
  }

  return new Intl.NumberFormat("fr-TG").format(number);
};

/**
 * Formatter une taille de fichier
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Formatter une distance
 */
export const formatDistance = (meters) => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }

  return `${(meters / 1000).toFixed(1)} km`;
};

/**
 * Raccourcir un texte avec ellipse
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) {
    return text;
  }

  return `${text.substring(0, maxLength).trim()}...`;
};

/**
 * Formatter un temps relatif (il y a X minutes)
 */
export const formatRelativeTime = (date) => {
  if (!date) return "";

  const now = new Date();
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const diffMs = now - dateObj;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return "À l'instant";
  if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `Il y a ${diffHours}h`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `Il y a ${diffDays}j`;

  // Pour les dates plus anciennes, afficher la date complète
  return formatDate(dateObj);
};
