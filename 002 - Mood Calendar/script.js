"use strict";
const calendar = document.querySelector('.calendar');
const moods = document.querySelectorAll('.mood');
let selectedMood = 'happy'; // Default mood
const months = [
    { name: 'January', days: 31 },
    { name: 'February', days: 28 }, // 2025 is not a leap year
    { name: 'March', days: 31 },
    { name: 'April', days: 30 },
    { name: 'May', days: 31 },
    { name: 'June', days: 30 },
    { name: 'July', days: 31 },
    { name: 'August', days: 31 },
    { name: 'September', days: 30 },
    { name: 'October', days: 31 },
    { name: 'November', days: 30 },
    { name: 'December', days: 31 }
];
const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
moods.forEach(mood => {
    mood.addEventListener('click', () => {
        selectedMood = mood.classList[1];
    });
});
months.forEach((month, monthIndex) => {
    const monthContainer = document.createElement('div');
    monthContainer.classList.add('month');
    const monthHeader = document.createElement('h2');
    monthHeader.textContent = month.name;
    monthContainer.appendChild(monthHeader);
    const daysOfWeekContainer = document.createElement('div');
    daysOfWeekContainer.classList.add('days-of-week');
    daysOfWeek.forEach(day => {
        const dayOfWeek = document.createElement('div');
        dayOfWeek.textContent = day;
        daysOfWeekContainer.appendChild(dayOfWeek);
    });
    monthContainer.appendChild(daysOfWeekContainer);
    const daysContainer = document.createElement('div');
    daysContainer.classList.add('days');
    const firstDay = new Date(2025, monthIndex, 1).getDay();
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.classList.add('day', 'empty');
        daysContainer.appendChild(emptyDay);
    }
    for (let i = 1; i <= month.days; i++) {
        const day = document.createElement('div');
        day.classList.add('day');
        day.textContent = i.toString();
        daysContainer.appendChild(day);
        day.addEventListener('click', () => {
            const moodColor = getComputedStyle(document.querySelector(`.${selectedMood}`)).backgroundColor;
            day.style.backgroundColor = moodColor;
        });
    }
    monthContainer.appendChild(daysContainer);
    calendar.appendChild(monthContainer);
});
