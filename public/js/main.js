import { animate } from './animation.js';
import { updateCountdown } from './countdown.js';
import { initAudio } from './audio.js';
import { initUI } from './ui.js';
import { fireworkShow } from './choreography.js';

// Initialize UI
initUI();

// Khởi tạo audio khi user tương tác với trang web
function initOnUserInteraction() {
    document.addEventListener('click', function initializeAudio() {
        initAudio();
        document.removeEventListener('click', initializeAudio);
    }, { once: true });
}

// Xử lý sự kiện bàn phím
document.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
        fireworkShow.setMode(fireworkShow.mode === 'random' ? 'choreography' : 'random');
    } else if (fireworkShow.mode === 'choreography') {
        switch(e.key) {
            case '1':
                fireworkShow.switchChoreography(1);
                break;
            case '2':
                fireworkShow.switchChoreography(2);
                break;
            case '3':
                fireworkShow.switchChoreography(3);
                break;
        }
    }
});

// Start animations
animate();
setInterval(updateCountdown, 1000);
initOnUserInteraction();

// Set canvas size
const canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
