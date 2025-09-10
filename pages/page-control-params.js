// Подключаем стили
const styleLink = document.getElementById('page-control-params-css');
if (styleLink && styleLink.disabled) {
  styleLink.disabled = false;
}
// if (window.LumisInstance && typeof LumisInstance.loadItems === 'function') {
//     LumisInstance.loadItems(); // или LumisInstance.init(), как у тебя
//     document.getElementById('itemSelect').disabled = false;
//     document.getElementById('normativeSelect').disabled = false;
//     document.getElementById('controlTypeSelect').disabled = false;
//     document.getElementById('status').innerText = '✅ Готово к работе';
//   } else {
//     console.error('❌ LumisInstance.loadItems не существует!');
//   }

let isInitializing = false;

async function initializeControlParamsPage() {
  if (isInitializing) return;
  isInitializing = true;

  const statusEl = document.getElementById('status');
  if (!statusEl) return;

  try {
    statusEl.innerText = '⏳ Загрузка базы знаний...';

    // Убедимся, что класс Lumis доступен
    if (typeof window.Lumis === 'undefined') {
      await loadScript('../Lumis.js'); // ← Путь может быть просто 'Lumis.js', если index.html в корне
    }

    // Загружаем JSON из корня — путь '../OmniS.mini.json' или просто 'OmniS.mini.json'
    // const response = await fetch('../OmniS.mini.json'); // ← ВАЖНО: путь к JSON
    // if (!response.ok) throw new Error('Не удалось загрузить OmniS.mini.json');
    // const jsonData = await response.json();
    const jsonData = await loadKnowledgeData('OmniS.mini.json');
    // Создаём глобальный инстанс
    window.LumisInstance = new Lumis(jsonData);
    console.log("✨ Люмис активирован. Свет — с нами.");

    // Обновляем интерфейс
    statusEl.innerText = "✅ Готово. Выберите изделие, нормативку и тип контроля.";
    document.getElementById('normativeSelect')?.removeAttribute('disabled');
    document.getElementById('controlTypeSelect')?.removeAttribute('disabled');

    // Заполняем селект изделий
    const itemSelect = document.getElementById('itemSelect');
    if (itemSelect) {
      itemSelect.innerHTML = '<option value="">Выберите изделие...</option>';
      Object.entries(LumisInstance.aliases).forEach(([alias, key]) => {
        const item = LumisInstance.db[key];
        if (item) {
          const option = document.createElement('option');
          option.value = alias;
          option.innerText = `${item.name} (${alias})`;
          itemSelect.appendChild(option);
        }
      });
      itemSelect.disabled = false;
    }

    // Визуализируем ГОСТы
    LumisInstance.visualizeGOSTs(null);

    // Устанавливаем значение по умолчанию
    document.getElementById('normativeSelect').value = 'ГОСТ';

  } catch (error) {
    console.error('Ошибка инициализации Lumis:', error);
    statusEl.innerText = `❌ Ошибка: ${error.message}`;
  } finally {
    isInitializing = false;
  }

  // ✅ Добавляем обработчики для включения кнопки
const itemSelect = document.getElementById('itemSelect');
const normativeSelect = document.getElementById('normativeSelect');
const controlTypeSelect = document.getElementById('controlTypeSelect');
const runButton = document.querySelector('button[onclick="runQuery()"]');

function updateButtonState() {
  if (
    itemSelect.value &&
    normativeSelect.value &&
    controlTypeSelect.value
  ) {
    runButton.disabled = false;
  } else {
    runButton.disabled = true;
  }
}

itemSelect.addEventListener('change', updateButtonState);
normativeSelect.addEventListener('change', updateButtonState);
controlTypeSelect.addEventListener('change', updateButtonState);

// Проверяем состояние сразу после инициализации
updateButtonState();

}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Не удалось загрузить скрипт: ${src}`));
    document.head.appendChild(script);
  });
}

// Автозапуск при загрузке страницы
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeControlParamsPage);
} else {
  initializeControlParamsPage();
}

// --- ФУНКЦИИ ИНТЕРФЕЙСА (оставь как есть) ---

function runQuery() {
  console.log("🔥 runQuery вызван. itemKey =", document.getElementById('itemSelect').value);
  const itemKey = document.getElementById('itemSelect').value;
  const normative = document.getElementById('normativeSelect').value;
  const controlType = document.getElementById('controlTypeSelect').value;

  if (!itemKey || !normative || !controlType) {
    document.getElementById('output').innerHTML = `<div style="color: #e74c3c;">Выберите изделие, нормативку и тип контроля.</div>`;
    return;
  }

  const item = LumisInstance.db[LumisInstance.aliases[itemKey] || itemKey];
  if (!item) {
    document.getElementById('output').innerHTML = `<div style="color: #e74c3c;">Изделие не найдено.</div>`;
    return;
  }

  const instructions = LumisInstance.generateInstructions(item, normative, controlType);
  if (instructions.length === 0) {
    document.getElementById('output').innerHTML = `<div style="color: #e74c3c;">Нет параметров для выбранных условий.</div>`;
    return;
  }

  const checklistHTML = LumisInstance.generateChecklist(instructions, item, normative);
  document.getElementById('output').innerHTML = checklistHTML;

  const activeGroups = [...new Set(instructions.map(instr => instr.index))];
  const signatureCanvas = LumisInstance.generateWebGLColorSignature([]);

  const checklistDiv = document.querySelector('.checklist');
  if (checklistDiv) {
    const container = document.createElement('div');
    container.className = 'webgl-container';
    container.appendChild(signatureCanvas);
    checklistDiv.appendChild(container);
    window.currentSignatureCanvas = signatureCanvas;
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const total = instructions.length;
      const checkedCount = document.querySelectorAll('.checkbox:checked').length;
      const progressPercent = (checkedCount / total) * 100;
      const progressBar = document.querySelector('.progress-fill');
      if (progressBar) progressBar.style.width = `${progressPercent}%`;
    });
  });

  LumisInstance.visualizeGOSTs(itemKey);
}

function toggleStep(stepId) {
  const content = document.getElementById(`step-content-${stepId}`);
  content.classList.toggle('active');
}
function speakInstruction(stepNumber, description = "") {
  const text = `Шаг ${stepNumber}: ${description || "Описание отсутствует"}`;

  if ('speechSynthesis' in window) {
    // Ждём, пока голоса загрузятся
    if (speechSynthesis.getVoices().length === 0) {
      speechSynthesis.addEventListener('voiceschanged', () => {
        _speak(text);
      });
    } else {
      _speak(text);
    }
  } else {
    alert("🔊 " + text);
  }

  function _speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ru-RU';
    utterance.rate = 1.5; // чуть быстрее — 0.9 → 1.1
    utterance.pitch = 0.3; // повысим тон — звучит "веселее"

    // Ищем женский голос на русском
    const voices = speechSynthesis.getVoices();
    const femaleVoice = voices.find(voice =>
      voice.lang.includes('ru') &&
      (voice.name.includes('Anna') || // Anna (Microsoft)
       voice.name.includes('Анна') ||
       voice.name.includes('Tatiana') || // Tatiana (Yandex)
       voice.name.includes('Татьяна') ||
       voice.name.includes('female') ||
       voice.name.includes('Женский'))
    );

    if (femaleVoice) {
      utterance.voice = femaleVoice;
    } else {
      // Если женского нет — берём первый русский
      const ruVoice = voices.find(v => v.lang.includes('ru'));
      if (ruVoice) utterance.voice = ruVoice;
    }

    speechSynthesis.speak(utterance);
  }
}

// function speakInstruction(stepNumber, description = "") {
//   const text = `Шаг ${stepNumber}: ${description || "Описание отсутствует"}`;
//   if ('speechSynthesis' in window) {
//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.lang = 'ru-RU';
//     utterance.rate = 0.9;
//     speechSynthesis.speak(utterance);
//   } else {
//     alert("🔊 " + text);
//   }
// }

function toggleCheckbox(index, total) {
  const checkbox = document.getElementById(`checkbox-${index}`);
  checkbox.checked = !checkbox.checked;

  const checkedCount = document.querySelectorAll('.checkbox:checked').length;
  const progressPercent = (checkedCount / total) * 100;

  const progressBar = checkbox.closest('.checklist')?.querySelector('.progress-fill');
  if (progressBar) {
    progressBar.style.width = `${progressPercent}%`;
  }

  const activeGroups = [];
  document.querySelectorAll('.checkbox:checked').forEach(cb => {
    const paramRow = cb.closest('.param-row');
    const text = paramRow.querySelector('strong').innerText;
    const match = text.match(/\[([GPEFSJQ])\]/);
    if (match && match[1]) {
      activeGroups.push(match[1]);
    }
  });

  if (window.currentSignatureCanvas?.updateActivations) {
    window.currentSignatureCanvas.updateActivations([...new Set(activeGroups)]);
  }
}

function handlePhotoUpload(input, itemId) {
  const previewContainer = document.getElementById(`photo-preview-${itemId}`);
  previewContainer.innerHTML = ''; // очищаем, если хочешь только 1 фото — или оставь, если разрешаешь несколько

  if (!input.files || input.files.length === 0) return;

  Array.from(input.files).forEach(file => {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement('img');
      img.src = e.target.result;
      img.style.width = '100px';
      img.style.height = '100px';
      img.style.objectFit = 'cover';
      img.style.borderRadius = '8px';
      img.style.boxShadow = '0 2px 6px rgba(0,0,0,0.1)';

      // Добавляем кнопку удаления
      const wrapper = document.createElement('div');
      wrapper.style.position = 'relative';
      wrapper.appendChild(img);

      const removeBtn = document.createElement('button');
      removeBtn.innerText = '×';
      removeBtn.style.position = 'absolute';
      removeBtn.style.top = '2px';
      removeBtn.style.right = '2px';
      removeBtn.style.background = '#e74c3c';
      removeBtn.style.color = 'white';
      removeBtn.style.border = 'none';
      removeBtn.style.borderRadius = '50%';
      removeBtn.style.width = '20px';
      removeBtn.style.height = '20px';
      removeBtn.style.fontSize = '12px';
      removeBtn.style.cursor = 'pointer';
      removeBtn.onclick = () => {
        wrapper.remove();
        // Можно сбросить input, если нужно
        input.value = '';
      };

      wrapper.appendChild(removeBtn);
      previewContainer.appendChild(wrapper);
    };
    reader.readAsDataURL(file);
  });
}
