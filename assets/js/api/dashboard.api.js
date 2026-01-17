import CONFIG from '../config.js';
import StorageUtil from '../utils/storage.util.js';

class DashboardAPI {
  getAuthHeaders() {
    const token = StorageUtil.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async getDashboard(periodo = 'mes') {
    try {
      const response = await fetch(`${CONFIG.API_URL}${CONFIG.ENDPOINTS.DASHBOARD}?periodo=${periodo}`, {
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener dashboard');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }
}

export default new DashboardAPI();