// Khởi tạo UI
function initUI() {
    const toggleButton = document.getElementById('uiToggle');
    const content = document.getElementById('content');
    const audioButton = document.querySelector('#audioButton');

    const uiVisible = localStorage.getItem('fireworksUIVisible') !== 'false';
    if (!uiVisible) {
        content.classList.add('hidden');
        if (toggleButton) {
            toggleButton.checked = false;
        }
    }

    if (toggleButton) {
        toggleButton.addEventListener('click', () => {
            content.classList.toggle('hidden');
            localStorage.setItem('fireworksUIVisible', !content.classList.contains('hidden'));
        });
    }

    if (audioButton) {
        audioButton.addEventListener('click', () => {
            const isActive = audioButton.classList.contains('active');
            audioButton.textContent = isActive ? 'Bật âm thanh' : 'Tắt âm thanh';
            audioButton.classList.toggle('active');
        });
    }
}

export { initUI };
