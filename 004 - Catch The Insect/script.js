const start_btn = document.getElementById('start_btn');
const screens = document.querySelectorAll('.screen');
const playerIdInput = document.getElementById('player_id_input');
const choose_insect_btns = document.querySelectorAll('.choose_insect_btn');
const game_container = document.querySelector('.game_container');
const timeEl = document.getElementById('time');
const scoreEl = document.getElementById('score');
const annoying_message = document.getElementById('annoying_message');

let seconds = 0;
let score = 0;
let selected_insect = {};
let playerId = '';
let gameInterval;
let insectsActive = true;

// API URLs
const API_BASE = 'https://2wjswo4s7d.execute-api.us-east-2.amazonaws.com/004-catch-the-insect-rest-api';

// ----------------------
// Start Game
// ----------------------
start_btn.addEventListener('click', () => {
    const inputVal = playerIdInput.value.trim();
    if (!inputVal) {
        alert('Please enter your Player ID');
        return;
    }
    playerId = inputVal;
    screens[0].classList.add('up');
});

choose_insect_btns.forEach(btn => {
    btn.addEventListener('click', () => {
        const img = btn.querySelector('img');
        const src = img.getAttribute('src');
        const alt = img.getAttribute('alt');
        selected_insect = { src, alt };
        screens[1].classList.add('up');
        setTimeout(createInsect, 1000);
        startGame();
    });
});

// ----------------------
// Time & Score
// ----------------------
function increaseTime() {
    let m = Math.floor(seconds / 60);
    let s = seconds % 60;
    m = m < 10 ? `0${m}` : m;
    s = s < 10 ? `0${s}` : s;
    timeEl.innerHTML = `Time: ${m}:${s}`;
    seconds++;
}

function increaseScore() {
    score++;
    if (score > 19) {
        annoying_message.classList.add('visible');
    }
    scoreEl.innerHTML = `Score: ${score}`;
}

// ----------------------
// Insects
// ----------------------
function addInsects() {
    setTimeout(createInsect, 1000);
    setTimeout(createInsect, 1500);
}

function createInsect() {
    if (!insectsActive) return;
    const insect = document.createElement('div');
    const { x, y } = getRandomLocation();
    insect.classList.add('insect');
    insect.style.left = `${x}px`;
    insect.style.top = `${y}px`;
    insect.innerHTML = `<img src="${selected_insect.src}" alt="${selected_insect.alt}" style="transform: rotate(${Math.random() * 360}deg)"/>`;
    insect.addEventListener('click', catchInsect);
    game_container.appendChild(insect);
}

function catchInsect() {
    if (!insectsActive) return;
    increaseScore();
    this.classList.add('catched');
    sendEventToAPI('insectCaught', this.querySelector('img').alt);
    setTimeout(() => this.remove(), 2000);
    addInsects();
}

function getRandomLocation() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const x = Math.random() * (width - 200) + 100;
    const y = Math.random() * (height - 200) + 100;
    return { x, y };
}

function startGame() {
    gameInterval = setInterval(increaseTime, 1000);
}

// ----------------------
// API Calls
// ----------------------
async function sendScoreToAPI() {
    if (!playerId) return;
    try {
        const res = await fetch(`${API_BASE}/score`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playerId, score })
        });
        const data = await res.json();
        console.log('Score saved:', data);
    } catch (err) {
        console.error('Error sending score:', err);
    }
}

async function sendEventToAPI(eventType, insect) {
    if (!playerId) return;
    try {
        const res = await fetch(`${API_BASE}/event`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playerId, event: eventType, insect })
        });
        const data = await res.json();
        console.log('Event sent:', data);
    } catch (err) {
        console.error('Error sending event:', err);
    }
}

// ----------------------
// Stop Game Button
// ----------------------
const stopBtn = document.createElement('button');
stopBtn.classList.add('stop-btn');
stopBtn.textContent = 'Stop Game';
game_container.appendChild(stopBtn);

stopBtn.addEventListener('click', async () => {
    if (!insectsActive) return;
    insectsActive = false;
    clearInterval(gameInterval);

    // remove all remaining insects
    document.querySelectorAll('.insect').forEach(i => i.remove());

    // send final score
    await sendScoreToAPI();

    alert(`Game stopped! Your final score: ${score}. Refresh page to play again.`);
});

// ----------------------
// SOCIAL PANEL
// ----------------------
const floating_btn = document.querySelector('.floating-btn');
const close_btn = document.querySelector('.close-btn');
const social_panel_container = document.querySelector('.social-panel-container');

floating_btn.addEventListener('click', () => {
    social_panel_container.classList.toggle('visible');
});

close_btn.addEventListener('click', () => {
    social_panel_container.classList.remove('visible');
});
