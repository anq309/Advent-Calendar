import calendarData from './data.js';

const calendarContainer = document.getElementById('calendar');
const submitCodeBtn = document.getElementById('submitCodeBtn');
const codeInput = document.getElementById('codeInput');
const errorMsg = document.getElementById('errorMsg');
const modalDayNum = document.getElementById('modalDayNum');
const resetBtn = document.getElementById('resetBtn');

// Элементы левой панели
const panelWelcome = document.getElementById('panelWelcome');
const stepInput = document.getElementById('stepInput');
const stepLetter = document.getElementById('stepLetter');
const letterTitle = document.getElementById('letterTitle');
const letterText = document.getElementById('letterText');

let selectedDay = null;
let unlockedDays = JSON.parse(localStorage.getItem('advent_calendar_state')) || [];

// Инициализация календаря
function initCalendar() {
    calendarContainer.innerHTML = '';

    const urlParams = new URLSearchParams(window.location.search);
    const codeFromUrl = urlParams.get('code');

    calendarData.forEach(item => {
        const isUnlocked = unlockedDays.includes(item.day);
        const card = document.createElement('div');
        card.className = 'door-container';
        card.dataset.day = item.day;

        card.innerHTML = `
      <div class="door ${isUnlocked ? 'open' : ''}">
        <div class="door-front">
          <span class="door-number">${item.day}</span>
          ${!isUnlocked ? '<img src="assets/lock.png" class="door-locked-icon" alt="Locked">' : ''}
        </div>
        <div class="door-back">
          <div class="door-content">
            <div class="door-envelope">
              <div class="envelope-flap"></div>
              <div class="envelope-letter"></div>
              <div class="envelope-base"></div>
            </div>
          </div>
        </div>
      </div>
    `;

        card.addEventListener('click', () => {
            handleDayClick(item.day);
        });

        calendarContainer.appendChild(card);
    });

    if (codeFromUrl) {
        autoTryUnlock(codeFromUrl);
    }
}

// Обработка клика по дню
function handleDayClick(day) {
    selectedDay = day;
    const isUnlocked = unlockedDays.includes(day);

    // Сбрасываем видимость всех панелей
    hideAllPanels();

    if (isUnlocked) {
        showLetter(day);
    } else {
        showInput(day);
    }
}

function hideAllPanels() {
    panelWelcome.style.display = 'none';
    stepInput.style.display = 'none';
    stepLetter.style.display = 'none';

    // Сброс ошибок и инпута
    errorMsg.innerText = '';
    codeInput.value = '';
}

function showInput(day) {
    stepInput.style.display = 'block';
    modalDayNum.innerText = day;
    setTimeout(() => codeInput.focus(), 100);
}

function showLetter(day) {
    const dayData = calendarData.find(d => d.day === day);
    stepLetter.style.display = 'block';
    letterTitle.innerText = `День ${day}`;
    letterText.innerHTML = dayData ? dayData.content : "Сообщение не найдено...";
}

// Проверка кода
function checkCode() {
    if (!selectedDay) return;

    const enteredCode = codeInput.value.trim().toUpperCase();
    const dayData = calendarData.find(d => d.day === selectedDay);

    if (dayData && enteredCode === dayData.code) {
        unlockDay(selectedDay);
        triggerConfetti();
        hideAllPanels();
        showLetter(selectedDay);
    } else {
        errorMsg.innerText = "Неверный шифр! Попробуй еще раз.";
        shakeInput(); // Анимация тряски поля ввода, а не всей модалки
    }
}

function unlockDay(day) {
    if (!unlockedDays.includes(day)) {
        unlockedDays.push(day);
        localStorage.setItem('advent_calendar_state', JSON.stringify(unlockedDays));
    }

    const card = document.querySelector(`.door-container[data-day="${day}"] .door`);
    if (card) {
        card.classList.add('open');
        const icon = card.querySelector('.door-locked-icon');
        if (icon) icon.remove();
    }
}

function autoTryUnlock(code) {
    const dayData = calendarData.find(d => d.code === code);
    if (dayData) {
        setTimeout(() => {
            if (!unlockedDays.includes(dayData.day)) {
                unlockDay(dayData.day);
                triggerConfetti();
            }
            handleDayClick(dayData.day);
        }, 800);
    }
}

function triggerConfetti() {
    const duration = 2000;
    const end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#d42426', '#2e5a1c', '#ffc107']
        });
        confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#d42426', '#2e5a1c', '#ffc107']
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
}

function shakeInput() {
    codeInput.animate([
        { transform: 'translateX(0)' },
        { transform: 'translateX(-10px)' },
        { transform: 'translateX(10px)' },
        { transform: 'translateX(0)' }
    ], {
        duration: 300,
        easing: 'ease-in-out'
    });
}

// Event Listeners
submitCodeBtn.addEventListener('click', checkCode);
codeInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkCode();
});

resetBtn.addEventListener('click', () => {
    if (confirm('Вы уверены, что хотите закрыть все дверки?')) {
        localStorage.removeItem('advent_calendar_state');
        unlockedDays = [];
        initCalendar();
        hideAllPanels();
        panelWelcome.style.display = 'block';
    }
});

// Запуск
window.addEventListener('load', () => {
    initCalendar();
});
