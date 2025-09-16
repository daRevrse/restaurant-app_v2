export const formatCurrency = (amount, currency = "XOF") => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

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
