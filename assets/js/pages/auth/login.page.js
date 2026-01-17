import AuthAPI from '../../api/auth.api.js';
import Router from '../../router.js';
import ValidationUtil from '../../utils/validation.util.js';

class LoginPage {
  render() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12">
        <div class="max-w-md w-full">
          <div class="text-center mb-8">
            <h1 class="text-4xl font-bold text-primary mb-2">SmartMoney</h1>
            <p class="text-gray-600">Control Inteligente de Gastos</p>
          </div>

          <div class="bg-white rounded-lg shadow-lg p-8">
            <h2 class="text-2xl font-bold text-gray-800 mb-6">Iniciar Sesión</h2>

            <form id="login-form" class="space-y-4">
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="tu@email.com"
                  required
                />
              </div>

              <div>
                <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Mínimo 6 caracteres"
                  required
                />
              </div>

              <div id="error-message" class="hidden bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              </div>

              <button
                type="submit"
                id="submit-btn"
                class="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Iniciar Sesión
              </button>
            </form>

            <div class="mt-6 text-center">
              <p class="text-sm text-gray-600">
                ¿No tienes una cuenta?
                <a href="#register" class="text-primary hover:text-primary-dark font-medium">
                  Regístrate aquí
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    const form = document.getElementById('login-form');
    const submitBtn = document.getElementById('submit-btn');
    const errorMessage = document.getElementById('error-message');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      // Clear previous errors
      errorMessage.classList.add('hidden');
      ValidationUtil.clearError(document.getElementById('email'));
      ValidationUtil.clearError(document.getElementById('password'));

      // Validate
      if (!ValidationUtil.isValidEmail(email)) {
        ValidationUtil.showError(document.getElementById('email'), 'Email inválido');
        return;
      }

      if (!ValidationUtil.isValidPassword(password)) {
        ValidationUtil.showError(document.getElementById('password'), 'La contraseña debe tener al menos 6 caracteres');
        return;
      }

      // Submit
      submitBtn.disabled = true;
      submitBtn.textContent = 'Iniciando sesión...';

      try {
        await AuthAPI.login(email, password);
        Router.navigate('dashboard');
      } catch (error) {
        errorMessage.textContent = error.message;
        errorMessage.classList.remove('hidden');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Iniciar Sesión';
      }
    });
  }
}

export default new LoginPage();