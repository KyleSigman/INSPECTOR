// const db = window.db;

// Пример: добавить изделие
async function testAddItem() {
    try {
        const docRef = await db.collection('items').add({
            type: "Тестовое изделие",
            createdAt: new Date()
        });
        console.log('Добавлено с ID:', docRef.id);
    } catch (error) {
        console.error('Ошибка:', error);
    }
}


  async function loadKnowledgeData(filename) {
    return new Promise((resolve) => {
        // Проверяем, загружена ли кассета
        if (localStorage.getItem('knowledgePack_loaded')) {
            const data = localStorage.getItem(`knowledge_${filename}`);
            if (data) {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    console.error(`Ошибка парсинга JSON: ${filename}`);
                    resolve({});
                }
            } else {
                console.warn(`Файл ${filename} не найден в кассете`);
                resolve({});
            }
        } else {
            // Резерв: загрузка из /data/, если кассета не загружена
            fetch(`data/${filename}`)
                .then(r => r.json())
                .then(data => resolve(data))
                .catch(err => {
                    console.error(`Не удалось загрузить ${filename} из data/`, err);
                    resolve({});
                });
        }
    });
}

function unloadKnowledgePack() {
    if (confirm('Удалить загруженную кассету?')) {
        Object.keys(localStorage)
            .filter(k => k.startsWith('knowledge_'))
            .forEach(k => localStorage.removeItem(k));
        localStorage.removeItem('knowledgePack_loaded');
        localStorage.removeItem('knowledgePack_name');
        alert('Кассета извлечена');
        location.reload();
    }
}

// Обновление информации о посадке (без автоматического вызова)
function updateFitInfo() {
  const fitSelect = document.getElementById('fit');
  const infoContainer = document.getElementById('fit-info');
  
  // Проверяем, существуют ли элементы
  if (!fitSelect || !infoContainer) return;
  
  const fit = fitSelect.value;
  
  let systemText = '';
  let typeText = '';
  let systemClass = '';
  let typeClass = '';
  
  switch(fit) {
    case 'h7':
      systemText = 'Система вала';
      typeText = 'Зазор';
      systemClass = 'system-badge';
      typeClass = 'type-badge';
      break;
    case 'H8':
      systemText = 'Система отверстия';
      typeText = 'Зазор';
      systemClass = 'system-badge';
      typeClass = 'type-badge';
      break;
    case 'k6':
      systemText = 'Система вала';
      typeText = 'Переходная';
      systemClass = 'system-badge';
      typeClass = 'type-badge';
     
      break;
    default:
      systemText = 'Неизвестно';
      typeText = 'Неизвестно';
      systemClass = 'system-badge';
      typeClass = 'type-badge';
  }
  
  infoContainer.innerHTML = `
    <div class="info-badge ${systemClass}">${systemText}</div>
    <div class="info-badge ${typeClass}">${typeText}</div>
  `;
}

// Инициализация страницы допусков (вызывается из page-tolerance.js)
function initTolerancePage() {
  // Ждем немного, пока DOM загрузится
  setTimeout(() => {
    updateFitInfo();
    
    // Добавляем обработчик события изменения
    const fitSelect = document.getElementById('fit');
    if (fitSelect) {
      fitSelect.addEventListener('change', updateFitInfo);
    }
  }, 100);
}
async function calculate() {
  const sizeInput = document.getElementById('size').value;
  const size = parseFloat(sizeInput);
  const fit = document.getElementById('fit').value;

  // 1. Проверка размера
  if (!size || size <= 0) {
    showError('Введите корректный размер');
    return;
  }

  try {
    // 2. Загружаем данные
    const fits = await loadKnowledgeData('tolerances.json'); // или 'tolerances.json' — выбери один
    
    // 3. Проверка наличия посадки
    if (!fits[fit]) {
      showError('Квалитет не найден');
      return;
    }

    const table = fits[fit];

    // 4. Поиск интервала с защитой от строк
    const row = table.find(item => {
      const min = parseFloat(item.min);
      const max = parseFloat(item.max);
      return size > min && size <= max;
    });

    if (!row) {
      showError('Размер вне диапазона ГОСТ 25346');
      return;
    }

    // 5. Расчёт
    const upper = row.upper / 1000; // мм
    const lower = row.lower / 1000;
    const diff = upper - lower;

    const upperStr = upper.toFixed(3);
    const lowerStr = lower.toFixed(3);
    const diffStr = diff.toFixed(3);

    // 6. Вывод результата
    document.getElementById('result').innerHTML = `
      <strong>⌀${sizeInput}${fit}</strong>
      <div style="margin-top: 10px; font-size: 16px;">
        Верхнее отклонение: <span style="color: #e74c3c;">${upper >= 0 ? '+' : ''}${upperStr}</span> мм<br>
        Нижнее отклонение: <span style="color: #e74c3c;">${lower >= 0 ? '+' : ''}${lowerStr}</span> мм<br>
        Поле допуска: <span style="color: #6c5ce7; font-weight: bold;">${diffStr}</span> мм
      </div>
    `;

    // Вместо длинной болтовни:
// const speechText = `⌀${size}, ${fit}. Верх: ${upper >= 0 ? '+' : '-'}${Math.abs(upperStr)}. Низ: ${lower >= 0 ? '+' : '-'}${Math.abs(lowerStr)}. Допуск: ${diffStr} мм.`;
const speechText = `Диаметр ${numberToSpeech(size)} , посадка ${fit}. 
                    Верхнее: ${upper >= 0 ? 'плюс' : 'минус'} ${numberToSpeech(Math.abs(upper))} миллиметров. 
                    Нижнее: ${lower >= 0 ? 'плюс' : 'минус'} ${numberToSpeech(Math.abs(lower))} миллиметров. 
                    Поле допуска: ${numberToSpeech(diff)} миллиметров.`;

speak(speechText);


    // 7. Детали
    document.getElementById('interval-value').textContent = `${row.min}-${row.max} мм`;
    document.getElementById('upper-value').textContent = `${upper >= 0 ? '+' : ''}${upperStr} мм`;
    document.getElementById('lower-value').textContent = `${lower >= 0 ? '+' : ''}${lowerStr} мм`;
    document.getElementById('tolerance-value').textContent = `${diffStr} мм`;
    document.getElementById('calculation-details').style.display = 'block';

    // 8. Визуализация
    setTimeout(() => updateVisualization(upper, lower, size), 100);

    // 9. Кнопка таблицы
    document.getElementById('showTableBtn').style.display = 'block';

  } catch (error) {
    console.error('Ошибка в calculate():', error); // 🔥 добавлено!
    showError('Ошибка расчета: ' + error.message);
  }
}

