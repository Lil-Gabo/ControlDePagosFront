import CONFIG from '../config.js';
import StorageUtil from '../utils/storage.util.js';

class ReportesAPI {
  getAuthHeaders() {
    const token = StorageUtil.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async getMensual(mes, anio) {
    try {
      const response = await fetch(
        `${CONFIG.API_URL}${CONFIG.ENDPOINTS.REPORTES.MENSUAL}?mes=${mes}&anio=${anio}`,
        {
          headers: this.getAuthHeaders()
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener reporte');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }
}

export default new ReportesAPI();