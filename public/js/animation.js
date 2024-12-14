import { canvas, ctx } from './canvas.js';
import { fireworkShow } from './choreography.js';

// Khởi tạo arrays toàn cục để các module khác có thể truy cập
let fireworks = [];
let particles = [];

class AnimationManager {
    constructor() {
        this.isRunning = false;
        this.targetFPS = 60;
        this.minFPS = 30;
        this.fpsInterval = 1000 / this.targetFPS;
        this.lastDrawTime = 0;
        this.frameCount = 0;
        this.lastFPSUpdate = 0;
        this.currentFPS = 0;
        
        // Tự động điều chỉnh hiệu năng dựa trên FPS
        this.autoAdjustPerformance = true;
        this.performanceCheckInterval = 2000; // 2 giây kiểm tra một lần
        this.lastPerformanceCheck = 0;
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.lastDrawTime = performance.now();
            this.animate();
        }
    }

    stop() {
        this.isRunning = false;
    }

    animate(currentTime = performance.now()) {
        if (!this.isRunning) return;

        requestAnimationFrame(time => this.animate(time));

        // Tính toán thời gian từ frame cuối
        const elapsed = currentTime - this.lastDrawTime;

        // Nếu chưa đến lúc vẽ frame tiếp theo thì bỏ qua
        if (elapsed < this.fpsInterval) return;

        // Cập nhật thời gian vẽ frame cuối
        this.lastDrawTime = currentTime - (elapsed % this.fpsInterval);

        // Tính FPS
        this.frameCount++;
        if (currentTime - this.lastFPSUpdate >= 1000) {
            this.currentFPS = Math.round((this.frameCount * 1000) / (currentTime - this.lastFPSUpdate));
            this.frameCount = 0;
            this.lastFPSUpdate = currentTime;

            // Tự động điều chỉnh hiệu năng
            if (this.autoAdjustPerformance && currentTime - this.lastPerformanceCheck >= this.performanceCheckInterval) {
                this.adjustPerformance();
                this.lastPerformanceCheck = currentTime;
            }
        }

        // Xóa canvas
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Cập nhật và vẽ pháo hoa
        fireworkShow.update();
        fireworkShow.fireworks.forEach(fw => {
            fw.draw();
        });
    }

    adjustPerformance() {
        if (this.currentFPS < this.minFPS) {
            // Giảm số lượng pháo hoa và particle nếu FPS thấp
            fireworkShow.maxFireworks = Math.max(5, fireworkShow.maxFireworks - 2);
            fireworkShow.options.particleCount = Math.max(20, fireworkShow.options.particleCount - 5);
        } else if (this.currentFPS > this.targetFPS + 10) {
            // Tăng số lượng nếu FPS cao
            fireworkShow.maxFireworks = Math.min(20, fireworkShow.maxFireworks + 1);
            fireworkShow.options.particleCount = Math.min(50, fireworkShow.options.particleCount + 2);
        }
    }

    setTargetFPS(fps) {
        this.targetFPS = Math.max(this.minFPS, Math.min(60, fps));
        this.fpsInterval = 1000 / this.targetFPS;
    }

    toggleAutoAdjust(enabled) {
        this.autoAdjustPerformance = enabled;
    }
}

const animationManager = new AnimationManager();
animationManager.start();

// Resize canvas khi window thay đổi kích thước
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

export { animationManager, fireworks, particles };