// ГОЛОСОВОЕ УПРАВЛЕНИЕ
function startVoiceInput() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert('❌ Ваш браузер не поддерживает распознавание речи. Попробуйте Chrome.');
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'ru-RU';
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.toLowerCase();
    console.log('Услышал:', transcript);

    // Ищем число (размер)
    const sizeMatch = transcript.match(/(\d+([.,]\d+)?)/);
    const size = sizeMatch ? parseFloat(sizeMatch[0].replace(',', '.')) : null;

    // Ищем посадку: h7, H8, k6, F8 и т.д.
    const fitMatch = transcript.match(/\b([a-zA-Z]{1,2}\d+)\b/);
    let fit = null;
    if (fitMatch) {
      fit = fitMatch[0].toUpperCase();
      // Проверим, есть ли такой option в select
      const fitSelect = document.getElementById('fit');
      if ([...fitSelect.options].some(opt => opt.value === fit)) {
        fitSelect.value = fit;
      } else {
        fit = null;
      }
    }

    // Подставляем
    if (size !== null) {
      document.getElementById('size').value = size;
    }

    if (fit) {
      document.getElementById('fit').value = fit;
    }

    // Если есть что-то — запускаем расчёт
    if (size !== null || fit) {
      calculate();
    } else {
      alert('❌ Не распознано: размер или посадка');
    }
  };

  recognition.onerror = (event) => {
    let msg = 'Неизвестная ошибка';
    if (event.error === 'not-allowed') {
      msg = 'Микрофон запрещён. Проверьте разрешения.';
    } else if (event.error === 'no-speech') {
      msg = 'Ничего не услышал. Попробуйте ещё раз.';
    } else if (event.error === 'aborted') {
      msg = 'Распознавание прервано.';
    }
    alert('🎤 Ошибка: ' + msg);
  };

  recognition.start();
}
function numberToSpeech(num) {
  const n = Math.abs(Math.round(num * 1000)) / 1000; // точность до 3 знаков
  const whole = Math.floor(n);
  const frac = Math.round((n - whole) * 1000);

  let text = '';

  // Основное число
  if (whole === 0) {
    text = 'ноль';
  } else if (whole === 1) {
    text = 'один';
  } else if (whole === 2) {
    text = 'два';
  } else if (whole === 3) {
    text = 'три';
  } else if (whole === 4) {
    text = 'четыре';
  } else if (whole === 5) {
    text = 'пять';
  } else if (whole === 6) {
    text = 'шесть';
  } else if (whole === 7) {
    text = 'семь';
  } else if (whole === 8) {
    text = 'восемь';
  } else if (whole === 9) {
    text = 'девять';
  } else if (whole === 10) {
    text = 'десять';
  } else if (whole === 11) {
    text = 'одиннадцать';
  } else if (whole === 12) {
    text = 'двенадцать';
  } else if (whole === 13) {
    text = 'тринадцать';
  } else if (whole === 14) {
    text = 'четырнадцать';
  } else if (whole === 15) {
    text = 'пятнадцать';
  } else if (whole === 16) {
    text = 'шестнадцать';
  } else if (whole === 17) {
    text = 'семнадцать';
  } else if (whole === 18) {
    text = 'восемнадцать';
  } else if (whole === 19) {
    text = 'девятнадцать';
  } else if (whole === 20) {
    text = 'двадцать';
  } else if (whole < 30) {
    text = 'двадцать ' + numberToSpeech(whole - 20);
  } else if (whole === 30) {
    text = 'тридцать';
  } else if (whole < 40) {
    text = 'тридцать ' + numberToSpeech(whole - 30);
  } else if (whole === 40) {
    text = 'сорок';
  } else if (whole < 50) {
    text = 'сорок ' + numberToSpeech(whole - 40);
  } else if (whole === 50) {
    text = 'пятьдесят';
  } else if (whole < 60) {
    text = 'пятьдесят ' + numberToSpeech(whole - 50);
  } else if (whole === 60) {
    text = 'шестьдесят';
  } else if (whole < 70) {
    text = 'шестьдесят ' + numberToSpeech(whole - 60);
  } else if (whole === 70) {
    text = 'семьдесят';
  } else if (whole < 80) {
    text = 'семьдесят ' + numberToSpeech(whole - 70);
  } else if (whole === 80) {
    text = 'восемьдесят';
  } else if (whole < 90) {
    text = 'восемьдесят ' + numberToSpeech(whole - 80);
  } else if (whole === 90) {
    text = 'девяносто';
  } else if (whole < 100) {
    text = 'девяносто ' + numberToSpeech(whole - 90);
  } else if (whole === 100) {
    text = 'сто';
  } else if (whole < 200) {
    text = 'сто ' + numberToSpeech(whole - 100);
  } else if (whole < 300) {
    text = 'двести ' + numberToSpeech(whole - 200);
  } else if (whole < 400) {
    text = 'триста ' + numberToSpeech(whole - 300);
  } else if (whole < 500) {
    text = 'четыреста ' + numberToSpeech(whole - 400);
  } else if (whole < 600) {
    text = 'пятьсот ' + numberToSpeech(whole - 500);
  } else if (whole < 700) {
    text = 'шестьсот ' + numberToSpeech(whole - 600);
  } else if (whole < 800) {
    text = 'семьсот ' + numberToSpeech(whole - 700);
  } else if (whole < 900) {
    text = 'восемьсот ' + numberToSpeech(whole - 800);
  } else if (whole < 1000) {
    text = 'девятьсот ' + numberToSpeech(whole - 900);
  } else {
    text = whole.toString(); // если больше 1000 — просто цифры
  }

  // Дробная часть
  if (frac > 0) {
    const f = frac.toString().padStart(3, '0').replace(/0+$/, '');
    text += ' целых ' + f + ' тысячных';
  }

  return text;
}

