// Выполнить команду
function runSmartCommand() {
    const input = document.getElementById('smartCommand').value.trim();
    const resultDiv = document.getElementById('smartResult');
    const contentDiv = document.getElementById('resultContent');
  
    if (!input || !input.startsWith('/')) {
      contentDiv.innerHTML = '❌ Введите команду, начинающуюся с /';
      resultDiv.style.display = 'block';
      return;
    }
  
    const [command, ...args] = input.slice(1).trim().split(' ');
    const argsStr = args.join(' ');
  
    try {
        switch (command.toLowerCase()) {
            case 'get_item':
              getItem(argsStr);
              break;
            case 'get_company':
              getCompany(argsStr);
              break;
            case 'get_ncr':
              getNCR(argsStr);
              break;
            case 'get_inspection':
              getInspection(argsStr);
              break;
            case 'show_tolerances':
              showTolerances(argsStr);
              break;
            default:
              contentDiv.innerHTML = `❌ Неизвестная команда: /${command}`;
              resultDiv.style.display = 'block';
          }
    //   switch (command.toLowerCase()) {
    //     case 'get_item':
    //       getItem(argsStr);
    //       break;
    //     case 'get_company':
    //       getCompany(argsStr);
    //       break;
    //     case 'show_tolerances':
    //       showTolerances(argsStr);
    //       break;
    //     case 'find_items':
    //       findItems(argsStr);
    //       break;
    //     case 'stats':
    //       getStats(argsStr);
    //       break;
    //     default:
    //       contentDiv.innerHTML = `❌ Неизвестная команда: /${command}`;
    //       resultDiv.style.display = 'block';
    //   }
    } catch (error) {
      contentDiv.innerHTML = `❌ Ошибка: ${error.message}`;
      resultDiv.style.display = 'block';
    }
  }
  
  // Обработка Enter
  function handleCommandEnter(e) {
    if (e.key === 'Enter') {
      runSmartCommand();
    }
  }
  
  // Получить изделие
  async function getItem(itemId) {
    if (!itemId) {
      showError('Укажите ID изделия');
      return;
    }
  
    try {
      const db = window.db;
      const doc = await db.collection('items').doc(itemId).get();
  
      if (!doc.exists) {
        showError(`Изделие ${itemId} не найдено`);
        return;
      }
  
      const item = doc.data();
      const contentDiv = document.getElementById('resultContent');
      
      contentDiv.innerHTML = `
        <h3>📦 Карточка изделия</h3>
        <strong>ID:</strong> ${item.id}<br>
        <strong>Тип:</strong> ${item.type}<br>
        <strong>Производитель:</strong> ${item.manufacturer || '—'}<br>
        <strong>Материал:</strong> ${item.material}<br>
        <strong>Дата изготовления:</strong> ${item.date || '—'}<br>
        <strong>Партия:</strong> ${item.batch || '—'}<br>
        ${item.diameter ? `<strong>Диаметр:</strong> ${item.diameter} мм<br>` : ''}
        ${item.pn ? `<strong>PN:</strong> ${item.pn}<br>` : ''}
        ${item.volume ? `<strong>Объём:</strong> ${item.volume} м³<br>` : ''}
        <hr>
        <strong>Комплектность:</strong><br>
        ${await renderDocStatus(item)}
      `;
  
      document.getElementById('smartResult').style.display = 'block';
    } catch (error) {
      showError(`Ошибка загрузки: ${error.message}`);
    }
  }
  
  // Получить предприятие
  async function getCompany(name) {
    if (!name) {
      showError('Укажите название предприятия');
      return;
    }
  
    try {
      const db = window.db;
      const snapshot = await db.collection('items')
        .where('manufacturer', '==', name)
        .get();
  
      if (snapshot.empty) {
        showError(`Нет изделий от ${name}`);
        return;
      }
  
      const items = snapshot.docs.map(d => d.data());
      const ncrCount = items.filter(i => i.ncr && i.ncr.length > 0).length;
      const total = items.length;
      const missingUZK = items.filter(i => !i.documents?.some(d => d.name === 'УЗК')).length;
  
      const contentDiv = document.getElementById('resultContent');
      contentDiv.innerHTML = `
        <h3>🏭 Профиль предприятия</h3>
        <strong>Название:</strong> ${name}<br>
        <strong>Всего изделий:</strong> ${total}<br>
        <strong>С NCR:</strong> ${ncrCount} (${Math.round(ncrCount / total * 100)}%)<br>
        <strong>Без УЗК:</strong> ${missingUZK}<br>
        <strong>Первое изделие:</strong> ${items.sort((a,b) => a.date.localeCompare(b.date))[0]?.date}<br>
        <strong>Последнее:</strong> ${items.sort((a,b) => b.date.localeCompare(a.date))[0]?.date}<br>
        <hr>
        <strong>Типы продукции:</strong><br>
        ${[...new Set(items.map(i => i.type))].join(', ')}
      `;
  
      document.getElementById('smartResult').style.display = 'block';
    } catch (error) {
      showError(`Ошибка: ${error.message}`);
    }
  }
  
  // Показать допуск
  async function showTolerances(argsStr) {
    const params = parseArgs(argsStr);
    const size = parseFloat(params.size);
    const fit = params.fit;
  
    if (!size || !fit) {
      showError('Используйте: /show_tolerances size=50 fit=h7');
      return;
    }
  
    try {
      const tolerances = await loadKnowledgeData('tolerances.json');
      const table = tolerances[fit];
      if (!table) {
        showError(`Посадка ${fit} не найдена`);
        return;
      }
  
      const row = table.find(r => size > r.min && size <= r.max);
      if (!row) {
        showError(`Размер ${size} мм не входит в диапазон для ${fit}`);
        return;
      }
  
      const upper = (row.upper / 1000).toFixed(3);
      const lower = (row.lower / 1000).toFixed(3);
      const diff = (upper - lower).toFixed(3);
  
      const contentDiv = document.getElementById('resultContent');
      contentDiv.innerHTML = `
        <h3>📏 Допуск: ${size} ${fit.toUpperCase()}</h3>
        <strong>Верхнее отклонение:</strong> ${upper >= 0 ? '+' : ''}${upper} мм<br>
        <strong>Нижнее отклонение:</strong> ${lower >= 0 ? '+' : ''}${lower} мм<br>
        <strong>Поле допуска:</strong> ${diff} мм<br>
        <div style="margin-top: 10px; font-size: 0.9em; color: #666;">
          Интервал: ${row.min}–${row.max} мм
        </div>
      `;
  
      document.getElementById('smartResult').style.display = 'block';
    } catch (error) {
      showError(`Ошибка: ${error.message}`);
    }
  }

  // Получить NCR
