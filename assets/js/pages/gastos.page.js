import GastosAPI from '../api/gastos.api.js';
import CategoriasAPI from '../api/categorias.api.js';
import FormatUtil from '../utils/format.util.js';
import ValidationUtil from '../utils/validation.util.js';

class GastosPage {
  constructor() {
    this.gastos = [];
    this.categorias = [];
    this.filters = {};
    this.editingGasto = null;
  }

  async render() {
    const app = document.getElementById('app');
    app.innerHTML = this.getTemplate();
    await this.loadCategorias();
    await this.loadGastos();
    this.attachEventListeners();
  }

  getTemplate() {
    return `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Mis Gastos</h1>
            <p class="text-gray-600 mt-1">Administra tus gastos diarios</p>
          </div>
          <div class="flex gap-3">
            <button id="quick-expense-btn" class="bg-secondary hover:bg-secondary-dark text-white px-4 py-2 rounded-md transition-colors flex items-center">
              <i class="fas fa-bolt mr-2"></i>
              Gasto Rápido
            </button>
            <button id="new-expense-btn" class="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md transition-colors flex items-center">
              <i class="fas fa-plus mr-2"></i>
              Nuevo Gasto
            </button>
          </div>
        </div>

        <!-- Filters -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Filtros</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select id="filter-categoria" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary">
                <option value="">Todas</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
              <input type="date" id="filter-fecha-inicio" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
              <input type="date" id="filter-fecha-fin" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
              <select id="filter-metodo" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary">
                <option value="">Todos</option>
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
              </select>
            </div>
          </div>
          <div class="mt-4 flex gap-3">
            <button id="apply-filters-btn" class="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md transition-colors">
              Aplicar Filtros
            </button>
            <button id="clear-filters-btn" class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md transition-colors">
              Limpiar
            </button>
          </div>
        </div>

        <!-- Gastos List -->
        <div class="bg-white rounded-lg shadow-md">
          <div id="gastos-loading" class="p-8">
            <div class="skeleton h-16 rounded mb-3"></div>
            <div class="skeleton h-16 rounded mb-3"></div>
            <div class="skeleton h-16 rounded"></div>
          </div>
          
          <div id="gastos-list" class="hidden"></div>
          
          <div id="gastos-empty" class="hidden p-12">
            <div class="empty-state">
              <i class="fas fa-receipt"></i>
              <p class="text-gray-500 mt-4">No hay gastos registrados</p>
              <button onclick="document.getElementById('new-expense-btn').click()" class="mt-4 bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-md transition-colors">
                Crear Primer Gasto
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Nuevo/Editar Gasto -->
      <div id="expense-modal" class="hidden modal-backdrop">
        <div class="modal-content">
          <div class="p-6">
            <div class="flex justify-between items-center mb-6">
              <h2 id="modal-title" class="text-2xl font-bold text-gray-900">Nuevo Gasto</h2>
              <button id="close-modal" class="text-gray-400 hover:text-gray-600">
                <i class="fas fa-times text-xl"></i>
              </button>
            </div>

            <form id="expense-form" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select id="categoria_id" required class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary">
                  <option value="">Selecciona una categoría</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Monto</label>
                <input type="number" id="monto" step="0.01" min="0.01" required class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary" placeholder="0.00">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label>
                <textarea id="descripcion" rows="3" class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary" placeholder="Ej: Almuerzo con amigos"></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
                <select id="metodo_pago" required class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary">
                  <option value="">Selecciona un método</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="transferencia">Transferencia</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <input type="date" id="fecha" required class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary">
              </div>

              <div id="form-error" class="hidden bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm"></div>

              <div class="flex gap-3 pt-4">
                <button type="submit" id="submit-expense" class="flex-1 bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-md transition-colors">
                  Guardar
                </button>
                <button type="button" id="cancel-expense" class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-md transition-colors">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Modal Gasto Rápido -->
      <div id="quick-expense-modal" class="hidden modal-backdrop">
        <div class="modal-content max-w-md">
          <div class="p-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold text-gray-900">Gasto Rápido</h2>
              <button id="close-quick-modal" class="text-gray-400 hover:text-gray-600">
                <i class="fas fa-times text-xl"></i>
              </button>
            </div>

            <form id="quick-expense-form" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Monto</label>
                <input type="number" id="quick-monto" step="0.01" min="0.01" required class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary text-2xl" placeholder="0.00" autofocus>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select id="quick-categoria" required class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary">
                  <option value="">Selecciona una categoría</option>
                </select>
              </div>

              <div class="grid grid-cols-3 gap-2">
                <button type="button" data-metodo="efectivo" class="metodo-btn bg-gray-100 hover:bg-gray-200 py-3 rounded-md transition-colors">
                  <i class="fas fa-money-bill-wave block mb-1"></i>
                  <span class="text-xs">Efectivo</span>
                </button>
                <button type="button" data-metodo="tarjeta" class="metodo-btn bg-gray-100 hover:bg-gray-200 py-3 rounded-md transition-colors">
                  <i class="fas fa-credit-card block mb-1"></i>
                  <span class="text-xs">Tarjeta</span>
                </button>
                <button type="button" data-metodo="transferencia" class="metodo-btn bg-gray-100 hover:bg-gray-200 py-3 rounded-md transition-colors">
                  <i class="fas fa-exchange-alt block mb-1"></i>
                  <span class="text-xs">Transfer</span>
                </button>
              </div>
              <input type="hidden" id="quick-metodo" required>

              <div id="quick-form-error" class="hidden bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm"></div>

              <button type="submit" id="submit-quick" class="w-full bg-secondary hover:bg-secondary-dark text-white py-3 px-4 rounded-md transition-colors font-medium">
                Registrar Gasto
              </button>
            </form>
          </div>
        </div>
      </div>
    `;
  }