function speak(text) {
  window.speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'ru-RU';
  utter.rate = 1.3;        // быстро, но не панически
  utter.pitch = 0.8;       // ниже → больше похоже на мужской

  // Получаем голоса
  const voices = window.speechSynthesis.getVoices();

  // Ищем русский голос с низким тоном
  let selectedVoice = null;

  // Сначала ищем "Yuri" (Microsoft, мужской) или "Aleksandr" (если есть)
  for (let v of voices) {
    if (v.lang.includes('ru') && (v.name.includes('Yuri') || v.name.includes('Aleksandr') || v.name.includes('Мужской'))) {
      selectedVoice = v;
      break;
    }
  }

  // Если не нашли — берём первый русский
  if (!selectedVoice) {
    selectedVoice = voices.find(v => v.lang.includes('ru')) || voices[0];
  }

  if (selectedVoice) {
    utter.voice = selectedVoice;
  }

  window.speechSynthesis.speak(utter);
}

// Визуализация допуска
function updateVisualization(upper, lower, size) {
  const visualization = document.getElementById('tolerance-visualization');
  const toleranceZone = document.getElementById('tolerance-zone');
  
  // Проверяем существование элементов
  if (!visualization || !toleranceZone) return;
  
  // Показываем визуализацию
  visualization.style.display = 'block';
  
  // Рассчитываем масштаб (пикселей на мм)
  const scale = 1000; // Увеличил масштаб для лучшей видимости
  const zoneWidth = Math.abs(upper - lower) * scale;
  
  // Позиционируем зону допуска
  const zonePosition = lower * scale;
  
  toleranceZone.style.width = `${zoneWidth}px`;
  toleranceZone.style.left = `calc(50% + ${zonePosition}px)`;
  
  // Цвет в зависимости от типа посадки
  if (upper <= 0 && lower < 0) {
    // Зазор (оба отрицательные или верхний 0)
    toleranceZone.style.background = 'linear-gradient(90deg, #ff6b6b, #e74c3c)';
  } else if (upper > 0 && lower >= 0) {
    // Натяг (оба положительные)
    toleranceZone.style.background = 'linear-gradient(90deg, #2ecc71, #27ae60)';
  } else {
    // Переходная (разные знаки)
    toleranceZone.style.background = 'linear-gradient(90deg, #6c5ce7, #a29bfe)';
  }
}


// Показ ошибки
function showError(message) {
  document.getElementById('result').innerHTML = `
    <div style="color: #e74c3c; padding: 15px; background: #ffeaea; border-radius: 8px; border-left: 4px solid #e74c3c;">
      ❌ ${message}
    </div>
  `;
  document.getElementById('showTableBtn').style.display = 'none';
  document.getElementById('calculation-details').style.display = 'none';
  document.getElementById('tolerance-visualization').style.display = 'none';
}



document.addEventListener('DOMContentLoaded', function() {
  updateFitInfo(); // Показать начальную информацию
});


async function searchStandard() {
    const query = document.getElementById('query').value.toLowerCase();
    const standards = await loadKnowledgeData('standards.json');
    let result = '';
  
    for (const [code, data] of Object.entries(standards)) {
      if (query.includes(code) || 
          query.includes('твёрдость') && data.hardness_limit ||
          query.includes('радиус') && data.radius) {
        result += `<strong>${code}</strong>:<br>`;
        for (const [key, value] of Object.entries(data)) {
          if (key !== 'name') result += `${key}: ${value}<br>`;
        }
      }
    }
  
    document.getElementById('standardResult').innerHTML = 
      result || 'Не найдено';
  }

async function generateNCR() {
  const itemId = document.getElementById('itemId').value;
  const type = document.getElementById('ncrType').value;
  const templates = await loadKnowledgeData('ncr_templates.json');
  const template = templates[type];
  
  document.getElementById('ncrOutput').innerHTML = `
    <strong>${template.title}</strong><br>
    Изделие: ${itemId}<br>
    Требуется: ${template.fields.join(', ')}<br>
    <em>Черновик NCR готов. Перейти к заполнению?</em>
  `;
}

