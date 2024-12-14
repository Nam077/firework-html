import { canvas } from './canvas.js';
import Firework from './Firework.js';
import { webRandom } from './random_utils.js';

class FireworkShow {
    constructor() {
        this.fireworks = [];
        this.sequences = [
            this.heartFormation.bind(this),
            this.circleFormation.bind(this),
            this.cascadeEffect.bind(this),
            this.crossPattern.bind(this),
            this.spiralStaircase.bind(this)
        ];
        this.currentSequence = 0;
        this.lastLaunchTime = 0;
        this.sequenceInterval = 8000; // 8 giây cho mỗi sequence
        this.mode = 'random'; // 'random' hoặc 'choreography'
        this.currentChoreography = 1; // Thêm biến để theo dõi kịch bản hiện tại
        this.maxFireworks = 15; // Giới hạn tối đa pháo hoa cùng lúc
        this.isPlaying = false; // Biến kiểm tra trạng thái chạy
        
        this.options = {
            effectType: 'random',    // Kiểu hiệu ứng: 'random', 'spiral', 'heart', 'star'...
            particleSize: 2,         // Kích thước hạt: 1-5
            particleCount: 30,       // Số lượng hạt: 10-100
            height: 0.7,             // Tăng độ cao mặc định lên 0.7 (từ 0.6)
            spread: 0.4,             // Độ rộng: 0.2-0.6 (tỉ lệ so với chiều rộng canvas)
            speed: 1,                // Tốc độ: 0.5-2
            delay: 0.4               // Độ trễ giữa các pháo hoa: 0.1-1 giây
        };
    }

    setMode(mode) {
        this.mode = mode;
        if (mode === 'choreography') {
            // Reset và bắt đầu sequence đầu tiên
            this.currentSequence = 0;
            this.lastLaunchTime = performance.now();
            this.sequences[0]();
        }
    }

    setEffectType(type) {
        this.options.effectType = type;
        return this;
    }

    setParticleSize(size) {
        this.options.particleSize = Math.max(1, Math.min(5, size));
        return this;
    }

    setParticleCount(count) {
        this.options.particleCount = Math.max(10, Math.min(100, count));
        return this;
    }

    setHeight(height) {
        this.options.height = Math.max(0.3, Math.min(0.8, height));
        return this;
    }

    setSpread(spread) {
        this.options.spread = Math.max(0.2, Math.min(0.6, spread));
        return this;
    }

    setSpeed(speed) {
        this.options.speed = Math.max(0.5, Math.min(2, speed));
        return this;
    }

    setDelay(delay) {
        this.options.delay = Math.max(0.1, Math.min(1, delay));
        return this;
    }

    setOptions(options) {
        Object.assign(this.options, options);
        return this;
    }

    update() {
        const currentTime = performance.now();
        
        if (this.mode === 'choreography') {
            // Chế độ kịch bản
            if (currentTime - this.lastLaunchTime > this.sequenceInterval) {
                this.currentSequence = (this.currentSequence + 1) % this.sequences.length;
                this.lastLaunchTime = currentTime;
                this.sequences[this.currentSequence]();
            }
        } else {
            // Chế độ random
            if (currentTime - this.lastLaunchTime > 500) { // 500ms giữa mỗi lần bắn
                if (webRandom.randomFloat(0, 1) < 0.3) { // 30% cơ hội bắn
                    const startX = webRandom.randomFloat(0, canvas.width);
                    const startY = canvas.height;
                    const minHeight = canvas.height * 0.1;
                    const maxHeight = canvas.height * 0.8;
                    const targetY = webRandom.randomFloat(minHeight, maxHeight);
                    const spread = canvas.width * 0.3;
                    const targetX = startX + webRandom.randomFloat(-spread/2, spread/2);
                    const finalTargetX = Math.max(20, Math.min(canvas.width - 20, targetX));
                    
                    this.fireworks.push(new Firework(startX, startY, finalTargetX, targetY));
                    this.lastLaunchTime = currentTime;
                }
            }
        }

        // Cập nhật và xóa pháo hoa đã tắt
        this.fireworks = this.fireworks.filter(fw => {
            fw.update();
            return !fw.done;
        });
    }

