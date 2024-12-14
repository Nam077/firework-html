function initUI() {
    const toggleButton = document.getElementById('toggleUI');
    const content = document.getElementById('content');

    const uiVisible = localStorage.getItem('fireworksUIVisible') !== 'false';
    if (!uiVisible) {
        content.classList.add('hidden');
    }

    toggleButton.addEventListener('click', () => {
        content.classList.toggle('hidden');
        localStorage.setItem('fireworksUIVisible', !content.classList.contains('hidden'));
    });
}

export { initUI };