async function loadCompany() {
  const companies = await loadKnowledgeData('companies.json');
  const name = document.getElementById('companySelect').value;
  const c = companies[name];
  
  if (c) {
    document.getElementById('companyInfo').innerHTML = `
      <strong>${name}</strong><br>
      Всего проверок: ${c.inspections.length}<br>
      NCR: ${c.ncr_count}<br>
      Последняя: ${c.last_update || 'нет'}
    `;
  }
}
// НОВАЯ checkDocs()

async function checkDocs() {
  const productType = document.getElementById('productTypeChecklist').value;
  
  try {
    // Загружаем требования из кассеты (products.json)
    const products = await loadKnowledgeData('products.json');
    const product = products[productType];
    
    if (!product) {
      document.getElementById('checklistResult').innerHTML = 'Тип изделия не найден';
      return;
    }

    // Требуемые документы
    const requiredDocs = product.required_docs || [];
    
    // Загружаем реальные изделия из Firebase
    const db = window.db;
    const snapshot = await db.collection('items')
      .where('type', '==', productType)
      .limit(5)
      .get();
    
    if (snapshot.empty) {
      document.getElementById('checklistResult').innerHTML = `Изделия типа "${productType}" не найдены`;
      return;
    }

    let html = `<h3>Проверка комплектности: ${productType}</h3>`;
    
    for (const doc of snapshot.docs) {
      const item = doc.data();
      html += `<div class="item-check"><strong>${item.id}</strong><br>`;
      
      // Документы, которые есть (новый формат с файлами)
      const presentDocs = item.documents || [];
      
      // Проверяем каждый обязательный документ
      requiredDocs.forEach(docName => {
        // Если документ - объект (с файлом), ищем по name
        const isPresent = Array.isArray(presentDocs) && 
          presentDocs.some(d => typeof d === 'object' ? d.name === docName : d === docName);
        
        html += `
          <div class="doc-line">
            <span class="${isPresent ? 'present' : 'missing'}">
              ${isPresent ? '✅' : '❌'} ${docName}
            </span>
          </div>
        `;
      });
      
      html += '<hr></div>';
    }
    
    document.getElementById('checklistResult').innerHTML = html;
    
  } catch (error) {
    console.error('Ошибка проверки комплектности:', error);
    document.getElementById('checklistResult').innerHTML = `❌ Ошибка: ${error.message}`;
  }
}


async function showTable() {
  const sizeInput = document.getElementById('size');
  const fitSelect = document.getElementById('fit');

  const size = parseFloat(sizeInput.value);
  const fit = fitSelect.value;

  if (isNaN(size) || size <= 0) {
    alert('Введите корректный размер!');
    return;
  }

  // Загружаем данные
  const tolerances = await loadKnowledgeData('tolerances.json');

  if (!tolerances[fit]) {
    alert(`Данные для посадки ${fit} не найдены.`);
    return;
  }

  const rows = tolerances[fit];
  const intervalRow = rows.find(r => size > r.min && size <= r.max);

  // Заполняем модалку
  document.getElementById('refSize').textContent = size;
  document.getElementById('refFit').textContent = fit.toUpperCase();

  const tableBody = rows.map(row => {
    const isActive = intervalRow && size > row.min && size <= row.max;
    return `
      <tr class="${isActive ? 'active-row' : ''}">
        <td>${row.min}–${row.max}</td>
        <td>${row.upper} мкм</td>
        <td>${row.lower} мкм</td>
      </tr>
    `;
  }).join('');

  document.getElementById('referenceTable').innerHTML = `
    <p><strong>ГОСТ 25346-89</strong> — Поля допусков для посадки <strong>${fit.toUpperCase()}</strong></p>
    <table class="std-table">
      <thead>
        <tr>
          <th>Интервал, мм</th>
          <th>Верхнее отклонение</th>
          <th>Нижнее отклонение</th>
        </tr>
      </thead>
      <tbody>
        ${tableBody}
      </tbody>
    </table>
    <p><small>💡 Подсвечена строка, соответствующая размеру <strong>${size} мм</strong>.</small></p>
  `;

  // Показываем модальное окно
  document.getElementById('tableModal').style.display = 'flex';
}

// function showTable() {
//   const sizeInput = document.getElementById('size');
//   const fitSelect = document.getElementById('fit');

//   const size = sizeInput.value.trim();
//   const fit = fitSelect.value;

//   // Проверка, что введены данные
//   if (!size || isNaN(size) || size <= 0) {
//     alert('Введите корректный размер!');
//     return;
//   }

//   // Показываем модальное окно
//   const modal = document.getElementById('tableModal');
//   document.getElementById('refSize').textContent = size;
//   document.getElementById('refFit').textContent = fit;

//   // Здесь можно улучшить: подтягивать данные из справочника
//   const interval = getSizeInterval(size);
//   const toleranceData = getToleranceData(fit, interval);

//   document.getElementById('referenceTable').innerHTML = `
//     <strong>ГОСТ 25346-89 — Поля допусков и посадки</strong><br>
//     <strong>Таблица допусков для интервала:</strong> ${interval} мм<br><br>
//     <code>
//       Посадка: ${fit.toUpperCase()}<br>
//       Верхнее отклонение: ${toleranceData.upper} мкм (${(toleranceData.upper / 1000).toFixed(3)} мм)<br>
//       Нижнее отклонение: ${toleranceData.lower} мкм (${(toleranceData.lower / 1000).toFixed(3)} мм)<br>
//       Поле допуска: ${(toleranceData.upper - toleranceData.lower)} мкм
//     </code><br><br>
//     <small>Данные взяты из встроенной базы знаний. Реальные таблицы — в оригинале ГОСТ.</small>
//   `;

