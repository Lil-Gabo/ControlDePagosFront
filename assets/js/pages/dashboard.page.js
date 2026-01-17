import DashboardAPI from '../api/dashboard.api.js';
import FormatUtil from '../utils/format.util.js';
import Router from '../router.js';

class DashboardPage {
  constructor() {
    this.dashboardData = null;
    this.charts = {};
  }

  async render() {
    const app = document.getElementById('app');
    app.innerHTML = this.getTemplate();
    await this.loadData();
  }

  getTemplate() {
    return `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p class="text-gray-600 mt-1">Resumen de tus finanzas</p>
        </div>

        <!-- Loading State -->
        <div id="loading-state" class="space-y-4">
          <div class="skeleton h-32 rounded-lg"></div>
          <div class="skeleton h-64 rounded-lg"></div>
        </div>

        <!-- Dashboard Content -->
        <div id="dashboard-content" class="hidden space-y-6">
          <!-- Summary Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="summary-cards">
          </div>

          <!-- Mensajes Motivacionales -->
          <div id="motivational-messages" class="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-6 text-white shadow-lg">
          </div>

          <!-- Charts -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Gastos por Categoría -->
            <div class="bg-white rounded-lg shadow-md p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Gastos por Categoría</h3>
              <div class="chart-container">
                <canvas id="category-chart"></canvas>
              </div>
            </div>

            <!-- Gastos por Día -->
            <div class="bg-white rounded-lg shadow-md p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Gastos por Día</h3>
              <div class="chart-container">
                <canvas id="daily-chart"></canvas>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <button onclick="window.location.hash='#gastos'" class="flex items-center justify-center bg-primary hover:bg-primary-dark text-white px-4 py-3 rounded-md transition-colors">
                <i class="fas fa-plus-circle mr-2"></i>
                Nuevo Gasto
              </button>
              <button onclick="window.location.hash='#presupuestos'" class="flex items-center justify-center bg-secondary hover:bg-secondary-dark text-white px-4 py-3 rounded-md transition-colors">
                <i class="fas fa-wallet mr-2"></i>
                Ver Presupuestos
              </button>
              <button onclick="window.location.hash='#reportes'" class="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-md transition-colors">
                <i class="fas fa-chart-bar mr-2"></i>
                Ver Reportes
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async loadData() {
    try {
      const response = await DashboardAPI.getDashboard();
      this.dashboardData = response.data;

      document.getElementById('loading-state').classList.add('hidden');
      document.getElementById('dashboard-content').classList.remove('hidden');

      this.renderSummaryCards();
      this.renderMotivationalMessages();
      this.renderCharts();
    } catch (error) {
      console.error('Error loading dashboard:', error);
      this.showError(error.message);
    }
  }

  renderSummaryCards() {
    const container = document.getElementById('summary-cards');
    const { resumen } = this.dashboardData;

    const cards = [
      {
        title: 'Gastado Hoy',
        value: FormatUtil.formatCurrency(resumen.total_gastado_hoy),
        icon: 'fa-notdog fa-solid fa-calendar',
        color: 'text-blue-600 bg-blue-50'
      },
      {
        title: 'Gastado este Mes',
        value: FormatUtil.formatCurrency(resumen.total_gastado_mes),
        icon: 'fa-calendar-alt',
        color: 'text-purple-600 bg-purple-50'
      },
      {
        title: 'Presupuesto Restante',
        value: FormatUtil.formatCurrency(resumen.presupuesto_restante),
        icon: 'fa-wallet',
        color: resumen.presupuesto_restante > 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
      },
      {
        title: 'Presupuesto Usado',
        value: `${resumen.porcentaje_usado.toFixed(1)}%`,
        icon: 'fa-percentage',
        color: this.getStatusColor(resumen.porcentaje_usado)
      }
    ];

    container.innerHTML = cards.map(card => `
      <div class="bg-white rounded-lg shadow-md p-6 card-hover">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">${card.title}</p>
            <p class="text-2xl font-bold text-gray-900">${card.value}</p>
          </div>
          <div class="${card.color} w-12 h-12 rounded-full flex items-center justify-center">
            <i class="fas ${card.icon} text-xl"></i>
          </div>
        </div>
      </div>
    `).join('');
  }

  renderMotivationalMessages() {
    const container = document.getElementById('motivational-messages');
    const { mensajes_motivacionales } = this.dashboardData;

    container.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <i class="fas fa-lightbulb text-3xl"></i>
        </div>
        <div class="ml-4">
          <h3 class="text-lg font-semibold mb-2">Mensajes para ti</h3>
          ${mensajes_motivacionales.map(msg => `
            <p class="text-white opacity-90 mb-1">${msg}</p>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderCharts() {
    this.renderCategoryChart();
    this.renderDailyChart();
  }

  renderCategoryChart() {
    const ctx = document.getElementById('category-chart');
    const { gastos_por_categoria } = this.dashboardData;

    if (gastos_por_categoria.length === 0) {
      ctx.parentElement.innerHTML = '<div class="empty-state"><i class="fas fa-chart-pie"></i><p class="text-gray-500 mt-2">No hay gastos registrados</p></div>';
      return;
    }

    if (this.charts.category) {
      this.charts.category.destroy();
    }

    this.charts.category = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: gastos_por_categoria.map(c => c.categoria),
        datasets: [{
          data: gastos_por_categoria.map(c => c.total),
          backgroundColor: gastos_por_categoria.map(c => c.color),
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = FormatUtil.formatCurrency(context.parsed);
                const percentage = gastos_por_categoria[context.dataIndex].porcentaje;
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  renderDailyChart() {
    const ctx = document.getElementById('daily-chart');
    const { gastos_por_dia } = this.dashboardData;

    if (gastos_por_dia.length === 0) {
      ctx.parentElement.innerHTML = '<div class="empty-state"><i class="fas fa-chart-line"></i><p class="text-gray-500 mt-2">No hay gastos registrados</p></div>';
      return;
    }

    if (this.charts.daily) {
      this.charts.daily.destroy();
    }

    this.charts.daily = new Chart(ctx, {
      type: 'line',
      data: {
        labels: gastos_por_dia.map(d => FormatUtil.formatDateShort(d.fecha)),
        datasets: [{
          label: 'Gastos Diarios',
          data: gastos_por_dia.map(d => d.total),
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
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
                return FormatUtil.formatCurrency(context.parsed.y);
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

  getStatusColor(percentage) {
    if (percentage < 60) return 'text-green-600 bg-green-50';
    if (percentage < 80) return 'text-yellow-600 bg-yellow-50';
    if (percentage < 95) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  }

  showError(message) {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
          <p class="text-red-700 font-medium">${message}</p>
          <button onclick="location.reload()" class="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md">
            Reintentar
          </button>
        </div>
      </div>
    `;
  }
}

export default new DashboardPage();