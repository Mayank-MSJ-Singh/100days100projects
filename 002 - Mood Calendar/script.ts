const calendar = document.querySelector('.calendar') as HTMLDivElement;
const moods = document.querySelectorAll('.mood') as NodeListOf<HTMLButtonElement>;

let selectedMood: string = 'happy'; // Default mood

moods.forEach(mood => {
    mood.addEventListener('click', () => {
        selectedMood = mood.classList[1];
    });
});

for (let i = 1; i <= 365; i++) {
    const day = document.createElement('div');
    day.classList.add('day');
    day.textContent = i.toString();
    calendar.appendChild(day);

    day.addEventListener('click', () => {
        const moodColor = getComputedStyle(document.querySelector(`.${selectedMood}`) as HTMLElement).backgroundColor;
        day.style.backgroundColor = moodColor;
    });
}
