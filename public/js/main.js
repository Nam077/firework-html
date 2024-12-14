import { canvas } from './canvas.js';
import { fireworkShow } from './choreography.js';
import { animationManager } from './animation.js';
import { initAudio } from './audio.js';
import { initUI } from './ui.js';
import { initCountdown } from '../../js/countdown.js';

// Hàm khởi tạo chính
function init() {
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

    // Mode display
    const modeText = document.getElementById('modeText');
    const scenarioText = document.getElementById('scenarioText');
    let isRandomMode = true;
    let currentScenario = null;

    function updateModeDisplay() {
        if (isRandomMode) {
            modeText.textContent = 'Chế độ: Ngẫu nhiên';
            scenarioText.textContent = '';
        } else {
            modeText.textContent = 'Chế độ: Kịch bản';
            if (currentScenario) {
                const scenarioNames = {
                    1: 'Lễ hội ánh sáng',
                    2: 'Vũ điệu tình yêu',
                    3: 'Bão lửa rồng',
                    4: 'Rainbow Symphony',
                    5: 'Starry Night Fantasy',
                    6: 'Crystal Cascade',
                    7: 'Phoenix Rising',
                    8: 'Ocean Dreams',
                    9: 'Garden of Light',
                    10: 'Dragon Dance',
                    11: 'Aurora Borealis',
                    12: 'Cosmic Journey'
                };
                scenarioText.textContent = `Đang chạy: ${scenarioNames[currentScenario]}`;
            } else {
                scenarioText.textContent = 'Chọn kịch bản (1-12)';
            }
        }
    }

    // Xử lý sự kiện bàn phím
    document.addEventListener('keydown', async (e) => {
        switch(e.key.toLowerCase()) {
            case ' ':
                // Chuyển đổi giữa chế độ ngẫu nhiên và kịch bản
                isRandomMode = !isRandomMode;
                if (isRandomMode) {
                    fireworkShow.setMode('random');
                } else {
                    fireworkShow.setMode('choreography');
                }
                updateModeDisplay();
                break;
            case 'q':
                // Lễ hội ánh sáng
                if (!isRandomMode) {
                    currentScenario = 1;
                    fireworkShow.switchChoreography(1);
                    updateModeDisplay();
                }
                break;
            case 'w':
                // Vũ điệu tình yêu
                if (!isRandomMode) {
                    currentScenario = 2;
                    fireworkShow.switchChoreography(2);
                    updateModeDisplay();
                }
                break;
            case 'e':
                // Bão lửa rồng
                if (!isRandomMode) {
                    currentScenario = 3;
                    fireworkShow.switchChoreography(3);
                    updateModeDisplay();
                }
                break;
            case 'r':
                // Rainbow Symphony
                if (!isRandomMode) {
                    currentScenario = 4;
                    fireworkShow.switchChoreography(4);
                    updateModeDisplay();
                }
                break;
            case 't':
                // Starry Night Fantasy
                if (!isRandomMode) {
                    currentScenario = 5;
                    fireworkShow.switchChoreography(5);
                    updateModeDisplay();
                }
                break;
            case 'y':
                // Crystal Cascade
                if (!isRandomMode) {
                    currentScenario = 6;
                    fireworkShow.switchChoreography(6);
                    updateModeDisplay();
                }
                break;
            case 'u':
                // Phoenix Rising
                if (!isRandomMode) {
                    currentScenario = 7;
                    fireworkShow.switchChoreography(7);
                    updateModeDisplay();
                }
                break;
            case 'i':
                // Ocean Dreams
                if (!isRandomMode) {
                    currentScenario = 8;
                    fireworkShow.switchChoreography(8);
                    updateModeDisplay();
                }
                break;
            case 'o':
                // Garden of Light
                if (!isRandomMode) {
                    currentScenario = 9;
                    fireworkShow.switchChoreography(9);
                    updateModeDisplay();
                }
                break;
            case 'p':
                // Dragon Dance
                if (!isRandomMode) {
                    currentScenario = 10;
                    fireworkShow.switchChoreography(10);
                    updateModeDisplay();
                }
                break;
            case '[':
                // Aurora Borealis
                if (!isRandomMode) {
                    currentScenario = 11;
                    fireworkShow.switchChoreography(11);
                    updateModeDisplay();
                }
                break;
            case ']':
                // Cosmic Journey
                if (!isRandomMode) {
                    currentScenario = 12;
                    fireworkShow.switchChoreography(12);
                    updateModeDisplay();
                }
                break;
            case 'c':
                toggleUI();
                break;
            case 'a':
                // Bật/tắt tự động replay
                fireworkShow.setAutoReplay(!fireworkShow.autoReplay);
                break;
            case 's':
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

    // Initialize mode display
    updateModeDisplay();

    initOnUserInteraction();

    initCountdown();
}

// Khởi chạy ứng dụng
init();
