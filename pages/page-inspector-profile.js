// pages/page-inspector-profile.js

// Загрузка профиля при открытии страницы
document.addEventListener('DOMContentLoaded', async function() {
    await loadInspectorProfile();
  });
  
  async function loadInspectorProfile() {
    try {
      // Получаем данные из Firebase
      const db = window.db;
      
      // Считаем общую статистику
      const itemsSnapshot = await db.collection('items').get();
      const inspectionsSnapshot = await db.collection('inspections').get();
      const ncrsSnapshot = await db.collection('ncrs').get();
      
      const totalItems = itemsSnapshot.size;
      const totalInspections = inspectionsSnapshot.size;
      const totalNCR = ncrsSnapshot.size;
      
      const defectRate = totalInspections > 0 ? 
        ((totalNCR / totalInspections) * 100).toFixed(1) : 0;
      
      // Обновляем общую статистику
      document.querySelector('.stat-card:nth-child(1) .stat-number').textContent = totalInspections;
      document.querySelector('.stat-card:nth-child(2) .stat-number').textContent = totalNCR;
      document.querySelector('.stat-card:nth-child(3) .stat-number').textContent = defectRate + '%';
      
      // Симуляция остальных данных (в реальном приложении - из аналитики)
      updateSkillProgress();
      updateAchievements();
      
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
    }
  }
  
  function updateSkillProgress() {
    // В реальном приложении - данные из аналитики
    const skills = {
      'Мастер проверок': { current: 184, max: 250, level: 3 },
      'Мастер NCR': { current: 12, max: 20, level: 2 },
      'Крафтмастер': { current: 47, max: 120, level: 1 },
      'Эксперт по стандартам': { current: 17, max: 20, level: 4 },
      'Мастер качества': { current: 92, max: 100, level: 5 },
      'Скоростной инспектор': { current: 55, max: 100, level: 2 }
    };
    
    // Обновляем шкалы прогресса
    document.querySelectorAll('.progress-bar').forEach((bar, index) => {
      const skillNames = Object.keys(skills);
      const skillName = skillNames[index];
      const skill = skills[skillName];
      
      if (skill) {
        const fill = bar.querySelector('.progress-fill');
        const text = bar.querySelector('.progress-text');
        const level = bar.closest('.skill-card').querySelector('.skill-level');
        
        const percent = (skill.current / skill.max) * 100;
        fill.style.width = `${percent}%`;
        fill.setAttribute('data-level', skill.level);
        text.textContent = `${skill.current}/${skill.max}`;
        level.textContent = `Уровень ${skill.level}`;
      }
    });
  }
  
  function updateAchievements() {
    // В реальном приложении - проверка условий
    const unlocked = ['Без брака 30 дней', '100 проверок', 'Эксперт УЗК'];
    const locked = ['Супер скорость', 'Идеальная точность', '10 предприятий'];
    
    // Пока просто симуляция
  }