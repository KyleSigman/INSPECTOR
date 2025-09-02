// // pages/page-standards.js

// async function searchStandard() {
//     const query = document.getElementById('query').value.toLowerCase();
//     if (!query) {
//       alert('Введите запрос');
//       return;
//     }
  
//     try {
//       // Загружаем стандарты
//       const standards = await loadKnowledgeData('standards.json');
//       let result = '';
  
//       // Ищем по всем стандартам
//       for (const [code, data] of Object.entries(standards)) {
//         const fullText = JSON.stringify(data).toLowerCase();
        
//         if (query.includes(code.toLowerCase()) || fullText.includes(query)) {
//           result += `<div class="standard-card">`;
//           result += `<strong>${code}</strong>: ${data.name || ''}<br>`;
          
//           // Показываем все поля
//           for (const [key, value] of Object.entries(data)) {
//             if (key !== 'name') {
//               result += `<strong>${key}:</strong> ${value}<br>`;
//             }
//           }
//           result += `</div><hr>`;
//         }
//       }
  
//       document.getElementById('standardResult').innerHTML = 
//         result || 'Не найдено';
  
//     } catch (error) {
//       console.error('Ошибка поиска:', error);
//       document.getElementById('standardResult').innerHTML = `❌ Ошибка: ${error.message}`;
//     }
//   }

// pages/page-standards.js
function toggleStandardsHelp() {
  const content = document.getElementById('helpContent');
  const help = document.getElementById('standardsHelp');

  if (content && help) {
    if (content.style.display === 'none' || content.style.display === '') {
      // Разворачиваем
      content.style.display = 'block';
      help.style.height = '70%';
      help.style.overflow = 'auto'; // или 'scroll'
    } else {
      // Сворачиваем
      content.style.display = 'none';
      help.style.height = '50px';
      help.style.overflow = 'hidden'; // на всякий случай
    }
  }
}
// // Функции для справки
// function toggleStandardsHelp() {
//   const content = document.getElementById('helpContent');
//   const help = document.getElementById('standardsHelp');
//   if (content && help) {
//     if (content.style.display === 'none') {
//       content.style.display = 'block';
//       help.style.height = '70%';
//     } else {
//       content.style.display = 'none';
//       help.style.height = '50px';
//     }
//   }
// }

function setQuery(text) {
  const queryInput = document.getElementById('query');
  if (queryInput) {
    queryInput.value = text;
    searchStandard();
  }
}

// Поиск по стандартам
async function searchStandard() {
  const queryInput = document.getElementById('query');
  if (!queryInput) return;
  
  const query = queryInput.value.toLowerCase();
  if (!query) {
    alert('Введите запрос');
    return;
  }

  try {
    // Загружаем стандарты
    const standards = await loadKnowledgeData('standards.json');
    let result = '';

    // Ищем по всем стандартам
    for (const [code, data] of Object.entries(standards)) {
      const fullText = JSON.stringify(data).toLowerCase();
      
      if (query.includes(code.toLowerCase()) || fullText.includes(query)) {
        result += `<div class="standard-card">`;
        result += `<strong>${code}</strong>: ${data.name || ''}<br>`;
        
        // Показываем все поля
        for (const [key, value] of Object.entries(data)) {
          if (key !== 'name') {
            result += `<strong>${key}:</strong> ${value}<br>`;
          }
        }
        result += `</div><hr>`;
      }
    }

    const resultDiv = document.getElementById('standardResult');
    if (resultDiv) {
      resultDiv.innerHTML = result || 'Не найдено';
    }

  } catch (error) {
    console.error('Ошибка поиска:', error);
    const resultDiv = document.getElementById('standardResult');
    if (resultDiv) {
      resultDiv.innerHTML = `❌ Ошибка: ${error.message}`;
    }
  }
}

// Автозагрузка при открытии страницы
document.addEventListener('DOMContentLoaded', function() {
  // Можно добавить автозагрузку последних запросов
});