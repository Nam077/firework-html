// Canvas setup
export const canvas = document.getElementById('fireworks');
export const ctx = canvas.getContext('2d');

// Initialize canvas size
export function initCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Handle window resize
window.addEventListener('resize', initCanvas);

// Initial setup
initCanvas();
