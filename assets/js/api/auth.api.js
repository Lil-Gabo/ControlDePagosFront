import CONFIG from '../config.js';
import StorageUtil from '../utils/storage.util.js';

class AuthAPI {
  async register(email, password, nombre) {
    try {
      const response = await fetch(`${CONFIG.API_URL}${CONFIG.ENDPOINTS.AUTH.REGISTER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, nombre })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al registrarse');
      }

      if (data.success && data.data.session) {
        StorageUtil.setToken(data.data.session.access_token);
        StorageUtil.setUser(data.data.user);
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  async login(email, password) {
    try {
      const response = await fetch(`${CONFIG.API_URL}${CONFIG.ENDPOINTS.AUTH.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      if (data.success && data.data.session) {
        StorageUtil.setToken(data.data.session.access_token);
        StorageUtil.setUser(data.data.user);
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      const token = StorageUtil.getToken();

      if (token) {
        await fetch(`${CONFIG.API_URL}${CONFIG.ENDPOINTS.AUTH.LOGOUT}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }

      StorageUtil.clear();
    } catch (error) {
      StorageUtil.clear();
      throw error;
    }
  }

  async getProfile() {
    try {
      const token = StorageUtil.getToken();

      const response = await fetch(`${CONFIG.API_URL}${CONFIG.ENDPOINTS.AUTH.PROFILE}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener perfil');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }
}

export default new AuthAPI();