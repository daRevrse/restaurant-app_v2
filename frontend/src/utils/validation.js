export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validatePhone = (phone) => {
  const phoneRegex = /^(\+\d{1,3}[- ]?)?\d{8,14}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};

export const validateRequired = (value, fieldName = "Ce champ") => {
  if (!value || (typeof value === "string" && !value.trim())) {
    return `${fieldName} est requis`;
  }
  return null;
};

export const validateMinLength = (value, minLength, fieldName = "Ce champ") => {
  if (value && value.length < minLength) {
    return `${fieldName} doit contenir au moins ${minLength} caractères`;
  }
  return null;
};

export const validateMaxLength = (value, maxLength, fieldName = "Ce champ") => {
  if (value && value.length > maxLength) {
    return `${fieldName} ne peut pas dépasser ${maxLength} caractères`;
  }
  return null;
};

export const validateNumber = (value, fieldName = "Ce champ") => {
  if (value && isNaN(Number(value))) {
    return `${fieldName} doit être un nombre valide`;
  }
  return null;
};

export const validatePositiveNumber = (value, fieldName = "Ce champ") => {
  const numberError = validateNumber(value, fieldName);
  if (numberError) return numberError;

  if (value && Number(value) <= 0) {
    return `${fieldName} doit être un nombre positif`;
  }
  return null;
};

// Validateur composite pour les formulaires
export const createValidator = (rules) => {
  return (values) => {
    const errors = {};

    Object.keys(rules).forEach((field) => {
      const fieldRules = Array.isArray(rules[field])
        ? rules[field]
        : [rules[field]];
      const fieldValue = values[field];

      for (const rule of fieldRules) {
        const error = rule(fieldValue);
        if (error) {
          errors[field] = error;
          break; // Arrêter à la première erreur
        }
      }
    });

    return errors;
  };
};

// Exemple d'utilisation du validateur
export const loginValidator = createValidator({
  username: [
    (value) => validateRequired(value, "Nom d'utilisateur"),
    (value) => validateMinLength(value, 3, "Nom d'utilisateur"),
  ],
  password: [
    (value) => validateRequired(value, "Mot de passe"),
    (value) => validateMinLength(value, 6, "Mot de passe"),
  ],
});

export const dishValidator = createValidator({
  name: [
    (value) => validateRequired(value, "Nom du plat"),
    (value) => validateMinLength(value, 2, "Nom du plat"),
    (value) => validateMaxLength(value, 100, "Nom du plat"),
  ],
  price: [
    (value) => validateRequired(value, "Prix"),
    (value) => validatePositiveNumber(value, "Prix"),
  ],
  category_id: [(value) => validateRequired(value, "Catégorie")],
});
