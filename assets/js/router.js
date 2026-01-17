import StorageUtil from './utils/storage.util.js';

class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    this.init();
  }

  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('load', () => this.handleRoute());
  }

  register(path, handler) {
    this.routes[path] = handler;
  }

  navigate(path) {
    window.location.hash = path;
  }

  handleRoute() {
    let hash = window.location.hash.slice(1) || 'login';

    // Check authentication
    const isAuthenticated = StorageUtil.isAuthenticated();
    const publicRoutes = ['login', 'register'];

    if (!isAuthenticated && !publicRoutes.includes(hash)) {
      hash = 'login';
      window.location.hash = '#login';
    }

    if (isAuthenticated && publicRoutes.includes(hash)) {
      hash = 'dashboard';
      window.location.hash = '#dashboard';
    }

    // Show/hide navbar
    const navbar = document.getElementById('navbar');
    if (isAuthenticated) {
      navbar.classList.remove('hidden');
      this.updateNavbar();
    } else {
      navbar.classList.add('hidden');
    }

    // Update active nav links
    this.updateActiveLink(hash);

    // Call route handler
    if (this.routes[hash]) {
      this.currentRoute = hash;
      this.routes[hash]();
    } else {
      this.navigate('dashboard');
    }
  }

  updateNavbar() {
    const user = StorageUtil.getUser();
    const userNameElement = document.getElementById('user-name');
    if (user && userNameElement) {
      userNameElement.textContent = user.nombre;
    }
  }

  updateActiveLink(currentPath) {
    // Desktop nav links
    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href').slice(1);
      if (href === currentPath) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Mobile nav links
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
      const href = link.getAttribute('href').slice(1);
      if (href === currentPath) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  getQueryParams() {
    const hash = window.location.hash;
    const queryString = hash.includes('?') ? hash.split('?')[1] : '';
    const params = new URLSearchParams(queryString);
    return Object.fromEntries(params);
  }
}

export default new Router();