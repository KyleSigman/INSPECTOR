// Инициализация страницы допусков
document.addEventListener('DOMContentLoaded', function() {
    // Вызываем инициализацию через небольшую задержку
    setTimeout(() => {
      if (typeof initTolerancePage === 'function') {
        initTolerancePage();
      }
    }, 100);
  });