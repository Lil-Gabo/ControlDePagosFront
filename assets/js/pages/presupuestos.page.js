import PresupuestosAPI from '../api/presupuestos.api.js';
import CategoriasAPI from '../api/categorias.api.js';
import FormatUtil from '../utils/format.util.js';

class PresupuestosPage {
  constructor() {
    this.presupuestos = [];
    this.categorias = [];
    this.mesActual = FormatUtil.getCurrentMonth();
    this.anioActual = FormatUtil.getCurrentYear();
  }

  async render() {
    const app = document.getElementById('app');
    app.innerHTML = this.getTemplate();
    await this.loadCategorias();
    await this.loadPresupuestos();
    this.attachEventListeners();
  }

  getTemplate() {
    return `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Presupuestos</h1>
            <p class="text-gray-600 mt-1">Controla tus límites de gasto</p>
          </div>
          <button id="new-budget-btn" class="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md transition-colors flex items-center">
            <i class="fas fa-plus mr-2"></i>
            Nuevo Presupuesto
          </button>
        </div>

        <!-- Selector de Mes -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <label class="text-sm font-medium text-gray-700">Ver presupuestos de:</label>
            <div class="flex gap-3">
              <select id="select-mes" class="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary">
                ${this.generateMonthOptions()}
              </select>
              <select id="select-anio" class="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary">
                ${this.generateYearOptions()}
              </select>
              <button id="load-period-btn" class="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md transition-colors">
                Cargar
              </button>
            </div>
          </div>
        </div>

        <!-- Presupuestos List -->
        <div id="presupuestos-loading" class="space-y-4">
          <div class="skeleton h-32 rounded-lg"></div>
          <div class="skeleton h-32 rounded-lg"></div>
        </div>

        <div id="presupuestos-list" class="hidden space-y-4"></div>

        <div id="presupuestos-empty" class="hidden bg-white rounded-lg shadow-md p-12">
          <div class="empty-state">
            <i class="fas fa-wallet"></i>
            <p class="text-gray-500 mt-4">No tienes presupuestos para este mes</p>
            <button onclick="document.getElementById('new-budget-btn').click()" class="mt-4 bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-md transition-colors">
              Crear Presupuesto
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Nuevo Presupuesto -->
      <div id="budget-modal" class="hidden modal-backdrop">
        <div class="modal-content">
          <div class="p-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold text-gray-900">Nuevo Presupuesto</h2>
              <button id="close-modal" class="text-gray-400 hover:text-gray-600">
                <i class="fas fa-times text-xl"></i>
              </button>
            </div>

            <form id="budget-form" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select id="categoria_id" required class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary">
                  <option value="">Selecciona una categoría</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Monto Límite</label>
                <input type="number" id="monto_limite" step="0.01" min="0.01" required class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary" placeholder="500.00">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Periodo</label>
                <select id="periodo" required class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary">
                  <option value="mensual">Mensual</option>
                  <option value="semanal">Semanal</option>
                </select>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Mes</label>
                  <select id="mes" required class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary">
                    ${this.generateMonthOptions()}
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Año</label>
                  <select id="anio" required class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary">
                    ${this.generateYearOptions()}
                  </select>
                </div>
              </div>

              <div id="form-error" class="hidden bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm"></div>

              <div class="flex gap-3 pt-4">
                <button type="submit" id="submit-budget" class="flex-1 bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-md transition-colors">
                  Guardar
                </button>
                <button type="button" id="cancel-budget" class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-md transition-colors">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  }

  generateMonthOptions() {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    return months.map((month, index) => {
      const value = index + 1;
      const selected = value === this.mesActual ? 'selected' : '';
      return `<option value="${value}" ${selected}>${month}</option>`;
    }).join('');
  }

  generateYearOptions() {
    const currentYear = this.anioActual;
    const years = [];
    
    for (let i = currentYear - 1; i <= currentYear + 1; i++) {
      years.push(i);
    }
    
    return years.map(year => {
      const selected = year === currentYear ? 'selected' : '';
      return `<option value="${year}" ${selected}>${year}</option>`;
    }).join('');
  }

  async loadCategorias() {
    try {
      const response = await CategoriasAPI.getAll();
      this.categorias = response.data;
      this.populateCategoriaSelect();
    } catch (error) {
      console.error('Error loading categorias:', error);
    }
  }

  populateCategoriaSelect() {
    const select = document.getElementById('categoria_id');
    select.innerHTML = '<option value="">Selecciona una categoría</option>';
    
    this.categorias.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.id;
      option.textContent = cat.nombre;
      select.appendChild(option);
    });
  }

  async loadPresupuestos() {
    try {
      document.getElementById('presupuestos-loading').classList.remove('hidden');
      document.getElementById('presupuestos-list').classList.add('hidden');
      document.getElementById('presupuestos-empty').classList.add('hidden');

      const response = await PresupuestosAPI.getAll({
        mes: this.mesActual,
        anio: this.anioActual
      });
      
      this.presupuestos = response.data;

      document.getElementById('presupuestos-loading').classList.add('hidden');

      if (this.presupuestos.length === 0) {
        document.getElementById('presupuestos-empty').classList.remove('hidden');
      } else {
        this.renderPresupuestos();
      }
    } catch (error) {
      console.error('Error loading presupuestos:', error);
      document.getElementById('presupuestos-loading').classList.add('hidden');
    }
  }

  renderPresupuestos() {
    const container = document.getElementById('presupuestos-list');
    container.classList.remove('hidden');

    container.innerHTML = this.presupuestos.map(presupuesto => 
      this.renderPresupuestoCard(presupuesto)
    ).join('');

    this.attachPresupuestoActions();
  }

  renderPresupuestoCard(presupuesto) {
    const statusClass = this.getStatusClass(presupuesto.estado);
    const progressColor = this.getProgressColor(presupuesto.estado);

    return `
      <div class="bg-white rounded-lg shadow-md p-6 card-hover">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div class="flex items-center mb-2 sm:mb-0">
            <div class="w-12 h-12 rounded-full flex items-center justify-center mr-4" style="background-color: ${presupuesto.categoria.color}20">
              <i class="fas fa-wallet text-xl" style="color: ${presupuesto.categoria.color}"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">${presupuesto.categoria.nombre}</h3>
              <p class="text-sm text-gray-600">${FormatUtil.capitalize(presupuesto.periodo)}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span class="badge badge-${statusClass}">
              ${this.getStatusText(presupuesto.estado)}
            </span>
            <button data-id="${presupuesto.id}" class="delete-budget text-red-600 hover:text-red-800">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>

        <div class="space-y-2 mb-4">
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Gastado</span>
            <span class="font-semibold text-gray-900">${FormatUtil.formatCurrency(presupuesto.monto_gastado)}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Límite</span>
            <span class="font-semibold text-gray-900">${FormatUtil.formatCurrency(presupuesto.monto_limite)}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Restante</span>
            <span class="font-semibold ${presupuesto.monto_restante >= 0 ? 'text-green-600' : 'text-red-600'}">
              ${FormatUtil.formatCurrency(presupuesto.monto_restante)}
            </span>
          </div>
        </div>

        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Progreso</span>
            <span class="font-semibold status-${presupuesto.estado}">
              ${presupuesto.porcentaje_usado.toFixed(1)}%
            </span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill ${progressColor}" style="width: ${Math.min(presupuesto.porcentaje_usado, 100)}%"></div>
          </div>
        </div>

        ${this.getStatusMessage(presupuesto)}
      </div>
    `;
  }

  getStatusClass(estado) {
    const classes = {
      'normal': 'success',
      'atencion': 'info',
      'advertencia': 'warning',
      'critico': 'danger'
    };
    return classes[estado] || 'info';
  }

  getProgressColor(estado) {
    const colors = {
      'normal': 'normal',
      'atencion': 'atencion',
      'advertencia': 'advertencia',
      'critico': 'critico'
    };
    return colors[estado] || 'normal';
  }

  getStatusText(estado) {
    const texts = {
      'normal': 'En control',
      'atencion': 'Atención',
      'advertencia': 'Cuidado',
      'critico': 'Límite excedido'
    };
    return texts[estado] || 'Normal';
  }

  getStatusMessage(presupuesto) {
    const messages = {
      'normal': '<div class="mt-4 p-3 bg-green-50 rounded-md"><p class="text-sm text-green-700">Vas muy bien, sigue así</p></div>',
      'atencion': '<div class="mt-4 p-3 bg-blue-50 rounded-md"><p class="text-sm text-blue-700">Estás usando una buena parte de tu presupuesto</p></div>',
      'advertencia': '<div class="mt-4 p-3 bg-yellow-50 rounded-md"><p class="text-sm text-yellow-700">Cuidado, estás cerca de tu límite</p></div>',
      'critico': '<div class="mt-4 p-3 bg-red-50 rounded-md"><p class="text-sm text-red-700">Has superado tu presupuesto este mes</p></div>'
    };
    return messages[presupuesto.estado] || '';
  }

  attachEventListeners() {
    document.getElementById('new-budget-btn').addEventListener('click', () => this.openModal());
    document.getElementById('close-modal').addEventListener('click', () => this.closeModal());
    document.getElementById('cancel-budget').addEventListener('click', () => this.closeModal());
    document.getElementById('budget-form').addEventListener('submit', (e) => this.handleSubmit(e));
    document.getElementById('load-period-btn').addEventListener('click', () => this.loadPeriod());

    // Set default values
    document.getElementById('mes').value = this.mesActual;
    document.getElementById('anio').value = this.anioActual;
  }

  attachPresupuestoActions() {
    document.querySelectorAll('.delete-budget').forEach(btn => {
      btn.addEventListener('click', () => this.deletePresupuesto(btn.dataset.id));
    });
  }

  openModal() {
    document.getElementById('budget-modal').classList.remove('hidden');
    document.getElementById('budget-form').reset();
    document.getElementById('mes').value = this.mesActual;
    document.getElementById('anio').value = this.anioActual;
  }

  closeModal() {
    document.getElementById('budget-modal').classList.add('hidden');
    document.getElementById('form-error').classList.add('hidden');
  }

  async handleSubmit(e) {
    e.preventDefault();

    const presupuestoData = {
      categoria_id: parseInt(document.getElementById('categoria_id').value),
      monto_limite: parseFloat(document.getElementById('monto_limite').value),
      periodo: document.getElementById('periodo').value,
      mes: parseInt(document.getElementById('mes').value),
      anio: parseInt(document.getElementById('anio').value)
    };

    const submitBtn = document.getElementById('submit-budget');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Guardando...';

    try {
      await PresupuestosAPI.create(presupuestoData);
      this.closeModal();
      await this.loadPresupuestos();
    } catch (error) {
      document.getElementById('form-error').textContent = error.message;
      document.getElementById('form-error').classList.remove('hidden');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Guardar';
    }
  }

  async deletePresupuesto(id) {
    if (!confirm('¿Estás seguro de eliminar este presupuesto?')) return;

    try {
      await PresupuestosAPI.delete(id);
      await this.loadPresupuestos();
    } catch (error) {
      alert('Error al eliminar el presupuesto: ' + error.message);
    }
  }

  loadPeriod() {
    this.mesActual = parseInt(document.getElementById('select-mes').value);
    this.anioActual = parseInt(document.getElementById('select-anio').value);
    this.loadPresupuestos();
  }
}

export default new PresupuestosPage();