// pages/page-compare.js

async function compareStandards() {
    const key = document.getElementById('compareSelect').value;
    if (!key) return;
  
    try {
      const comparisons = await loadKnowledgeData('comparison.json');
      const data = comparisons[key];
  
      if (!data) {
        document.getElementById('comparisonResult').innerHTML = 'Сравнение не найдено';
        return;
      }
  
      let html = `<h3>Сравнение: ${key.replace(/_/g, ' → ')}</h3>`;
      html += '<table border="1" style="width: 100%; border-collapse: collapse;">';
      html += '<tr><th>Параметр</th><th>Стандарт 1</th><th>Стандарт 2</th><th>Вывод</th></tr>';
  
      for (const [param, values] of Object.entries(data)) {
        const standards = Object.keys(values).filter(k => k !== 'conclusion');
        if (standards.length >= 2) {
          html += `
            <tr>
              <td>${param}</td>
              <td>${values[standards[0]] || '—'}</td>
              <td>${values[standards[1]] || '—'}</td>
              <td><strong>${values.conclusion || '—'}</strong></td>
            </tr>
          `;
        }
      }
  
      html += '</table>';
      document.getElementById('comparisonResult').innerHTML = html;
  
    } catch (error) {
      console.error('Ошибка сравнения:', error);
      document.getElementById('comparisonResult').innerHTML = `❌ Ошибка: ${error.message}`;
    }
  }