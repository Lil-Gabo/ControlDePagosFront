import CONFIG from '../config.js';
import StorageUtil from '../utils/storage.util.js';

class GastosAPI {
  getAuthHeaders() {
    const token = StorageUtil.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async create(gastoData) {
    try {
      const response = await fetch(`${CONFIG.API_URL}${CONFIG.ENDPOINTS.GASTOS}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(gastoData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al crear gasto');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  async getAll(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const url = `${CONFIG.API_URL}${CONFIG.ENDPOINTS.GASTOS}${queryParams ? '?' + queryParams : ''}`;

      const response = await fetch(url, {
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener gastos');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  async getById(id) {
    try {
      const response = await fetch(`${CONFIG.API_URL}${CONFIG.ENDPOINTS.GASTOS}/${id}`, {
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener gasto');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  async update(id, gastoData) {
    try {
      const response = await fetch(`${CONFIG.API_URL}${CONFIG.ENDPOINTS.GASTOS}/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(gastoData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar gasto');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  async delete(id) {
    try {
      const response = await fetch(`${CONFIG.API_URL}${CONFIG.ENDPOINTS.GASTOS}/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al eliminar gasto');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }
}

export default new GastosAPI();