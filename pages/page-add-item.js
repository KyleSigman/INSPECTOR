// pages/page-add-item.js

// Загрузка формы по типу изделия
// pages/page-add-item.js

async function loadTemplate() {
  try {
    const products = await loadKnowledgeData('products.json');
    const type = document.getElementById('productType').value;
    
    const product = products[type];
    if (!product) {
      console.warn(`Тип "${type}" не найден`);
      document.getElementById('paramsForm').innerHTML = '<p style="color: red;">Тип не найден</p>';
      return;
    }
    
    const container = document.getElementById('paramsForm');
    let form = '';

    // Динамические поля
    if (product.params.includes('diameter')) {
      form += '<label>Диаметр, мм: <input type="number" id="diameter" step="0.1"></label><br>';
    }
    if (product.params.includes('thickness')) {
      form += '<label>Толщина стенки, мм: <input type="number" id="thickness" step="0.1"></label><br>';
    }
    if (product.params.includes('pn')) {
      form += '<label>PN: <input type="number" id="pn"></label><br>';
    }
    if (product.params.includes('face_type')) {
      form += `
        <label>Тип уплотнения: 
          <select id="face_type">
            <option value="RF">RF</option>
            <option value="FF">FF</option>
            <option value="MFM">MFM</option>
          </select>
        </label><br>
      `;
    }
    if (product.params.includes('dn')) {
      form += '<label>DN: <input type="number" id="dn"></label><br>';
    }
    if (product.params.includes('volume')) {
      form += '<label>Объем, м³: <input type="number" id="volume" step="0.1"></label><br>';
    }
    if (product.params.includes('flow')) {
      form += '<label>Производительность, м³/ч: <input type="number" id="flow" step="0.1"></label><br>';
    }
    if (product.params.includes('head')) {
      form += '<label>Напор, м: <input type="number" id="head"></label><br>';
    }
    if (product.params.includes('power')) {
      form += '<label>Мощность, кВт: <input type="number" id="power" step="0.1"></label><br>';
    }
    if (product.params.includes('pressure')) {
      form += '<label>Давление, МПа: <input type="number" id="pressure" step="0.1"></label><br>';
    }
    if (product.params.includes('heat_surface')) {
      form += '<label>Поверхность теплообмена, м²: <input type="number" id="heat_surface" step="0.1"></label><br>';
    }
    if (product.params.includes('ratio')) {
      form += '<label>Передаточное отношение: <input type="number" id="ratio" step="0.01"></label><br>';
    }

    // Материал — с дефолтом из products.json
    const defaultMaterial = product.default_material || "12Х18Н10Т";
    form += `
      <label>Материал: 
        <select id="material">
          <option value="12Х18Н10Т">12Х18Н10Т</option>
          <option value="09Г2С">09Г2С</option>
          <option value="13ХФА">13ХФА</option>
          <option value="15ХМ">15ХМ</option>
          <option value="12Х1МФ">12Х1МФ</option>
        </select>
      </label><br>
      <script>
        document.getElementById('material').value = '${defaultMaterial}';
      </script>
    `;

    // Дата и партия
    form += `
      <label>Дата изготовления: <input type="date" id="manufactureDate"></label><br>
      <label>Партия: <input type="text" id="batch"></label><br>
      <label>Производитель: <input type="text" id="manufacturer" value="Нефтегазпром"></label><br>
    `;

    container.innerHTML = form;

  } catch (error) {
    console.error('Ошибка загрузки формы:', error);
    document.getElementById('paramsForm').innerHTML = '<p style="color: red;">Ошибка загрузки формы</p>';
  }
}

// async function loadTemplate() {
//   try {
//     const products = await loadKnowledgeData('products.json');
//     const type = document.getElementById('productType').value;
    
//     // ✅ Проверка существования типа
//     const product = products[type];
//     if (!product) {
//       console.warn(`Тип "${type}" не найден в products.json`);
//       document.getElementById('paramsForm').innerHTML = '<p style="color: red;">Тип изделия не найден в справочнике</p>';
//       return;
//     }
    
//     const container = document.getElementById('paramsForm');
    
//     let form = '';

