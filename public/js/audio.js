// Audio context
let audioContext;
let audioBuffer;

// Khởi tạo audio context
function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        loadSound();
    } catch (e) {
        console.error('Web Audio API không được hỗ trợ:', e);
    }
}

let location = window.location.href;

// Load file âm thanh
async function loadSound() {
    try {
        const response = await fetch("../music/sound.mp3");
        const arrayBuffer = await response.arrayBuffer();
        audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    } catch (e) {
        console.error("Không thể load file âm thanh:", e);
    }
}

// Phát âm thanh
function playSound(volume = 1.0) {
    if (!audioContext || !audioBuffer) return;
    
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

export { initAudio, playSound };
