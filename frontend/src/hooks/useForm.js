import { useState } from "react";

export const useForm = (initialValues, validator = null) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (name, value) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Valider le champ si un validateur est fourni
    if (validator && touched[name]) {
      const fieldErrors = validator({ ...values, [name]: value });
      setErrors((prev) => ({
        ...prev,
        [name]: fieldErrors[name],
      }));
    }
  };

  const handleBlur = (name) => {
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    // Valider le champ
    if (validator) {
      const fieldErrors = validator(values);
      setErrors((prev) => ({
        ...prev,
        [name]: fieldErrors[name],
      }));
    }
  };

  const validate = () => {
    if (!validator) return true;

    const newErrors = validator(values);
    setErrors(newErrors);

    // Marquer tous les champs comme touchés
    const allTouched = {};
    Object.keys(values).forEach((key) => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    return Object.keys(newErrors).length === 0;
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validate,
    reset,
    setValues,
  };
};
