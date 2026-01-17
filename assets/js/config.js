// API Configuration
const CONFIG = {
  API_URL: 'https://controldepagos.onrender.com', // Cambia esto por tu URL de Render
  // API_URL: 'http://localhost:3000/api', // Para desarrollo local
  
  // Endpoints
  ENDPOINTS: {
    AUTH: {
      REGISTER: '/api/auth/register',
      LOGIN: '/api/auth/login',
      LOGOUT: '/api/auth/logout',
      PROFILE: '/api/auth/profile'
    },
    GASTOS: '/api/gastos',
    CATEGORIAS: '/api/categorias',
    PRESUPUESTOS: '/api/presupuestos',
    DASHBOARD: '/api/dashboard',
    REPORTES: {
      MENSUAL: '/api/reportes/mensual'
    }
  },

  // Storage keys
  STORAGE: {
    TOKEN: 'smartmoney_token',
    USER: 'smartmoney_user'
  }
};

export default CONFIG;