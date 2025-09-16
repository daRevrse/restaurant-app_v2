import { useState, useCallback } from "react";

export const useForm = (initialValues = {}, validator = null) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mettre à jour une valeur
  const setValue = useCallback(
    (name, value) => {
      setValues((prev) => ({ ...prev, [name]: value }));

      // Effacer l'erreur si elle existe
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [errors]
  );

  // Gérer le changement d'un input
  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      const newValue = type === "checkbox" ? checked : value;
      setValue(name, newValue);
    },
    [setValue]
  );

  // Gérer le focus sur un champ
  const handleBlur = useCallback(
    (e) => {
      const { name } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));

      // Valider le champ si un validateur est fourni
      if (validator) {
        const fieldErrors = validator({ [name]: values[name] });
        if (fieldErrors[name]) {
          setErrors((prev) => ({ ...prev, [name]: fieldErrors[name] }));
        }
      }
    },
    [validator, values]
  );

  // Valider le formulaire
  const validate = useCallback(() => {
    if (!validator) return true;

    const formErrors = validator(values);
    setErrors(formErrors);

    return Object.keys(formErrors).length === 0;
  }, [validator, values]);

  // Gérer la soumission
  const handleSubmit = useCallback(
    async (onSubmit) => {
      setIsSubmitting(true);

      try {
        const isValid = validate();
        if (isValid) {
          await onSubmit(values);
          return true;
        }
        return false;
      } catch (error) {
        console.error("Erreur soumission formulaire:", error);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [validate, values]
  );

  // Réinitialiser le formulaire
  const reset = useCallback(
    (newValues = initialValues) => {
      setValues(newValues);
      setErrors({});
      setTouched({});
      setIsSubmitting(false);
    },
    [initialValues]
  );

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    handleChange,
    handleBlur,
    handleSubmit,
    validate,
    reset,
    isValid: Object.keys(errors).length === 0,
  };
};