//     // Динамические поля
//     if (product.params.includes('diameter')) {
//       form += '<label>Диаметр, мм: <input type="number" id="diameter" step="0.1"></label><br>';
//     }
//     if (product.params.includes('thickness')) {
//       form += '<label>Толщина стенки, мм: <input type="number" id="thickness" step="0.1"></label><br>';
//     }
//     if (product.params.includes('pn')) {
//       form += '<label>PN: <input type="number" id="pn"></label><br>';
//     }
//     if (product.params.includes('face_type')) {
//       form += `
//         <label>Тип уплотнения: 
//           <select id="face_type">
//             <option value="RF">RF</option>
//             <option value="FF">FF</option>
//             <option value="MFM">MFM</option>
//           </select>
//         </label><br>
//       `;
//     }
//     if (product.params.includes('dn')) {
//       form += '<label>DN: <input type="number" id="dn"></label><br>';
//     }
//     if (product.params.includes('volume')) {
//       form += '<label>Объем, м³: <input type="number" id="volume" step="0.1"></label><br>';
//     }
//     if (product.params.includes('flow')) {
//       form += '<label>Производительность, м³/ч: <input type="number" id="flow" step="0.1"></label><br>';
//     }
//     if (product.params.includes('head')) {
//       form += '<label>Напор, м: <input type="number" id="head"></label><br>';
//     }
//     if (product.params.includes('power')) {
//       form += '<label>Мощность, кВт: <input type="number" id="power" step="0.1"></label><br>';
//     }
//     if (product.params.includes('pressure')) {
//       form += '<label>Давление, МПа: <input type="number" id="pressure" step="0.1"></label><br>';
//     }
//     if (product.params.includes('heat_surface')) {
//       form += '<label>Поверхность теплообмена, м²: <input type="number" id="heat_surface" step="0.1"></label><br>';
//     }
//     if (product.params.includes('ratio')) {
//       form += '<label>Передаточное отношение: <input type="number" id="ratio" step="0.01"></label><br>';
//     }

//     // Материал
//     form += `
//       <label>Материал: 
//         <select id="material">
//           <option value="12Х18Н10Т">12Х18Н10Т</option>
//           <option value="09Г2С">09Г2С</option>
//           <option value="13ХФА">13ХФА</option>
//           <option value="15ХМ">15ХМ</option>
//           <option value="12Х1МФ">12Х1МФ</option>
//         </select>
//       </label><br>
//     `;

//     // Дата и партия
//     form += `
//       <label>Дата изготовления: <input type="date" id="manufactureDate"></label><br>
//       <label>Партия: <input type="text" id="batch"></label><br>
//       <label>Производитель: <input type="text" id="manufacturer" value="Нефтегазпром"></label><br>
//     `;

//     container.innerHTML = form;
    
//   } catch (error) {
//     console.error('Ошибка загрузки формы:', error);
//     document.getElementById('paramsForm').innerHTML = '<p style="color: red;">Ошибка загрузки формы</p>';
//   }
// }

// Загрузка формы по типу изделия
// async function loadTemplate() {
//     const products = await loadKnowledgeData('products.json');
//     const type = document.getElementById('productType').value;
//     const product = products[type];
//     const container = document.getElementById('paramsForm');
  
//     let form = '';
  
//     // Динамические поля
//     if (product.params.includes('diameter')) {
//       form += '<label>Диаметр, мм: <input type="number" id="diameter" step="0.1"></label><br>';
//     }
//     if (product.params.includes('thickness')) {
//       form += '<label>Толщина стенки, мм: <input type="number" id="thickness" step="0.1"></label><br>';
//     }
//     if (product.params.includes('pn')) {
//       form += '<label>PN: <input type="number" id="pn"></label><br>';
//     }
//     if (product.params.includes('face_type')) {
//       form += `
//         <label>Тип уплотнения: 
//           <select id="face_type">
//             <option value="RF">RF</option>
//             <option value="FF">FF</option>
//             <option value="MFM">MFM</option>
//           </select>
//         </label><br>
//       `;
//     }
  
//     // Материал
//     form += `
//       <label>Материал: 
//         <select id="material">
//           <option value="12Х18Н10Т">12Х18Н10Т</option>
//           <option value="09Г2С">09Г2С</option>
//           <option value="13ХФА">13ХФА</option>
//         </select>
//       </label><br>
//     `;
  
//     // Дата и партия
//     form += `
//       <label>Дата изготовления: <input type="date" id="manufactureDate"></label><br>
//       <label>Партия: <input type="text" id="batch"></label><br>
//       <label>Производитель: <input type="text" id="manufacturer" value="Нефтегазпром"></label><br>
//     `;
  
