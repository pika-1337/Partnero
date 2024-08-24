const burgerBtn = document.querySelector('.btn-burger');
const menu = document.querySelector('.menu-navigation');
const cards = document.querySelectorAll('.section-price-item'); // Виправлено селектор
let defaultCard = document.querySelector('.section-price-starter.default'); // Оновлено селектор

burgerBtn.addEventListener('click', function() {
  menu.classList.toggle('active');
});

cards.forEach(card => {
  card.addEventListener('focusin', () => {
    if (card !== defaultCard) {
      defaultCard.classList.remove('default');
    }
    card.classList.add('default');
    defaultCard = card;  // Оновлюємо змінну з новою дефолтною карткою
  });

  card.addEventListener('focusout', () => {
    if (!document.activeElement.closest('.section-price-item')) {
      card.classList.remove('default');
      if (defaultCard) {
        defaultCard.classList.add('default');
      }
    }
  });
});