//   modal.style.display = 'flex'; // Показываем
// }

// Закрытие модального окна
function closeTable() {
  document.getElementById('tableModal').style.display = 'none';
}

// Определяем интервал размеров (пример упрощён)
function getSizeInterval(size) {
  const val = parseFloat(size);
  if (val <= 3) return 'св. 0 до 3';
  if (val <= 6) return 'св. 3 до 6';
  if (val <= 10) return 'св. 6 до 10';
  if (val <= 18) return 'св. 10 до 18';
  if (val <= 30) return 'св. 18 до 30';
  if (val <= 50) return 'св. 30 до 50';
  if (val <= 80) return 'св. 50 до 80';
  // ... можно продолжить
  return 'св. 30 до 50'; // fallback
}

// Условные данные (позже заменишь на JSON или базу)
function getToleranceData(fit, interval) {
  const data = {
    'h7': { upper: 0, lower: -25 },
    'H8': { upper: 39, lower: 0 },
    'k6': { upper: 18, lower: 2 }
  };
  return data[fit] || { upper: 0, lower: 0 };
}

  // function showTable() {
  //   const size = document.getElementById('size').value;
  //   const fit = document.getElementById('fit').value;
  //   document.getElementById('refSize').textContent = size;
  //   document.getElementById('refFit').textContent = fit;
  
  //   // Имитация поиска в ГОСТ
  //   const std = {
  //     "ГОСТ 25346-89": {
  //       "title": "Поля допусков и посадки",
  //       "table": "Таблица 1",
  //       "data": `Интервал: 30–50 мм | h7: 0 / -25 мкм`
  //     }
  //   };
  
  //   document.getElementById('referenceTable').innerHTML = `
  //     <strong>Источник:</strong> ${std["ГОСТ 25346-89"].title}<br>
  //     <strong>${std["ГОСТ 25346-89"].table}:</strong><br>
  //     <code>${std["ГОСТ 25346-89"].data}</code><br>
  //     <small>Данные из встроенной кассеты знаний</small>
  //   `;
  // }

  function checkReminders() {
    const today = new Date().toISOString().split('T')[0];
    const mockReminders = [
      { text: "Сертификат Иванова — завтра", urgent: true },
      { text: "УЗК для ITEM-001 — срок 15.04", urgent: false }
    ];
  
    const list = document.getElementById('reminderList');
    list.innerHTML = mockReminders
      .map(r => `<p style="color:${r.urgent ? 'red' : 'black'}">${r.text}</p>`)
      .join('');
  }

  function addItem() {
    const type = document.getElementById('productType').value;
    const diameter = document.getElementById('diameter')?.value;
    const wall_thickness = document.getElementById('wall_thickness')?.value;
    const pn = document.getElementById('pn')?.value;
    const material = document.getElementById('material').value;
    
    const id = `ITEM-${type.slice(0,3).toUpperCase()}-${diameter || pn}-${Date.now() % 1000}`;
    
    document.getElementById('itemResult').innerHTML = `
      ✅ Создано: <strong>${id}</strong><br>
      Тип: ${type}<br>
      Размер: ${diameter ? diameter + 'x' + wall_thickness : pn}<br>
      Материал: ${material}<br>
      <a href="#" onclick="showItem('${id}')">Открыть профиль</a>
    `;
  }

  async function loadTemplate() {
    const products = await loadKnowledgeData('products.json');
    const type = document.getElementById('productType').value;
    const product = products[type];
    const container = document.getElementById('paramsForm');
    
    let form = '';
    if (product.params.includes('diameter')) {
      form += 'Диаметр, мм: <input type="number" id="diameter"><br>';
    }
    if (product.params.includes('wall_thickness')) {
      form += 'Толщина стенки, мм: <input type="number" id="wall_thickness"><br>';
    }
    if (product.params.includes('pn')) {
      form += 'PN: <input type="number" id="pn"><br>';
    }
    if (product.params.includes('face_type')) {
      form += 'Тип уплотнения: <select id="face_type"><option>RF</option><option>FF</option></select><br>';
    }
    form += `Материал: <select id="material">
      <option>13ХФА</option>
      <option>09Г2С</option>
      <option>12Х18Н10Т</option>
    </select><br>`;
    
    container.innerHTML = form;
  }
  
  async function translatePhrase() {
    const translations = await loadKnowledgeData('translations.json');
    const phrase = document.getElementById('phraseSelect').value;
    const eng = translations[phrase];
    
    document.getElementById('translationResult').innerHTML = `
      <strong>RU:</strong> ${phrase}<br>
      <strong>EN:</strong> ${eng}
    `;
  }
  
  async function compareStandards() {
    const comparisons = await loadKnowledgeData('comparison.json');
    const key = document.getElementById('compareSelect').value;
    const data = comparisons[key];
  
    let html = `<strong>Сравнение: ${key.replace('_', ' → ')}</strong><br>`;
    for (const [param, values] of Object.entries(data)) {
      html += `<br><em>${param}:</em><br>`;
      for (const [std, value] of Object.entries(values)) {
        if (std !== "conclusion") html += `${std}: ${value}<br>`;
      }
      html += `<strong>Вывод:</strong> ${values.conclusion}<br>`;
    }
  
    document.getElementById('comparisonResult').innerHTML = html;
  }

  function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
  }

  // Функция для загрузки внешних скриптов для страниц
