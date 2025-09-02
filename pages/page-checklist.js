// ✅ Добавить документ (только имя файла)
async function addDocumentToLocal() {
  const itemId = document.getElementById('itemIdForDoc').value;
  const docName = document.getElementById('docName').value;
  const fileInput = document.getElementById('docFile');
  
  if (!itemId || !docName || !fileInput.files[0]) {
    alert('Заполните все поля и выберите файл');
    return;
  }

  try {
    const db = window.db;
    const file = fileInput.files[0];
    
    // Проверяем изделие
    const itemDoc = await db.collection('items').doc(itemId).get();
    if (!itemDoc.exists) {
      throw new Error(`Изделие ${itemId} не найдено`);
    }

    // ✅ Сохраняем только имя файла (как ID картинки)
    const docRecord = {
      name: docName,
      fileName: file.name,
      addedAt: new Date().toISOString()
    };

    // Добавляем в изделие
    await db.collection('items').doc(itemId).update({
      documents: firebase.firestore.FieldValue.arrayUnion(docRecord)
    });

    document.getElementById('uploadResult').innerHTML = `
      ✅ Документ добавлен!<br>
      <strong>${docName}</strong><br>
      📄 ${file.name}
    `;

    // Очищаем форму
    document.getElementById('docName').value = '';
    fileInput.value = '';

  } catch (error) {
    console.error('Ошибка добавления документа:', error);
    document.getElementById('uploadResult').innerHTML = `❌ Ошибка: ${error.message}`;
  }
}



// Автоматическое обновление при вводе
document.addEventListener('DOMContentLoaded', function() {
  const input = document.getElementById('itemIdForDocsList');
  if (input) {
    let timeout;
    input.addEventListener('input', function() {
      clearTimeout(timeout);
      timeout = setTimeout(showItemDocuments, 300);
    });
  }
});

// ✅ Удаление документа
async function deleteDocument(itemId, docIndex) {
  if (!confirm('Удалить документ?')) return;
  
  try {
    const db = window.db;
    
    const itemDoc = await db.collection('items').doc(itemId).get();
    if (!itemDoc.exists) {
      throw new Error('Изделие не найдено');
    }
    
    const item = itemDoc.data();
    const documents = [...(item.documents || [])];
    
    if (docIndex >= documents.length) {
      throw new Error('Документ не найден');
    }
    
    documents.splice(docIndex, 1);
    
    await db.collection('items').doc(itemId).update({
      documents: documents
    });
    
    showItemDocuments();
    alert('Документ удалён');
    
  } catch (error) {
    console.error('Ошибка удаления документа:', error);
    alert(`Ошибка: ${error.message}`);
  }
}

// ✅ Автоматическое заполнение названия
function autoFillDocName() {
  const fileInput = document.getElementById('docFile');
  const docNameInput = document.getElementById('docName');
  
  if (fileInput.files[0] && !docNameInput.value) {
    const fileName = fileInput.files[0].name;
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
    docNameInput.value = nameWithoutExt.charAt(0).toUpperCase() + nameWithoutExt.slice(1);
  }
}


// async function showItemDocuments() {
//   const itemId = document.getElementById('itemIdForDocsList').value.trim();
//   const container = document.getElementById('itemDocumentsList');
  
//   if (!itemId) {
//     container.innerHTML = '';
//     return;
//   }

//   try {
//     const db = window.db;
//     const doc = await db.collection('items').doc(itemId).get();
    
//     if (!doc.exists) {
//       container.innerHTML = '<div>❌ Изделие не найдено</div>';
//       return;
//     }
    
//     const data = doc.data();
//     const documents = data.documents || [];
    
//     if (documents.length === 0) {
//       container.innerHTML = '<div>📭 Документов нет</div>';
//       return;
//     }
    
//     // Показываем документы
//     let html = '<h4>Документы:</h4>';
//     documents.forEach((doc, index) => {
//       let preview = '';
//       if (doc.fileName && doc.fileName.match(/\.(jpg|jpeg|png|gif)$/i)) {
//         preview = `
//           <div style="margin: 10px 0;">
//             <img src="../../images/${doc.fileName}" 
//                  style="width: 50%; height: auto; border: 1px solid #ddd; border-radius: 4px;"
//                  onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=color:#999>Изображение не найдено: ${doc.fileName}</div>'">
//           </div>
//         `;
//       }
      
