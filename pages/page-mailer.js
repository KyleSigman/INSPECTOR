
(function() {
    emailjs.init("weuRg4oHu_2yh6FtH"); 
  })();

  async function sendEmail() {
    if (!window.emailjs) {
      console.error("🔴 EmailJS не загружен");
      alert("Ошибка: EmailJS не загружен");
      return;
    }
  
    const toEmail = document.getElementById("toEmail").value;
    const subject = document.getElementById("emailSubject").value || "Отчёт от инспектора";
    const description = document.getElementById("emailDescription").value;
    const template = document.getElementById("templateSelect").value;
    const status = document.getElementById("status");
  
    // --- Работаем только с ссылкой ---
    const photoLink = document.getElementById("photoLink").value.trim();
    let photoUrl = "";
    
    if (photoLink) {
      // Извлекаем часть до ? (если есть параметры)
      const cleanUrl = photoLink.split('?')[0];
      
      // Проверяем, заканчивается ли чистая ссылка на нужное расширение
      if (cleanUrl.match(/\.(jpeg|jpg|png|webp|gif)$/i)) {
        photoUrl = photoLink; // ← используем оригинальную ссылку (с параметрами)
      } else {
        alert("⚠️ Пожалуйста, введите прямую ссылку на изображение (например: .jpg, .png)");
        return;
      }
    }
  
    // --- Кнопка "Скачать прикреплённый файл" ---
    let attachmentButton = "";
    if (photoUrl) {
      attachmentButton = `
        <a href="${photoUrl}" download class="download-btn">
          📎 Скачать прикреплённый файл
        </a>
      `;
    }
  
    // --- Иконка ---
    const icon = 
      template === "vik" ? "📋" :
      template === "kv" ? "📏" : "📄";
  
    // --- Заголовок ---
    const reportTitle = 
      template === "vik" ? "ВИК — Визуальный контроль" :
      template === "kv" ? "Квалитет / Точность" : 
      "Общий отчёт";
  
    try {
      status.innerText = "📨 Отправляю...";
  
      const res = await emailjs.send("service_a28x7j4", "template_4x0jy43", {
        to_email: toEmail,
        subject: subject,
        from_name: "Инспекция | Свет и Порядок",
        date: new Date().toLocaleString(),
        html_message: description,
        attachment_button: attachmentButton,
        report_title: reportTitle,
        icon: icon,
        report_type: template
      });
  
      console.log("✅ Письмо отправлено:", res);
      status.innerHTML = "✅ Письмо отправлено!";
      setTimeout(() => (status.innerHTML = ""), 3000);
  
    } catch (err) {
      console.error("🔴 Ошибка:", err);
      status.innerHTML = "❌ Ошибка: не отправлено";
    }
  }


