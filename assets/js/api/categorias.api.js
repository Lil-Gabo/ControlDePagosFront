import CONFIG from '../config.js';
import StorageUtil from '../utils/storage.util.js';

class CategoriasAPI {
  getAuthHeaders() {
    const token = StorageUtil.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async getAll() {
    try {
      const response = await fetch(`${CONFIG.API_URL}${CONFIG.ENDPOINTS.CATEGORIAS}`, {
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener categorías');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  async create(categoriaData) {
    try {
      const response = await fetch(`${CONFIG.API_URL}${CONFIG.ENDPOINTS.CATEGORIAS}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(categoriaData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al crear categoría');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }
}

export default new CategoriasAPI();