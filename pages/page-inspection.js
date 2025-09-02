// pages/page-inspection.js

// Установка сегодняшней даты и загрузка данных при открытии страницы
document.addEventListener('DOMContentLoaded', function() {
    // Дата по умолчанию
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('inspectionDate').value = today;
  
    // Загружаем списки
    loadItemsForInspection();
    showRecentInspections();
  });
  
  // Добавление проверки
  async function addInspection() {
    const itemId = document.getElementById('inspectionItemId').value;
    const type = document.getElementById('inspectionType').value;
    const result = document.getElementById('inspectionResult').value;
    const defect = document.getElementById('inspectionDefect').value;
    const inspector = document.getElementById('inspectorName').value;
    const date = document.getElementById('inspectionDate').value;
  
    // Валидация
    if (!itemId || !type || !result || !inspector || !date) {
      alert('Заполните все обязательные поля');
      return;
    }
  
    try {
      const db = window.db;
      
      // Проверяем, существует ли изделие
      const itemDoc = await db.collection('items').doc(itemId).get();
      if (!itemDoc.exists) {
        throw new Error(`Изделие ${itemId} не найдено`);
      }
  
      // Создаем запись проверки
      const inspectionId = `INS-${Date.now()}`;
      const inspection = {
        id: inspectionId,
        item_id: itemId,
        type,
        result,
        defect: defect || null,
        inspector,
        date,
        createdAt: new Date().toISOString()
      };
  
      // Сохраняем проверку
      await db.collection('inspections').doc(inspectionId).set(inspection);
  
      // Добавляем ссылку на проверку в изделие
      await db.collection('items').doc(itemId).update({
        inspections: firebase.firestore.FieldValue.arrayUnion(inspectionId)
      });
  
      // Успех
      document.getElementById('inspectionResult').innerHTML = `
        ✅ Проверка добавлена: <strong>${inspectionId}</strong><br>
        Изделие: ${itemId}<br>
        Тип: ${type}<br>
        Результат: ${result}
      `;
  
      // Если брак — триггерим событие
      if (result === 'Брак' && window.agent) {
        await window.agent.trigger('on_new_defect', inspection);
      }
  
      // Обновляем список
      showRecentInspections();
  
    } catch (error) {
      console.error('Ошибка добавления проверки:', error);
      document.getElementById('inspectionResult').innerHTML = `❌ Ошибка: ${error.message}`;
    }
  }
  
  // Показ последних проверок
  async function showRecentInspections() {
    try {
      const db = window.db;
      const snapshot = await db.collection('inspections')
        .orderBy('createdAt', 'desc')
        .limit(10)
        .get();
  
      let html = '';
      snapshot.forEach(doc => {
        const ins = doc.data();
        html += `
          <div class="inspection-card">
            <strong>${ins.id}</strong><br>
            Изделие: ${ins.item_id}<br>
            Тип: ${ins.type}<br>
            Результат: <span class="${ins.result === 'OK' ? 'ok' : 'defect'}">${ins.result}</span><br>
            Инспектор: ${ins.inspector}<br>
            Дата: ${ins.date}
          </div>
          <hr>
        `;
      });
  
      document.getElementById('recentInspections').innerHTML = html || 'Проверок нет';
  
    } catch (error) {
      console.error('Ошибка загрузки проверок:', error);
    }
  }

  // Загрузка списка изделий
async function loadItemsForInspection() {
    try {
      const db = window.db;
      const snapshot = await db.collection('items')
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();
  
      const select = document.getElementById('inspectionItemId');
      select.innerHTML = '<option value="">-- Выберите изделие --</option>';
  
      snapshot.forEach(doc => {
        const item = doc.data();
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = `${item.id} - ${item.type} ${item.diameter || item.pn || ''}`;
        select.appendChild(option);
      });
  
    } catch (error) {
      console.error('Ошибка загрузки изделий:', error);
    }
  }
  
  // Загружаем при открытии страницы
  document.addEventListener('DOMContentLoaded', loadItemsForInspection);
  
  // Автозагрузка при открытии страницы
  document.addEventListener('DOMContentLoaded', showRecentInspections);