//     container.innerHTML = form;
//   }
  
  // Генерация ID
  function generateItemId(type, diameter, pn) {
    const prefix = type.slice(0, 3).toUpperCase();
    const size = diameter || pn || '000';
    const timestamp = Date.now() % 100000;
    return `ITEM-${prefix}-${size}-${timestamp}`;
  }

  async function addItem() {
    const type = document.getElementById('productType').value;
    const diameter = document.getElementById('diameter')?.value;
    const thickness = document.getElementById('thickness')?.value;
    const pn = document.getElementById('pn')?.value;
    const face_type = document.getElementById('face_type')?.value;
    const dn = document.getElementById('dn')?.value;
    const volume = document.getElementById('volume')?.value;
    const flow = document.getElementById('flow')?.value;
    const head = document.getElementById('head')?.value;
    const power = document.getElementById('power')?.value;
    const pressure = document.getElementById('pressure')?.value;
    const heat_surface = document.getElementById('heat_surface')?.value;
    const ratio = document.getElementById('ratio')?.value;
    const material = document.getElementById('material').value;
    const date = document.getElementById('manufactureDate').value;
    const batch = document.getElementById('batch').value;
    const manufacturer = document.getElementById('manufacturer').value;
  
    // Валидация
    if (!type || !material || !manufacturer) {
      alert('Заполните обязательные поля: тип, материал, производитель');
      return;
    }
  
    // Генерация ID
    const prefixes = {
      'Труба': 'TRU',
      'Фланец': 'FLN',
      'Задвижка': 'ZAD',
      'Клапан предохранительный': 'KLP',
      'Резервуар вертикальный': 'RZR',
      'Насос центробежный': 'NSP',
      'Компрессор поршневой': 'KMP',
      'Теплообменник': 'TPL',
      'Редуктор': 'RDK',
      'Фильтр': 'FLT'
    };
    const prefix = prefixes[type] || 'ITM';
    const size = diameter || pn || dn || volume || '000';
    const timestamp = Date.now() % 100000;
    const itemId = `ITEM-${prefix}-${size}-${timestamp}`;
  
    // Подготовка данных
    const item = {
      id: itemId,
      type,
      manufacturer,
      diameter: diameter ? parseFloat(diameter) : null,
      thickness: thickness ? parseFloat(thickness) : null,
      pn: pn ? parseInt(pn) : null,
      face_type: face_type || null,
      dn: dn ? parseInt(dn) : null,
      volume: volume ? parseFloat(volume) : null,
      flow: flow ? parseFloat(flow) : null,
      head: head ? parseFloat(head) : null,
      power: power ? parseFloat(power) : null,
      pressure: pressure ? parseFloat(pressure) : null,
      heat_surface: heat_surface ? parseFloat(heat_surface) : null,
      ratio: ratio ? parseFloat(ratio) : null,
      material,
      date: date || new Date().toISOString().split('T')[0],
      batch: batch || null,
      createdAt: new Date().toISOString(),
      inspections: [],
      ncr: [],
      documents: []
    };
  
    try {
      // Сохранение в Firebase
      const db = window.db;
      await db.collection('items').doc(itemId).set(item);
  
      // Формируем красивую карточку
      const resultContainer = document.getElementById('itemResult');
      resultContainer.innerHTML = `
        <div class="item-card">
          <button class="close-btn" onclick="this.closest('.item-card').remove()">×</button>
          <h3 style="margin: 0 0 10px 0;">✅ Изделие добавлено</h3>
          <p><strong>ID:</strong> ${itemId}</p>
          <p><strong>Тип:</strong> ${item.type}</p>
          ${item.diameter ? `<p><strong>Диаметр:</strong> ${item.diameter} мм</p>` : ''}
          ${item.thickness ? `<p><strong>Толщина стенки:</strong> ${item.thickness} мм</p>` : ''}
          ${item.pn ? `<p><strong>PN:</strong> ${item.pn}</p>` : ''}
          ${item.dn ? `<p><strong>DN:</strong> ${item.dn}</p>` : ''}
          ${item.volume ? `<p><strong>Объем:</strong> ${item.volume} м³</p>` : ''}
          ${item.flow ? `<p><strong>Производительность:</strong> ${item.flow} м³/ч</p>` : ''}
          ${item.head ? `<p><strong>Напор:</strong> ${item.head} м</p>` : ''}
          ${item.power ? `<p><strong>Мощность:</strong> ${item.power} кВт</p>` : ''}
          ${item.pressure ? `<p><strong>Давление:</strong> ${item.pressure} МПа</p>` : ''}
          ${item.heat_surface ? `<p><strong>Поверхность теплообмена:</strong> ${item.heat_surface} м²</p>` : ''}
          ${item.ratio ? `<p><strong>Передаточное отношение:</strong> ${item.ratio}</p>` : ''}
          ${item.face_type ? `<p><strong>Тип уплотнения:</strong> ${item.face_type}</p>` : ''}
          <p><strong>Материал:</strong> ${item.material}</p>
          <p><strong>Дата изготовления:</strong> ${item.date}</p>
          ${item.batch ? `<p><strong>Партия:</strong> ${item.batch}</p>` : ''}
          <p><strong>Производитель:</strong> ${item.manufacturer}</p>
          <p><small><em>Добавлено: ${new Date().toLocaleString('ru-RU')}</em></small></p>
        </div>
      `;
  
      // Триггер события для агента
      if (window.agent) {
        await window.agent.trigger('on_new_item', item);
      }
  
    } catch (error) {
      console.error('Ошибка добавления изделия:', error);
      document.getElementById('itemResult').innerHTML = `
        <div class="error-box">
          ❌ Ошибка при добавлении: ${error.message}
          <button class="close-btn" onclick="this.closest('.error-box').remove()">×</button>
        </div>
      `;
    }
  }
  // Добавление изделия (обновлённая версия)
