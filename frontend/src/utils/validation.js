export const loginValidator = (values) => {
    const errors = {};
  
    if (!values.username) {
      errors.username = 'Le nom d\'utilisateur est requis';
    } else if (values.username.length < 3) {
      errors.username = 'Le nom d\'utilisateur doit contenir au moins 3 caractères';
    }
  
    if (!values.password) {
      errors.password = 'Le mot de passe est requis';
    } else if (values.password.length < 6) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }
  
    return errors;
  };
  
  export const registerValidator = (values) => {
    const errors = {};
  
    if (!values.username) {
      errors.username = 'Le nom d\'utilisateur est requis';
    } else if (values.username.length < 3) {
      errors.username = 'Le nom d\'utilisateur doit contenir au moins 3 caractères';
    }
  
    if (!values.email) {
      errors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      errors.email = 'L\'email n\'est pas valide';
    }
  
    if (!values.password) {
      errors.password = 'Le mot de passe est requis';
    } else if (values.password.length < 6) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }
  
    if (!values.confirmPassword) {
      errors.confirmPassword = 'Veuillez confirmer le mot de passe';
    } else if (values.password !== values.confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
  
    return errors;
  };
  
  export const dishValidator = (values) => {
    const errors = {};
  
    if (!values.name) {
      errors.name = 'Le nom du plat est requis';
    }
  
    if (!values.price) {
      errors.price = 'Le prix est requis';
    } else if (isNaN(values.price) || values.price <= 0) {
      errors.price = 'Le prix doit être un nombre positif';
    }
  
    if (!values.category_id) {
      errors.category_id = 'La catégorie est requise';
    }
  
    return errors;
  };