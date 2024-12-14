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
            this.spiralStaircase.bind(this),
            this.rainbowSymphony.bind(this)
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
        if (this.isPlaying) return;
        this.isPlaying = true;
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const height = canvas.height * this.options.height;
        const spread = canvas.width * this.options.spread;
        
        switch(this.currentChoreography) {
            case 1: // Kịch bản 1: Lễ hội ánh sáng
                // Mở đầu: Hoa đăng dâng lên
                this.setEffectType('flower');
                for (let i = 0; i < 3; i++) {
                    const x = centerX - spread + i * spread;
                    await this.addFirework(x, canvas.height, x, height - 200 - i * 50, 0.3);
                }
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Hiệu ứng kết hợp vòng tròn và sao
                const promises1 = [];
                this.setEffectType('circle');
                for (let i = 0; i < 5; i++) {
                    const angle = (i / 5) * Math.PI * 2;
                    promises1.push(this.addFirework(
                        centerX,
                        canvas.height,
                        centerX + Math.cos(angle) * spread * 0.8,
                        height - 250,
                        i * 0.2
                    ));
                }
                this.setEffectType('star');
                for (let i = 0; i < 3; i++) {
                    const angle = (i / 3) * Math.PI * 2;
                    promises1.push(this.addFirework(
                        centerX,
                        canvas.height,
                        centerX + Math.cos(angle) * spread * 0.4,
                        height - 350,
                        i * 0.2
                    ));
                }
                await Promise.all(promises1);
                await new Promise(resolve => setTimeout(resolve, 3000));

                // Hiệu ứng kết hợp bướm và hoa
                const promises2 = [];
                this.setEffectType('butterfly');
                for (let i = 0; i < 2; i++) {
                    const offset = spread * 0.6;
                    promises2.push(this.addFirework(
                        centerX - offset + i * offset * 2,
                        canvas.height,
                        centerX - offset + i * offset * 2,
                        height - 300,
                        i * 0.3
                    ));
                }
                this.setEffectType('flower');
                promises2.push(this.addFirework(centerX, canvas.height, centerX, height - 400, 0.4));
                await Promise.all(promises2);
                await new Promise(resolve => setTimeout(resolve, 3000));

                // Kết thúc hoành tráng
                const finalPromises = [];
                this.setEffectType('phoenix');
                finalPromises.push(this.addFirework(centerX, canvas.height, centerX, height - 450, 0));
                
                this.setEffectType('heart');
                for (let i = 0; i < 4; i++) {
                    const angle = (i / 4) * Math.PI * 2;
                    finalPromises.push(this.addFirework(
                        centerX + Math.cos(angle) * spread * 0.5,
                        canvas.height,
                        centerX + Math.cos(angle) * spread * 0.5,
                        height - 350,
                        0.2
                    ));
                }
                await Promise.all(finalPromises);
                break;

            case 2: // Kịch bản 2: Vũ điệu tình yêu
                // Mở đầu với trái tim đơn lẻ
                this.setEffectType('heart');
                await this.addFirework(centerX, canvas.height, centerX, height - 300, 0);
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Hiệu ứng kết hợp bướm và trái tim
                const lovePromises1 = [];
                this.setEffectType('butterfly');
                for (let i = 0; i < 2; i++) {
                    const offset = spread * 0.4;
                    lovePromises1.push(this.addFirework(
                        centerX - offset + i * offset * 2,
                        canvas.height,
                        centerX - offset + i * offset * 2,
                        height - 250,
                        i * 0.3
                    ));
                }
                this.setEffectType('heart');
                lovePromises1.push(this.addFirework(centerX, canvas.height, centerX, height - 350, 0.4));
                await Promise.all(lovePromises1);
                await new Promise(resolve => setTimeout(resolve, 3000));

                // Hiệu ứng kết hợp sao và hoa
                const lovePromises2 = [];
                this.setEffectType('star');
                for (let i = 0; i < 4; i++) {
                    const angle = (i / 4) * Math.PI * 2;
                    lovePromises2.push(this.addFirework(
                        centerX + Math.cos(angle) * spread * 0.6,
                        canvas.height,
                        centerX + Math.cos(angle) * spread * 0.6,
                        height - 300,
                        i * 0.2
                    ));
                }
                this.setEffectType('flower');
                lovePromises2.push(this.addFirework(centerX, canvas.height, centerX, height - 400, 0.5));
                await Promise.all(lovePromises2);
                await new Promise(resolve => setTimeout(resolve, 3000));

                // Kết thúc với vòng trái tim
                const loveFinalPromises = [];
                this.setEffectType('heart');
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2;
                    const radius = spread * 0.5;
                    loveFinalPromises.push(this.addFirework(
                        centerX + Math.cos(angle) * radius,
                        canvas.height,
                        centerX + Math.cos(angle) * radius,
                        height - 350,
                        i * 0.2
                    ));
                }
                await Promise.all(loveFinalPromises);
                break;

            case 3: // Kịch bản 3: Bão lửa rồng
                // Mở đầu với phượng hoàng đơn lẻ
                this.setEffectType('phoenix');
                await this.addFirework(centerX, canvas.height, centerX, height - 350, 0);
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Hiệu ứng kết hợp phượng hoàng và xoắn ốc
                const dragonPromises1 = [];
                this.setEffectType('phoenix');
                for (let i = 0; i < 3; i++) {
                    const angle = (i / 3) * Math.PI * 2;
                    dragonPromises1.push(this.addFirework(
                        centerX + Math.cos(angle) * spread * 0.6,
                        canvas.height,
                        centerX + Math.cos(angle) * spread * 0.6,
                        height - 300,
                        i * 0.3
                    ));
                }
                this.setEffectType('spiral');
                dragonPromises1.push(this.addFirework(centerX, canvas.height, centerX, height - 400, 0.5));
                await Promise.all(dragonPromises1);
                await new Promise(resolve => setTimeout(resolve, 3000));

                // Hiệu ứng kết hợp mưa sao và galaxy
                const dragonPromises2 = [];
                this.setEffectType('rain');
                for (let i = 0; i < 4; i++) {
                    const x = centerX - spread * 0.6 + i * (spread * 0.4);
                    dragonPromises2.push(this.addFirework(
                        x,
                        canvas.height,
                        x,
                        height - 250 - i * 30,
                        i * 0.2
                    ));
                }
                this.setEffectType('galaxy');
                dragonPromises2.push(this.addFirework(centerX, canvas.height, centerX, height - 400, 0.6));
                await Promise.all(dragonPromises2);
                await new Promise(resolve => setTimeout(resolve, 3000));

                // Kết thúc với vòng xoáy rồng
                const dragonFinalPromises = [];
                this.setEffectType('phoenix');
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    const radius = spread * 0.5;
                    dragonFinalPromises.push(this.addFirework(
                        centerX + Math.cos(angle) * radius,
                        canvas.height,
                        centerX + Math.cos(angle) * radius,
                        height - 350 + Math.sin(angle) * 100,
                        i * 0.15
                    ));
                }
                await Promise.all(dragonFinalPromises);
                break;

            case 4: // Kịch bản 4: Rainbow Symphony
                // Mở đầu với vòng cung cầu vồng
                this.setEffectType('star');
                const rainbowColors = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];
                for (let i = 0; i < 6; i++) {
                    const x = centerX - spread + (i * spread/3);
                    await this.addFirework(x, canvas.height, x, height - 200 - Math.sin(i) * 100, i * 0.2);
                }
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Hiệu ứng xoắn ốc đa màu
                const spiralPromises = [];
                this.setEffectType('spiral');
                for (let i = 0; i < 12; i++) {
                    const angle = (i / 12) * Math.PI * 2;
                    const radius = 200;
                    spiralPromises.push(this.addFirework(
                        centerX,
                        canvas.height,
                        centerX + Math.cos(angle) * radius,
                        height - 350 + Math.sin(angle) * 50,
                        i * 0.1
                    ));
                }
                await Promise.all(spiralPromises);
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Hiệu ứng hoa và bướm hòa quyện
                const blendPromises = [];
                this.setEffectType('flower');
                for (let i = 0; i < 4; i++) {
                    const angle = (i / 4) * Math.PI * 2;
                    blendPromises.push(this.addFirework(
                        centerX + Math.cos(angle) * spread * 0.4,
                        canvas.height,
                        centerX + Math.cos(angle) * spread * 0.4,
                        height - 300,
                        i * 0.2
                    ));
                }
                this.setEffectType('butterfly');
                blendPromises.push(this.addFirework(centerX - spread * 0.3, canvas.height, centerX - spread * 0.3, height - 400, 0.8));
                blendPromises.push(this.addFirework(centerX + spread * 0.3, canvas.height, centerX + spread * 0.3, height - 400, 0.8));
                await Promise.all(blendPromises);
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Màn kết thúc hoành tráng
                const finalePromises = [];
                this.setEffectType('galaxy');
                for (let i = 0; i < 3; i++) {
                    const height_offset = i * 50;
                    finalePromises.push(this.addFirework(
                        centerX,
                        canvas.height,
                        centerX,
                        height - 450 + height_offset,
                        i * 0.3
                    ));
                }
                
                this.setEffectType('rain');
                for (let i = 0; i < 5; i++) {
                    const x = centerX - spread * 0.8 + i * (spread * 0.4);
                    finalePromises.push(this.addFirework(
                        x,
                        canvas.height,
                        x,
                        height - 350 - Math.sin(i) * 50,
                        1 + i * 0.1
                    ));
                }
                await Promise.all(finalePromises);
                break;

            case 5: // Starry Night Fantasy
                // Mở đầu với bầu trời sao
                this.setEffectType('star');
                for (let i = 0; i < 8; i++) {
                    const x = centerX - spread + (i * spread/4);
                    const y = height - webRandom.randomFloat(300, 500);
                    await this.addFirework(x, canvas.height, x, y, i * 0.15);
                }
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Hiệu ứng sao băng
                const meteorPromises = [];
                this.setEffectType('rain');
                for (let i = 0; i < 5; i++) {
                    const startX = centerX - spread + (i * spread/2);
                    const endX = startX + spread/3;
                    meteorPromises.push(this.addFirework(
                        startX,
                        height - 200,
                        endX,
                        height - 400,
                        i * 0.2
                    ));
                }
                await Promise.all(meteorPromises);
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Hiệu ứng thiên hà xoáy
                const galaxyPromises = [];
                this.setEffectType('galaxy');
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 6; j++) {
                        const angle = (j / 6) * Math.PI * 2;
                        const radius = 150 + i * 50;
                        galaxyPromises.push(this.addFirework(
                            centerX,
                            canvas.height,
                            centerX + Math.cos(angle) * radius,
                            height - 350 + Math.sin(angle) * 50,
                            i * 0.3 + j * 0.1
                        ));
                    }
                }
                await Promise.all(galaxyPromises);
                break;

            case 6: // Crystal Cascade
                // Mở đầu với thác nước pha lê
                this.setEffectType('rain');
                for (let i = 0; i < 5; i++) {
                    for (let j = 0; j < 3; j++) {
                        const x = centerX - spread/2 + i * (spread/4);
                        await this.addFirework(
                            x,
                            canvas.height,
                            x,
                            height - 200 - j * 100,
                            i * 0.1 + j * 0.2
                        );
                    }
                }
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Hiệu ứng pha lê vỡ
                const crystalPromises = [];
                this.setEffectType('star');
                for (let i = 0; i < 4; i++) {
                    const angle = (i / 4) * Math.PI * 2;
                    for (let j = 0; j < 3; j++) {
                        const radius = 100 + j * 50;
                        crystalPromises.push(this.addFirework(
                            centerX,
                            canvas.height,
                            centerX + Math.cos(angle) * radius,
                            height - 300 + Math.sin(angle) * radius/2,
                            i * 0.2
                        ));
                    }
                }
                await Promise.all(crystalPromises);
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Kết thúc với vụ nổ pha lê
                const finalCrystalPromises = [];
                this.setEffectType('circle');
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    finalCrystalPromises.push(this.addFirework(
                        centerX,
                        canvas.height,
                        centerX + Math.cos(angle) * spread * 0.4,
                        height - 350,
                        i * 0.1
                    ));
                }
                await Promise.all(finalCrystalPromises);
                break;

            case 7: // Phoenix Rising
                // Mở đầu với phượng hoàng đơn độc
                this.setEffectType('phoenix');
                await this.addFirework(centerX, canvas.height, centerX, height - 300, 0);
                await new Promise(resolve => setTimeout(resolve, 1500));

                // Hiệu ứng cánh phượng hoàng
                const wingPromises = [];
                this.setEffectType('butterfly');
                for (let i = 0; i < 3; i++) {
                    const offset = spread * 0.2 * (i + 1);
                    wingPromises.push(this.addFirework(
                        centerX - offset,
                        canvas.height,
                        centerX - offset,
                        height - 350,
                        i * 0.2
                    ));
                    wingPromises.push(this.addFirework(
                        centerX + offset,
                        canvas.height,
                        centerX + offset,
                        height - 350,
                        i * 0.2
                    ));
                }
                await Promise.all(wingPromises);
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Hiệu ứng lửa bùng cháy
                const firePromises = [];
                this.setEffectType('spiral');
                for (let i = 0; i < 12; i++) {
                    const angle = (i / 12) * Math.PI * 2;
                    firePromises.push(this.addFirework(
                        centerX,
                        canvas.height,
                        centerX + Math.cos(angle) * spread * 0.5,
                        height - 400 + Math.sin(angle) * 100,
                        i * 0.1
                    ));
                }
                await Promise.all(firePromises);
                break;

            case 8: // Ocean Dreams
                // Mở đầu với sóng biển
                this.setEffectType('rain');
                for (let i = 0; i < 3; i++) {
                    const wavePromises = [];
                    for (let j = 0; j < 5; j++) {
                        const x = centerX - spread/2 + j * (spread/4);
                        wavePromises.push(this.addFirework(
                            x,
                            canvas.height,
                            x,
                            height - 200 - Math.sin(j) * 50 - i * 70,
                            j * 0.1
                        ));
                    }
                    await Promise.all(wavePromises);
                    await new Promise(resolve => setTimeout(resolve, 500));
                }

                // Hiệu ứng bong bóng
                const bubblePromises = [];
                this.setEffectType('circle');
                for (let i = 0; i < 4; i++) {
                    for (let j = 0; j < 3; j++) {
                        const angle = (i / 4) * Math.PI * 2;
                        const radius = 100 + j * 60;
                        bubblePromises.push(this.addFirework(
                            centerX + Math.cos(angle) * radius * 0.3,
                            canvas.height,
                            centerX + Math.cos(angle) * radius * 0.3,
                            height - 250 - j * 80,
                            i * 0.2 + j * 0.1
                        ));
                    }
                }
                await Promise.all(bubblePromises);
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Kết thúc với đàn cá heo
                const dolphinPromises = [];
                this.setEffectType('butterfly');
                for (let i = 0; i < 5; i++) {
                    const startX = centerX - spread/2 + i * (spread/4);
                    const endX = startX + spread/8;
                    dolphinPromises.push(this.addFirework(
                        startX,
                        canvas.height,
                        endX,
                        height - 300 - Math.sin(i) * 100,
                        i * 0.15
                    ));
                }
                await Promise.all(dolphinPromises);
                break;

            case 9: // Garden of Light
                // Phần 1: Khu vườn thức giấc
                this.setEffectType('rain');
                for (let i = 0; i < 5; i++) {
                    const morningDewPromises = [];
                    for (let j = 0; j < 4; j++) {
                        const x = centerX - spread/2 + i * (spread/4);
                        morningDewPromises.push(this.addFirework(
                            x,
                            canvas.height,
                            x + Math.sin(j) * 30,
                            height - 200 - j * 80,
                            j * 0.15
                        ));
                    }
                    await Promise.all(morningDewPromises);
                    await new Promise(resolve => setTimeout(resolve, 400));
                }

                // Phần 2: Hoa nở rộ
                this.setEffectType('flower');
                for (let i = 0; i < 3; i++) {
                    const flowerLayerPromises = [];
                    for (let j = 0; j < 5; j++) {
                        const angle = (j / 5) * Math.PI * 2;
                        const radius = 150 + i * 50;
                        flowerLayerPromises.push(this.addFirework(
                            centerX + Math.cos(angle) * radius * 0.3,
                            canvas.height,
                            centerX + Math.cos(angle) * radius,
                            height - 300 - i * 50,
                            j * 0.2
                        ));
                    }
                    await Promise.all(flowerLayerPromises);
                    await new Promise(resolve => setTimeout(resolve, 800));
                }

                // Phần 3: Bướm xuất hiện
                const butterflyWaves = [];
                this.setEffectType('butterfly');
                for (let i = 0; i < 4; i++) {
                    for (let j = 0; j < 3; j++) {
                        const startX = centerX - spread/2 + i * (spread/3);
                        const endX = startX + Math.sin(j) * 100;
                        butterflyWaves.push(this.addFirework(
                            startX,
                            canvas.height,
                            endX,
                            height - 250 - j * 100,
                            i * 0.15 + j * 0.2
                        ));
                    }
                }
                await Promise.all(butterflyWaves);
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Phần 4: Vũ điệu của ánh sáng
                const lightDancePromises = [];
                this.setEffectType('star');
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 8; j++) {
                        const angle = (j / 8) * Math.PI * 2;
                        const radius = 180 - i * 30;
                        lightDancePromises.push(this.addFirework(
                            centerX + Math.cos(angle) * radius,
                            canvas.height,
                            centerX + Math.cos(angle) * (radius + 50),
                            height - 300 + Math.sin(angle) * 50,
                            j * 0.1 + i * 0.2
                        ));
                    }
                    await new Promise(resolve => setTimeout(resolve, 600));
                }
                await Promise.all(lightDancePromises);

                // Phần 5: Cầu vồng kết hợp
                const rainbowLayersPromises = [];
                this.setEffectType('circle');
                for (let i = 0; i < 5; i++) {
                    for (let j = 0; j < 7; j++) {
                        const x = centerX - spread/2 + j * (spread/6);
                        const y = height - 200 - i * 60 - Math.sin(j) * 40;
                        rainbowLayersPromises.push(this.addFirework(
                            x,
                            canvas.height,
                            x,
                            y,
                            j * 0.1 + i * 0.15
                        ));
                    }
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
                await Promise.all(rainbowLayersPromises);

                // Phần 6: Màn kết thúc hoành tráng
                const grandeFinalePromises = [];
                this.setEffectType('galaxy');
                for (let i = 0; i < 12; i++) {
                    const angle = (i / 12) * Math.PI * 2;
                    const radius = 200;
                    grandeFinalePromises.push(this.addFirework(
                        centerX,
                        canvas.height,
                        centerX + Math.cos(angle) * radius,
                        height - 350 + Math.sin(angle) * radius/2,
                        i * 0.08
                    ));
                }
                await Promise.all(grandeFinalePromises);
                break;

            case 10: // Dragon Dance
                // Phần 1: Khởi động với đốm lửa
                this.setEffectType('star');
                for (let i = 0; i < 6; i++) {
                    const sparkPromises = [];
                    for (let j = 0; j < 4; j++) {
                        const x = centerX - spread/2 + i * (spread/5);
                        sparkPromises.push(this.addFirework(
                            x,
                            canvas.height,
                            x + Math.sin(j) * 50,
                            height - 200 - j * 60,
                            j * 0.1
                        ));
                    }
                    await Promise.all(sparkPromises);
                    await new Promise(resolve => setTimeout(resolve, 300));
                }

                // Phần 2: Thân rồng uốn lượn
                this.setEffectType('spiral');
                for (let i = 0; i < 3; i++) {
                    const dragonBodyPromises = [];
                    for (let j = 0; j < 8; j++) {
                        const x = centerX - spread/2 + j * (spread/7);
                        const y = height - 300 + Math.sin(j + i) * 100;
                        dragonBodyPromises.push(this.addFirework(
                            x,
                            canvas.height,
                            x + Math.cos(i) * 30,
                            y,
                            j * 0.12
                        ));
                    }
                    await Promise.all(dragonBodyPromises);
                    await new Promise(resolve => setTimeout(resolve, 800));
                }

                // Phần 3: Cánh rồng mở rộng
                const wingExpansionPromises = [];
                this.setEffectType('butterfly');
                for (let i = 0; i < 4; i++) {
                    for (let j = 0; j < 6; j++) {
                        const angle = (j / 6) * Math.PI;
                        const radius = 150 + i * 40;
                        wingExpansionPromises.push(this.addFirework(
                            centerX,
                            canvas.height,
                            centerX + Math.cos(angle) * radius,
                            height - 350 + Math.sin(angle) * radius/2,
                            i * 0.15 + j * 0.1
                        ));
                    }
                    await new Promise(resolve => setTimeout(resolve, 600));
                }
                await Promise.all(wingExpansionPromises);

                // Phần 4: Rồng bay lên trời
                const ascensionPromises = [];
                this.setEffectType('phoenix');
                for (let i = 0; i < 5; i++) {
                    for (let j = 0; j < 4; j++) {
                        const startX = centerX - spread/3 + i * (spread/4);
                        const endX = startX + spread/5;
                        ascensionPromises.push(this.addFirework(
                            startX,
                            height - 200 - i * 50,
                            endX,
                            height - 400 - i * 60,
                            j * 0.2
                        ));
                    }
                    await new Promise(resolve => setTimeout(resolve, 700));
                }
                await Promise.all(ascensionPromises);

                // Phần 5: Lửa rồng phun
                const firebreathPromises = [];
                this.setEffectType('rain');
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 10; j++) {
                        const angle = (j / 10) * Math.PI / 2 - Math.PI/4;
                        const radius = 200 + i * 50;
                        firebreathPromises.push(this.addFirework(
                            centerX,
                            height - 350,
                            centerX + Math.cos(angle) * radius,
                            height - 350 + Math.sin(angle) * radius,
                            j * 0.08 + i * 0.2
                        ));
                    }
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
                await Promise.all(firebreathPromises);

                // Phần 6: Màn kết với vòng xoáy lửa
                const fireVortexPromises = [];
                this.setEffectType('circle');
                for (let i = 0; i < 4; i++) {
                    for (let j = 0; j < 12; j++) {
                        const angle = (j / 12) * Math.PI * 2;
                        const radius = 180 - i * 30;
                        fireVortexPromises.push(this.addFirework(
                            centerX + Math.cos(angle) * radius,
                            canvas.height,
                            centerX + Math.cos(angle) * (radius - 50),
                            height - 350 + Math.sin(angle) * 50,
                            j * 0.1
                        ));
                    }
                    await new Promise(resolve => setTimeout(resolve, 600));
                }
                await Promise.all(fireVortexPromises);
                break;

            case 11: // Aurora Borealis
                // Phần 1: Bình minh phương Bắc
                this.setEffectType('rain');
                for (let i = 0; i < 4; i++) {
                    const dawnPromises = [];
                    for (let j = 0; j < 8; j++) {
                        const x = centerX - spread/2 + j * (spread/7);
                        dawnPromises.push(this.addFirework(
                            x,
                            canvas.height,
                            x + Math.sin(i) * 30,
                            height - 200 - Math.sin(j) * 80 - i * 40,
                            j * 0.08
                        ));
                    }
                    await Promise.all(dawnPromises);
                    await new Promise(resolve => setTimeout(resolve, 600));
                }

                // Phần 2: Màn sáng đầu tiên
                const firstCurtainPromises = [];
                this.setEffectType('star');
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 10; j++) {
                        const x = centerX - spread/2 + j * (spread/9);
                        firstCurtainPromises.push(this.addFirework(
                            x,
                            canvas.height,
                            x + Math.cos(i) * 40,
                            height - 250 - i * 60 - Math.sin(j) * 50,
                            j * 0.1 + i * 0.15
                        ));
                    }
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
                await Promise.all(firstCurtainPromises);

                // Phần 3: Sóng ánh sáng chuyển động
                const wavesPromises = [];
                this.setEffectType('butterfly');
                for (let i = 0; i < 4; i++) {
                    for (let j = 0; j < 6; j++) {
                        const x = centerX - spread/2 + j * (spread/5);
                        const y = height - 300 - Math.sin(i + j) * 100;
                        wavesPromises.push(this.addFirework(
                            x,
                            canvas.height,
                            x + Math.cos(i) * 60,
                            y,
                            i * 0.2 + j * 0.1
                        ));
                    }
                    await new Promise(resolve => setTimeout(resolve, 700));
                }
                await Promise.all(wavesPromises);

                // Phần 4: Xoáy cực quang
                const vortexPromises = [];
                this.setEffectType('spiral');
                for (let i = 0; i < 5; i++) {
                    for (let j = 0; j < 8; j++) {
                        const angle = (j / 8) * Math.PI * 2;
                        const radius = 150 - i * 20;
                        vortexPromises.push(this.addFirework(
                            centerX + Math.cos(angle) * radius,
                            canvas.height,
                            centerX + Math.cos(angle) * (radius + 40),
                            height - 350 + Math.sin(angle) * 60,
                            j * 0.12
                        ));
                    }
                    await new Promise(resolve => setTimeout(resolve, 600));
                }
                await Promise.all(vortexPromises);

                // Phần 5: Mưa sao băng
                const auroraMeteorites = [];
                this.setEffectType('rain');
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 12; j++) {
                        const startX = centerX - spread + j * (spread/6);
                        const endX = startX + spread/4;
                        auroraMeteorites.push(this.addFirework(
                            startX,
                            height - 200 - i * 100,
                            endX,
                            height - 400 - i * 100,
                            j * 0.1 + i * 0.2
                        ));
                    }
                    await new Promise(resolve => setTimeout(resolve, 800));
                }
                await Promise.all(auroraMeteorites);

                // Phần 6: Màn kết thúc hoành tráng
                const finalDancePromises = [];
                this.setEffectType('galaxy');
                for (let i = 0; i < 4; i++) {
                    for (let j = 0; j < 10; j++) {
                        const angle = (j / 10) * Math.PI * 2;
                        const radius = 200 - i * 30;
                        finalDancePromises.push(this.addFirework(
                            centerX,
                            canvas.height,
                            centerX + Math.cos(angle) * radius,
                            height - 350 + Math.sin(angle) * radius/2,
                            j * 0.08 + i * 0.15
                        ));
                    }
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
                await Promise.all(finalDancePromises);
                break;

            case 12: // Cosmic Journey
                // Phần 1: Khởi đầu vũ trụ
                this.setEffectType('star');
                for (let i = 0; i < 5; i++) {
                    const startPromises = [];
                    for (let j = 0; j < 6; j++) {
                        const angle = (j / 6) * Math.PI * 2;
                        const radius = 100 + i * 40;
                        startPromises.push(this.addFirework(
                            centerX,
                            canvas.height,
                            centerX + Math.cos(angle) * radius,
                            height - 300 + Math.sin(angle) * radius/2,
                            j * 0.15
                        ));
                    }
                    await Promise.all(startPromises);
                    await new Promise(resolve => setTimeout(resolve, 600));
                }

                // Phần 2: Thiên hà xoáy
                const galaxySpinPromises = [];
                this.setEffectType('galaxy');
                for (let i = 0; i < 4; i++) {
                    for (let j = 0; j < 8; j++) {
                        const angle = (j / 8) * Math.PI * 2 + i * Math.PI/4;
                        const radius = 150 + i * 30;
                        galaxySpinPromises.push(this.addFirework(
                            centerX,
                            canvas.height,
                            centerX + Math.cos(angle) * radius,
                            height - 350 + Math.sin(angle) * radius/2,
                            j * 0.1 + i * 0.15
                        ));
                    }
                    await new Promise(resolve => setTimeout(resolve, 700));
                }
                await Promise.all(galaxySpinPromises);

                // Phần 3: Vũ điệu của các hành tinh
                const planetDancePromises = [];
                this.setEffectType('circle');
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 8; j++) {
                        const angle = (j / 8) * Math.PI * 2;
                        for (let k = 0; k < 3; k++) {
                            const radius = 120 + k * 60;
                            planetDancePromises.push(this.addFirework(
                                centerX + Math.cos(angle + i) * radius,
                                canvas.height,
                                centerX + Math.cos(angle + i + Math.PI/4) * radius,
                                height - 300 + Math.sin(angle) * 50,
                                j * 0.1 + k * 0.15
                            ));
                        }
                    }
                    await new Promise(resolve => setTimeout(resolve, 800));
                }
                await Promise.all(planetDancePromises);

                // Phần 4: Hố đen vũ trụ
                const blackHolePromises = [];
                this.setEffectType('spiral');
                for (let i = 0; i < 5; i++) {
                    for (let j = 0; j < 12; j++) {
                        const angle = (j / 12) * Math.PI * 2;
                        const radius = 200 - i * 35;
                        blackHolePromises.push(this.addFirework(
                            centerX + Math.cos(angle) * radius,
                            canvas.height,
                            centerX,
                            height - 350,
                            j * 0.08 + i * 0.1
                        ));
                    }
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
                await Promise.all(blackHolePromises);

                // Phần 5: Sao băng vũ trụ
                const cosmicMeteorPromises = [];
                this.setEffectType('rain');
                for (let i = 0; i < 4; i++) {
                    for (let j = 0; j < 6; j++) {
                        const startX = centerX - spread/2 + j * spread/5;
                        const startY = height - 400 + i * 50;
                        cosmicMeteorPromises.push(this.addFirework(
                            startX,
                            startY,
                            startX + spread/4,
                            startY + 200,
                            j * 0.15 + i * 0.2
                        ));
                    }
                    await new Promise(resolve => setTimeout(resolve, 600));
                }
                await Promise.all(cosmicMeteorPromises);

                // Phần 6: Vụ nổ Big Bang
                const bigBangPromises = [];
                this.setEffectType('flower');
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 15; j++) {
                        const angle = (j / 15) * Math.PI * 2;
                        const radius = 150 + i * 50;
                        bigBangPromises.push(this.addFirework(
                            centerX,
                            canvas.height,
                            centerX + Math.cos(angle) * radius,
                            height - 350 + Math.sin(angle) * radius/2,
                            j * 0.05 + i * 0.1
                        ));
                    }
                    await new Promise(resolve => setTimeout(resolve, 400));
                }
                await Promise.all(bigBangPromises);
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

        // Hiệu ứng kết hợp xoắn ốc và phượng hoàng
        const promises1 = [];
        this.setEffectType('spiral');
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            promises1.push(this.addFirework(
                centerX,
                canvas.height,
                centerX + Math.cos(angle) * spread * 0.6,
                height - 250,
                delay
            ));
        }
        this.setEffectType('phoenix');
        promises1.push(this.addFirework(centerX, canvas.height, centerX, height - 300, delay));
        await Promise.all(promises1);

        // Hiệu ứng kết hợp hoa và trái tim
        const promises2 = [];
        this.setEffectType('flower');
        for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2;
            promises2.push(this.addFirework(
                centerX + Math.cos(angle) * spread * 0.5,
                canvas.height,
                centerX + Math.cos(angle) * spread * 0.5,
                height - 200,
                delay
            ));
        }
        this.setEffectType('heart');
        promises2.push(this.addFirework(centerX, canvas.height, centerX, height - 280, delay));
        await Promise.all(promises2);

        // Hiệu ứng kết hợp sao và vòng tròn
        const promises3 = [];
        this.setEffectType('star');
        for (let i = 0; i < 5; i++) {
            const x = centerX - spread * 0.8 + i * (spread * 0.4);
            const randomHeight = height - webRandom.randomFloat(200, 350);
            promises3.push(this.addFirework(x, canvas.height, x, randomHeight, delay));
        }
        this.setEffectType('circle');
        promises3.push(this.addFirework(centerX, canvas.height, centerX, height - 300, delay));
        await Promise.all(promises3);
    }

    async createGrandFinaleScene(centerX, centerY) {
        const height = canvas.height * this.options.height;
        const spread = canvas.width * this.options.spread;
        const delay = this.options.delay * 0.7;

        const promises = [];
        
        // Vòng 1: Circle + Star
        this.setEffectType('circle');
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            promises.push(this.addFirework(
                centerX,
                canvas.height,
                centerX + Math.cos(angle) * spread * 0.8,
                height - 300,
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
                height - 350,
                delay
            ));
        }

        // Vòng 2: Heart + Phoenix
        this.setEffectType('heart');
        promises.push(this.addFirework(centerX - spread * 0.3, canvas.height, centerX - spread * 0.3, height - 400, delay));
        promises.push(this.addFirework(centerX + spread * 0.3, canvas.height, centerX + spread * 0.3, height - 400, delay));
        
        this.setEffectType('phoenix');
        promises.push(this.addFirework(centerX, canvas.height, centerX, height - 450, delay));

        // Vòng 3: Galaxy + Rain + Butterfly
        this.setEffectType('galaxy');
        for (let i = 0; i < 3; i++) {
            const x = centerX - spread * 0.4 + i * spread * 0.4;
            promises.push(this.addFirework(x, canvas.height, x, height - 420, delay));
        }

        this.setEffectType('rain');
        for (let i = 0; i < 5; i++) {
            const x = centerX - spread * 0.8 + i * spread * 0.4;
            const randomHeight = height - webRandom.randomFloat(350, 450);
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
            const x = centerX - spread + (i * spread/3);
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

    async rainbowSymphony() {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const scale = 100;
        
        // Tạo hiệu ứng cầu vồng
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI;
            const x = centerX + Math.cos(angle) * scale * 2;
            const y = centerY - Math.sin(angle) * scale;
            
            setTimeout(() => {
                const fw = new Firework(
                    centerX,
                    canvas.height,
                    x,
                    y
                );
                this.addFirework(fw);
            }, i * 200);
        }

        // Thêm hiệu ứng xoắn ốc sau 1.5s
        setTimeout(() => {
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                setTimeout(() => {
                    const fw = new Firework(
                        centerX,
                        canvas.height,
                        centerX + Math.cos(angle) * scale * 2,
                        centerY + Math.sin(angle) * scale
                    );
                    this.addFirework(fw);
                }, i * 150);
            }
        }, 1500);

        // Kết thúc với hiệu ứng bung tỏa
        setTimeout(() => {
            for (let i = 0; i < 12; i++) {
                const angle = (i / 12) * Math.PI * 2;
                const radius = 200;
                setTimeout(() => {
                    const fw = new Firework(
                        centerX,
                        canvas.height,
                        centerX + Math.cos(angle) * radius,
                        centerY + Math.sin(angle) * radius * 0.8
                    );
                    this.addFirework(fw);
                }, i * 100);
            }
        }, 3000);
    }
}

// Singleton instance
const fireworkShow = new FireworkShow();
export { fireworkShow };
