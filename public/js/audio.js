// Audio context
let audioContext;
let audioBuffer;
let audioEnabled = false;

// Khởi tạo audio context
async function initAudio() {
    try {
        await loadSound();
        // Tự động bật âm thanh
        audioEnabled = true;
        // Cập nhật trạng thái nút
        const audioButton = document.querySelector('#audioButton');
        if (audioButton) {
            audioButton.textContent = 'Tắt âm thanh';
            audioButton.classList.add('active');
        }
    } catch (error) {
        console.error('Không thể khởi tạo âm thanh:', error);
    }
}

// Load file âm thanh
async function loadSound() {
    try {
        const response = await fetch('../public/music/sound.mp3');
        const arrayBuffer = await response.arrayBuffer();
        audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    } catch (e) {
        console.error('Không thể load file âm thanh:', e);
    }
}

// Phát âm thanh
function playSound(volume = 1.0) {
    if (!audioContext || !audioBuffer || !audioEnabled) return;
    
    // Tạo source node
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    
    // Tạo gain node để điều chỉnh âm lượng
    const gainNode = audioContext.createGain();
    gainNode.gain.value = volume;
    
    // Kết nối các node
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Phát âm thanh
    source.start(0);
}

// Thêm sự kiện để tự động bật âm thanh khi người dùng tương tác
function setupAutoAudio() {
    const startAudio = async () => {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            await initAudio();
        }
        // Xóa tất cả event listener sau khi đã bật âm thanh
        ['click', 'touchstart', 'keydown'].forEach(event => {
            document.removeEventListener(event, startAudio);
        });
    };

    // Thêm các event listener để bắt sự kiện tương tác đầu tiên
    ['click', 'touchstart', 'keydown'].forEach(event => {
        document.addEventListener(event, startAudio, { once: true });
    });
}

// Gọi hàm setup khi trang web được tải
setupAutoAudio();

export { initAudio, playSound };