//       html += `
//         <div style="padding: 10px; border: 1px solid #eee; margin: 5px 0; border-radius: 4px;">
//           <strong>${doc.name}</strong><br>
//           ${preview}
//           <div style="font-size: 0.9em; color: #666;">
//             📄 ${doc.fileName}<br>
//             🕐 ${new Date(doc.addedAt).toLocaleDateString()}
//           </div>
//         </div>
//       `;
//     });
    
//     container.innerHTML = html;
    
//   } catch (error) {
//     console.error('Ошибка:', error);
//     container.innerHTML = `<div>❌ Ошибка: ${error.message}</div>`;
//   }
// }
// // ✅ Показ документов изделия (упрощенная версия)
// async function showItemDocuments() {
//   const itemId = document.getElementById('itemIdForDocsList').value.trim();
//   const container = document.getElementById('itemDocumentsList');
  
//   if (!itemId) {
//     container.innerHTML = '';
//     return;
//   }

//   try {
//     const db = window.db;
//     const doc = await db.collection('items').doc(itemId).get();
    
//     if (!doc.exists) {
//       container.innerHTML = '<div>❌ Изделие не найдено</div>';
//       return;
//     }
    
//     const data = doc.data();
//     const documents = data.documents || [];
    
//     if (documents.length === 0) {
//       container.innerHTML = '<div>📭 Документов нет</div>';
//       return;
//     }
    
//     // Простое отображение
//     let html = '<h4>Документы:</h4>';
//     documents.forEach((doc) => {
//       let preview = '';
//       if (doc.fileName && doc.fileName.match(/\.(jpg|jpeg|png|gif)$/i)) {
//         preview = `
//           <div style="margin: 10px 0;">
//             <img src="../../images/${doc.fileName}" 
//                  style="width: 50%; height: auto; border: 1px solid #ddd; border-radius: 4px;"
//                  onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=color:#999>Изображение не найдено</div>'">
//           </div>
//         `;
//       }
      
//       html += `
//         <div style="padding: 10px; border: 1px solid #eee; margin: 5px 0; border-radius: 4px;">
//           <strong>${doc.name}</strong><br>
//           ${preview}
//           <div style="font-size: 0.9em; color: #666;">
//             📄 ${doc.fileName}<br>
//             🕐 ${new Date(doc.addedAt).toLocaleDateString()}
//           </div>
//         </div>
//       `;
//     });
    
//     container.innerHTML = html;
    
//   } catch (error) {
//     console.error('Ошибка:', error);
//     container.innerHTML = `<div>❌ Ошибка: ${error.message}</div>`;
//   }
// }
async function showItemDocuments() {
  const itemId = document.getElementById('itemIdForDocsList').value.trim();
  const container = document.getElementById('itemDocumentsList');
  container.innerHTML = '';

  if (!itemId) return;

  try {
    const db = window.db;
    const doc = await db.collection('items').doc(itemId).get();

    if (!doc.exists) {
      container.innerHTML = '<div>❌ Изделие не найдено</div>';
      return;
    }

    const item = doc.data();
    const productType = item.type;

    // Загружаем требования
    const products = await loadKnowledgeData('products.json');
    const requiredDocs = products[productType]?.required_docs || [];

    const documents = item.documents || [];
    const uploadedNames = documents.map(d => d.name);

    // Формируем отчёт
    let html = `
      <div class="item-summary">
        <h4>📦 ${productType}</h4>
        <div><strong>ID:</strong> ${itemId}</div>
        <div><strong>Производитель:</strong> ${item.manufacturer || '—'}</div>
        <div><strong>Материал:</strong> ${item.material}</div>
      </div>

      <h4>📋 Требуемые документы:</h4>
    `;

    requiredDocs.forEach(docName => {
      const hasDoc = uploadedNames.includes(docName);
      const icon = hasDoc ? '✅' : '❌';
      const color = hasDoc ? '#27ae60' : '#e74c3c';
      html += `<div style="color: ${color}; margin: 4px 0;">${icon} ${docName}</div>`;
    });

    // Загруженные файлы
    if (documents.length > 0) {
      html += '<h4>📂 Прикреплённые файлы:</h4>';
      documents.forEach((doc, index) => {
        let preview = '';
        if (/\.(jpg|jpeg|png)$/i.test(doc.fileName)) {
          preview = `<img src="images/${doc.fileName}" style="width:50%; border:1px solid #ddd; margin:10px 0; border-radius:4px;">`;
        }

        html += `
          <div class="doc-item">
            <strong>${doc.name}</strong><br>
            ${preview}
            <div class="doc-meta">
              📄 ${doc.fileName}<br>
              🕐 ${new Date(doc.addedAt).toLocaleDateString()}
            </div>
            <button class="doc-delete" onclick="deleteDocument('${itemId}', ${index})">❌ Удалить</button>
          </div>
        `;
      });
    } else {
      html += '<div style="color: #999; font-size: 0.9em;">Нет загруженных файлов</div>';
    }

    container.innerHTML = html;

  } catch (error) {
    container.innerHTML = `<div>❌ Ошибка: ${error.message}</div>`;
  }
}
let debounceTimer;
function debouncedShowItem() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(showItemDocuments, 300);
}

