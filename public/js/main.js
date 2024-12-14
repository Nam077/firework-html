import { canvas } from './canvas.js';
import { fireworkShow } from './choreography.js';
import { animationManager } from './animation.js';
import { updateCountdown } from './countdown.js';
import { initAudio } from './audio.js';
import { initUI } from './ui.js';

// Initialize UI
initUI();

// Khởi tạo audio khi user tương tác với trang web
function initOnUserInteraction() {
    document.addEventListener('click', function initializeAudio() {
        initAudio();
        document.removeEventListener('click', initializeAudio);
    }, { once: true });
}

// Khởi tạo canvas
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Bắt đầu animation
animationManager.start();

// Xử lý sự kiện bàn phím
document.addEventListener('keydown', async (e) => {
    switch(e.key) {
        case ' ':
            // Chuyển đổi giữa chế độ ngẫu nhiên và kịch bản
            fireworkShow.setMode(fireworkShow.mode === 'random' ? 'choreography' : 'random');
            break;
        case '1':
        case '2':
        case '3':
            // Chọn kịch bản tương ứng
            await fireworkShow.switchChoreography(parseInt(e.key));
            break;
        case 'r':
            // Bật/tắt tự động replay
            fireworkShow.setAutoReplay(!fireworkShow.autoReplay);
            break;
        case 'p':
            // Bật/tắt tự động điều chỉnh hiệu năng
            animationManager.toggleAutoAdjust(!animationManager.autoAdjustPerformance);
            break;
        case '+':
            // Tăng FPS mục tiêu
            animationManager.setTargetFPS(animationManager.targetFPS + 5);
            break;
        case '-':
            // Giảm FPS mục tiêu
            animationManager.setTargetFPS(animationManager.targetFPS - 5);
            break;
    }
});

setInterval(updateCountdown, 1000);
initOnUserInteraction();