    // Tạo hình trái tim
    heartFormation() {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const scale = 100;
        
        // Tăng số điểm lên một chút, bước 0.35
        for (let t = 0; t < Math.PI * 2; t += 0.35) {
            const x = centerX + scale * 16 * Math.pow(Math.sin(t), 3);
            const y = centerY - scale * (13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
            
            setTimeout(() => {
                const fw = new Firework(
                    centerX + webRandom.randomFloat(-50, 50),
                    canvas.height,
                    x,
                    y
                );
                this.addFirework(fw);
            }, t * 1200); // Giảm delay xuống 1.2s
        }
    }

    // Tạo vòng tròn đồng tâm
    circleFormation() {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const numCircles = 3;
        
        for (let circle = 0; circle < numCircles; circle++) {
            const radius = 100 + circle * 70;
            const points = 10 + circle * 4; // Tăng từ 8 lên 10 điểm
            
            for (let i = 0; i < points; i++) {
                const angle = (i / points) * Math.PI * 2;
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                
                setTimeout(() => {
                    const fw = new Firework(
                        centerX + webRandom.randomFloat(-30, 30),
                        canvas.height,
                        x,
                        y
                    );
                    this.addFirework(fw);
                }, (circle * points + i) * 180); // Giảm delay xuống 180ms
            }
        }
    }

    // Hiệu ứng thác nước
    cascadeEffect() {
        const numColumns = 6; // Tăng từ 5 lên 6 cột
        const columnWidth = canvas.width / numColumns;
        
        for (let col = 0; col < numColumns; col++) {
            const x = columnWidth * (col + 0.5);
            const maxHeight = canvas.height * 0.3;
            const steps = 4;
            
            for (let step = 0; step < steps; step++) {
                const y = canvas.height - maxHeight - step * 60;
                
                setTimeout(() => {
                    const fw = new Firework(
                        x,
                        canvas.height,
                        x + webRandom.randomFloat(-20, 20),
                        y
                    );
                    this.addFirework(fw);
                }, (col * steps + step) * 250); // Giảm delay xuống 250ms
            }
        }
    }

    // Tạo hình chữ thập
    crossPattern() {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const length = 200;
        const spacing = 60; // Giảm spacing xuống 60
        
        // Ngang
        for (let x = -length; x <= length; x += spacing) {
            setTimeout(() => {
                const fw = new Firework(
                    centerX + webRandom.randomFloat(-20, 20),
                    canvas.height,
                    centerX + x,
                    centerY
                );
                this.addFirework(fw);
            }, (x + length) * 25);
        }
        
        // Đợi 1.2 giây trước khi bắn dọc
        setTimeout(() => {
            for (let y = -length; y <= length; y += spacing) {
                setTimeout(() => {
                    const fw = new Firework(
                        centerX + webRandom.randomFloat(-20, 20),
                        canvas.height,
                        centerX,
                        centerY + y
                    );
                    this.addFirework(fw);
                }, y * 25);
            }
        }, 1200);
    }

    // Cầu thang xoắn ốc
    spiralStaircase() {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const numSpirals = 3; // Tăng lại lên 3 xoắn
        const pointsPerSpiral = 16; // Tăng lên 16 điểm
        
        for (let spiral = 0; spiral < numSpirals; spiral++) {
            for (let i = 0; i < pointsPerSpiral; i++) {
                const progress = i / pointsPerSpiral;
                const angle = progress * Math.PI * 6 + (spiral * Math.PI * 2 / numSpirals);
                const radius = 50 + progress * 150;
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                const height = canvas.height - progress * 200;
                
                setTimeout(() => {
                    const fw = new Firework(
                        x,
                        canvas.height,
                        x,
                        height
                    );
                    this.addFirework(fw);
                }, (spiral * pointsPerSpiral + i) * 180); // Giảm delay xuống 180ms
            }
        }
    }

    async createChoreography() {
        if (this.isPlaying) return; // Nếu đang chạy thì không chạy nữa
        this.isPlaying = true;
        
        // Reset thởi gian
        this.currentTime = 0;
        
        // Kịch bản mới
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        switch(this.currentChoreography) {
            case 1: // Kịch bản 1: Lễ hội ánh sáng
                // Cảnh 1: Hoa đăng dâng lên
                this.setEffectType('flower');
                for (let i = 0; i < 5; i++) {
                    const x = centerX - canvas.width * 0.4 + i * (canvas.width * 0.2);
                    await this.addFirework(x, canvas.height, x, canvas.height * 0.4, i * 0.2);
                }
                await new Promise(resolve => setTimeout(resolve, 5000)); // Đợi 5 giây

                // Cảnh 2: Vòng tròn hoa sen
                this.setEffectType('flower');
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    const radius = canvas.width * 0.2;
                    await this.addFirework(
                        centerX,
                        canvas.height,
                        centerX + Math.cos(angle) * radius,
                        canvas.height * 0.5 + Math.sin(angle) * radius,
                        i * 0.2
                    );
                }
                await new Promise(resolve => setTimeout(resolve, 5000));

                // Cảnh 3: Vũ điệu ánh sáng
                this.setEffectType('spiral');
                for (let i = 0; i < 4; i++) {
                    const angle = (i / 4) * Math.PI * 2;
                    await this.addFirework(
                        centerX + Math.cos(angle) * 200,
                        canvas.height,
                        centerX + Math.cos(angle) * 100,
                        canvas.height * 0.3,
                        i * 0.2
                    );
                }
                await new Promise(resolve => setTimeout(resolve, 5000));

                // Cảnh 4: Mưa sao băng vàng
                this.setEffectType('rain');
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 4; j++) {
                        const x = centerX - canvas.width * 0.3 + j * (canvas.width * 0.2);
                        await this.addFirework(x, canvas.height, x, canvas.height * (0.3 + i * 0.15), i * 0.2);
                    }
                }
                await new Promise(resolve => setTimeout(resolve, 5000));