async function loadPageScripts(pageId) {
  if (pageId === 'page-analytics') {
    // Загружаем Chart.js перед страницей аналитики
    return new Promise((resolve, reject) => {
      // Проверяем, загружен ли уже Chart.js
      if (typeof Chart !== 'undefined') {
        resolve();
        return;
      }
      
      // Загружаем Chart.js
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
}

  async function showPage(pageId) {
    // Убираем активность у всех страниц
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    // Закрываем сайдбар
    document.getElementById('sidebar').classList.remove('open');

     // ✅ Загружаем необходимые скрипты перед загрузкой страницы
  try {
    await loadPageScripts(pageId);
  } catch (error) {
    console.warn('Ошибка загрузки скриптов для страницы:', error);
  }
    
    // Если страница уже существует — просто покажем
    const existingPage = document.getElementById(pageId);
    if (existingPage) {
      existingPage.classList.add('active');
      
      // ✅ Автозагрузка для существующих страниц
      setTimeout(() => {
        switch(pageId) {
          case 'page-inspection':
            if (typeof loadItemsForInspection === 'function') {
              loadItemsForInspection();
              showRecentInspections();
            }
            break;
          case 'page-ncr':
            if (typeof loadItemsForNCR === 'function') {
              loadItemsForNCR();
              showRecentNCRs();
            }
            break;
          case 'page-statistics':
            if (typeof loadStatistics === 'function') {
              loadStatistics();
            }
            break;
          case 'page-reminders':
            if (typeof loadReminders === 'function') {
              loadReminders();
            }
            break;
                  // ✅ Добавляем загрузку компаний
      case 'page-company':
        if (typeof loadCompaniesList === 'function' && typeof loadCompaniesForStats === 'function') {
          loadCompaniesList();
          loadCompaniesForStats();
        }
        break;
          // ✅ Добавляем аналитику
          case 'page-analytics':
            if (typeof loadAnalytics === 'function') {
              loadAnalytics();
            }
            break;
        }
      }, 100);
      
      return;
    }
  
    // Карта страниц
    const pageFiles = {
      'page-inspector-profile': 'pages/page-inspector-profile.html',
      'page-skill-tree': 'pages/page-skill-tree.html',
      'page-analytics': 'pages/page-analytics.html',
      'page-add-item': 'pages/page-add-item.html',
      'page-materials': 'pages/page-materials.html',
      'page-inspection': 'pages/page-inspection.html',
      'page-ncr': 'pages/page-ncr.html',
      'page-company': 'pages/page-company.html',
      'page-checklist': 'pages/page-checklist.html',
      'page-standards': 'pages/page-standards.html',
      'page-compare': 'pages/page-compare.html',
      'page-reminders': 'pages/page-reminders.html',
      'page-translate': 'pages/page-translate.html',
      'page-tolerance': 'pages/page-tolerance.html',
      'page-statistics': 'pages/page-statistics.html',
      'page-help': 'pages/page-help.html',
      'page-smart': 'pages/page-smart.html',
      'page-mailer': 'pages/page-mailer.html'
    };
  
    const url = pageFiles[pageId];
    if (!url) {
      console.error('Страница не найдена:', pageId);
      return;
    }
  
    try {
      const response = await fetch(url);
      const html = await response.text();
  
      // Создаём новый элемент
      const newPage = document.createElement('div');
      newPage.id = pageId;
      newPage.className = 'page';
      newPage.innerHTML = html;
  
      // Добавляем в DOM
      document.getElementById('mainContent').appendChild(newPage);
  
      // Показываем
      newPage.classList.add('active');

      // Загружаем JS для этой страницы
const jsFile = url.replace('.html', '.js') + '?v=' + Date.now();
if (jsFile !== url) {
  const script = document.createElement('script');
  script.src = jsFile;
  document.head.appendChild(script);
}
      // // Загружаем JS для этой страницы
      // const jsFile = url.replace('.html', '.js');
      // if (jsFile !== url) {
      //   const script = document.createElement('script');
      //   script.src = jsFile;
      //   document.head.appendChild(script);
      // }
      
      // ✅ Автозагрузка для новых страниц
      setTimeout(() => {
        switch(pageId) {
          case 'page-inspection':
            if (typeof loadItemsForInspection === 'function') {
              loadItemsForInspection();
              showRecentInspections();
            }
            break;
          case 'page-ncr':
            if (typeof loadItemsForNCR === 'function') {
              loadItemsForNCR();
              showRecentNCRs();
            }
            break;
          case 'page-statistics':
            if (typeof loadStatistics === 'function') {
              loadStatistics();
            }
            break;
          case 'page-reminders':
            if (typeof loadReminders === 'function') {
              loadReminders();
            }
            break;
                // ✅ Добавляем загрузку компаний для новых страниц
    case 'page-company':
      if (typeof loadCompaniesList === 'function' && typeof loadCompaniesForStats === 'function') {
        loadCompaniesList();
        loadCompaniesForStats();
      }
      break;
          // ✅ Добавляем аналитику
          case 'page-analytics':
            if (typeof loadAnalytics === 'function') {
              loadAnalytics();
            }
            break;
        }
      }, 100);
  
    } catch (error) {
      console.error('Ошибка загрузки страницы:', error);
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
      
      // Безопасная обработка standards
      let standardsDisplay = '—';
      try {
        if (company.standards && Array.isArray(company.standards) && company.standards.length > 0) {
          standardsDisplay = company.standards.join(', ');
        }
      } catch (e) {
        console.warn('Ошибка обработки standards для компании:', company.name, e);
        standardsDisplay = 'Ошибка данных';
      }
      
      html += `
        <div class="company-card">
          <strong>${company.name || 'Без названия'}</strong><br>
          ID: ${company.id || '—'}<br>
          Контакт: ${company.contact || '—'}<br>
          Стандарты: ${standardsDisplay}
        </div>
        <hr>
      `;
    });

    document.getElementById('companiesList').innerHTML = html || 'Предприятий нет';

  } catch (error) {
    console.error('Ошибка загрузки предприятий:', error);
    document.getElementById('companiesList').innerHTML = '❌ Ошибка загрузки предприятий';
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


// При загрузке страницы показываем допуски
document.addEventListener('DOMContentLoaded', function() {
    showPage('page-tolerance');
  });

  document.getElementById('knowledgePack').addEventListener('change', async function(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
        alert('Загрузка и распаковка кассеты...');

        const zip = new JSZip();
        const content = await zip.loadAsync(file);

        for (const [filename, zipEntry] of Object.entries(content.files)) {
            if (zipEntry.dir) continue;
        
            // Извлекаем только имя файла (без папок)
            const cleanFilename = filename.split('/').pop();
        
            const text = await zipEntry.async('text');
        
            try {
                JSON.parse(text); // проверка на валидный JSON
                localStorage.setItem(`knowledge_${cleanFilename}`, text);
                console.log(`Сохранено: ${cleanFilename}`);
            } catch (err) {
                console.warn(`Файл ${cleanFilename} не JSON — пропущен`);
            }
        }

        // Устанавливаем флаг успешной загрузки
        localStorage.setItem('knowledgePack_loaded', 'true');
        localStorage.setItem('knowledgePack_name', file.name);

        alert(`Кассета "${file.name}" успешно загружена и распакована!`);
        // location.reload();

    } catch (error) {
        console.error('Ошибка обработки ZIP:', error);
        alert('Ошибка загрузки или распаковки кассеты.');
    }
});

async function testFirebase() {
  try {
    const db = window.db;
    
    // Добавляем тестовую запись
    const docRef = await db.collection('test').add({
      message: 'Firebase работает!',
      timestamp: new Date()
    });
    
    console.log('✅ Запись добавлена с ID:', docRef.id);
    
    // Читаем запись обратно
    const doc = await db.collection('test').doc(docRef.id).get();
    if (doc.exists) {
      console.log('✅ Данные получены:', doc.data());
    }
    
    // Удаляем тестовую запись
    await db.collection('test').doc(docRef.id).delete();
    console.log('✅ Тестовая запись удалена');
    
  } catch (error) {
    console.error('❌ Ошибка Firebase:', error);
  }
}

// Вызов при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
  if (window.db) {
    console.log('Firebase SDK загружен');
    // testFirebase(); // Раскомментируй для теста
  } else {
    console.log('Firebase НЕ подключен');
  }
});