// async function showItemDocuments() {
//   const itemId = document.getElementById('itemIdForDocsList').value.trim();
//   const container = document.getElementById('itemDocumentsList');
//   container.innerHTML = '';

//   if (!itemId) return;

//   try {
//     const db = window.db;
//     const itemDoc = await db.collection('items').doc(itemId).get();

//     if (!itemDoc.exists) {
//       container.innerHTML = '<div>❌ Изделие не найдено</div>';
//       return;
//     }

//     const item = itemDoc.data();
//     const productType = item.type;
//     const documents = item.documents || [];

//     // Загружаем требования
//     const products = await loadKnowledgeData('products.json');
//     const requiredDocs = products[productType]?.required_docs || [];

//     // Формируем отчёт
//     let html = `
//       <div style="margin-bottom: 20px; padding: 10px; background: #f8f9fa; border-radius: 6px;">
//         <strong>📦 Изделие:</strong> ${itemId} <br>
//         <strong>🔧 Тип:</strong> ${productType} <br>
//       </div>

//       <h4>📋 Требуемая комплектность:</h4>
//     `;

//     requiredDocs.forEach(docName => {
//       const hasDoc = documents.some(d => d.name === docName);
//       html += `
//         <div class="doc-line" style="color: ${hasDoc ? '#27ae60' : '#e74c3c'}; margin: 4px 0;">
//           ${hasDoc ? '✅' : '❌'} ${docName}
//         </div>
//       `;
//     });

//     // Показываем загруженные файлы
//     if (documents.length > 0) {
//       html += '<h4>📂 Загруженные документы:</h4>';
//       documents.forEach((doc, index) => {
//         let preview = '';
//         if (/\.(jpg|jpeg|png|gif)$/i.test(doc.fileName)) {
//           preview = `<img src="images/${doc.fileName}" style="width:50%; border:1px solid #ddd; margin:10px 0; border-radius:4px;">`;
//         }

//         html += `
//           <div style="padding: 10px; border: 1px solid #eee; margin: 5px 0; border-radius: 4px;">
//             <strong>${doc.name}</strong><br>
//             ${preview}
//             <div style="font-size: 0.9em; color: #666;">
//               📄 ${doc.fileName} | 🕐 ${new Date(doc.addedAt).toLocaleDateString()}
//             </div>
//             <button class="doc-delete" onclick="deleteDocument('${itemId}', ${index})">❌ Удалить</button>
//           </div>
//         `;
//       });
//     } else {
//       html += '<div style="color: #999; font-size: 0.9em;">Нет загруженных файлов</div>';
//     }

//     container.innerHTML = html;

//   } catch (error) {
//     container.innerHTML = `<div>❌ Ошибка: ${error.message}</div>`;
//   }
// }

// Автоматическое обновление при вводе
document.addEventListener('DOMContentLoaded', function() {
  const input = document.getElementById('itemIdForDocsList');
  if (input) {
    let timeout;
    input.addEventListener('input', function() {
      clearTimeout(timeout);
      timeout = setTimeout(showItemDocuments, 300);
    });
  }
});