                // Cảnh 5: Vòng xoắn kép
                this.setEffectType('spiral');
                for (let i = 0; i < 2; i++) {
                    for (let j = 0; j < 6; j++) {
                        const angle = (j / 6) * Math.PI * 2;
                        const radius = 150 + i * 100;
                        await this.addFirework(
                            centerX,
                            canvas.height,
                            centerX + Math.cos(angle) * radius,
                            canvas.height * 0.4 + Math.sin(angle) * radius * 0.5,
                            i * 0.2
                        );
                    }
                }
                await new Promise(resolve => setTimeout(resolve, 5000));

                // Cảnh 6: Màn kết thúc rực rỡ
                const finalPromises1 = [];
                this.setEffectType('heart');
                for (let i = 0; i < 5; i++) {
                    const angle = (i / 5) * Math.PI * 2;
                    finalPromises1.push(this.addFirework(
                        centerX + Math.cos(angle) * 200,
                        canvas.height,
                        centerX + Math.cos(angle) * 100,
                        canvas.height * 0.3,
                        i * 0.2
                    ));
                }
                await Promise.all(finalPromises1);
                break;

            case 2: // Kịch bản 2: Vũ điệu tình yêu
                // Cảnh 1: Cánh bướm đôi
                for (let i = 0; i < 3; i++) {
                    this.setEffectType('butterfly');
                    const offset = canvas.width * 0.15;
                    await Promise.all([
                        this.addFirework(centerX - offset, canvas.height, centerX - offset, canvas.height * 0.3, i * 0.2),
                        this.addFirework(centerX + offset, canvas.height, centerX + offset, canvas.height * 0.3, i * 0.2)
                    ]);
                }
                await new Promise(resolve => setTimeout(resolve, 5000));