// Глобальная переменная для хранения выбранной эмоции
let selectedEmoji = '👨‍💼';
let feedbackType = 'inspector'; // 'inspector' или 'developer'

// Выбор эмоции
function selectEmoji(emoji) {
  selectedEmoji = emoji;
  
  // Обновляем эмодзи в углу textarea
  document.getElementById('emoji-corner').textContent = emoji;
  
  // Обновляем визуальное выделение кнопок
  document.querySelectorAll('.emoji-option').forEach(option => {
    option.classList.remove('selected');
  });
  
  // Находим и выделяем выбранную кнопку
  event?.target?.classList?.add('selected');
  
  // Определяем тип фидбэка
  if (emoji === '👨‍💼') {
    feedbackType = 'inspector';
  } else if (emoji === '👨‍💻') {
    feedbackType = 'developer';
  }
  
  // Обновляем placeholder в зависимости от типа
  const textarea = document.getElementById('developer-feedback');
  if (feedbackType === 'inspector') {
    textarea.placeholder = "от инстпектора...";
  } else {
    textarea.placeholder = "от разработчика...";
  }
}
// // Выбор эмоции
// function selectEmoji(emoji) {
//   selectedEmoji = emoji;
  
//   // Обновляем отображение эмоции
//   document.getElementById('emoji-display').textContent = emoji;
  
//   // Обновляем визуальное выделение кнопок
//   document.querySelectorAll('.emoji-option').forEach(option => {
//     option.classList.remove('selected');
//   });
  
//   // Находим и выделяем выбранную кнопку
//   event?.target?.classList?.add('selected');
  
//   // Определяем тип фидбэка
//   if (emoji === '👨‍💼') {
//     feedbackType = 'inspector';
//   } else if (emoji === '👨‍💻') {
//     feedbackType = 'developer';
//   }
  
//   // Обновляем placeholder в зависимости от типа
//   const textarea = document.getElementById('developer-feedback');
//   if (feedbackType === 'inspector') {
//     textarea.placeholder = "Оставьте свои пожелания, замечания, идеи для улучшения приложения...";
//   } else {
//     textarea.placeholder = "Сообщите о технических проблемах, багах, предложениях по архитектуре...";
//   }
// }

