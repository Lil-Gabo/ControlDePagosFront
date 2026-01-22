import ReportesAPI from '../api/reportes.api.js';
import FormatUtil from '../utils/format.util.js';

class ReportesPage {
  constructor() {
    this.reporte = null;
    this.mesActual = FormatUtil.getCurrentMonth();
    this.anioActual = FormatUtil.getCurrentYear();
    this.chart = null;
  }

  async render() {
    const app = document.getElementById('app');
    app.innerHTML = this.getTemplate();
    await this.loadReporte();
    this.attachEventListeners();
  }

  getTemplate() {
    return `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Reportes Mensuales</h1>
          <p class="text-gray-600 mt-1">Análisis detallado de tus gastos</p>
        </div>

        <!-- Selector de Periodo -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <label class="text-sm font-medium text-gray-700">Generar reporte de:</label>
            <div class="flex gap-3">
              <select id="select-mes" class="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary">
                ${this.generateMonthOptions()}
              </select>
              <select id="select-anio" class="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary">
                ${this.generateYearOptions()}
              </select>
              <button id="generate-report-btn" class="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-md transition-colors">
                Generar
              </button>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div id="loading-state" class="space-y-4">
          <div class="skeleton h-64 rounded-lg"></div>
          <div class="skeleton h-48 rounded-lg"></div>
        </div>

        <!-- Reporte Content -->
        <div id="reporte-content" class="hidden space-y-6">
          <!-- Resumen General -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-2xl font-bold text-gray-900 mb-6" id="reporte-title"></h2>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6" id="summary-cards"></div>
          </div>

          <!-- Comparación con Mes Anterior -->
          <div id="comparison-card" class="bg-gradient-to-r rounded-lg shadow-md p-6 text-white"></div>

          <!-- Gráfico de Categorías -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Distribución por Categorías</h3>
            <div class="chart-container">
              <canvas id="categories-chart"></canvas>
            </div>
          </div>

          <!-- Gastos por Categoría (Tabla) -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Detalle por Categoría</h3>
            <div id="categories-table"></div>
          </div>

          <!-- Recomendaciones -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Recomendaciones</h3>
            <div id="recommendations" class="space-y-3"></div>
          </div>
        </div>

        <!-- Empty State -->
        <div id="empty-state" class="hidden bg-white rounded-lg shadow-md p-12">
          <div class="empty-state">
            <i class="fas fa-chart-bar"></i>
            <p class="text-gray-500 mt-4">No hay datos para este periodo</p>
            <p class="text-sm text-gray-400 mt-2">Selecciona un mes diferente o comienza a registrar gastos</p>
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
    
    for (let i = currentYear - 2; i <= currentYear; i++) {
      years.push(i);
    }
    
    return years.map(year => {
      const selected = year === currentYear ? 'selected' : '';
      return `<option value="${year}" ${selected}>${year}</option>`;
    }).join('');
  }

  async loadReporte() {
    try {
      document.getElementById('loading-state').classList.remove('hidden');
      document.getElementById('reporte-content').classList.add('hidden');
      document.getElementById('empty-state').classList.add('hidden');

      const response = await ReportesAPI.getMensual(this.mesActual, this.anioActual);
      this.reporte = response.data;

      document.getElementById('loading-state').classList.add('hidden');

      if (this.reporte.resumen.total_gastado === 0) {
        document.getElementById('empty-state').classList.remove('hidden');
      } else {
        this.renderReporte();
      }
    } catch (error) {
      console.error('Error loading reporte:', error);
      document.getElementById('loading-state').classList.add('hidden');
      document.getElementById('empty-state').classList.remove('hidden');
    }
  }

  renderReporte() {
    document.getElementById('reporte-content').classList.remove('hidden');

    // Título
    document.getElementById('reporte-title').textContent = 
      `Reporte de ${this.reporte.periodo.nombre_mes} ${this.reporte.periodo.anio}`;

    // Summary Cards
    this.renderSummaryCards();

    // Comparación
    this.renderComparison();

    // Gráfico
    this.renderChart();

    // Tabla de categorías
    this.renderCategoriesTable();

    // Recomendaciones
    this.renderRecommendations();
  }

  renderSummaryCards() {
    const container = document.getElementById('summary-cards');
    const { resumen } = this.reporte;

    const cards = [
      {
        title: 'Total Gastado',
        value: FormatUtil.formatCurrency(resumen.total_gastado),
        icon: 'fa-dollar-sign',
        color: 'text-blue-600 bg-blue-50'
      },
      {
        title: 'Promedio Diario',
        value: FormatUtil.formatCurrency(resumen.promedio_diario),
        icon: 'fa-calendar-day',
        color: 'text-purple-600 bg-purple-50'
      },
      {
        title: 'Total Transacciones',
        value: resumen.total_transacciones,
        icon: 'fa-receipt',
        color: 'text-green-600 bg-green-50'
      }
    ];

    container.innerHTML = cards.map(card => `
      <div class="text-center">
        <div class="${card.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
          <i class="fas ${card.icon} text-2xl"></i>
        </div>
        <p class="text-sm text-gray-600 mb-1">${card.title}</p>
        <p class="text-2xl font-bold text-gray-900">${card.value}</p>
      </div>
    `).join('');
  }

  renderComparison() {
    const container = document.getElementById('comparison-card');
    const { comparacion_mes_anterior } = this.reporte;

    const isPositive = comparacion_mes_anterior.diferencia < 0;
    const bgColor = isPositive ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600';
    const icon = isPositive ? 'fa-arrow-down' : 'fa-arrow-up';

    container.className = `bg-gradient-to-r ${bgColor} rounded-lg shadow-md p-6 text-white`;
    container.innerHTML = `
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold mb-2">Comparación con mes anterior</h3>
          <p class="text-white opacity-90 mb-3">${comparacion_mes_anterior.mensaje}</p>
          <div class="flex items-center gap-2">
            <i class="fas ${icon} text-2xl"></i>
            <span class="text-3xl font-bold">${Math.abs(comparacion_mes_anterior.porcentaje).toFixed(1)}%</span>
          </div>
        </div>
        <div class="text-right">
          <p class="text-sm opacity-75 mb-1">Diferencia</p>
          <p class="text-2xl font-bold">${FormatUtil.formatCurrency(Math.abs(comparacion_mes_anterior.diferencia))}</p>
        </div>
      </div>
    `;
  }

  renderChart() {
    const ctx = document.getElementById('categories-chart');
    const { gastos_por_categoria } = this.reporte;

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: gastos_por_categoria.map(c => c.categoria),
        datasets: [{
          label: 'Gasto por Categoría',
          data: gastos_por_categoria.map(c => c.total),
          backgroundColor: gastos_por_categoria.map(c => c.color),
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = FormatUtil.formatCurrency(context.parsed.y);
                const percentage = gastos_por_categoria[context.dataIndex].porcentaje;
                return `${value} (${percentage}%)`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => FormatUtil.formatCurrency(value)
            }
          }
        }
      }
    });
  }

  renderCategoriesTable() {
    const container = document.getElementById('categories-table');
    const { gastos_por_categoria } = this.reporte;

    container.innerHTML = `
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Monto</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Porcentaje</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Visual</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            ${gastos_por_categoria.map(cat => `
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    <div class="w-3 h-3 rounded-full mr-3" style="background-color: ${cat.color}"></div>
                    <span class="font-medium text-gray-900">${cat.categoria}</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-right font-semibold text-gray-900">
                  ${FormatUtil.formatCurrency(cat.total)}
                </td>
                <td class="px-6 py-4 text-right text-gray-600">
                  ${cat.porcentaje.toFixed(1)}%
                </td>
                <td class="px-6 py-4">
                  <div class="flex justify-end">
                    <div class="w-24 bg-gray-200 rounded-full h-2">
                      <div class="h-2 rounded-full" style="width: ${cat.porcentaje}%; background-color: ${cat.color}"></div>
                    </div>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  renderRecommendations() {
    const container = document.getElementById('recommendations');
    const { recomendaciones } = this.reporte;

    container.innerHTML = recomendaciones.map((rec, index) => {
      const icons = ['fa-lightbulb', 'fa-chart-line', 'fa-check-circle', 'fa-exclamation-circle'];
      const colors = ['blue', 'purple', 'green', 'yellow'];
      const icon = icons[index % icons.length];
      const color = colors[index % colors.length];

      return `
        <div class="flex items-start p-4 bg-${color}-50 rounded-lg">
          <div class="flex-shrink-0">
            <i class="fas ${icon} text-${color}-600 text-xl"></i>
          </div>
          <p class="ml-3 text-sm text-${color}-900">${rec}</p>
        </div>
      `;
    }).join('');
  }

  attachEventListeners() {
    document.getElementById('generate-report-btn').addEventListener('click', () => {
      this.mesActual = parseInt(document.getElementById('select-mes').value);
      this.anioActual = parseInt(document.getElementById('select-anio').value);
      this.loadReporte();
    });
  }
}

export default new ReportesPage();