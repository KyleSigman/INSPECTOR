// pages/page-company.js

// pages/page-company.js

// Добавление предприятия
async function addCompany() {
  const name = document.getElementById('companyName').value;
  const address = document.getElementById('companyAddress').value;
  const contact = document.getElementById('companyContact').value;
  const standards = document.getElementById('companyStandards').value;

  if (!name) {
    alert('Укажите название предприятия');
    return;
  }

  try {
    const db = window.db;
    
    // Генерируем ID
    const companyId = `COMPANY-${Date.now()}`;

    // Создаем предприятие
    const company = {
      id: companyId,
      name,
      address: address || null,
      contact: contact || null,
      standards: standards ? standards.split(',').map(s => s.trim()) : [],
      createdAt: new Date().toISOString(),
      items: [], // Список изделий
      ncr_count: 0,
      last_update: new Date().toISOString()
    };

    // Сохраняем
    await db.collection('companies').doc(companyId).set(company);

    // Успех
    document.getElementById('companyAddResult').innerHTML = `
      ✅ Предприятие добавлено: <strong>${companyId}</strong><br>
      Название: ${name}
    `;

    // Обновляем списки
    loadCompaniesList();
    loadCompaniesForStats();

    // Очищаем форму
    document.getElementById('companyName').value = '';
    document.getElementById('companyAddress').value = '';
    document.getElementById('companyContact').value = '';
    document.getElementById('companyStandards').value = '';

  } catch (error) {
    console.error('Ошибка добавления предприятия:', error);
    document.getElementById('companyAddResult').innerHTML = `❌ Ошибка: ${error.message}`;
  }
}

// Загрузка списка предприятий
async function loadCompaniesList() {
  try {
    const db = window.db;
    const snapshot = await db.collection('companies')
      .orderBy('createdAt', 'desc')
      .get();

    let html = '';
    snapshot.forEach(doc => {
      const company = doc.data();
      // ✅ Исправлено: безопасная обработка standards
      const standardsText = (company.standards && Array.isArray(company.standards) && company.standards.length > 0) 
        ? company.standards.join(', ') 
        : '—';
      
      html += `
        <div class="company-card">
          <strong>${company.name || 'Без названия'}</strong><br>
          ID: ${company.id || '—'}<br>
          Контакт: ${company.contact || '—'}<br>
          Стандарты: ${standardsText}
        </div>
        <hr>
      `;
    });

    document.getElementById('companiesList').innerHTML = html || 'Предприятий нет';

  } catch (error) {
    console.error('Ошибка загрузки предприятий:', error);
  }
}

// Загрузка предприятий для статистики
async function loadCompaniesForStats() {
  try {
    const db = window.db;
    const snapshot = await db.collection('companies')
      .orderBy('name')
      .get();

    const select = document.getElementById('companyForStats');
    select.innerHTML = '<option value="">-- Выберите предприятие --</option>';

    snapshot.forEach(doc => {
      const company = doc.data();
      const option = document.createElement('option');
      option.value = company.id || '';
      option.textContent = company.name || 'Без названия';
      select.appendChild(option);
    });

  } catch (error) {
    console.error('Ошибка загрузки предприятий для статистики:', error);
  }
}

// Статистика по предприятию
async function loadCompanyStatistics() {
  const companyId = document.getElementById('companyForStats').value;
  if (!companyId) {
    alert('Выберите предприятие');
    return;
  }

  try {
    const db = window.db;
    
    // Получаем предприятие
    const companyDoc = await db.collection('companies').doc(companyId).get();
    if (!companyDoc.exists) {
      throw new Error('Предприятие не найдено');
    }
    const company = companyDoc.data();

    // Получаем изделия этого предприятия
    const itemsSnapshot = await db.collection('items')
      .where('manufacturer', '==', company.name)
      .get();

    // Получаем NCR по этим изделиям
    const itemIds = itemsSnapshot.docs.map(doc => doc.id);
    let totalNCR = 0;

    if (itemIds.length > 0) {
      const ncrsSnapshot = await db.collection('ncrs')
        .where('item_id', 'in', itemIds.slice(0, 10)) // Ограничение Firestore
        .get();
      totalNCR = ncrsSnapshot.size;
    }

    // ✅ Исправлено: безопасная обработка standards
    const standardsText = (company.standards && Array.isArray(company.standards) && company.standards.length > 0) 
      ? company.standards.join(', ') 
      : '—';

    // Отображаем
    document.getElementById('companyStatsResult').innerHTML = `
      <div class="stats-card">
        <h3>🏭 ${company.name || 'Без названия'}</h3>
        <p><strong>Изделий:</strong> ${itemsSnapshot.size}</p>
        <p><strong>Актов NCR:</strong> ${totalNCR}</p>
        <p><strong>Уровень брака:</strong> ${itemsSnapshot.size > 0 ? ((totalNCR / itemsSnapshot.size) * 100).toFixed(1) : 0}%</p>
        <p><strong>Стандарты:</strong> ${standardsText}</p>
        <p><strong>Последнее обновление:</strong> ${company.last_update ? new Date(company.last_update).toLocaleDateString() : '—'}</p>
      </div>
    `;

  } catch (error) {
    console.error('Ошибка загрузки статистики:', error);
    document.getElementById('companyStatsResult').innerHTML = `❌ Ошибка: ${error.message}`;
  }
}

