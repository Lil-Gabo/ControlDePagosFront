class FormatUtil {
  formatCurrency(amount) {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateFormat('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }

  formatDateShort(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  }

  formatDateInput(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getCurrentDate() {
    return this.formatDateInput(new Date());
  }

  getMonthName(monthNumber) {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[monthNumber - 1];
  }

  getCurrentMonth() {
    return new Date().getMonth() + 1;
  }

  getCurrentYear() {
    return new Date().getFullYear();
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  truncate(str, length = 50) {
    if (str.length <= length) return str;
    return str.substring(0, length) + '...';
  }

  formatPercentage(value) {
    return `${value.toFixed(2)}%`;
  }
}

export default new FormatUtil();