// async function addItem() {
//   const type = document.getElementById('productType').value;
//   const diameter = document.getElementById('diameter')?.value;
//   const thickness = document.getElementById('thickness')?.value;
//   const pn = document.getElementById('pn')?.value;
//   const face_type = document.getElementById('face_type')?.value;
//   const dn = document.getElementById('dn')?.value;
//   const volume = document.getElementById('volume')?.value;
//   const flow = document.getElementById('flow')?.value;
//   const head = document.getElementById('head')?.value;
//   const power = document.getElementById('power')?.value;
//   const pressure = document.getElementById('pressure')?.value;
//   const heat_surface = document.getElementById('heat_surface')?.value;
//   const ratio = document.getElementById('ratio')?.value;
//   const material = document.getElementById('material').value;
//   const date = document.getElementById('manufactureDate').value;
//   const batch = document.getElementById('batch').value;
//   const manufacturer = document.getElementById('manufacturer').value;

//   // Валидация
//   if (!type || !material || !manufacturer) {
//     alert('Заполните обязательные поля: тип, материал, производитель');
//     return;
//   }

//   // Генерация ID (улучшенная)
//   function generateItemId() {
//     const prefixes = {
//       'Труба': 'TRU',
//       'Фланец': 'FLN',
//       'Задвижка': 'ZAD',
//       'Клапан предохранительный': 'KLP',
//       'Резервуар вертикальный': 'RZR',
//       'Насос центробежный': 'NSP',
//       'Компрессор поршневой': 'KMP',
//       'Теплообменник': 'TPL',
//       'Редуктор': 'RDK',
//       'Фильтр': 'FLT'
//     };
    
//     const prefix = prefixes[type] || 'ITM';
//     const size = diameter || pn || dn || volume || '000';
//     const timestamp = Date.now() % 100000;
//     return `ITEM-${prefix}-${size}-${timestamp}`;
//   }

//   const itemId = generateItemId();

//   // Подготовка данных
//   const item = {
//     id: itemId,
//     type,
//     manufacturer,
//     diameter: diameter ? parseFloat(diameter) : null,
//     thickness: thickness ? parseFloat(thickness) : null,
//     pn: pn ? parseInt(pn) : null,
//     face_type: face_type || null,
//     dn: dn ? parseInt(dn) : null,
//     volume: volume ? parseFloat(volume) : null,
//     flow: flow ? parseFloat(flow) : null,
//     head: head ? parseFloat(head) : null,
//     power: power ? parseFloat(power) : null,
//     pressure: pressure ? parseFloat(pressure) : null,
//     heat_surface: heat_surface ? parseFloat(heat_surface) : null,
//     ratio: ratio ? parseFloat(ratio) : null,
//     material,
//     date: date || new Date().toISOString().split('T')[0],
//     batch: batch || null,
//     createdAt: new Date().toISOString(),
//     inspections: [],
//     ncr: [],
//     documents: []
//   };

