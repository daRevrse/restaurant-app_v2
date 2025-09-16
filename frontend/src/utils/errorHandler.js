import { message } from 'antd';

export const handleApiError = (error) => {
  console.error('API Error:', error);

  if (error.response) {
    // Erreur de réponse du serveur
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        message.error(data.error || 'Données invalides');
        break;
      case 401:
        message.error('Session expirée, veuillez vous reconnecter');
        break;
      case 403:
        message.error('Accès non autorisé');
        break;
      case 404:
        message.error('Ressource non trouvée');
        break;
      case 409:
        message.error(data.error || 'Conflit de données');
        break;
      case 500:
        message.error('Erreur serveur');
        break;
      default:
        message.error(data.error || 'Une erreur est survenue');
    }

    return data.error || 'Une erreur est survenue';
  } else if (error.request) {
    // Erreur réseau
    message.error('Problème de connexion réseau');
    return 'Problème de connexion réseau';
  } else {
    // Autre erreur
    message.error('Une erreur inattendue s\'est produite');
    return 'Une erreur inattendue s\'est produite';
  }
};

export const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF', // Franc CFA pour le Togo
    minimumFractionDigits: 0,
  }).format(price);
};

export const formatDate = (dateString) => {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
};

export const getStatusColor = (status) => {
  const statusColors = {
    pending: 'orange',
    confirmed: 'blue',
    preparing: 'purple',
    ready: 'cyan',
    served: 'green',
    completed: 'green',
    cancelled: 'red',
  };

  return statusColors[status] || 'default';
};

export const getStatusText = (status) => {
  const statusTexts = {
    pending: 'En attente',
    confirmed: 'Confirmée',
    preparing: 'En préparation',
    ready: 'Prête',
    served: 'Servie',
    completed: 'Terminée',
    cancelled: 'Annulée',
  };

  return statusTexts[status] || status;
};