// Простой обработчик ввода
document.addEventListener('DOMContentLoaded', function() {
  const input = document.getElementById('itemIdForDocsList');
  if (input) {
    let timeout;
    input.addEventListener('input', function() {
      clearTimeout(timeout);
      timeout = setTimeout(showItemDocuments, 300);
    });
  }
});

// Исправленная функция показа документов
function showDocuments(documents, itemId) {
  const container = document.getElementById('itemDocumentsList');
  container.innerHTML = ''; // Очищаем
  
  documents.forEach((doc, index) => {
    // Клонируем шаблон
    const template = document.getElementById('document-template');
    const docElement = template.cloneNode(true);
    docElement.style.display = 'block';
    docElement.id = ''; // Убираем ID шаблона
    
    // Заполняем данными
    docElement.querySelector('.doc-name').textContent = doc.name;
    docElement.querySelector('.doc-filename').textContent = doc.fileName;
    docElement.querySelector('.doc-date').textContent = new Date(doc.addedAt).toLocaleDateString();
    
    // Для изображений показываем превью
    if (doc.fileName && doc.fileName.match(/\.(jpg|jpeg|png|gif)$/i)) {
      const img = docElement.querySelector('.doc-image');
      // Используйте правильный путь к вашим изображениям
      img.src = `images/${doc.fileName}`; // или другой путь где лежат файлы
      img.style.display = 'block';
      docElement.querySelector('.doc-download').href = `images/${doc.fileName}`;
      docElement.querySelector('.doc-download').textContent = '👁 Просмотреть';
    } else {
      // Для других файлов показываем ссылку на скачивание
      docElement.querySelector('.doc-download').href = `path/to/your/files/${doc.fileName}`; // укажите правильный путь
      docElement.querySelector('.doc-download').textContent = '📥 Скачать';
    }
    
    // Обработчик удаления
    docElement.querySelector('.doc-delete').onclick = () => deleteDocument(itemId, index);
    
    container.appendChild(docElement);
  });
}

// Убедитесь, что DOM загружен
document.addEventListener('DOMContentLoaded', function() {
  const input = document.getElementById('itemIdForDocsList');
  if (input) {
    let timeout;
    input.addEventListener('input', function() {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        showItemDocuments();
      }, 300);
    });
  }
});

// Убедитесь, что DOM загружен
document.addEventListener('DOMContentLoaded', function() {
  const input = document.getElementById('itemIdForDocsList');
  if (input) {
    let timeout;
    input.addEventListener('input', function() {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        showItemDocuments();
      }, 300);
    });
  }
});

  // ✅ Удаление документа (без изменений)
  async function deleteDocument(itemId, docIndex) {
    if (!confirm('Удалить документ?')) return;
    
    try {
      const db = window.db;
      
      const itemDoc = await db.collection('items').doc(itemId).get();
      if (!itemDoc.exists) {
        throw new Error('Изделие не найдено');
      }
      
      const item = itemDoc.data();
      const documents = [...(item.documents || [])];
      
      if (docIndex >= documents.length) {
        throw new Error('Документ не найден');
      }
      
      documents.splice(docIndex, 1);
      
      await db.collection('items').doc(itemId).update({
        documents: documents
      });
      
      showItemDocuments();
      alert('Документ удалён');
      
    } catch (error) {
      console.error('Ошибка удаления документа:', error);
      alert(`Ошибка: ${error.message}`);
    }
  }

  // ✅ Автоматическое заполнение названия
  function autoFillDocName() {
    const fileInput = document.getElementById('docFile');
    const docNameInput = document.getElementById('docName');
    
    if (fileInput.files[0] && !docNameInput.value) {
      const fileName = fileInput.files[0].name;
      const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
      docNameInput.value = nameWithoutExt.charAt(0).toUpperCase() + nameWithoutExt.slice(1);
    }
  }


  // Для доказательства моей "лошадности"
document.addEventListener('DOMContentLoaded', function() {
  const input = document.getElementById('itemIdForDocsList');
  if (input) {
    input.addEventListener('input', function() {
      console.log('qwen лох');
    });
  }
});