//   try {
//     // Сохранение в Firebase
//     const db = window.db;
//     await db.collection('items').doc(itemId).set(item);

//     // Успех
//     document.getElementById('itemResult').innerHTML = `
//       ✅ Изделие добавлено:<br>
//       <strong>${itemId}</strong><br>
//       Тип: ${type}<br>
//       ${
//         diameter ? `Диаметр: ${diameter} мм<br>` :
//         pn ? `PN: ${pn}<br>` :
//         dn ? `DN: ${dn}<br>` : ''
//       }
//       Материал: ${material}<br>
//       ${batch ? `Партия: ${batch}<br>` : ''}
//       <button onclick="showItem('${itemId}')">Открыть карточку</button>
//     `;

//     // Триггер события для агента
//     if (window.agent) {
//       await window.agent.trigger('on_new_item', item);
//     }

//   } catch (error) {
//     console.error('Ошибка добавления изделия:', error);
//     document.getElementById('itemResult').innerHTML = `❌ Ошибка: ${error.message}`;
//   }
// }
  // // Добавление изделия
  // async function addItem() {
  //   const type = document.getElementById('productType').value;
  //   const diameter = document.getElementById('diameter')?.value;
  //   const thickness = document.getElementById('thickness')?.value;
  //   const pn = document.getElementById('pn')?.value;
  //   const material = document.getElementById('material').value;
  //   const face_type = document.getElementById('face_type')?.value;
  //   const date = document.getElementById('manufactureDate').value;
  //   const batch = document.getElementById('batch').value;
  //   const manufacturer = document.getElementById('manufacturer').value;
  
  //   // Валидация
  //   if (!type || !material || !manufacturer) {
  //     alert('Заполните обязательные поля: тип, материал, производитель');
  //     return;
  //   }
  
  //   // Генерация ID
  //   const itemId = generateItemId(type, diameter, pn);
  
  //   // Подготовка данных
  //   const item = {
  //     id: itemId,
  //     type,
  //     manufacturer,
  //     diameter: diameter ? parseFloat(diameter) : null,
  //     thickness: thickness ? parseFloat(thickness) : null,
  //     pn: pn ? parseInt(pn) : null,
  //     material,
  //     face_type: face_type || null,
  //     date: date || new Date().toISOString().split('T')[0],
  //     batch: batch || null,
  //     createdAt: new Date().toISOString(),
  //     inspections: [],
  //     ncr: [],
  //     documents: [] // Для проверки комплектности
  //   };
  
  //   try {
  //     // Сохранение в Firebase
  //     const db = window.db;
  //     await db.collection('items').doc(itemId).set(item);
  
  //     // Успех
  //     document.getElementById('itemResult').innerHTML = `
  //       ✅ Изделие добавлено:<br>
  //       <strong>${itemId}</strong><br>
  //       Тип: ${type}<br>
  //       Размер: ${diameter ? diameter + ' мм' : pn ? 'PN' + pn : '—'}<br>
  //       Материал: ${material}<br>
  //       <button onclick="showItem('${itemId}')">Открыть карточку</button>
  //     `;
  
  //     // Триггер события для агента
  //     if (window.agent) {
  //       await window.agent.trigger('on_new_item', item);
  //     }
  
  //   } catch (error) {
  //     console.error('Ошибка добавления изделия:', error);
  //     document.getElementById('itemResult').innerHTML = `❌ Ошибка: ${error.message}`;
  //   }
  // }
  
  // Показать карточку изделия
  async function showItem(itemId) {
    try {
      const db = window.db;
      const doc = await db.collection('items').doc(itemId).get();
      
      if (doc.exists) {
        const item = doc.data();
        alert(`Изделие: ${item.id}\nТип: ${item.type}\nМатериал: ${item.material}`);
      } else {
        alert('Изделие не найдено');
      }
    } catch (error) {
      console.error('Ошибка загрузки изделия:', error);
    }
  }
  
  // Инициализация при загрузке страницы
  document.addEventListener('DOMContentLoaded', function() {
    loadTemplate();
  });