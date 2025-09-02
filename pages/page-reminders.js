// pages/page-reminders.js
document.addEventListener('DOMContentLoaded', () => setTimeout(loadReminders, 100));
// document.addEventListener('DOMContentLoaded', loadReminders);

async function loadReminders() {
  try {
    const db = window.db;
    
    // Очищаем список
    const list = document.getElementById('reminders-list');
    list.innerHTML = '';
    
    // Загружаем все напоминания
    const snapshot = await db.collection('reminders')
      .orderBy('date', 'asc')
      .get();
    
    // Создаем плашки для каждого документа
    snapshot.forEach(doc => {
      const reminder = doc.data();
      const card = createReminderCard(reminder);
      list.appendChild(card);
    });
    
  } catch (error) {
    console.error('Ошибка загрузки:', error);
  }
}

function createReminderCard(reminder) {
  const card = document.createElement('div');
  const priority = reminder.priority || 'planned';
  card.className = `reminder-card ${priority}`;
  
  const buttonText = priority === 'urgent' ? 'Отложить' : 
                    priority === 'soon' ? 'Отметить' : 'Назначить';
  
  card.innerHTML = `
    <div class="reminder-icon">
      ${priority === 'urgent' ? '⚠️' : 
        priority === 'soon' ? '📅' : '📋'}
    </div>
    <div class="reminder-content">
      <div class="reminder-text">${reminder.text}</div>
      <div class="reminder-date">📅 ${reminder.date}</div>
    </div>

  `;
  
  return card;
}

async function addReminder() {
  const text = document.getElementById('reminderText').value;
  const date = document.getElementById('reminderDate').value;
  const priority = document.getElementById('reminderPriority').value;
  
  if (!text || !date) {
    alert('Заполните поля');
    return;
  }
  
  try {
    const db = window.db;
    const id = `REM-${Date.now()}`;
    
    await db.collection('reminders').doc(id).set({
      id,
      text,
      date,
      priority,
      createdAt: new Date().toISOString(),
      completed: false
    });
    
    document.getElementById('reminderText').value = '';
    document.getElementById('reminderDate').value = '';
    
    loadReminders(); // Обновляем список
    
  } catch (error) {
    console.error('Ошибка:', error);
  }
}

async function dismissReminder(reminderId) {
  try {
    const db = window.db;
    await db.collection('reminders').doc(reminderId).update({
      completed: true
    });
    loadReminders(); // Обновляем список
  } catch (error) {
    console.error('Ошибка:', error);
  }
}




    // <button class="reminder-action" onclick="dismissReminder('${reminder.id}')">
    //   ${buttonText}
    // </button>