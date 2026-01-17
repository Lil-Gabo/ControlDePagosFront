class ValidationUtil {
  isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  isValidPassword(password) {
    return password.length >= 6;
  }

  isValidAmount(amount) {
    return !isNaN(amount) && parseFloat(amount) > 0;
  }

  isRequired(value) {
    return value !== null && value !== undefined && value.toString().trim() !== '';
  }

  showError(inputElement, message) {
    const parent = inputElement.parentElement;
    
    // Remove existing error
    const existingError = parent.querySelector('.error-message');
    if (existingError) {
      existingError.remove();
    }

    // Add error class to input
    inputElement.classList.add('border-red-500');
    inputElement.classList.remove('border-gray-300');

    // Add error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message text-red-500 text-sm mt-1';
    errorDiv.textContent = message;
    parent.appendChild(errorDiv);
  }

  clearError(inputElement) {
    const parent = inputElement.parentElement;
    
    // Remove error message
    const existingError = parent.querySelector('.error-message');
    if (existingError) {
      existingError.remove();
    }

    // Remove error class from input
    inputElement.classList.remove('border-red-500');
    inputElement.classList.add('border-gray-300');
  }

  validateForm(formData, rules) {
    const errors = {};
    let isValid = true;

    for (const field in rules) {
      const value = formData[field];
      const fieldRules = rules[field];

      for (const rule of fieldRules) {
        if (rule.type === 'required' && !this.isRequired(value)) {
          errors[field] = rule.message || `${field} es requerido`;
          isValid = false;
          break;
        }

        if (rule.type === 'email' && value && !this.isValidEmail(value)) {
          errors[field] = rule.message || 'Email inválido';
          isValid = false;
          break;
        }

        if (rule.type === 'password' && value && !this.isValidPassword(value)) {
          errors[field] = rule.message || 'La contraseña debe tener al menos 6 caracteres';
          isValid = false;
          break;
        }

        if (rule.type === 'amount' && value && !this.isValidAmount(value)) {
          errors[field] = rule.message || 'El monto debe ser mayor a 0';
          isValid = false;
          break;
        }
      }
    }

    return { isValid, errors };
  }
}

export default new ValidationUtil();