  async loadCategorias() {
    try {
      const response = await CategoriasAPI.getAll();
      this.categorias = response.data;
      this.populateCategoriaSelects();
    } catch (error) {
      console.error('Error loading categorias:', error);
    }
  }

  populateCategoriaSelects() {
    const selects = ['categoria_id', 'quick-categoria', 'filter-categoria'];
    
    selects.forEach(selectId => {
      const select = document.getElementById(selectId);
      if (select && selectId !== 'filter-categoria') {
        select.innerHTML = '<option value="">Selecciona una categoría</option>';
      }
      
      this.categorias.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.nombre;
        select.appendChild(option);
      });
    });
  }

  async loadGastos() {
    try {
      document.getElementById('gastos-loading').classList.remove('hidden');
      document.getElementById('gastos-list').classList.add('hidden');
      document.getElementById('gastos-empty').classList.add('hidden');

      const response = await GastosAPI.getAll(this.filters);
      this.gastos = response.data;

      document.getElementById('gastos-loading').classList.add('hidden');

      if (this.gastos.length === 0) {
        document.getElementById('gastos-empty').classList.remove('hidden');
      } else {
        this.renderGastos();
      }
    } catch (error) {
      console.error('Error loading gastos:', error);
      document.getElementById('gastos-loading').classList.add('hidden');
    }
  }

  renderGastos() {
    const container = document.getElementById('gastos-list');
    container.classList.remove('hidden');

    container.innerHTML = `
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Método</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Monto</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            ${this.gastos.map(gasto => this.renderGastoRow(gasto)).join('')}
          </tbody>
        </table>
      </div>
    `;

    this.attachGastoActions();
  }

  renderGastoRow(gasto) {
    return `
      <tr class="hover:bg-gray-50">
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          ${FormatUtil.formatDateShort(gasto.fecha)}
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style="background-color: ${gasto.categoria.color}20; color: ${gasto.categoria.color}">
            ${gasto.categoria.nombre}
          </span>
        </td>
        <td class="px-6 py-4 text-sm text-gray-600">
          ${gasto.descripcion || '-'}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
          ${FormatUtil.capitalize(gasto.metodo_pago)}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">
          ${FormatUtil.formatCurrency(gasto.monto)}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
          <button data-id="${gasto.id}" class="edit-gasto text-blue-600 hover:text-blue-800 mr-3">
            <i class="fas fa-edit"></i>
          </button>
          <button data-id="${gasto.id}" class="delete-gasto text-red-600 hover:text-red-800">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }

  attachEventListeners() {
    // Botones principales
    document.getElementById('new-expense-btn').addEventListener('click', () => this.openModal());
    document.getElementById('quick-expense-btn').addEventListener('click', () => this.openQuickModal());

    // Modal normal
    document.getElementById('close-modal').addEventListener('click', () => this.closeModal());
    document.getElementById('cancel-expense').addEventListener('click', () => this.closeModal());
    document.getElementById('expense-form').addEventListener('submit', (e) => this.handleSubmit(e));

    // Modal gasto rápido
    document.getElementById('close-quick-modal').addEventListener('click', () => this.closeQuickModal());
    document.getElementById('quick-expense-form').addEventListener('submit', (e) => this.handleQuickSubmit(e));

    // Botones de método de pago en modal rápido
    document.querySelectorAll('.metodo-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.metodo-btn').forEach(b => {
          b.classList.remove('bg-secondary', 'text-white');
          b.classList.add('bg-gray-100');
        });
        btn.classList.remove('bg-gray-100');
        btn.classList.add('bg-secondary', 'text-white');
        document.getElementById('quick-metodo').value = btn.dataset.metodo;
      });
    });

    // Filtros
    document.getElementById('apply-filters-btn').addEventListener('click', () => this.applyFilters());
    document.getElementById('clear-filters-btn').addEventListener('click', () => this.clearFilters());

    // Fecha por defecto
    document.getElementById('fecha').value = FormatUtil.getCurrentDate();
  }

  attachGastoActions() {
    document.querySelectorAll('.edit-gasto').forEach(btn => {
      btn.addEventListener('click', () => this.editGasto(btn.dataset.id));
    });

    document.querySelectorAll('.delete-gasto').forEach(btn => {
      btn.addEventListener('click', () => this.deleteGasto(btn.dataset.id));
    });
  }

  openModal(gasto = null) {
    this.editingGasto = gasto;
    const modal = document.getElementById('expense-modal');
    const title = document.getElementById('modal-title');

    if (gasto) {
      title.textContent = 'Editar Gasto';
      document.getElementById('categoria_id').value = gasto.categoria.id;
      document.getElementById('monto').value = gasto.monto;
      document.getElementById('descripcion').value = gasto.descripcion || '';
      document.getElementById('metodo_pago').value = gasto.metodo_pago;
      document.getElementById('fecha').value = gasto.fecha;
    } else {
      title.textContent = 'Nuevo Gasto';
      document.getElementById('expense-form').reset();
      document.getElementById('fecha').value = FormatUtil.getCurrentDate();
    }

    modal.classList.remove('hidden');
  }

  closeModal() {
    document.getElementById('expense-modal').classList.add('hidden');
    document.getElementById('expense-form').reset();
    document.getElementById('form-error').classList.add('hidden');
    this.editingGasto = null;
  }

  openQuickModal() {
    document.getElementById('quick-expense-modal').classList.remove('hidden');
    document.getElementById('quick-expense-form').reset();
    document.querySelectorAll('.metodo-btn').forEach(b => {
      b.classList.remove('bg-secondary', 'text-white');
      b.classList.add('bg-gray-100');
    });
  }

  closeQuickModal() {
    document.getElementById('quick-expense-modal').classList.add('hidden');
  }

  async handleSubmit(e) {
    e.preventDefault();

    const gastoData = {
      categoria_id: parseInt(document.getElementById('categoria_id').value),
      monto: parseFloat(document.getElementById('monto').value),
      descripcion: document.getElementById('descripcion').value.trim(),
      metodo_pago: document.getElementById('metodo_pago').value,
      fecha: document.getElementById('fecha').value
    };

    const submitBtn = document.getElementById('submit-expense');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Guardando...';

    try {
      if (this.editingGasto) {
        await GastosAPI.update(this.editingGasto.id, gastoData);
      } else {
        await GastosAPI.create(gastoData);
      }

      this.closeModal();
      await this.loadGastos();
    } catch (error) {
      document.getElementById('form-error').textContent = error.message;
      document.getElementById('form-error').classList.remove('hidden');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Guardar';
    }
  }

  async handleQuickSubmit(e) {
    e.preventDefault();

    const gastoData = {
      categoria_id: parseInt(document.getElementById('quick-categoria').value),
      monto: parseFloat(document.getElementById('quick-monto').value),
      metodo_pago: document.getElementById('quick-metodo').value,
      fecha: FormatUtil.getCurrentDate()
    };

    if (!gastoData.metodo_pago) {
      document.getElementById('quick-form-error').textContent = 'Selecciona un método de pago';
      document.getElementById('quick-form-error').classList.remove('hidden');
      return;
    }

    const submitBtn = document.getElementById('submit-quick');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Registrando...';

    try {
      await GastosAPI.create(gastoData);
      this.closeQuickModal();
      await this.loadGastos();
    } catch (error) {
      document.getElementById('quick-form-error').textContent = error.message;
      document.getElementById('quick-form-error').classList.remove('hidden');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Registrar Gasto';
    }
  }

  async editGasto(id) {
    try {
      const response = await GastosAPI.getById(id);
      this.openModal(response.data);
    } catch (error) {
      alert('Error al cargar el gasto: ' + error.message);
    }
  }

  async deleteGasto(id) {
    if (!confirm('¿Estás seguro de eliminar este gasto?')) return;

    try {
      await GastosAPI.delete(id);
      await this.loadGastos();
    } catch (error) {
      alert('Error al eliminar el gasto: ' + error.message);
    }
  }

  applyFilters() {
    this.filters = {};

    const categoriaId = document.getElementById('filter-categoria').value;
    const fechaInicio = document.getElementById('filter-fecha-inicio').value;
    const fechaFin = document.getElementById('filter-fecha-fin').value;
    const metodo = document.getElementById('filter-metodo').value;

    if (categoriaId) this.filters.categoria_id = categoriaId;
    if (fechaInicio) this.filters.fecha_inicio = fechaInicio;
    if (fechaFin) this.filters.fecha_fin = fechaFin;
    if (metodo) this.filters.metodo_pago = metodo;

    this.loadGastos();
  }

  clearFilters() {
    this.filters = {};
    document.getElementById('filter-categoria').value = '';
    document.getElementById('filter-fecha-inicio').value = '';
    document.getElementById('filter-fecha-fin').value = '';
    document.getElementById('filter-metodo').value = '';
    this.loadGastos();
  }
}

export default new GastosPage();