async function getNCR(id) {
    if (!id) {
      showError('Укажите ID акта');
      return;
    }
  
    try {
      const db = window.db;
      const doc = await db.collection('ncrs').doc(id).get();
  
      if (!doc.exists) {
        showError(`Акт NCR ${id} не найден`);
        return;
      }
  
      const ncr = doc.data();
      const contentDiv = document.getElementById('resultContent');
  
      contentDiv.innerHTML = `
        <h3>📝 Акт несоответствия: ${ncr.id}</h3>
        <strong>Изделие:</strong> ${ncr.itemId}<br>
        <strong>Тип:</strong> ${ncr.type || '—'}<br>
        <strong>Стандарт:</strong> ${ncr.standard || '—'}<br>
        <strong>Описание:</strong> ${ncr.description || '—'}<br>
        <strong>Дата:</strong> ${new Date(ncr.createdAt).toLocaleDateString()}<br>
        <strong>Статус:</strong> ${ncr.status || 'open'}<br>
        <strong>Инспектор:</strong> ${ncr.inspector || '—'}
      `;
  
      document.getElementById('smartResult').style.display = 'block';
    } catch (error) {
      showError(`Ошибка: ${error.message}`);
    }
  }

  // Получить проверку
async function getInspection(id) {
    if (!id) {
      showError('Укажите ID проверки');
      return;
    }
  
    try {
      const db = window.db;
      const doc = await db.collection('inspections').doc(id).get();
  
      if (!doc.exists) {
        showError(`Проверка ${id} не найдена`);
        return;
      }
  
      const insp = doc.data();
      const contentDiv = document.getElementById('resultContent');
  
      contentDiv.innerHTML = `
        <h3>🔍 Проверка: ${insp.id}</h3>
        <strong>Изделие:</strong> ${insp.itemId}<br>
        <strong>Тип:</strong> ${insp.type}<br>
        <strong>Метод:</strong> ${insp.method}<br>
        <strong>Результат:</strong> ${insp.result}<br>
        <strong>Дата:</strong> ${new Date(insp.date).toLocaleDateString()}<br>
        <strong>Инспектор:</strong> ${insp.inspector}<br>
        <strong>Комментарий:</strong> ${insp.comment || '—'}
      `;
  
      document.getElementById('smartResult').style.display = 'block';
    } catch (error) {
      showError(`Ошибка: ${error.message}`);
    }
  }
  
  // Вспомогательные функции
  function showError(msg) {
    const contentDiv = document.getElementById('resultContent');
    contentDiv.innerHTML = `<div style="color: #e74c3c;">❌ ${msg}</div>`;
    document.getElementById('smartResult').style.display = 'block';
  }
  
  async function renderDocStatus(item) {
    const products = await loadKnowledgeData('products.json');
    const required = products[item.type]?.required_docs || [];
    const uploaded = item.documents?.map(d => d.name) || [];
  
    return required.map(doc => {
      const has = uploaded.includes(doc);
      return `<div style="color: ${has ? '#27ae60' : '#e74c3c'};">${has ? '✅' : '❌'} ${doc}</div>`;
    }).join('');
  }
  
  function parseArgs(str) {
    const args = {};
    str.split(' ').forEach(arg => {
      const [k, v] = arg.split('=');
      if (k && v) args[k] = v;
    });
    return args;
  }

  function generatePDF() {
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
  
      const content = document.getElementById('resultContent');
      if (!content) throw new Error('Элемент resultContent не найден');
  
      const text = content.innerText;
  
      // Разбиваем текст на строки по ширине
      const lines = doc.splitTextToSize(text, 180);
  
      doc.setFontSize(14);
      doc.text("Отчёт", 10, 10);
      doc.setFontSize(10);
      doc.text(lines, 10, 20);
  
      doc.save('отчет.pdf');
    } catch (error) {
      console.error('Ошибка генерации PDF:', error);
      alert('Не удалось сгенерировать PDF: ' + error.message);
    }
  }


