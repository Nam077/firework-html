import { canvas, ctx } from './canvas.js';
import { fireworkShow } from './choreography.js';

// Khởi tạo arrays toàn cục để các module khác có thể truy cập
let fireworks = [];
let particles = [];

function animate() {
    requestAnimationFrame(animate);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Cập nhật show pháo hoa
    fireworkShow.update();
    
    // Vẽ tất cả pháo hoa từ show
    fireworkShow.fireworks.forEach(fw => {
        fw.draw();
    });
}

// Resize canvas khi window thay đổi kích thước
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

export { animate, fireworks, particles };