// Открыть модальное окно
function openDeveloperModal() {
  document.getElementById('developer-modal').style.display = 'block';
  loadDeveloperNotifications();
  loadFeedbackHistory();
  // Сбрасываем на стандартную эмоцию при открытии
  selectEmoji('👨‍💼');
}

// Закрыть модальное окно
function closeDeveloperModal() {
  document.getElementById('developer-modal').style.display = 'none';
}

// Закрыть по клику вне модального окна
window.onclick = function(event) {
  const modal = document.getElementById('developer-modal');
  if (event.target == modal) {
    modal.style.display = 'none';
  }
}

// Отправить обратную связь
async function submitDeveloperFeedback() {
  const feedbackText = document.getElementById('developer-feedback').value.trim();
  
  if (!feedbackText) {
    alert('Пожалуйста, введите текст сообщения');
    return;
  }
  
  try {
    const db = window.db;
    if (!db) {
      throw new Error('Firebase не инициализирован');
    }
    
    const fullMessage = `${selectedEmoji} ${feedbackText}`;
    
    if (feedbackType === 'inspector') {
      // Обычный фидбэк в /feedback/
      await db.collection('feedback').add({
        message: fullMessage,
        emoji: selectedEmoji,
        type: 'inspector',
        author: localStorage.getItem('inspector_name') || 'Анонимный инспектор',
        timestamp: new Date(),
        status: 'new'
      });
      
      alert('✅ Сообщение отправлено! Спасибо за фидбэк!');
      
    } else {
      // Техническое уведомление в /notifications/
      await db.collection('notifications').add({
        text: fullMessage,
        emoji: selectedEmoji,
        type: 'technical',
        author: localStorage.getItem('inspector_name') || 'Инспектор',
        date: new Date(),
        priority: 'medium'
      });
      
      alert('✅ Техническое уведомление отправлено разработчику!');
    }
    
    // Очищаем поле ввода
    document.getElementById('developer-feedback').value = '';
    
    // Сбрасываем на стандартную эмоцию
    selectEmoji('👨‍💼');
    
    // Обновляем историю
    loadFeedbackHistory();
    
  } catch (error) {
    console.error('Ошибка отправки сообщения:', error);
    alert('❌ Ошибка отправки сообщения: ' + error.message);
  }
}

// Загрузить уведомления для разработчиков
async function loadDeveloperNotifications() {
  try {
    const db = window.db;
    if (!db) return;
    
    const snapshot = await db.collection('notifications')
      .orderBy('date', 'desc')
      .limit(3)
      .get();
    
    const notificationsContainer = document.getElementById('dev-notifications');
    
    if (snapshot.empty) {
      notificationsContainer.innerHTML = '<p>📭 Нет новых уведомлений</p>';
      return;
    }
    
    let html = '<h3>📢 Последние обновления:</h3>';
    snapshot.forEach(doc => {
      const notif = doc.data();
      // Показываем эмоцию если есть, иначе стандартный текст
      const displayText = notif.emoji ? `${notif.emoji} ${notif.text.replace(notif.emoji + ' ', '')}` : notif.text;
      html += `<p>• ${displayText}</p>`;
    });
    
    notificationsContainer.innerHTML = html;
    
  } catch (error) {
    console.error('Ошибка загрузки уведомлений:', error);
    document.getElementById('dev-notifications').innerHTML = '<p>❌ Ошибка загрузки уведомлений</p>';
  }
}

// Загрузить историю сообщений
async function loadFeedbackHistory() {
  try {
    const db = window.db;
    if (!db) return;
    
    // Загружаем и фидбэки и уведомления
    const feedbackSnapshot = await db.collection('feedback')
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get();
    
    const historyContainer = document.getElementById('feedback-list');
    
    if (feedbackSnapshot.empty) {
      historyContainer.innerHTML = '<p>📭 История сообщений пуста</p>';
      return;
    }
    
    let html = '';
    feedbackSnapshot.forEach(doc => {
      const feedback = doc.data();
      const date = new Date(feedback.timestamp.toDate ? feedback.timestamp.toDate() : feedback.timestamp);
      const formattedDate = date.toLocaleString('ru-RU');
      
      // Показываем эмоцию если есть
      const displayText = feedback.emoji ? feedback.message.replace(feedback.emoji + ' ', '') : feedback.message;
      const displayEmoji = feedback.emoji || '📝';
      
      html += `
        <div class="feedback-item">
          <div class="feedback-date">${displayEmoji} ${formattedDate}</div>
          <div class="feedback-text">${displayText}</div>
          <div class="feedback-status status-${feedback.status}">
            Статус: ${getStatusText(feedback.status)}
          </div>
        </div>
      `;
    });
    
    historyContainer.innerHTML = html;
    
  } catch (error) {
    console.error('Ошибка загрузки истории:', error);
    document.getElementById('feedback-list').innerHTML = '<p>❌ Ошибка загрузки истории</p>';
  }
}

// Получить текст статуса
function getStatusText(status) {
  const statuses = {
    'new': 'Новое',
    'in_progress': 'В работе',
    'done': 'Выполнено'
  };
  return statuses[status] || status;
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
  // Можно добавить автоматическую проверку новых уведомлений
  if (document.getElementById('dev-notifications')) {
    loadDeveloperNotifications();
  }
});


  
  // Загрузка сохраненного ключа
  document.addEventListener('DOMContentLoaded', function() {
    const savedKey = localStorage.getItem('openrouter_api_key');
    if (savedKey) {
      document.getElementById('apiKey').value = savedKey;
    }
  });

