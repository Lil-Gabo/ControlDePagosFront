import Router from './router.js';
import AuthAPI from './api/auth.api.js';

// Pages
import LoginPage from './pages/auth/login.page.js';
import RegisterPage from './pages/auth/register.page.js';
import DashboardPage from './pages/dashboard.page.js';

class App {
  constructor() {
    this.init();
  }

  init() {
    this.registerRoutes();
    this.setupEventListeners();
  }

  registerRoutes() {
    Router.register('login', () => LoginPage.render());
    Router.register('register', () => RegisterPage.render());
    Router.register('dashboard', () => DashboardPage.render());
    Router.register('gastos', () => this.showComingSoon('Gastos'));
    Router.register('presupuestos', () => this.showComingSoon('Presupuestos'));
    Router.register('reportes', () => this.showComingSoon('Reportes'));
  }

  setupEventListeners() {
    // Logout button
    document.getElementById('logout-btn')?.addEventListener('click', async () => {
      try {
        await AuthAPI.logout();
        Router.navigate('login');
      } catch (error) {
        console.error('Logout error:', error);
        Router.navigate('login');
      }
    });

    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    mobileMenuBtn?.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu?.classList.add('hidden');
      });
    });
  }

  showComingSoon(pageName) {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="bg-white rounded-lg shadow-md p-12 text-center">
          <i class="fas fa-tools text-6xl text-gray-400 mb-4"></i>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Página ${pageName}</h2>
          <p class="text-gray-600 mb-6">Esta página está en desarrollo</p>
          <a href="#dashboard" class="inline-block bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-md transition-colors">
            Volver al Dashboard
          </a>
        </div>
      </div>
    `;
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new App();
});

export default App;