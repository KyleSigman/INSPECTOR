// pages/page-materials.js

// Загрузка материала
async function loadMaterial() {
    const materialName = document.getElementById('materialSelect').value;
    if (!materialName) {
      document.getElementById('materialInfo').innerHTML = 'Выберите материал';
      return;
    }
  
    try {
      // Загружаем из кассеты
      const materials = await loadKnowledgeData('materials.json');
      const material = materials[materialName];
      
      if (!material) {
        document.getElementById('materialInfo').innerHTML = 'Материал не найден в справочнике';
        return;
      }
  
      // Отображаем
      document.getElementById('materialInfo').innerHTML = `
        <div class="material-card">
          <h3>📋 ${materialName}</h3>
          <p><strong>Тип:</strong> ${material.type}</p>
          <p><strong>Диапазон температур:</strong> ${material.temp_range}</p>
          <p><strong>Применение:</strong> ${material.applications.join(', ')}</p>
          <p><strong>Аналог:</strong> ${material.analog}</p>
        </div>
      `;
  
    } catch (error) {
      console.error('Ошибка загрузки материала:', error);
      document.getElementById('materialInfo').innerHTML = `❌ Ошибка: ${error.message}`;
    }
  }
  
  // Показать все материалы
  async function showAllMaterials() {
    try {
      const materials = await loadKnowledgeData('materials.json');
      
      let html = '<h3>📋 Все материалы в справочнике</h3>';
      for (const [name, data] of Object.entries(materials)) {
        html += `
          <div class="material-mini-card">
            <strong>${name}</strong> - ${data.type}
          </div>
        `;
      }
      
      document.getElementById('materialInfo').innerHTML = html;
  
    } catch (error) {
      console.error('Ошибка загрузки материалов:', error);
      document.getElementById('materialInfo').innerHTML = `❌ Ошибка: ${error.message}`;
    }
  }
  
  // Добавление нового материала
  async function addNewMaterial() {
    const name = document.getElementById('newMaterialName').value;
    if (!name) {
      alert('Введите название материала');
      return;
    }
  
    // Заглушка - в реальности нужно сохранять в Firebase
    alert(`Материал "${name}" будет добавлен в следующей версии`);
    document.getElementById('newMaterialName').value = '';
  }
  
  // Автозагрузка при открытии
  document.addEventListener('DOMContentLoaded', function() {
    // Можно добавить автозагрузку последнего материала
  });