// Автозагрузка при открытии страницы
document.addEventListener('DOMContentLoaded', function() {
  loadCompaniesList();
  loadCompaniesForStats();
});
// Добавление предприятия
// async function addCompany() {
//     const name = document.getElementById('companyName').value;
//     const address = document.getElementById('companyAddress').value;
//     const contact = document.getElementById('companyContact').value;
//     const standards = document.getElementById('companyStandards').value;
  
//     if (!name) {
//       alert('Укажите название предприятия');
//       return;
//     }
  
//     try {
//       const db = window.db;
      
//       // Генерируем ID
//       const companyId = `COMPANY-${Date.now()}`;
  
//       // Создаем предприятие
//       const company = {
//         id: companyId,
//         name,
//         address: address || null,
//         contact: contact || null,
//         standards: standards ? standards.split(',').map(s => s.trim()) : [],
//         createdAt: new Date().toISOString(),
//         items: [], // Список изделий
//         ncr_count: 0,
//         last_update: new Date().toISOString()
//       };
  
//       // Сохраняем
//       await db.collection('companies').doc(companyId).set(company);
  
//       // Успех
//       document.getElementById('companyAddResult').innerHTML = `
//         ✅ Предприятие добавлено: <strong>${companyId}</strong><br>
//         Название: ${name}
//       `;
  
//       // Обновляем списки
//       loadCompaniesList();
//       loadCompaniesForStats();
  
//       // Очищаем форму
//       document.getElementById('companyName').value = '';
//       document.getElementById('companyAddress').value = '';
//       document.getElementById('companyContact').value = '';
//       document.getElementById('companyStandards').value = '';
  
//     } catch (error) {
//       console.error('Ошибка добавления предприятия:', error);
//       document.getElementById('companyAddResult').innerHTML = `❌ Ошибка: ${error.message}`;
//     }
//   }
  
  // Загрузка списка предприятий
  async function loadCompaniesList() {
    try {
      const db = window.db;
      const snapshot = await db.collection('companies')
        .orderBy('createdAt', 'desc')
        .get();
  
      let html = '';
      snapshot.forEach(doc => {
        const company = doc.data();
        html += `
          <div class="company-card">
            <strong>${company.name}</strong><br>
            ID: ${company.id}<br>
            Контакт: ${company.contact || '—'}<br>
            Стандарты: ${(company.standards && Array.isArray(company.standards)) ? company.standards.join(', ') : '—'}

          </div>
          <hr>
        `;
      });
  
      document.getElementById('companiesList').innerHTML = html || 'Предприятий нет';
  
    } catch (error) {
      console.error('Ошибка загрузки предприятий:', error);
    }
  }
  
  // Загрузка предприятий для статистики
  async function loadCompaniesForStats() {
    try {
      const db = window.db;
      const snapshot = await db.collection('companies')
        .orderBy('name')
        .get();
  
      const select = document.getElementById('companyForStats');
      select.innerHTML = '<option value="">-- Выберите предприятие --</option>';
  
      snapshot.forEach(doc => {
        const company = doc.data();
        const option = document.createElement('option');
        option.value = company.id;
        option.textContent = company.name;
        select.appendChild(option);
      });
  
    } catch (error) {
      console.error('Ошибка загрузки предприятий для статистики:', error);
    }
  }
  
  // Статистика по предприятию
  async function loadCompanyStatistics() {
    const companyId = document.getElementById('companyForStats').value;
    if (!companyId) {
      alert('Выберите предприятие');
      return;
    }
  
    try {
      const db = window.db;
      
      // Получаем предприятие
      const companyDoc = await db.collection('companies').doc(companyId).get();
      if (!companyDoc.exists) {
        throw new Error('Предприятие не найдено');
      }
      const company = companyDoc.data();
  
      // Получаем изделия этого предприятия
      const itemsSnapshot = await db.collection('items')
        .where('manufacturer', '==', company.name)
        .get();
  
      // Получаем NCR по этим изделиям
      const itemIds = itemsSnapshot.docs.map(doc => doc.id);
      let totalNCR = 0;
  
      if (itemIds.length > 0) {
        const ncrsSnapshot = await db.collection('ncrs')
          .where('item_id', 'in', itemIds.slice(0, 10)) // Ограничение Firestore
          .get();
        totalNCR = ncrsSnapshot.size;
      }
  
      // Отображаем
      document.getElementById('companyStatsResult').innerHTML = `
        <div class="stats-card">
          <h3>🏭 ${company.name}</h3>
          <p><strong>Изделий:</strong> ${itemsSnapshot.size}</p>
          <p><strong>Актов NCR:</strong> ${totalNCR}</p>
          <p><strong>Уровень брака:</strong> ${itemsSnapshot.size > 0 ? ((totalNCR / itemsSnapshot.size) * 100).toFixed(1) : 0}%</p>

          <strong>Стандарты:</strong> ${(company.standards && Array.isArray(company.standards)) ? company.standards.join(', ') : '—'}</p>
          <p><strong>Последнее обновление:</strong> ${new Date(company.last_update).toLocaleDateString()}</p>
        </div>
      `;
  
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
      document.getElementById('companyStatsResult').innerHTML = `❌ Ошибка: ${error.message}`;
    }
  }
  
  // Автозагрузка при открытии страницы
  document.addEventListener('DOMContentLoaded', function() {
    loadCompaniesList();
    loadCompaniesForStats();
  });