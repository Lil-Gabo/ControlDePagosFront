import CONFIG from '../config.js';
import StorageUtil from '../utils/storage.util.js';

class PresupuestosAPI {
  getAuthHeaders() {
    const token = StorageUtil.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async create(presupuestoData) {
    try {
      const response = await fetch(`${CONFIG.API_URL}${CONFIG.ENDPOINTS.PRESUPUESTOS}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(presupuestoData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al crear presupuesto');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  async getAll(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const url = `${CONFIG.API_URL}${CONFIG.ENDPOINTS.PRESUPUESTOS}${queryParams ? '?' + queryParams : ''}`;

      const response = await fetch(url, {
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener presupuestos');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  async update(id, presupuestoData) {
    try {
      const response = await fetch(`${CONFIG.API_URL}${CONFIG.ENDPOINTS.PRESUPUESTOS}/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(presupuestoData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar presupuesto');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  async delete(id) {
    try {
      const response = await fetch(`${CONFIG.API_URL}${CONFIG.ENDPOINTS.PRESUPUESTOS}/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al eliminar presupuesto');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }
}

export default new PresupuestosAPI();