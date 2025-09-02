// pages/page-statistics.js

// Загрузка статистики
async function loadStatistics() {
    const period = document.getElementById('statPeriod').value;
    const stats = await calculateStatistics(period);
    
    displayStatistics(stats);
  }
  
  // Расчет статистики
  async function calculateStatistics(period) {
    try {
      const db = window.db;
      const now = new Date();
      let startDate;
  
      // Определяем период
      switch(period) {
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          break;
        case 'quarter':
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      }
  
      // Загружаем данные
      const itemsSnapshot = await db.collection('items')
        .where('createdAt', '>=', startDate.toISOString())
        .get();
      
      const ncrsSnapshot = await db.collection('ncrs')
        .where('createdAt', '>=', startDate.toISOString())
        .get();
  
      const totalItems = itemsSnapshot.size;
      const totalNCR = ncrsSnapshot.size;
      const defectRate = totalItems > 0 ? ((totalNCR / totalItems) * 100).toFixed(1) : 0;
  
      // Анализируем дефекты
      const defectTypes = {};
      const severityCount = { minor: 0, major: 0, critical: 0 };
      const companyStats = {};
  
      ncrsSnapshot.forEach(doc => {
        const ncr = doc.data();
        
        // Типы дефектов
        defectTypes[ncr.type] = (defectTypes[ncr.type] || 0) + 1;
        
        // Критичность
        severityCount[ncr.severity] = (severityCount[ncr.severity] || 0) + 1;
        
        // Предприятия (через изделия)
        // Пока упрощенно - добавим позже
      });
  
      // Топ дефектов
      const topDefects = Object.entries(defectTypes)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);
  
      return {
        period,
        totalItems,
        totalNCR,
        defectRate,
        topDefects,
        severityCount,
        companyStats,
        startDate: startDate.toISOString().split('T')[0],
        endDate: now.toISOString().split('T')[0]
      };
  
    } catch (error) {
      console.error('Ошибка расчета статистики:', error);
      return null;
    }
  }
  
  // Отображение статистики
  function displayStatistics(stats) {
    if (!stats) {
      document.getElementById('statsOverview').innerHTML = '❌ Ошибка загрузки статистики';
      return;
    }
  
    // Общая сводка
    document.getElementById('statsOverview').innerHTML = `
      <div class="stats-card">
        <h3>📈 Общая сводка</h3>
        <p><strong>Период:</strong> ${stats.startDate} — ${stats.endDate}</p>
        <p><strong>Изделий проверено:</strong> ${stats.totalItems}</p>
        <p><strong>Актов NCR:</strong> ${stats.totalNCR}</p>
        <p><strong>Уровень брака:</strong> <span class="rate">${stats.defectRate}%</span></p>
      </div>
    `;
  
    // Тренды (упрощенно)
    document.getElementById('trendChart').innerHTML = `
      <div class="chart-placeholder">
        📈 График динамики (будет реализован позже)
      </div>
    `;
  
    // Топ дефектов
    let topDefectsHTML = '<ul>';
    stats.topDefects.forEach(([type, count]) => {
      topDefectsHTML += `<li><strong>${type}:</strong> ${count} шт.</li>`;
    });
    topDefectsHTML += '</ul>';
    document.getElementById('topDefects').innerHTML = topDefectsHTML;
  
    // Критичность
    document.getElementById('severityChart').innerHTML = `
      <div class="severity-stats">
        <div class="severity-item">
          <span class="severity-badge critical">Critical</span>: ${stats.severityCount.critical || 0}
        </div>
        <div class="severity-item">
          <span class="severity-badge major">Major</span>: ${stats.severityCount.major || 0}
        </div>
        <div class="severity-item">
          <span class="severity-badge minor">Minor</span>: ${stats.severityCount.minor || 0}
        </div>
      </div>
    `;
  
    // По предприятиям (заглушка)
    document.getElementById('companyStats').innerHTML = `
      <div class="chart-placeholder">
        🏭 Статистика по предприятиям (будет реализована позже)
      </div>
    `;
  
    // Рекомендации (упрощенно)
    let recommendation = '';
    if (stats.defectRate > 10) {
      recommendation = '⚠️ Высокий уровень брака. Рекомендуется усилить контроль.';
    } else if (stats.defectRate > 5) {
      recommendation = 'ℹ️ Умеренный уровень брака. Следить за трендом.';
    } else {
      recommendation = '✅ Уровень качества хороший.';
    }
  
    document.getElementById('statsOverview').innerHTML += `
      <div class="recommendation">
        <h4>🤖 Рекомендация:</h4>
        <p>${recommendation}</p>
      </div>
    `;
  }
  
  // Автозагрузка при открытии страницы
  document.addEventListener('DOMContentLoaded', loadStatistics);