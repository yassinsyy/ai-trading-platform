document.addEventListener("DOMContentLoaded", () => {
  // Создаем кастомный курсор
  const cursor = document.createElement("div");
  cursor.classList.add("custom-cursor");
  document.body.appendChild(cursor);

  // Движение курсора
  document.addEventListener("mousemove", (e) => {
    cursor.style.top = e.clientY + "px";
    cursor.style.left = e.clientX + "px";
  });

  // Наведение на интерактивные элементы
  const interactiveElements = "a, button, .btn, input, textarea, .card";
  document.querySelectorAll(interactiveElements).forEach(el => {
    el.addEventListener("mouseenter", () => cursor.classList.add("active"));
    el.addEventListener("mouseleave", () => cursor.classList.remove("active"));
  });

  // Эффект при клике
  document.addEventListener("click", () => {
    cursor.classList.add("click");
    setTimeout(() => cursor.classList.remove("click"), 300);
  });
}); 