// pages/page-ncr.js

// Загрузка изделий для NCR
async function loadItemsForNCR() {
    try {
      const db = window.db;
      const snapshot = await db.collection('items')
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();
  
      const select = document.getElementById('ncrItemId');
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
  
  // Создание NCR
  async function createNCR() {
    const itemId = document.getElementById('ncrItemId').value;
    const type = document.getElementById('ncrType').value;
    const severity = document.getElementById('ncrSeverity').value;
    const standard = document.getElementById('ncrStandard').value;
    const description = document.getElementById('ncrDescription').value;
    const action = document.getElementById('ncrAction').value;
    const deadline = document.getElementById('ncrDeadline').value;
  
    // Валидация
    if (!itemId || !type || !severity || !description || !action || !deadline) {
      alert('Заполните все обязательные поля');
      return;
    }
  
    try {
      const db = window.db;
      
      // Проверяем изделие
      const itemDoc = await db.collection('items').doc(itemId).get();
      if (!itemDoc.exists) {
        throw new Error(`Изделие ${itemId} не найдено`);
      }
  
      // Генерируем ID
      const ncrId = `NCR-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;
  
      // Создаем NCR
      const ncr = {
        id: ncrId,
        item_id: itemId,
        type,
        severity,
        standard: standard || null,
        description,
        required_action: action,
        deadline,
        status: 'open',
        createdAt: new Date().toISOString(),
        closedAt: null
      };
  
      // Сохраняем NCR
      await db.collection('ncrs').doc(ncrId).set(ncr);
  
      // Добавляем ссылку в изделие
      await db.collection('items').doc(itemId).update({
        ncr: firebase.firestore.FieldValue.arrayUnion(ncrId)
      });
  
      // Успех
      document.getElementById('ncrResult').innerHTML = `
        ✅ NCR создан: <strong>${ncrId}</strong><br>
        Изделие: ${itemId}<br>
        Тип: ${type}<br>
        Критичность: ${severity}
      `;
  
      // Триггер для агента
      if (window.agent) {
        await window.agent.trigger('on_new_ncr', ncr);
      }
  
      // Обновляем список
      showRecentNCRs();
  
    } catch (error) {
      console.error('Ошибка создания NCR:', error);
      document.getElementById('ncrResult').innerHTML = `❌ Ошибка: ${error.message}`;
    }
  }
  
  // Показ последних NCR
  async function showRecentNCRs() {
    try {
      const db = window.db;
      const snapshot = await db.collection('ncrs')
        .orderBy('createdAt', 'desc')
        .limit(10)
        .get();
  
      let html = '';
      snapshot.forEach(doc => {
        const ncr = doc.data();
        const severityClass = ncr.severity === 'critical' ? 'critical' : 
                            ncr.severity === 'major' ? 'major' : 'minor';
        
        html += `
          <div class="ncr-card ${severityClass}">
            <strong>${ncr.id}</strong><br>
            Изделие: ${ncr.item_id}<br>
            Тип: ${ncr.type}<br>
            Критичность: ${ncr.severity}<br>
            Статус: ${ncr.status}<br>
            Срок: ${ncr.deadline}
          </div>
          <hr>
        `;
      });
  
      document.getElementById('recentNCRs').innerHTML = html || 'NCR нет';
  
    } catch (error) {
      console.error('Ошибка загрузки NCR:', error);
    }
  }
  
  // Автозагрузка при открытии страницы
  document.addEventListener('DOMContentLoaded', function() {
    loadItemsForNCR();
    showRecentNCRs();
    
    // Установка дедлайна через 7 дней
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 7);
    document.getElementById('ncrDeadline').value = deadline.toISOString().split('T')[0];
  });