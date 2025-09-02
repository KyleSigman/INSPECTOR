// pages/page-analytics.js

// Загрузка аналитики при открытии страницы
document.addEventListener('DOMContentLoaded', loadAnalytics);

async function loadAnalytics() {
  try {
    showLoading();
    
    // Загружаем все данные
    const data = await fetchAllData();
    console.log('Данные для аналитики:', data);
    
    // Обновляем метрики
    updateMetrics(data);
    
    // Создаем графики
    createQualityTrendChart(data);
    createDefectsByTypeChart(data);
    createCompaniesChart(data);
    createInspectorsChart(data);
    
    hideLoading();
    
  } catch (error) {
    console.error('Ошибка загрузки аналитики:', error);
    hideLoading();
  }
}

// Загрузка всех данных
async function fetchAllData() {
  const db = window.db;
  
  const [items, inspections, ncrs, companies] = await Promise.all([
    db.collection('items').get(),
    db.collection('inspections').get(),
    db.collection('ncrs').get(),
    db.collection('companies').get()
  ]);
  
  return {
    items: items.docs.map(doc => doc.data()),
    inspections: inspections.docs.map(doc => doc.data()),
    ncrs: ncrs.docs.map(doc => doc.data()),
    companies: companies.docs.map(doc => doc.data())
  };
}

// Обновление метрик
function updateMetrics(data) {
  const totalItems = data.items.length;
  const totalInspections = data.inspections.length;
  const totalNCR = data.ncrs.length;
  
  const defectRate = totalInspections > 0 ? 
    ((totalNCR / totalInspections) * 100).toFixed(1) : 0;
  
  document.getElementById('totalItems').textContent = totalItems;
  document.getElementById('totalInspections').textContent = totalInspections;
  document.getElementById('totalNCR').textContent = totalNCR;
  document.getElementById('defectRate').textContent = defectRate + '%';
}

function createQualityTrendChart(data) {
  const ctx = document.getElementById('qualityTrendChart').getContext('2d');
  
  // Группируем по месяцам
  const monthlyData = {};
  data.inspections.forEach(inspection => {
    const month = inspection.date.substring(0, 7); // "2025-04"
    if (!monthlyData[month]) {
      monthlyData[month] = { total: 0, defects: 0 };
    }
    monthlyData[month].total++;
    if (inspection.result !== 'OK') {
      monthlyData[month].defects++;
    }
  });
  
  const months = Object.keys(monthlyData).sort();
  const rates = months.map(month => {
    const d = monthlyData[month];
    return d.total > 0 ? ((d.defects / d.total) * 100).toFixed(1) : 0;
  });
  
  console.log('Данные для графика качества:', {months, rates});
  
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: months,
      datasets: [{
        label: 'Уровень брака, %',
        data: rates,
        borderColor: '#007bff',
        backgroundColor: 'rgba(0, 123, 255, 0.1)',
        tension: 0.1,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Динамика качества'
        }
      }
    }
  });
}

function createDefectsByTypeChart(data) {
  const ctx = document.getElementById('defectsByTypeChart').getContext('2d');
  
  const defectTypes = {};
  data.ncrs.forEach(ncr => {
    // Используем severity вместо type
    const type = ncr.severity || 'Не указан';
    defectTypes[type] = (defectTypes[type] || 0) + 1;
  });
  
  const types = Object.keys(defectTypes);
  const counts = Object.values(defectTypes);
  
  console.log('Данные для графика дефектов:', {types, counts});
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: types,
      datasets: [{
        label: 'Количество дефектов',
        data: counts,
        backgroundColor: '#dc3545'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Типы дефектов (по критичности)'
        }
      }
    }
  });
}


function createCompaniesChart(data) {
  const ctx = document.getElementById('companiesByNCRChart').getContext('2d');
  
  // Считаем NCR по предприятиям
  const companyNCR = {};
  data.ncrs.forEach(ncr => {
    const item = data.items.find(i => i.id === ncr.item_id);
    if (item) {
      const company = item.manufacturer || 'Неизвестно';
      companyNCR[company] = (companyNCR[company] || 0) + 1;
    } else {
      companyNCR['Неизвестное изделие'] = (companyNCR['Неизвестное изделие'] || 0) + 1;
    }
  });
  
  const companies = Object.keys(companyNCR);
  const counts = Object.values(companyNCR);
  
  console.log('Данные для графика предприятий:', {companies, counts});
  
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: companies,
      datasets: [{
        data: counts,
        backgroundColor: [
          '#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8'
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'NCR по предприятиям'
        }
      }
    }
  });
}

// График инспекторов
function createInspectorsChart(data) {
  const ctx = document.getElementById('inspectorsChart').getContext('2d');
  
  const inspectors = {};
  data.inspections.forEach(inspection => {
    const inspector = inspection.inspector || 'Неизвестен';
    inspectors[inspector] = (inspectors[inspector] || 0) + 1;
  });
  
  const names = Object.keys(inspectors);
  const counts = Object.values(inspectors);
  
  console.log('Данные для графика инспекторов:', {names, counts});
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: names,
      datasets: [{
        label: 'Проверок проведено',
        data: counts,
        backgroundColor: '#28a745'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Активность инспекторов'
        }
      }
    }
  });
}

// Экспорт отчетов
async function exportReport(format) {
  alert(`Экспорт в ${format.toUpperCase()} (пока заглушка)`);
}

// Показ/скрытие загрузки
function showLoading() {
  // Можно добавить индикатор загрузки
}

function hideLoading() {
  // Скрыть индикатор загрузки
}