                // Cảnh 2: Vòng trái tim
                this.setEffectType('heart');
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2;
                    const radius = canvas.width * 0.25;
                    await this.addFirework(
                        centerX,
                        canvas.height,
                        centerX + Math.cos(angle) * radius,
                        canvas.height * 0.4 + Math.sin(angle) * radius * 0.5,
                        i * 0.2
                    );
                }
                await new Promise(resolve => setTimeout(resolve, 5000));

                // Cảnh 3: Thiên thần vũ điệu
                this.setEffectType('star');
                for (let i = 0; i < 5; i++) {
                    const angle = (i / 5) * Math.PI * 2;
                    await this.addFirework(
                        centerX + Math.cos(angle) * 200,
                        canvas.height,
                        centerX + Math.cos(angle) * 100,
                        canvas.height * 0.3,
                        i * 0.2
                    );
                }
                await new Promise(resolve => setTimeout(resolve, 5000));

                // Cảnh 4: Mưa tình yêu
                this.setEffectType('heart');
                for (let i = 0; i < 4; i++) {
                    for (let j = 0; j < 3; j++) {
                        const x = centerX - canvas.width * 0.3 + j * (canvas.width * 0.3);
                        await this.addFirework(
                            x,
                            canvas.height,
                            x + (i % 2 === 0 ? 50 : -50),
                            canvas.height * (0.4 - i * 0.1),
                            i * 0.2
                        );
                    }
                }
                await new Promise(resolve => setTimeout(resolve, 5000));

                // Cảnh 5: Vũ điệu thiên thần
                this.setEffectType('butterfly');
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 4; j++) {
                        const angle = (j / 4) * Math.PI * 2;
                        const radius = 150 + i * 50;
                        await this.addFirework(
                            centerX,
                            canvas.height,
                            centerX + Math.cos(angle) * radius,
                            canvas.height * 0.4 - i * 50,
                            i * 0.2
                        );
                    }
                }

                // Cảnh 6: Kết thúc ngọt ngào
                const finalPromises2 = [];
                this.setEffectType('heart');
                finalPromises2.push(this.addFirework(centerX, canvas.height, centerX, canvas.height * 0.3, 0));
                this.setEffectType('butterfly');
                for (let i = 0; i < 4; i++) {
                    const angle = (i / 4) * Math.PI * 2;
                    finalPromises2.push(this.addFirework(
                        centerX + Math.cos(angle) * 150,
                        canvas.height,
                        centerX + Math.cos(angle) * 150,
                        canvas.height * 0.4,
                        i * 0.2
                    ));
                }
                await Promise.all(finalPromises2);
                break;

            case 3: // Kịch bản 3: Bão lửa rồng
                // Cảnh 1: Rồng lửa thức tỉnh
                this.setEffectType('phoenix');
                for (let i = 0; i < 3; i++) {
                    const angle = (i / 3) * Math.PI * 2;
                    await this.addFirework(
                        centerX + Math.cos(angle) * 200,
                        canvas.height,
                        centerX + Math.cos(angle) * 100,
                        canvas.height * 0.3,
                        i * 0.2
                    );
                }
                await new Promise(resolve => setTimeout(resolve, 5000));

                // Cảnh 2: Vòng xoáy rồng
                this.setEffectType('phoenix');
                for (let i = 0; i < 4; i++) {
                    const angle = (i / 4) * Math.PI * 2;
                    await this.addFirework(
                        centerX + Math.cos(angle) * 150,
                        canvas.height,
                        centerX + Math.cos(angle) * 75,
                        canvas.height * 0.4,
                        i * 0.2
                    );
                }
                await new Promise(resolve => setTimeout(resolve, 5000));

                // Cảnh 3: Xoáy lốc lửa
                this.setEffectType('spiral');
                for (let i = 0; i < 2; i++) {
                    for (let j = 0; j < 6; j++) {
                        const angle = (j / 6) * Math.PI * 2;
                        const radius = 150 + i * 100;
                        await this.addFirework(
                            centerX,
                            canvas.height,
                            centerX + Math.cos(angle) * radius,
                            canvas.height * 0.4 + Math.sin(angle) * radius * 0.5,
                            i * 0.2
                        );
                    }
                }

                // Cảnh 4: Mưa sao lửa
                this.setEffectType('rain');
                for (let i = 0; i < 4; i++) {
                    for (let j = 0; j < 3; j++) {
                        const x = centerX - canvas.width * 0.3 + j * (canvas.width * 0.3);
                        await this.addFirework(
                            x,
                            canvas.height,
                            x + (i % 2 === 0 ? 50 : -50),
                            canvas.height * (0.4 - i * 0.1),
                            i * 0.2
                        );
                    }
                }
                await new Promise(resolve => setTimeout(resolve, 5000));

                // Cảnh 5: Vũ điệu rồng lửa
                this.setEffectType('phoenix');
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 4; j++) {
                        const angle = (j / 4) * Math.PI * 2;
                        const radius = 200 - i * 50;
                        await this.addFirework(
                            centerX,
                            canvas.height,
                            centerX + Math.cos(angle) * radius,
                            canvas.height * 0.3 + Math.sin(angle) * radius * 0.5,
                            i * 0.2
                        );
                    }
                }

                // Cảnh 6: Kết thúc hoành tráng
                const finalPromises3 = [];
                this.setEffectType('phoenix');
                finalPromises3.push(this.addFirework(centerX, canvas.height, centerX, canvas.height * 0.25, 0));
                this.setEffectType('spiral');
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2;
                    finalPromises3.push(this.addFirework(
                        centerX + Math.cos(angle) * 150,
                        canvas.height,
                        centerX + Math.cos(angle) * 150,
                        canvas.height * 0.4,
                        i * 0.2
                    ));
                }
                await Promise.all(finalPromises3);
                break;
        }
        this.isPlaying = false;
    }

    async addFirework(startX, startY, targetX, targetY, delay = 0) {
        return new Promise(resolve => {
            setTimeout(() => {
                const fw = new Firework(startX, startY, targetX, targetY);
                this.fireworks.push(fw);
                resolve();
            }, delay * 1000);
        });
    }

    async createOpeningScene(centerX, centerY) {
        const height = canvas.height * this.options.height;
        const spread = canvas.width * this.options.spread;
        const delay = this.options.delay;

        // Hiệu ứng kết hợp vòng tròn và sao
        const promises1 = [];
        this.setEffectType('circle');
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            promises1.push(this.addFirework(
                centerX,
                canvas.height,
                centerX + Math.cos(angle) * spread * 0.8,
                height - 100,
                delay
            ));
        }
        this.setEffectType('star');
        for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2;
            promises1.push(this.addFirework(
                centerX,
                canvas.height,
                centerX + Math.cos(angle) * spread * 0.4,
                height - 200,
                delay
            ));
        }
        await Promise.all(promises1);

        // Hiệu ứng kết hợp bướm và hoa
        const promises2 = [];
        this.setEffectType('butterfly');
        promises2.push(this.addFirework(centerX - spread * 0.7, canvas.height, centerX - spread * 0.7, height - 150, delay));
        promises2.push(this.addFirework(centerX + spread * 0.7, canvas.height, centerX + spread * 0.7, height - 150, delay));
        
        this.setEffectType('flower');
        promises2.push(this.addFirework(centerX, canvas.height, centerX, height - 100, delay));
        await Promise.all(promises2);

        // Hiệu ứng kết hợp mưa sao và thiên hà
        const promises3 = [];
        this.setEffectType('rain');
        for (let i = 0; i < 3; i++) {
            const x = centerX - spread + i * spread;
            promises3.push(this.addFirework(x, canvas.height, x, height - 150, delay));
        }
        this.setEffectType('galaxy');
        promises3.push(this.addFirework(centerX, canvas.height, centerX, height - 200, delay));
        await Promise.all(promises3);
    }

    async createLightDanceScene(centerX, centerY) {
        const height = canvas.height * this.options.height;
        const spread = canvas.width * this.options.spread;
        const delay = this.options.delay;

        // Hiệu ứng kết hợp xoắn ốc và phượng hoàng - nâng cao hơn
        const promises1 = [];
        this.setEffectType('spiral');
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            promises1.push(this.addFirework(
                centerX,
                canvas.height,
                centerX + Math.cos(angle) * spread * 0.6,
                height - 250, // Tăng độ cao
                delay
            ));
        }
        this.setEffectType('phoenix');
        promises1.push(this.addFirework(centerX, canvas.height, centerX, height - 300, delay)); // Tăng độ cao
        await Promise.all(promises1);

        // Hiệu ứng kết hợp hoa và trái tim - nâng cao hơn
        const promises2 = [];
        this.setEffectType('flower');
        for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2;
            promises2.push(this.addFirework(
                centerX + Math.cos(angle) * spread * 0.5,
                canvas.height,
                centerX + Math.cos(angle) * spread * 0.5,
                height - 200, // Tăng độ cao
                delay
            ));
        }
        this.setEffectType('heart');
        promises2.push(this.addFirework(centerX, canvas.height, centerX, height - 280, delay)); // Tăng độ cao cho trái tim
        await Promise.all(promises2);

        // Hiệu ứng kết hợp sao và vòng tròn - đa tầng
        const promises3 = [];
        this.setEffectType('star');
        for (let i = 0; i < 5; i++) {
            const x = centerX - spread * 0.8 + i * (spread * 0.4);
            const randomHeight = height - webRandom.randomFloat(200, 350); // Tăng phạm vi độ cao
            promises3.push(this.addFirework(x, canvas.height, x, randomHeight, delay));
        }
        this.setEffectType('circle');
        promises3.push(this.addFirework(centerX, canvas.height, centerX, height - 300, delay)); // Tăng độ cao
        await Promise.all(promises3);
    }

    async createGrandFinaleScene(centerX, centerY) {
        const height = canvas.height * this.options.height;
        const spread = canvas.width * this.options.spread;
        const delay = this.options.delay * 0.7; // Nhanh hơn cho màn kết thúc

        const promises = [];
        
        // Vòng 1: Circle + Star - Tăng độ cao
        this.setEffectType('circle');
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            promises.push(this.addFirework(
                centerX,
                canvas.height,
                centerX + Math.cos(angle) * spread * 0.8,
                height - 300, // Tăng độ cao
                delay
            ));
        }
        this.setEffectType('star');
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            promises.push(this.addFirework(
                centerX,
                canvas.height,
                centerX + Math.cos(angle) * spread * 0.4,
                height - 350, // Tăng độ cao
                delay
            ));
        }

        // Vòng 2: Heart + Phoenix - Tăng độ cao đáng kể
        this.setEffectType('heart');
        promises.push(this.addFirework(centerX - spread * 0.3, canvas.height, centerX - spread * 0.3, height - 400, delay));
        promises.push(this.addFirework(centerX + spread * 0.3, canvas.height, centerX + spread * 0.3, height - 400, delay));
        
        this.setEffectType('phoenix');
        promises.push(this.addFirework(centerX, canvas.height, centerX, height - 450, delay));

        // Vòng 3: Galaxy + Rain + Butterfly - Đa tầng
        this.setEffectType('galaxy');
        for (let i = 0; i < 3; i++) {
            const x = centerX - spread * 0.4 + i * spread * 0.4;
            promises.push(this.addFirework(x, canvas.height, x, height - 420, delay));
        }

        this.setEffectType('rain');
        for (let i = 0; i < 5; i++) {
            const x = centerX - spread * 0.8 + i * spread * 0.4;
            const randomHeight = height - webRandom.randomFloat(350, 450); // Tăng phạm vi độ cao
            promises.push(this.addFirework(x, canvas.height, x, randomHeight, delay));
        }

        this.setEffectType('butterfly');
        promises.push(this.addFirework(centerX - spread * 0.6, canvas.height, centerX - spread * 0.6, height - 380, delay));
        promises.push(this.addFirework(centerX + spread * 0.6, canvas.height, centerX + spread * 0.6, height - 380, delay));

        await Promise.all(promises);
    }

    async createStarryNightScene(centerX, centerY) {
        const height = canvas.height * this.options.height;
        const spread = canvas.width * this.options.spread;
        const delay = this.options.delay;
        const promises = [];

        // Hiệu ứng bầu trời sao
        this.setEffectType('star');
        for (let i = 0; i < 5; i++) {
            const x = centerX - spread + i * (spread * 0.5);
            const y = height - webRandom.randomFloat(300, 500);
            promises.push(this.addFirework(x, canvas.height, x, y, delay));
        }

        await Promise.all(promises);

        // Hiệu ứng thiên hà xoáy
        const galaxyPromises = [];
        this.setEffectType('galaxy');
        for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2;
            const radius = 200;
            galaxyPromises.push(this.addFirework(
                centerX,
                canvas.height,
                centerX + Math.cos(angle) * radius,
                height - 400,
                delay
            ));
        }

        await Promise.all(galaxyPromises);

        // Hiệu ứng mưa sao băng
        const rainPromises = [];
        this.setEffectType('rain');
        for (let i = 0; i < 4; i++) {
            const x = centerX - spread * 0.6 + i * (spread * 0.4);
            rainPromises.push(this.addFirework(x, canvas.height, x, height - 350, delay));
        }

        this.setEffectType('spiral');
        rainPromises.push(this.addFirework(centerX, canvas.height, centerX, height - 450, delay));

        await Promise.all(rainPromises);
    }

    async createDragonScene(centerX, centerY) {
        const height = canvas.height * this.options.height;
        const spread = canvas.width * this.options.spread;
        const delay = this.options.delay;
        const promises = [];

        // Hiệu ứng rồng bay
        this.setEffectType('phoenix');
        for (let i = 0; i < 3; i++) { // Giảm từ 5 xuống 3
            const x = centerX - spread + (i * spread/2);
            const y = height - 400 + Math.sin(i) * 100;
            promises.push(this.addFirework(x, canvas.height, x, y, delay));
        }

        // Hiệu ứng mưa sao rồng
        this.setEffectType('rain');
        for (let i = 0; i < 4; i++) { // Giảm từ 8 xuống 4
            const x = centerX - spread + (i * spread/2);
            const y = height - 300 + Math.cos(i) * 50;
            promises.push(this.addFirework(x, canvas.height, x, y, delay));
        }

        await Promise.all(promises);

        // Hiệu ứng vòng xoáy lửa
        const spiralPromises = [];
        this.setEffectType('spiral');
        for (let i = 0; i < 8; i++) { // Giảm từ 12 xuống 8
            const angle = (i / 8) * Math.PI * 2;
            const radius = 200 + Math.sin(i) * 50;
            spiralPromises.push(this.addFirework(
                centerX,
                canvas.height,
                centerX + Math.cos(angle) * radius,
                height - 350 + Math.sin(angle) * 100,
                delay * 0.8
            ));
        }
        await Promise.all(spiralPromises);
    }

    async createButterfliesScene(centerX, centerY) {
        const height = canvas.height * this.options.height;
        const spread = canvas.width * this.options.spread;
        const delay = this.options.delay;
        const promises = [];

        // Hiệu ứng bướm đôi
        this.setEffectType('butterfly');
        for (let i = 0; i < 3; i++) { // Giảm từ 5 xuống 3
            const offset = i * spread * 0.4;
            promises.push(this.addFirework(centerX - offset, canvas.height, centerX - offset, height - 400, delay));
            promises.push(this.addFirework(centerX + offset, canvas.height, centerX + offset, height - 400, delay));
        }

        // Hiệu ứng hoa nở
        this.setEffectType('flower');
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const x = centerX + Math.cos(angle) * spread * 0.6;
            const y = height - 350 + Math.sin(angle) * 50;
            promises.push(this.addFirework(x, canvas.height, x, y, delay));
        }

        await Promise.all(promises);

        // Hiệu ứng trái tim và ngôi sao
        const finalPromises = [];
        this.setEffectType('heart');
        finalPromises.push(this.addFirework(centerX, canvas.height, centerX, height - 450, delay));

        this.setEffectType('star');
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            finalPromises.push(this.addFirework(
                centerX + Math.cos(angle) * spread * 0.5,
                canvas.height,
                centerX + Math.cos(angle) * spread * 0.5,
                height - 400,
                delay
            ));
        }
        await Promise.all(finalPromises);
    }

    async createFirestormScene(centerX, centerY) {
        const height = canvas.height * this.options.height;
        const spread = canvas.width * this.options.spread;
        const delay = this.options.delay * 0.8;
        const promises = [];

        // Hiệu ứng bão lửa xoáy
        this.setEffectType('galaxy');
        for (let i = 0; i < 2; i++) { // Giảm từ 3 vòng xuống 2
            const radius = 150 + i * 100;
            for (let j = 0; j < 6; j++) { // Giảm từ 8 xuống 6 điểm
                const angle = (j / 6) * Math.PI * 2;
                promises.push(this.addFirework(
                    centerX,
                    canvas.height,
                    centerX + Math.cos(angle) * radius,
                    height - 400 + Math.sin(angle) * 100,
                    delay
                ));
            }
        }

        await Promise.all(promises);

        // Hiệu ứng mưa sao băng
        this.setEffectType('rain');
        for (let i = 0; i < 5; i++) { // Giảm từ 10 xuống 5
            const x = centerX - spread + i * (spread * 0.4);
            promises.push(this.addFirework(
                x, 
                canvas.height,
                x,
                height - webRandom.randomFloat(300, 500),
                delay
            ));
        }

        await Promise.all(promises);

        // Kết thúc với hiệu ứng phượng hoàng và trái tim
        const finalPromises = [];
        this.setEffectType('phoenix');
        for (let i = 0; i < 3; i++) { // Giảm từ 4 xuống 3
            const angle = (i / 3) * Math.PI * 2;
            finalPromises.push(this.addFirework(
                centerX + Math.cos(angle) * spread * 0.6,
                canvas.height,
                centerX + Math.cos(angle) * spread * 0.6,
                height - 450,
                delay
            ));
        }

        this.setEffectType('heart');
        finalPromises.push(this.addFirework(centerX, canvas.height, centerX, height - 500, delay));
        
        await Promise.all(finalPromises);
    }

    async switchChoreography(number) {
        this.currentChoreography = number;
        await this.createChoreography();
    }
}

// Singleton instance
const fireworkShow = new FireworkShow();
export { fireworkShow };
