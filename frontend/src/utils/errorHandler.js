import { notification } from "antd";

export const handleApiError = (error, customMessage = null) => {
  console.error("API Error:", error);

  let message = customMessage || "Une erreur est survenue";
  let description = "";

  if (error?.data?.error) {
    message = error.data.error;
    description = error.data.details?.map((d) => d.message).join(", ") || "";
  } else if (error?.message) {
    message = error.message;
  }

  // Afficher la notification d'erreur
  notification.error({
    message,
    description,
    placement: "topRight",
    duration: 5,
  });

  return { message, description };
};

export const handleNetworkError = () => {
  notification.error({
    message: "Problème de connexion",
    description: "Vérifiez votre connexion internet et réessayez.",
    placement: "topRight",
    duration: 5,
  });
};

export const handleValidationError = (validationErrors) => {
  const errorMessages = validationErrors
    .map((err) => `${err.field}: ${err.message}`)
    .join("\n");

  notification.error({
    message: "Erreurs de validation",
    description: errorMessages,
    placement: "topRight",
    duration: 7,
  });
};
