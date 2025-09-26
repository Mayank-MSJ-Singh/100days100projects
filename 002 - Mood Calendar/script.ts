const calendar = document.querySelector('.calendar') as HTMLDivElement;
const userIdSection = document.getElementById('userIdSection') as HTMLDivElement;
const calendarSection = document.getElementById('calendarSection') as HTMLDivElement;
const loadCalendarBtn = document.getElementById('loadCalendar') as HTMLButtonElement;
const userIdInput = document.getElementById('userId') as HTMLInputElement;
const moods = document.querySelectorAll('.mood') as NodeListOf<HTMLButtonElement>;

let selectedMood: string = 'happy';
let userId: string = '';

interface Month {
    name: string;
    days: number;
}

interface MoodItem {
    date: string;
    mood: string;
}

interface ApiMoodItem {
    UserId: string;
    Mood: string;
    Date: string;
}

const months: Month[] = [
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

const API_BASE = "https://j6e7lvdd1f.execute-api.us-east-2.amazonaws.com/002moodcalendar";
const daysOfWeek: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function pad(num: number): string {
    return num < 10 ? '0' + num : '' + num;
}

moods.forEach(mood => {
    mood.addEventListener('click', () => {
        document.querySelector('.mood.selected')?.classList.remove('selected');
        mood.classList.add('selected');
        selectedMood = mood.classList[1];
    });
});

async function getMoods(userId: string): Promise<MoodItem[]> {
    try {
        const url = `${API_BASE}/getMoods?userId=${encodeURIComponent(userId)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch moods");
        const data: ApiMoodItem[] = await res.json();
        return data.map(d => ({ date: d.Date, mood: d.Mood.toLowerCase() }));
    } catch {
        return []; // Fail silently
    }
}

async function saveMood(userId: string, date: string, mood: string) {
    try {
        await fetch(`${API_BASE}/saveMood`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, date, mood }) // This is the corrected line
        });
    } catch {
        alert('Failed to save mood');
    }
}

async function renderCalendar() {
    calendar.innerHTML = '';

    // Fetch moods first to avoid UI flicker
    const existingMoods = await getMoods(userId);

    const moodColorMap: { [key: string]: string } = {
        happy: getComputedStyle(document.querySelector('.mood.happy')!).backgroundColor,
        neutral: getComputedStyle(document.querySelector('.mood.neutral')!).backgroundColor,
        sad: getComputedStyle(document.querySelector('.mood.sad')!).backgroundColor
    };

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
            const daySpan = document.createElement('span');
            daySpan.textContent = i.toString();
            day.appendChild(daySpan);

            const dateStr = `2025-${pad(monthIndex + 1)}-${pad(i)}`;

            // Apply existing mood color during creation
            const existingMood = existingMoods.find(m => m.date === dateStr);
            if (existingMood) {
                day.style.backgroundColor = moodColorMap[existingMood.mood];
            }

            day.addEventListener('click', () => {
                const moodColor = getComputedStyle(document.querySelector(`.mood.${selectedMood}`) as HTMLElement).backgroundColor;
                day.style.backgroundColor = moodColor;
                saveMood(userId, dateStr, selectedMood);
            });

            daysContainer.appendChild(day);
        }

        monthContainer.appendChild(daysContainer);
        calendar.appendChild(monthContainer);
    });
}

loadCalendarBtn.addEventListener('click', async () => {
    userId = userIdInput.value.trim();
    if (!userId) {
        alert('Please enter a User ID');
        return;
    }

    userIdSection.style.display = 'none';
    calendarSection.style.display = 'block';

    await renderCalendar();
});