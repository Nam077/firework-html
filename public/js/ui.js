// Khởi tạo UI
function initUI() {
    const toggleButton = document.getElementById('toggleUI');
    const content = document.getElementById('content');
    const audioButton = document.querySelector('#audioButton');

    const uiVisible = localStorage.getItem('fireworksUIVisible') !== 'false';
    if (!uiVisible) {
        content.classList.add('hidden');
    }

    toggleButton.addEventListener('click', () => {
        content.classList.toggle('hidden');
        localStorage.setItem('fireworksUIVisible', !content.classList.contains('hidden'));
    });

    if (audioButton) {
        audioButton.addEventListener('click', () => {
            const isActive = audioButton.classList.contains('active');
            audioButton.textContent = isActive ? 'Bật âm thanh' : 'Tắt âm thanh';
            audioButton.classList.toggle('active');
            window.audioEnabled = !isActive;
        });
    }
}

export { initUI };