//   function generatePDF() {
//     const { jsPDF } = window.jspdf;
//     const doc = new jsPDF();
  
//     const content = document.getElementById('resultContent');
//     const title = document.querySelector('#resultContent h3')?.innerText || 'Отчёт';
  
//     // Заголовок
//     doc.setFontSize(16);
//     doc.text(title, 10, 10);
  
//     // Текст отчёта — построчно
//     const lines = doc.splitTextToSize(content.innerText, 180);
//     doc.setFontSize(10);
//     doc.text(lines, 10, 20);
  
//     // Если хочешь — добавь метаданные
//     doc.setFontSize(8);
//     doc.text(`Сформировано: ${new Date().toLocaleString()}`, 10, doc.internal.pageSize.height - 10);
  
//     doc.save('отчет.pdf');
//   }

//   function generatePDF() {
//     const { jsPDF } = window.jspdf;
//     const doc = new jsPDF();
  
//     const content = document.getElementById('resultContent');
//     const text = content.innerText;
  
//     // Разбиваем текст на строки по 90 символов
//     const lines = doc.splitTextToSize(text, 180); // 180 = ширина в мм
  
//     doc.setFontSize(12);
//     doc.text('Отчёт Инспектора', 10, 10);
//     doc.setFontSize(10);
//     doc.text(lines, 10, 20); // автоматически переносит
  
//     doc.save('отчет.pdf');
//   }
//   function generatePDF() {
//     const { jsPDF } = window.jspdf;
//     const doc = new jsPDF();
  
//     const content = document.getElementById('resultContent').innerText;
//     doc.setFontSize(12);
//     doc.text(content, 10, 10);
//     doc.save('отчет.pdf');
//   }