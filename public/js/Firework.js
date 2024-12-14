import Particle from './Particle.js';
import { webRandom } from './random_utils.js';
import { canvas, ctx } from './canvas.js';
import { playSound } from './audio.js';

class Firework {
    constructor(x, y, targetX, targetY) {
        this.x = x;
        this.y = y;
        this.targetX = targetX;
        this.targetY = targetY;
        
        const distance = Math.sqrt(
            Math.pow(targetX - x, 2) + Math.pow(targetY - y, 2)
        );
        
        this.speed = 4 + (distance / canvas.height) * 2;
        
        this.angle = Math.atan2(targetY - y, targetX - x);
        this.velocity = {
            x: Math.cos(this.angle) * this.speed,
            y: Math.sin(this.angle) * this.speed
        };
        
        // Thêm các thuộc tính cho chuyển động xoắn ốc
        this.isSpiral = Math.random() < 0.3;
        this.spiralRadius = 2;
        this.spiralAngle = 0;
        this.spiralSpeed = 0.2;
        
        this.curvature = (webRandom.randomFloat(0, 1) - 0.5) * 0.05;
        
        this.particles = [];
        this.hue = webRandom.randomFloat(0, 360);
        this.brightness = webRandom.randomFloat(0, 30) + 30;
        this.alpha = 0.8;
        this.trail = [];
        this.trailLength = 8;
        this.exploded = false;
        this.reachedTarget = false;
        this.targetReachedTime = 0;
        this.glowStarted = false;  // Thêm biến để kiểm soát thởi điểm bắt đầu phát sáng
        this.isRecursive = webRandom.randomFloat(0, 1) < 0.15;
        this.reachedTarget = false;  // Thêm biến để theo dõi khi đạt đến đích
        this.targetReachedTime = 0;  // Thêm biến để theo dõi thởi gian đạt đích

        // Thêm các thuộc tính điều khiển hiệu ứng
        this.effectType = 'normal';     // Kiểu hiệu ứng mặc định
        this.effectParams = {
            // Thông số cho hiệu ứng xoắn ốc
            spiral: {
                arms: 4,           // Số cánh xoắn
                rotations: 3,      // Số vòng xoắn
                tightness: 0.5     // Độ chặt của xoắn
            },
            // Thông số cho hiệu ứng hình trái tim
            heart: {
                size: 8,          // Kích thước trái tim
                density: 50       // Mật độ điểm
            },
            // Thông số cho hiệu ứng hình sao
            star: {
                points: 5,        // Số cánh sao
                innerRadius: 3,   // Bán kính trong
                outerRadius: 6    // Bán kính ngoài
            },
            // Thông số cho hiệu ứng vòng tròn
            circle: {
                rings: 3,         // Số vòng tròn
                particlesPerRing: 20  // Số hạt mỗi vòng
            },
            // Thông số cho hiệu ứng mưa sao
            rain: {
                width: 40,        // Độ rộng vùng mưa
                height: 30,       // Chiều cao vùng mưa
                clusters: 5       // Số cụm mưa
            },
            // Thông số cho hiệu ứng phượng hoàng
            phoenix: {
                wingSpan: 25,     // Độ dài cánh
                bodyLength: 30,    // Độ dài thân
                tailLength: 35     // Độ dài đuôi
            }
        };

        // Thêm các thuộc tính điều khiển
        this.particleCount = 50; // Số lượng hạt mặc định
        this.particleSize = 2;   // Kích thước hạt
        this.particleSpeed = 1;  // Tốc độ hạt
        this.effectDuration = 1; // Thời gian hiệu ứng (giây)

        // Add label properties
        this.showLabel = false;
        this.labelAlpha = 1;
        this.labelDuration = 2000; // 2 seconds
        this.labelStartTime = 0;
    }

    // Điều chỉnh số lượng hạt
    setParticleCount(count) {
        this.particleCount = count;
        return this;
    }

    // Điều chỉnh kích thước hạt
    setParticleSize(size) {
        this.particleSize = size;
        return this;
    }

    // Điều chỉnh tốc độ hạt
    setParticleSpeed(speed) {
        this.particleSpeed = speed;
        return this;
    }

    // Điều chỉnh thởi gian hiệu ứng
    setEffectDuration(duration) {
        this.effectDuration = duration;
        return this;
    }

    // Điều chỉnh màu sắc
    setColor(hue) {
        this.hue = hue;
        return this;
    }

    // Điều chỉnh độ sáng
    setBrightness(brightness) {
        this.brightness = brightness;
        return this;
    }

    // Điều chỉnh độ trong suốt
    setAlpha(alpha) {
        this.alpha = alpha;
        return this;
    }

    // Điều chỉnh độ cong của quỹ đạo
    setCurvature(curvature) {
        this.curvature = curvature;
        return this;
    }

    // Thiết lập nhiều thông số cùng lúc
    setProperties({
        particleCount,
        particleSize,
        particleSpeed,
        effectDuration,
        hue,
        brightness,
        alpha,
        curvature
    }) {
        if (particleCount !== undefined) this.particleCount = particleCount;
        if (particleSize !== undefined) this.particleSize = particleSize;
        if (particleSpeed !== undefined) this.particleSpeed = particleSpeed;
        if (effectDuration !== undefined) this.effectDuration = effectDuration;
        if (hue !== undefined) this.hue = hue;
        if (brightness !== undefined) this.brightness = brightness;
        if (alpha !== undefined) this.alpha = alpha;
        if (curvature !== undefined) this.curvature = curvature;
        return this;
    }

    // Thiết lập kiểu hiệu ứng
    setEffectType(type) {
        if (this.effectParams.hasOwnProperty(type) || type === 'normal') {
            this.effectType = type;
        }
        return this;
    }

    // Điều chỉnh thông số cho hiệu ứng xoắn ốc
    setSpiralParams(arms, rotations, tightness) {
        this.effectParams.spiral = {
            arms: arms || this.effectParams.spiral.arms,
            rotations: rotations || this.effectParams.spiral.rotations,
            tightness: tightness || this.effectParams.spiral.tightness
        };
        return this;
    }

    // Điều chỉnh thông số cho hiệu ứng hình trái tim
    setHeartParams(size, density) {
        this.effectParams.heart = {
            size: size || this.effectParams.heart.size,
            density: density || this.effectParams.heart.density
        };
        return this;
    }

    // Điều chỉnh thông số cho hiệu ứng hình sao
    setStarParams(points, innerRadius, outerRadius) {
        this.effectParams.star = {
            points: points || this.effectParams.star.points,
            innerRadius: innerRadius || this.effectParams.star.innerRadius,
            outerRadius: outerRadius || this.effectParams.star.outerRadius
        };
        return this;
    }

    // Điều chỉnh thông số cho hiệu ứng vòng tròn
    setCircleParams(rings, particlesPerRing) {
        this.effectParams.circle = {
            rings: rings || this.effectParams.circle.rings,
            particlesPerRing: particlesPerRing || this.effectParams.circle.particlesPerRing
        };
        return this;
    }

    // Điều chỉnh thông số cho hiệu ứng mưa sao
    setRainParams(width, height, clusters) {
        this.effectParams.rain = {
            width: width || this.effectParams.rain.width,
            height: height || this.effectParams.rain.height,
            clusters: clusters || this.effectParams.rain.clusters
        };
        return this;
    }

    // Điều chỉnh thông số cho hiệu ứng phượng hoàng
    setPhoenixParams(wingSpan, bodyLength, tailLength) {
        this.effectParams.phoenix = {
            wingSpan: wingSpan || this.effectParams.phoenix.wingSpan,
            bodyLength: bodyLength || this.effectParams.phoenix.bodyLength,
            tailLength: tailLength || this.effectParams.phoenix.tailLength
        };
        return this;
    }

    // Thiết lập nhiều thông số hiệu ứng cùng lúc
    setEffectParams(type, params) {
        if (this.effectParams.hasOwnProperty(type)) {
            this.effectParams[type] = { ...this.effectParams[type], ...params };
        }
        return this;
    }

    update() {
        if (!this.exploded) {
            if (this.isSpiral) {
                // Tính toán vị trí xoắn ốc
                const startY = canvas.height; // Vị trí bắt đầu
                const normalizedY = (startY - this.y) / (startY - this.targetY);
                const currentRadius = this.spiralRadius * Math.min(1, normalizedY);
                
                // Cập nhật góc xoắn
                this.spiralAngle += this.spiralSpeed;
                
                // Thêm offset xoắn ốc vào vị trí
                const offsetX = Math.cos(this.spiralAngle) * currentRadius;
                const offsetY = Math.sin(this.spiralAngle) * currentRadius;
                
                // Cập nhật vị trí
                this.x += this.velocity.x + offsetX * 0.5;
                this.y += this.velocity.y + offsetY * 0.5;
            } else {
                // Chuyển động thông thường
                this.velocity.x += this.curvature * (webRandom.randomFloat(0, 1) - 0.5) * 0.02;
                this.x += this.velocity.x;
                this.y += this.velocity.y;
            }
            
            this.velocity.y += 0.02;
            
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > this.trailLength) {
                this.trail.shift();
            }

            const distanceToTarget = Math.sqrt(
                Math.pow(this.targetX - this.x, 2) + 
                Math.pow(this.targetY - this.y, 2)
            );
            
            // Kiểm tra xem đã đạt đến điểm đích chưa
            if (!this.reachedTarget && ((distanceToTarget < 5 && this.y >= this.targetY) || this.y <= this.targetY)) {
                this.reachedTarget = true;
                this.targetReachedTime = Date.now();
                this.x = this.targetX;  // Đặt vị trí chính xác tại điểm đích
                this.y = this.targetY;
                return true;
            }

            // Bắt đầu hiệu ứng phát sáng sau 50ms khi đạt đến đích
            if (this.reachedTarget && !this.glowStarted && Date.now() - this.targetReachedTime > 50) {
                this.glowStarted = true;
            }

            // Nổ sau thêm 100ms sau khi bắt đầu phát sáng
            if (this.glowStarted && Date.now() - this.targetReachedTime > 150) {
                this.explode();
                this.exploded = true;
            }

            return true;
        } else {
            this.particles = this.particles.filter(particle => particle.update());
            
            // Hiệu ứng ánh sáng khi nổ chỉ xuất hiện sau khi đã bắt đầu phát sáng
            if (this.exploded && this.glowStarted && Date.now() - this.targetReachedTime < 250) {
                const ctx = canvas.getContext('2d');
                const timePassed = Date.now() - this.targetReachedTime;
                const glowIntensity = Math.min(1, (250 - timePassed) / 250);
                
                // Lớp ánh sáng chính
                ctx.save();
                ctx.globalCompositeOperation = 'lighter';
                
                // Vòng sáng trong
                const innerRadius = 15;  // Giảm từ 30 xuống 15
                const gradient1 = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, innerRadius);
                gradient1.addColorStop(0, `hsla(${this.hue}, 100%, 90%, ${0.6 * glowIntensity})`);  // Giảm alpha từ 0.8 xuống 0.6
                gradient1.addColorStop(0.4, `hsla(${this.hue}, 100%, 70%, ${0.4 * glowIntensity})`);  // Giảm alpha từ 0.5 xuống 0.4
                gradient1.addColorStop(1, 'hsla(0, 0%, 100%, 0)');
                
                ctx.fillStyle = gradient1;
                ctx.beginPath();
                ctx.arc(this.x, this.y, innerRadius, 0, Math.PI * 2);
                ctx.fill();
                
                // Vòng sáng ngoài
                const outerRadius = 80;  // Giảm từ 150 xuống 80
                const gradient2 = ctx.createRadialGradient(this.x, this.y, innerRadius * 0.7, this.x, this.y, outerRadius);
                gradient2.addColorStop(0, `hsla(${this.hue}, 100%, 50%, ${0.2 * glowIntensity})`);  // Giảm alpha từ 0.3 xuống 0.2
                gradient2.addColorStop(0.2, `hsla(${this.hue}, 80%, 40%, ${0.1 * glowIntensity})`);  // Giảm alpha từ 0.2 xuống 0.1
                gradient2.addColorStop(1, 'hsla(0, 0%, 100%, 0)');
                
                ctx.fillStyle = gradient2;
                ctx.beginPath();
                ctx.arc(this.x, this.y, outerRadius, 0, Math.PI * 2);
                ctx.fill();
                
                // Thêm hiệu ứng tia sáng
                const rays = 8;  // Giảm số tia từ 12 xuống 8
                ctx.strokeStyle = `hsla(${this.hue}, 100%, 70%, ${0.3 * glowIntensity})`;  // Giảm alpha từ 0.4 xuống 0.3
                ctx.lineWidth = 1;  // Giảm độ dày từ 2 xuống 1
                
                for (let i = 0; i < rays; i++) {
                    const angle = (i / rays) * Math.PI * 2;
                    const length = 40 + Math.random() * 20;  // Giảm độ dài từ 80-120 xuống 40-60
                    
                    ctx.beginPath();
                    ctx.moveTo(this.x, this.y);
                    ctx.lineTo(
                        this.x + Math.cos(angle) * length,
                        this.y + Math.sin(angle) * length
                    );
                    ctx.stroke();
                }
                
                ctx.restore();
            }

            return this.particles.length > 0;
        }
    }

    draw() {
        if (!this.exploded) {
            ctx.beginPath();
            ctx.moveTo(this.trail[0]?.x, this.trail[0]?.y);
            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            ctx.strokeStyle = `hsla(${this.hue}, 80%, ${this.brightness}%, ${this.alpha})`; 
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        this.particles.forEach(particle => particle.draw());

        // Draw label if needed
        if (this.showLabel && this.labelAlpha > 0) {
            const timePassed = Date.now() - this.labelStartTime;
            if (timePassed < this.labelDuration) {
                this.labelAlpha = 1 - (timePassed / this.labelDuration);
                ctx.save();
                ctx.font = '20px Arial';
                ctx.fillStyle = `rgba(255, 255, 255, ${this.labelAlpha})`;
                ctx.textAlign = 'center';
                ctx.fillText(this.effectType.toUpperCase(), this.targetX, this.targetY - 30);
                ctx.restore();
            }
        }
    }

    explode() {
        if (this.exploded) return;
        
        this.exploded = true;
        this.labelStartTime = Date.now();
        
        // Danh sách hiệu ứng có sẵn
        const effects = [
            'normal',
            'spiral',
            'heart',
            'star',
            'circle',
            'burst',
            'dna',
            'butterfly',
            'galaxy',
            'willow',
            'palm',
            'dahlia',
            'waterfall',
            'phoenix'
        ];
        
        // Chọn ngẫu nhiên một hiệu ứng
        const selectedEffect = effects[Math.floor(Math.random() * effects.length)];
        this.effectType = selectedEffect;
        
        let particleCount = this.isRecursive ? 30 : 100;
        
        // Tạo hiệu ứng tương ứng
        switch (selectedEffect) {
            case 'normal':
                this.createNormalEffect(particleCount);
                break;
            case 'spiral':
                this.createSpiralEffect(particleCount);
                break;
            case 'heart':
                this.createHeartEffect(particleCount);
                break;
            case 'star':
                this.createStarEffect(particleCount);
                break;
            case 'circle':
                this.createCircleEffect(particleCount);
                break;
            case 'burst':
                this.createBurstEffect(particleCount);
                break;
            case 'dna':
                this.createDNAEffect(particleCount);
                break;
            case 'butterfly':
                this.createButterflyEffect(particleCount);
                break;
            case 'galaxy':
                this.createGalaxyEffect(particleCount);
                break;
            case 'willow':
                this.createWillowEffect(particleCount);
                break;
            case 'palm':
                this.createPalmEffect(particleCount);
                break;
            case 'dahlia':
                this.createDahliaEffect(Math.floor(particleCount * 1.2));
                break;
            case 'waterfall':
                this.createWaterfallEffect(particleCount);
                break;
            case 'phoenix':
                this.createPhoenixEffect(particleCount);
                break;
        }
        
        // Phát âm thanh nổ
        playSound('explosion');
        
        // Tạo hiệu ứng phụ nếu là pháo hoa chính
        if (!this.isRecursive && Math.random() < 0.3) {
            this.createSecondaryExplosions();
        }
    }

    createNormalEffect(particleCount = webRandom.randomInt(30, 45)) {
        const angleStep = (Math.PI * 2) / particleCount;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = angleStep * i + webRandom.randomFloat(-0.15, 0.15);
            const speed = 3 + webRandom.randomFloat(-0.5, 1.5);
            const radius = webRandom.randomFloat(0.8, 1.2);
            
            const vx = Math.cos(angle) * speed * radius;
            const vy = Math.sin(angle) * speed * radius;
            
            this.particles.push(
                new Particle(
                    this.x, 
                    this.y,
                    vx,
                    vy,
                    (this.hue + webRandom.randomFloat(-10, 10)) % 360,
                    'circle',
                    0,
                    false,
                    webRandom.randomFloat(0, 0.2)
                )
            );
        }
        return this;
    }

    createSpiralEffect(particleCount) {
        const numArms = webRandom.randomInt(2, 4);
        const angleStep = (Math.PI * 2) / particleCount;
        const armSpacing = (Math.PI * 2) / numArms;
        
        for (let arm = 0; arm < numArms; arm++) {
            const armOffset = arm * armSpacing;
            
            for (let i = 0; i < particleCount / numArms; i++) {
                const ratio = i / (particleCount / numArms);
                const angle = angleStep * i * 3 + armOffset;
                const radius = 2 + ratio * 3;
                
                const vx = Math.cos(angle) * radius;
                const vy = Math.sin(angle) * radius;
                
                this.particles.push(
                    new Particle(
                        this.x,
                        this.y,
                        vx,
                        vy,
                        (this.hue + ratio * 30 + webRandom.randomFloat(-10, 10)) % 360,
                        'circle',
                        ratio * 0.2,
                        false,
                        ratio * 0.3 + webRandom.randomFloat(0, 0.2)
                    )
                );
            }
        }
        
        return this;
    }

    createRingEffect(particleCount) {
        const rings = 2 + Math.floor(webRandom.randomFloat(0, 2));
        const particlesPerRing = Math.floor(particleCount / rings);
        
        for (let ring = 0; ring < rings; ring++) {
            const ringRadius = 2 + ring * 1.5 + webRandom.randomFloat(-0.3, 0.3);
            
            for (let i = 0; i < particlesPerRing; i++) {
                const angle = (i / particlesPerRing) * Math.PI * 2;
                // Thêm nhiễu vào góc và bán kính
                const jitteredAngle = angle + webRandom.randomFloat(-0.15, 0.15);
                const jitteredRadius = ringRadius * (1 + webRandom.randomFloat(-0.2, 0.2));
                
                const vx = Math.cos(jitteredAngle) * jitteredRadius;
                const vy = Math.sin(jitteredAngle) * jitteredRadius;
                
                this.particles.push(
                    new Particle(
                        this.x + webRandom.randomFloat(-1, 1),
                        this.y + webRandom.randomFloat(-1, 1),
                        vx,
                        vy,
                        (this.hue + ring * 20 + webRandom.randomFloat(-15, 15)) % 360,
                        'circle',
                        webRandom.randomFloat(0.1, 0.3),
                        false,
                        webRandom.randomFloat(0, 0.3)
                    )
                );
            }
        }
        return this;
    }

    createCircleEffect(particleCount) {
        const numCircles = 3;  // Số vòng tròn đồng tâm
        const particlesPerCircle = Math.floor(particleCount / numCircles);
        
        for (let circle = 0; circle < numCircles; circle++) {
            const baseRadius = 2 + circle * 1.5;  // Bán kính cơ bản cho mỗi vòng
            
            for (let i = 0; i < particlesPerCircle; i++) {
                const angle = (i / particlesPerCircle) * Math.PI * 2;
                
                // Tạo hiệu ứng zic zac
                const zigzagAngle = angle + Math.sin(angle * 8) * 0.2;  // Tần số zic zac
                const zigzagRadius = baseRadius + Math.sin(angle * 12) * 0.3;  // Biên độ zic zac
                
                // Thêm nhiễu ngẫu nhiên
                const jitteredAngle = zigzagAngle + webRandom.randomFloat(-0.1, 0.1);
                const jitteredRadius = zigzagRadius * (1 + webRandom.randomFloat(-0.15, 0.15));
                
                // Tính toán vận tốc với hiệu ứng xoáy nhẹ
                const spiralFactor = 0.2;  // Độ mạnh của hiệu ứng xoáy
                const vx = (Math.cos(jitteredAngle) * jitteredRadius) + 
                          (Math.cos(jitteredAngle + Math.PI/2) * spiralFactor);
                const vy = (Math.sin(jitteredAngle) * jitteredRadius) + 
                          (Math.sin(jitteredAngle + Math.PI/2) * spiralFactor);
                
                // Thêm particle chính
                this.particles.push(
                    new Particle(
                        this.x + webRandom.randomFloat(-0.5, 0.5),
                        this.y + webRandom.randomFloat(-0.5, 0.5),
                        vx,
                        vy,
                        (this.hue + circle * 25 + webRandom.randomFloat(-15, 15)) % 360,
                        'circle',
                        webRandom.randomFloat(0.1, 0.3),
                        false,
                        webRandom.randomFloat(0, 0.3)
                    )
                );
                
                // Thêm particle phụ với xác suất
                if (Math.random() < 0.3) {
                    const sparkRadius = jitteredRadius * 0.8;
                    const sparkAngle = jitteredAngle + webRandom.randomFloat(-0.2, 0.2);
                    
                    this.particles.push(
                        new Particle(
                            this.x,
                            this.y,
                            Math.cos(sparkAngle) * sparkRadius,
                            Math.sin(sparkAngle) * sparkRadius,
                            (this.hue + circle * 25 + 40) % 360,
                            'star',
                            webRandom.randomFloat(0.05, 0.15),
                            false,
                            webRandom.randomFloat(0.1, 0.4)
                        )
                    );
                }
            }
        }
        
        return this;
    }

    createBurstEffect(particleCount) {
        const types = ['circle', 'star'];
        const type = types[webRandom.randomInt(0, types.length - 1)];
        const burstCount = webRandom.randomInt(3, 5);
        const particlesPerBurst = Math.floor(particleCount / burstCount);
        
        const createBurst = (x, y, delay, generation) => {
            if (generation >= 2) return;
            
            const angleStep = (Math.PI * 2) / particlesPerBurst;
            for (let i = 0; i < particlesPerBurst; i++) {
                const angle = angleStep * i + webRandom.randomFloat(-0.1, 0.1);
                const velocity = 3 + webRandom.randomFloat(0, 2);
                
                // 20% cơ hội tạo burst mới
                const willBurst = webRandom.randomFloat(0, 1) < 0.2;
                
                const particle = new Particle(
                    x,
                    y,
                    Math.cos(angle) * velocity,
                    Math.sin(angle) * velocity,
                    (this.hue + generation * 40) % 360,
                    type,
                    generation,
                    willBurst,
                    delay
                );
                
                this.particles.push(particle);
                
                if (willBurst) {
                    // Tính toán vị trí burst tiếp theo
                    const nextX = x + Math.cos(angle) * velocity * 20;
                    const nextY = y + Math.sin(angle) * velocity * 20;
                    const nextDelay = delay + 0.3;
                    
                    setTimeout(() => {
                        createBurst(nextX, nextY, nextDelay, generation + 1);
                    }, nextDelay * 1000);
                }
            }
        };
        
        createBurst(this.x, this.y, 0, 0);
    }

    createDNAEffect(particleCount) {
        const types = ['circle', 'star'];
        const type = types[webRandom.randomInt(0, types.length - 1)];
        const rotations = 3;
        const strands = 2;
        const radius = 5;
        
        for (let i = 0; i < particleCount; i++) {
            const progress = i / particleCount;
            const angle = progress * Math.PI * 2 * rotations;
            
            for (let strand = 0; strand < strands; strand++) {
                const offset = (strand * Math.PI) + angle;
                const x = Math.cos(offset) * radius;
                const y = progress * 20 - 10;
                
                const velocity = {
                    x: x * 0.5,
                    y: y * 0.2
                };
                
                this.particles.push(
                    new Particle(
                        this.x,
                        this.y,
                        velocity.x,
                        velocity.y,
                        (this.hue + progress * 100) % 360,
                        type,
                        progress * 0.2,
                        this.isRecursive,
                        0.8 - progress * 0.6
                    )
                );
                
                // Thêm các hạt kết nối
                if (i > 0 && i < particleCount - 1) {
                    const connector = new Particle(
                        this.x,
                        this.y,
                        velocity.x * 0.8,
                        velocity.y * 0.8,
                        this.hue,
                        'circle',
                        progress * 0.2,
                        false,
                        0.8
                    );
                    this.particles.push(connector);
                }
            }
        }
    }

    createGalaxyEffect(particleCount) {
        particleCount = this.getParticleCount(particleCount);
        const spiralArms = 5;  // Số cánh xoắn
        const particlesPerArm = Math.floor(particleCount / spiralArms);

        // Tạo hiệu ứng nổ ban đầu
        const burstParticles = 50;
        for (let i = 0; i < burstParticles; i++) {
            const angle = (i / burstParticles) * Math.PI * 2;
            const velocity = 4 + Math.random() * 2;
            this.particles.push(
                new Particle(
                    this.targetX,
                    this.targetY,
                    Math.cos(angle) * velocity,
                    Math.sin(angle) * velocity,
                    (this.hue + 30) % 360,
                    'star',
                    0,
                    false,
                    0.9
                )
            );
        }
        
        // Tạo vòng sáng trung tâm
        const coreParticles = 40;
        for (let i = 0; i < coreParticles; i++) {
            const angle = (i / coreParticles) * Math.PI * 2;
            const velocity = 2;
            this.particles.push(
                new Particle(
                    this.targetX,
                    this.targetY,
                    Math.cos(angle) * velocity,
                    Math.sin(angle) * velocity,
                    (this.hue + 60) % 360,
                    'circle',
                    0.1,
                    false,
                    0.8
                )
            );
        }
        
        // Tạo các cánh xoắn ốc
        for (let arm = 0; arm < spiralArms; arm++) {
            const armAngle = (arm / spiralArms) * Math.PI * 2;
            const armHueShift = (360 / spiralArms) * arm;
            
            for (let i = 0; i < particlesPerArm; i++) {
                const progress = i / particlesPerArm;
                const radius = 1 + progress * 6;  // Tăng bán kính theo tiến trình
                const rotation = progress * 4 * Math.PI;  // Số vòng xoắn
                const angle = armAngle + rotation;
                
                // Tính toán vị trí và vận tốc
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                
                // Thêm hạt chính của cánh xoắn
                this.particles.push(
                    new Particle(
                        this.targetX,
                        this.targetY,
                        x,
                        y,
                        (this.hue + armHueShift + progress * 30) % 360,
                        'circle',
                        progress * 0.5,
                        false,
                        0.7 - progress * 0.3
                    )
                );
                
                // Thêm các ngôi sao lấp lánh
                if (Math.random() < 0.4) {
                    const starSpread = webRandom.randomFloat(-0.5, 0.5);
                    this.particles.push(
                        new Particle(
                            this.targetX,
                            this.targetY,
                            x + starSpread,
                            y + starSpread,
                            (this.hue + armHueShift + 60) % 360,
                            'star',
                            progress * 0.5 + 0.1,
                            false,
                            0.5
                        )
                    );
                }
                
                // Thêm hiệu ứng bụi không gian
                if (Math.random() < 0.3) {
                    const dustSpread = webRandom.randomFloat(-0.8, 0.8);
                    this.particles.push(
                        new Particle(
                            this.targetX,
                            this.targetY,
                            x + dustSpread,
                            y + dustSpread,
                            (this.hue + armHueShift + 30) % 360,
                            'circle',
                            progress * 0.5 + 0.2,
                            false,
                            0.4
                        )
                    );
                }
            }
        }
        
        // Thêm các ngôi sao xa xôi
        const distantStars = 60;
        for (let i = 0; i < distantStars; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 4 + Math.random() * 4;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            this.particles.push(
                new Particle(
                    this.targetX,
                    this.targetY,
                    x,
                    y,
                    (this.hue + 80) % 360,
                    'star',
                    Math.random() * 0.5,
                    false,
                    0.6
                )
            );
        }
        
        // Thêm hiệu ứng sương mù không gian
        const spaceNebulaCount = 40;
        for (let i = 0; i < spaceNebulaCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 2 + Math.random() * 6;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            this.particles.push(
                new Particle(
                    this.targetX,
                    this.targetY,
                    x,
                    y,
                    (this.hue + 120) % 360,
                    'circle',
                    Math.random() * 0.3,
                    false,
                    0.4
                )
            );
        }
        
        // Thêm hiệu ứng tia sáng từ trung tâm
        const rayCount = 8;
        for (let i = 0; i < rayCount; i++) {
            const angle = (i / rayCount) * Math.PI * 2;
            const length = 3 + Math.random() * 2;
            
            for (let j = 0; j < 5; j++) {
                const progress = j / 5;
                const x = Math.cos(angle) * (length * progress);
                const y = Math.sin(angle) * (length * progress);
                
                this.particles.push(
                    new Particle(
                        this.targetX,
                        this.targetY,
                        x,
                        y,
                        (this.hue + 40) % 360,
                        'star',
                        0.1 + progress * 0.2,
                        false,
                        0.8 - progress * 0.4
                    )
                );
            }
        }
    }

    createButterflyEffect(particleCount) {
        particleCount = this.getParticleCount(particleCount);
        const wings = 2;
        const layers = 4;
        const particlesPerWing = Math.floor(particleCount / (wings * layers));

        // Tạo hiệu ứng nổ ban đầu
        const burstParticles = 40;
        for (let i = 0; i < burstParticles; i++) {
            const angle = (i / burstParticles) * Math.PI * 2;
            const velocity = 4 + Math.random() * 2;
            this.particles.push(
                new Particle(
                    this.targetX,
                    this.targetY,
                    Math.cos(angle) * velocity,
                    Math.sin(angle) * velocity,
                    (this.hue + 30) % 360,
                    'star',
                    0,
                    false,
                    0.8
                )
            );
        }

        // Tạo vòng sáng
        const ringParticles = 30;
        for (let i = 0; i < ringParticles; i++) {
            const angle = (i / ringParticles) * Math.PI * 2;
            const velocity = 2;
            this.particles.push(
                new Particle(
                    this.targetX,
                    this.targetY,
                    Math.cos(angle) * velocity,
                    Math.sin(angle) * velocity,
                    (this.hue + 60) % 360,
                    'circle',
                    0.1,
                    false,
                    0.7
                )
            );
        }

        // Tạo cánh bướm (sử dụng đường cong Bézier để tạo hình mượt mà hơn)
        for (let layer = 0; layer < layers; layer++) {
            const layerScale = 1 + layer * 0.2;  // Mỗi lớp có kích thước khác nhau
            const layerDelay = layer * 0.1;     // Độ trễ giữa các lớp
            
            for (let side = 0; side < 2; side++) {
                const isRightWing = side === 1;
                const sideMultiplier = isRightWing ? 1 : -1;
                
                for (let i = 0; i < particlesPerWing; i++) {
                    const progress = i / particlesPerWing;
                    const t = progress * Math.PI;
                    
                    // Tạo hình dạng cánh bướm đẹp hơn
                    const wingShape = Math.sin(t) * (1 + Math.cos(t * 2));  // Công thức cải tiến
                    const x = sideMultiplier * wingShape * 3 * layerScale;
                    const y = Math.cos(t) * Math.sin(t * 2) * 3 * layerScale;
                    
                    // Tính toán vận tốc để tạo hiệu ứng bay lên
                    const velocity = 2 + Math.sin(progress * Math.PI) * 2;
                    const angle = Math.atan2(y, x);
                    const vx = Math.cos(angle) * velocity;
                    const vy = Math.sin(angle) * velocity - 0.5;  // Thêm lực đẩy lên trên
                    
                    // Thêm các hạt chính tạo thành cánh
                    const hueShift = layer * 15 + progress * 30;
                    this.particles.push(
                        new Particle(
                            this.targetX,
                            this.targetY,
                            vx,
                            vy,
                            (this.hue + hueShift) % 360,
                            'circle',
                            layerDelay + progress * 0.2,
                            false,
                            0.7 - progress * 0.3
                        )
                    );
                    
                    // Thêm các hạt phụ tạo hiệu ứng tia sáng
                    if (Math.random() < 0.4) {
                        const sparkSpread = webRandom.randomFloat(-0.2, 0.2);
                        const sparkVelocity = velocity * 1.2;
                        const sparkAngle = angle + sparkSpread;
                        const sparkVx = Math.cos(sparkAngle) * sparkVelocity;
                        const sparkVy = Math.sin(sparkAngle) * sparkVelocity - 0.8;
                        
                        this.particles.push(
                            new Particle(
                                this.targetX,
                                this.targetY,
                                sparkVx,
                                sparkVy,
                                (this.hue + hueShift + 60) % 360,
                                'star',
                                layerDelay + progress * 0.1,
                                false,
                                0.5
                            )
                        );
                    }
                    
                    // Thêm các hạt bụi tạo hiệu ứng mờ ảo
                    if (Math.random() < 0.3 && progress > 0.2) {
                        const mistSpread = webRandom.randomFloat(-0.4, 0.4);
                        const mistVelocity = velocity * 0.7;
                        const mistAngle = angle + mistSpread;
                        const mistVx = Math.cos(mistAngle) * mistVelocity;
                        const mistVy = Math.sin(mistAngle) * mistVelocity - 0.3;
                        
                        this.particles.push(
                            new Particle(
                                this.targetX,
                                this.targetY,
                                mistVx,
                                mistVy,
                                (this.hue + hueShift - 30) % 360,
                                'circle',
                                layerDelay + progress * 0.25,
                                false,
                                0.4
                            )
                        );
                    }
                    
                    // Thêm các hạt lấp lánh ở viền cánh
                    if (Math.random() < 0.5 && (progress < 0.2 || progress > 0.8)) {
                        const glitterX = x * (1.05 + Math.random() * 0.1);
                        const glitterY = y * (1.05 + Math.random() * 0.1);
                        
                        this.particles.push(
                            new Particle(
                                this.targetX,
                                this.targetY,
                                glitterX,
                                glitterY,
                                (this.hue + hueShift + 60) % 360,
                                'star',
                                layerDelay,
                                false,
                                0.7
                            )
                        );
                    }
                }
            }
        }

        // Tạo thân bướm đẹp hơn
        const bodyParticles = 15;  // Tăng số lượng hạt
        const bodyWidth = 0.3;     // Độ rộng của thân
        
        for (let i = 0; i < bodyParticles; i++) {
            const progress = i / bodyParticles;
            const angle = Math.sin(progress * Math.PI * 4) * bodyWidth;  // Tạo hình sin
            const x = Math.cos(angle) * bodyWidth;
            const y = (progress - 0.5) * 3;  // Kéo dài thân
            
            // Hạt thân chính
            this.particles.push(
                new Particle(
                    this.targetX,
                    this.targetY,
                    x,
                    y,
                    (this.hue + 30) % 360,
                    'circle',
                    0,
                    false,
                    0.7
                )
            );
            
            // Thêm hạt phụ cho thân
            if (Math.random() < 0.5) {
                const sparkX = x + webRandom.randomFloat(-0.1, 0.1);
                const sparkY = y + webRandom.randomFloat(-0.1, 0.1);
                
                this.particles.push(
                    new Particle(
                        this.targetX,
                        this.targetY,
                        sparkX,
                        sparkY,
                        (this.hue + 60) % 360,
                        'star',
                        0.1,
                        false,
                        0.5
                    )
                );
            }
        }
    }

    createWillowEffect(particleCount) {
        particleCount = this.getParticleCount(particleCount);
        const streams = 150; // Tăng số lượng tia
        const layers = 4;    // Thêm nhiều lớp
        const particlesPerStream = Math.floor(particleCount / (streams * layers));

        // Tạo hiệu ứng nổ ban đầu
        const burstParticles = 30;
        for (let i = 0; i < burstParticles; i++) {
            const angle = (i / burstParticles) * Math.PI * 2;
            const velocity = 3 + Math.random();
            this.particles.push(
                new Particle(
                    this.targetX,
                    this.targetY,
                    Math.cos(angle) * velocity,
                    Math.sin(angle) * velocity,
                    (this.hue + 30) % 360,
                    'star',
                    0,
                    false,
                    0.8
                )
            );
        }

        for (let layer = 0; layer < layers; layer++) {
            const layerScale = 1 + layer * 0.2;  // Mỗi lớp có kích thước khác nhau
            const layerDelay = layer * 0.1;     // Độ trễ giữa các lớp
            
            for (let stream = 0; stream < streams; stream++) {
                const baseAngle = (stream / streams) * Math.PI * 2;
                const streamVelocity = 2 + Math.random() * 2; // Tốc độ ngẫu nhiên cho mỗi tia
                
                for (let i = 0; i < particlesPerStream; i++) {
                    const progress = i / particlesPerStream;
                    const spread = Math.sin(progress * Math.PI) * 0.1; // Tạo độ cong nhẹ
                    const angle = baseAngle + spread;
                    
                    // Tốc độ giảm dần theo tiến trình để tạo hiệu ứng rủ xuống
                    const velocity = (streamVelocity - progress * 1.5) * layerScale;
                    const gravity = progress * 0.2; // Thêm trọng lực để tạo hiệu ứng rủ
                    
                    const x = Math.cos(angle) * velocity;
                    const y = Math.sin(angle) * velocity + gravity;
                    
                    // Thêm các hạt chính với màu sắc chuyển đổi đẹp mắt
                    const hueShift = layer * 10 + progress * 20;
                    this.particles.push(
                        new Particle(
                            this.targetX,
                            this.targetY,
                            x,
                            y,
                            (this.hue + hueShift) % 360,
                            'circle',
                            layerDelay + progress * 0.2,
                            false,
                            0.7 - progress * 0.3
                        )
                    );
                    
                    // Thêm các hạt phụ tạo hiệu ứng tia sáng
                    if (Math.random() < 0.3) {
                        const sparkSpread = webRandom.randomFloat(-0.2, 0.2);
                        const sparkVelocity = velocity * 1.2;
                        const sparkAngle = angle + sparkSpread;
                        const sparkVx = Math.cos(sparkAngle) * sparkVelocity;
                        const sparkVy = Math.sin(sparkAngle) * sparkVelocity;
                        
                        this.particles.push(
                            new Particle(
                                this.targetX,
                                this.targetY,
                                sparkVx,
                                sparkVy,
                                (this.hue + hueShift + 30) % 360,
                                'circle',
                                layerDelay + progress * 0.2 + 0.1,
                                false,
                                0.5
                            )
                        );
                    }
                    
                    // Thêm các hạt bụi tạo hiệu ứng mờ ảo
                    if (Math.random() < 0.2 && progress > 0.3) {
                        const mistSpread = webRandom.randomFloat(-0.3, 0.3);
                        const mistVelocity = velocity * 0.7;
                        const mistAngle = angle + mistSpread;
                        const mistVx = Math.cos(mistAngle) * mistVelocity;
                        const mistVy = Math.sin(mistAngle) * mistVelocity + gravity * 0.6;
                        
                        this.particles.push(
                            new Particle(
                                this.targetX,
                                this.targetY,
                                mistVx,
                                mistVy,
                                (this.hue + hueShift - 20) % 360,
                                'circle',
                                layerDelay + progress * 0.2 + 0.15,
                                false,
                                0.4
                            )
                        );
                    }
                    
                    // Thêm các hạt lấp lánh ở phần đầu
                    if (Math.random() < 0.4 && progress < 0.2) {
                        const glitterVelocity = velocity * 1.1;
                        const glitterSpread = webRandom.randomFloat(-0.1, 0.1);
                        const glitterX = Math.cos(angle + glitterSpread) * glitterVelocity;
                        const glitterY = Math.sin(angle + glitterSpread) * glitterVelocity;
                        
                        this.particles.push(
                            new Particle(
                                this.targetX,
                                this.targetY,
                                glitterX,
                                glitterY,
                                (this.hue + hueShift + 60) % 360,
                                'star',
                                layerDelay,
                                false,
                                0.7
                            )
                        );
                    }
                }
            }
        }
    }

    createPalmEffect(particleCount) {
        particleCount = this.getParticleCount(particleCount);
        const trunk = Math.floor(particleCount * 0.2);
        const fronds = 6;
        const particlesPerFrond = Math.floor((particleCount - trunk) / fronds);
        
        // Tạo thân cây
        for (let i = 0; i < trunk; i++) {
            const progress = i / trunk;
            const velocity = 5 + progress * 2;
            const spread = webRandom.randomFloat(-0.1, 0.1);
            
            const trunkParticle = new Particle(
                this.x,
                this.y,
                spread * velocity * 0.1,
                -velocity,
                this.hue,
                'circle',
                0,
                this.isRecursive,
                progress * 0.2
            );
            
            trunkParticle.gravity = 0.15;
            this.particles.push(trunkParticle);
        }
        
        // Tạo các tán lá
        for (let frond = 0; frond < fronds; frond++) {
            const baseAngle = -Math.PI/2 + (frond - fronds/2) * 0.4;
            
            for (let i = 0; i < particlesPerFrond; i++) {
                const progress = i / particlesPerFrond;
                const velocity = 4 + progress * 3;
                const angle = baseAngle + Math.sin(progress * Math.PI) * 0.5;
                const spread = webRandom.randomFloat(-0.1, 0.1);
                
                const frondParticle = new Particle(
                    this.x,
                    this.y,
                    Math.cos(angle + spread) * velocity,
                    Math.sin(angle + spread) * velocity,
                    (this.hue + frond * 10) % 360,
                    'star',
                    0,
                    this.isRecursive,
                    0.3 + progress * 0.2
                );
                
                frondParticle.gravity = 0.12;
                this.particles.push(frondParticle);
                
                // Thêm các hạt phụ
                if (webRandom.randomFloat(0, 1) < 0.3) {
                    const sparkVelocity = velocity * 0.8;
                    const sparkSpread = spread * 2;
                    
                    const sparkParticle = new Particle(
                        this.x,
                        this.y,
                        sparkVelocity.x,
                        sparkVelocity.y,
                        (this.hue + frond * 10 + 30) % 360,
                        'circle',
                        0,
                        this.isRecursive,
                        0.3 + progress * 0.2 + 0.1
                    );
                    
                    sparkParticle.gravity = 0.1;
                    this.particles.push(sparkParticle);
                }
            }
        }
    }

    createDahliaEffect(particleCount) {
        particleCount = this.getParticleCount(particleCount);
        const layers = 6;      // Tăng số lớp
        const petalsPerLayer = 32;  // Tăng số cánh hoa
        const particlesPerPetal = Math.floor(particleCount / (layers * petalsPerLayer));

        // Tạo hiệu ứng nổ ban đầu cực lớn
        const burstParticles = 80;  // Tăng số lượng hạt nổ
        for (let i = 0; i < burstParticles; i++) {
            const angle = (i / burstParticles) * Math.PI * 2;
            const velocity = 5 + Math.random() * 3;  // Tăng tốc độ nổ
            this.particles.push(
                new Particle(
                    this.targetX,
                    this.targetY,
                    Math.cos(angle) * velocity,
                    Math.sin(angle) * velocity,
                    (this.hue + 30) % 360,
                    'star',
                    0,
                    false,
                    0.8
                )
            );
        }

        // Tạo vòng sáng
        const ringParticles = 50;
        for (let i = 0; i < ringParticles; i++) {
            const angle = (i / ringParticles) * Math.PI * 2;
            const velocity = 3;
            this.particles.push(
                new Particle(
                    this.targetX,
                    this.targetY,
                    Math.cos(angle) * velocity,
                    Math.sin(angle) * velocity,
                    (this.hue + 60) % 360,
                    'circle',
                    0.1,
                    false,
                    0.7
                )
            );
        }

        // Tạo các lớp cánh hoa
        for (let layer = 0; layer < layers; layer++) {
            const layerScale = 1 + layer * 0.4;  // Tăng kích thước mỗi lớp
            const layerDelay = layer * 0.12;     // Độ trễ giữa các lớp
            const layerHueShift = layer * 20;    // Chuyển màu giữa các lớp

            for (let petal = 0; petal < petalsPerLayer; petal++) {
                const petalAngle = (petal / petalsPerLayer) * Math.PI * 2;
                const petalSpread = Math.PI / petalsPerLayer;  // Độ rộng cánh hoa

                for (let i = 0; i < particlesPerPetal; i++) {
                    const progress = i / particlesPerPetal;
                    const radius = (1 + progress * 3) * layerScale;
                    const angle = petalAngle + Math.sin(progress * Math.PI) * petalSpread;
                    
                    // Tính toán vị trí và vận tốc
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    
                    // Thêm hạt chính của cánh hoa
                    this.particles.push(
                        new Particle(
                            this.targetX,
                            this.targetY,
                            x,
                            y,
                            (this.hue + layerHueShift + progress * 30) % 360,
                            'circle',
                            layerDelay + progress * 0.2,
                            false,
                            0.7 - progress * 0.3
                        )
                    );

                    // Thêm tia sáng
                    if (Math.random() < 0.4) {
                        const sparkSpread = webRandom.randomFloat(-0.3, 0.3);
                        this.particles.push(
                            new Particle(
                                this.targetX,
                                this.targetY,
                                x + sparkSpread,
                                y + sparkSpread,
                                (this.hue + layerHueShift + 60) % 360,
                                'star',
                                layerDelay + progress * 0.2 + 0.1,
                                false,
                                0.5
                            )
                        );
                    }

                    // Thêm hiệu ứng mờ ảo
                    if (Math.random() < 0.3 && progress > 0.2) {
                        const mistSpread = webRandom.randomFloat(-0.5, 0.5);
                        this.particles.push(
                            new Particle(
                                this.targetX,
                                this.targetY,
                                x + mistSpread,
                                y + mistSpread,
                                (this.hue + layerHueShift + 30) % 360,
                                'circle',
                                layerDelay + progress * 0.2 + 0.15,
                                false,
                                0.3
                            )
                        );
                    }

                    // Thêm hạt lấp lánh ở viền cánh
                    if (Math.random() < 0.5 && (progress < 0.2 || progress > 0.8)) {
                        const glitterX = x * (1.05 + Math.random() * 0.1);
                        const glitterY = y * (1.05 + Math.random() * 0.1);
                        this.particles.push(
                            new Particle(
                                this.targetX,
                                this.targetY,
                                glitterX,
                                glitterY,
                                (this.hue + layerHueShift - 30) % 360,
                                'star',
                                layerDelay + progress * 0.1,
                                false,
                                0.6
                            )
                        );
                    }
                }
            }
        }

        // Thêm hiệu ứng tia sáng từ trung tâm
        const rayCount = 16;
        for (let i = 0; i < rayCount; i++) {
            const angle = (i / rayCount) * Math.PI * 2;
            const length = 2 + Math.random() * 2;

            for (let j = 0; j < 5; j++) {
                const progress = j / 5;
                const x = Math.cos(angle) * (length * progress);
                const y = Math.sin(angle) * (length * progress);

                this.particles.push(
                    new Particle(
                        this.targetX,
                        this.targetY,
                        x,
                        y,
                        (this.hue + 40) % 360,
                        'star',
                        0.05 + progress * 0.1,
                        false,
                        0.7 - progress * 0.4
                    )
                );
            }
        }
    }

    createWaterfallEffect(particleCount) {
        particleCount = this.getParticleCount(particleCount);
        const streamCount = 8;  // Số luồng nước
        const particlesPerStream = Math.floor(particleCount / streamCount);
        
        // Tạo hiệu ứng nổ ban đầu
        const burstParticles = 40;
        for (let i = 0; i < burstParticles; i++) {
            const angle = (i / burstParticles) * Math.PI * 2;
            const velocity = 3 + Math.random() * 2;
            this.particles.push(
                new Particle(
                    this.targetX,
                    this.targetY,
                    Math.cos(angle) * velocity,
                    Math.sin(angle) * velocity,
                    (this.hue + 30) % 360,
                    'star',
                    0,
                    false,
                    0.8
                )
            );
        }
        
        // Tạo vòng sáng
        const ringParticles = 30;
        for (let i = 0; i < ringParticles; i++) {
            const angle = (i / ringParticles) * Math.PI * 2;
            const velocity = 2;
            this.particles.push(
                new Particle(
                    this.targetX,
                    this.targetY,
                    Math.cos(angle) * velocity,
                    Math.sin(angle) * velocity,
                    (this.hue + 60) % 360,
                    'circle',
                    0.1,
                    false,
                    0.7
                )
            );
        }
        
        // Tạo các luồng nước chính
        for (let stream = 0; stream < streamCount; stream++) {
            const streamAngle = (stream / streamCount) * Math.PI * 2;
            const streamSpread = Math.PI / 8;  // Độ rộng của luồng
            
            for (let i = 0; i < particlesPerStream; i++) {
                const progress = i / particlesPerStream;
                const delay = progress * 0.5;  // Độ trễ tạo hiệu ứng rơi
                
                // Tính toán góc và vận tốc cho từng hạt
                const particleAngle = streamAngle + 
                    (Math.random() - 0.5) * streamSpread + 
                    Math.PI / 2;  // Hướng xuống
                
                const baseVelocity = 2 + progress * 3;  // Tăng tốc độ theo thởi gian
                const velocityX = Math.cos(particleAngle) * baseVelocity;
                const velocityY = Math.sin(particleAngle) * baseVelocity;
                
                // Thêm hạt nước chính
                this.particles.push(
                    new Particle(
                        this.targetX,
                        this.targetY,
                        velocityX,
                        velocityY,
                        (this.hue + progress * 30) % 360,
                        'circle',
                        delay,
                        true,  // Chịu ảnh hưởng của trọng lực
                        0.7 - progress * 0.3
                    )
                );
                
                // Thêm bọt nước
                if (Math.random() < 0.4) {
                    const bubbleSpread = webRandom.randomFloat(-0.5, 0.5);
                    const bubbleVelocity = baseVelocity * 0.8;
                    this.particles.push(
                        new Particle(
                            this.targetX,
                            this.targetY,
                            velocityX + bubbleSpread,
                            velocityY + bubbleSpread,
                            (this.hue + 60) % 360,
                            'star',
                            delay + 0.1,
                            true,
                            0.5
                        )
                    );
                }
                
                // Thêm hạt sương mù
                if (Math.random() < 0.3) {
                    const mistSpread = webRandom.randomFloat(-0.8, 0.8);
                    const mistVelocity = baseVelocity * 0.6;
                    this.particles.push(
                        new Particle(
                            this.targetX,
                            this.targetY,
                            velocityX + mistSpread,
                            velocityY + mistSpread,
                            (this.hue + 40) % 360,
                            'circle',
                            delay + 0.2,
                            true,
                            0.4
                        )
                    );
                }
                
                // Thêm tia nước bắn
                if (Math.random() < 0.2 && progress > 0.3) {
                    const splashAngle = particleAngle + webRandom.randomFloat(-Math.PI/4, Math.PI/4);
                    const splashVelocity = baseVelocity * 1.2;
                    this.particles.push(
                        new Particle(
                            this.targetX,
                            this.targetY,
                            Math.cos(splashAngle) * splashVelocity,
                            Math.sin(splashAngle) * splashVelocity,
                            (this.hue + 20) % 360,
                            'star',
                            delay + 0.15,
                            true,
                            0.6
                        )
                    );
                }
            }
        }
        
        // Thêm hiệu ứng lấp lánh dọc theo thác nước
        const sparkleCount = 40;
        for (let i = 0; i < sparkleCount; i++) {
            const progress = i / sparkleCount;
            const angle = Math.PI/2 + (Math.random() - 0.5) * Math.PI/4;
            const velocity = 1 + Math.random() * 2;
            
            this.particles.push(
                new Particle(
                    this.targetX,
                    this.targetY,
                    Math.cos(angle) * velocity,
                    Math.sin(angle) * velocity,
                    (this.hue + 80) % 360,
                    'star',
                    progress * 0.3,
                    true,
                    0.5
                )
            );
        }
    }

    createPhoenixEffect(particleCount) {
        particleCount = this.getParticleCount(particleCount);
        const wings = 2;
        const layers = 4;
        const particlesPerWing = Math.floor(particleCount / (wings * layers));

        // Tạo hiệu ứng nổ ban đầu cực lớn
        const burstParticles = 50;  // Tăng số lượng hạt nổ
        for (let i = 0; i < burstParticles; i++) {
            const angle = (i / burstParticles) * Math.PI * 2;
            const velocity = 4 + Math.random() * 2;  // Tăng tốc độ nổ
            this.particles.push(
                new Particle(
                    this.targetX,
                    this.targetY,
                    Math.cos(angle) * velocity,
                    Math.sin(angle) * velocity,
                    (this.hue + 60) % 360,  // Màu vàng rực
                    'star',
                    0,
                    false,
                    0.8
                )
            );
        }

        // Tạo vòng lửa xoay
        const fireRingParticles = 40;
        for (let i = 0; i < fireRingParticles; i++) {
            const angle = (i / fireRingParticles) * Math.PI * 2;
            const velocity = 3;
            this.particles.push(
                new Particle(
                    this.targetX,
                    this.targetY,
                    Math.cos(angle) * velocity,
                    Math.sin(angle) * velocity,
                    (this.hue + 30) % 360,
                    'circle',
                    0.1,
                    false,
                    0.7
                )
            );
        }

        // Tạo cánh phượng hoàng
        for (let layer = 0; layer < layers; layer++) {
            const layerScale = 1 + layer * 0.3;  // Tăng kích thước mỗi lớp
            const layerDelay = layer * 0.15;
            
            for (let wing = 0; wing < wings; wing++) {
                const isRightWing = wing === 1;
                const sideMultiplier = isRightWing ? 1 : -1;
                
                for (let i = 0; i < particlesPerWing; i++) {
                    const progress = i / particlesPerWing;
                    const t = progress * Math.PI;
                    
                    // Tạo hình dạng cánh uốn cong
                    const wingAngle = Math.PI * 0.3;  // Góc cánh rộng hơn
                    const x = sideMultiplier * (Math.sin(t) * Math.cos(wingAngle) * 3 * layerScale);
                    const y = -Math.cos(t) * Math.sin(wingAngle) * 4 * layerScale;  // Kéo dài cánh
                    
                    // Tính vận tốc để tạo hiệu ứng bay lên
                    const velocity = 2 + Math.sin(progress * Math.PI) * 2;
                    const angle = Math.atan2(y, x);
                    const vx = Math.cos(angle) * velocity;
                    const vy = Math.sin(angle) * velocity - 0.5;  // Thêm lực đẩy lên trên
                    
                    // Thêm các hạt chính tạo thành cánh
                    const hueShift = layer * 15 + progress * 30;
                    this.particles.push(
                        new Particle(
                            this.targetX,
                            this.targetY,
                            vx,
                            vy,
                            (this.hue + hueShift) % 360,
                            'circle',
                            layerDelay + progress * 0.2,
                            false,
                            0.7 - progress * 0.3
                        )
                    );
                    
                    // Thêm các hạt lửa
                    if (Math.random() < 0.4) {
                        const fireSpread = webRandom.randomFloat(-0.3, 0.3);
                        const fireVelocity = velocity * 1.2;
                        const fireAngle = angle + fireSpread;
                        const fireVx = Math.cos(fireAngle) * fireVelocity;
                        const fireVy = Math.sin(fireAngle) * fireVelocity - 0.8;
                        
                        this.particles.push(
                            new Particle(
                                this.targetX,
                                this.targetY,
                                fireVx,
                                fireVy,
                                (this.hue + hueShift + 60) % 360,  // Màu lửa rực rỡ
                                'star',
                                layerDelay + progress * 0.1,
                                false,
                                0.6
                            )
                        );
                    }
                    
                    // Thêm khói và tia lửa
                    if (Math.random() < 0.3 && progress > 0.2) {
                        const smokeSpread = webRandom.randomFloat(-0.4, 0.4);
                        const smokeVelocity = velocity * 0.7;
                        const smokeAngle = angle + smokeSpread;
                        const smokeVx = Math.cos(smokeAngle) * smokeVelocity;
                        const smokeVy = Math.sin(smokeAngle) * smokeVelocity - 0.3;
                        
                        this.particles.push(
                            new Particle(
                                this.targetX,
                                this.targetY,
                                smokeVx,
                                smokeVy,
                                (this.hue + hueShift - 30) % 360,
                                'circle',
                                layerDelay + progress * 0.25,
                                false,
                                0.4
                            )
                        );
                    }
                }
            }
        }

        // Tạo đuôi phượng hoàng
        const tailFeathers = 15;  // Tăng số lượng lông đuôi
        const tailSpread = Math.PI * 0.3;  // Độ rộng của đuôi
        
        for (let i = 0; i < tailFeathers; i++) {
            const progress = i / tailFeathers;
            const angle = -Math.PI / 2 + (progress - 0.5) * tailSpread;
            const velocity = 3 + Math.random();
            
            // Lông đuôi chính
            this.particles.push(
                new Particle(
                    this.targetX,
                    this.targetY,
                    Math.cos(angle) * velocity,
                    Math.sin(angle) * velocity + 1,  // Bay lên trên
                    (this.hue + progress * 30) % 360,
                    'circle',
                    0.2,
                    false,
                    0.7
                )
            );
            
            // Thêm tia lửa cho đuôi
            if (Math.random() < 0.5) {
                const sparkSpread = webRandom.randomFloat(-0.2, 0.2);
                const sparkVelocity = velocity * 1.1;
                const sparkAngle = angle + sparkSpread;
                
                this.particles.push(
                    new Particle(
                        this.targetX,
                        this.targetY,
                        Math.cos(sparkAngle) * sparkVelocity,
                        Math.sin(sparkAngle) * sparkVelocity + 0.8,
                        (this.hue + 60) % 360,
                        'star',
                        0.1,
                        false,
                        0.5
                    )
                );
            }
        }
    }

    createSecondaryExplosions() {
        const numExplosions = webRandom.randomInt(2, 4);
        for (let i = 0; i < numExplosions; i++) {
            const angle = (i / numExplosions) * Math.PI * 2;
            const distance = webRandom.randomFloat(2, 4);
            
            setTimeout(() => {
                const recursive = new Firework(
                    this.targetX + Math.cos(angle) * distance,
                    this.targetY + Math.sin(angle) * distance,
                    this.targetX + Math.cos(angle) * (distance + 1),
                    this.targetY + Math.sin(angle) * (distance + 1)
                );
                recursive.isRecursive = true;
                recursive.hue = this.hue;
                recursive.explode();
            }, webRandom.randomFloat(200, 400));
        }
    }

    static PERFORMANCE_MODE = {
        HIGH: 'high',     // Chất lượng cao, nhiều hạt
        MEDIUM: 'medium', // Cân bằng
        LOW: 'low'       // Ít hạt, hiệu năng tốt
    };

    static currentPerformanceMode = Firework.PERFORMANCE_MODE.MEDIUM;

    static setPerformanceMode(mode) {
        this.currentPerformanceMode = mode;
    }

    getParticleCount(baseCount) {
        switch(Firework.currentPerformanceMode) {
            case Firework.PERFORMANCE_MODE.HIGH:
                return baseCount;
            case Firework.PERFORMANCE_MODE.MEDIUM:
                return Math.floor(baseCount * 0.6);
            case Firework.PERFORMANCE_MODE.LOW:
                return Math.floor(baseCount * 0.3);
            default:
                return baseCount;
        }
    }

    createHeartEffect(particleCount) {
        const types = ['heart'];
        const type = types[webRandom.randomInt(0, types.length - 1)];
        const heartSize = this.effectParams.heart.size * 5; 
        
        const numPoints = Math.floor(particleCount * 1.8);
        const points = [];
        
        // Tính toán các điểm của trái tim
        for (let i = 0; i < numPoints; i++) {
            const t = (i / numPoints) * Math.PI * 2;
            const x = 16 * Math.pow(Math.sin(t), 3);
            const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
            points.push({
                x: x * heartSize / 16,
                y: y * heartSize / 16,
                angle: t
            });
        }

        points.forEach((point, i) => {
            const delay = (i / numPoints) * 0.2; 
            const burstVelocity = webRandom.randomFloat(6, 9);
            
            const burstParticle = new Particle(
                this.x,
                this.y,
                Math.cos(point.angle) * burstVelocity,
                Math.sin(point.angle) * burstVelocity,
                this.hue,
                type,
                0,
                false,
                delay
            );

            burstParticle.targetX = this.x + point.x;
            burstParticle.targetY = this.y + point.y;
            burstParticle.originalVX = burstParticle.vx;
            burstParticle.originalVY = burstParticle.vy;
            burstParticle.heartPoint = true;
            burstParticle.heartPhase = 0;
            burstParticle.transitionTime = 0.4; 
            burstParticle.heartPosition = {x: point.x, y: point.y};
            burstParticle.scaleFactor = 1.4;
            burstParticle.baseLifespan = 1.0; 
            burstParticle.lifespan = burstParticle.baseLifespan;
            
            burstParticle.update = function() {
                if (!this.active) {
                    this.delay -= 0.016;
                    if (this.delay <= 0) {
                        this.active = true;
                    }
                    return true;
                }

                if (this.heartPoint) {
                    this.heartPhase += 0.016; 
                    
                    if (this.heartPhase < this.transitionTime) {
                        // Phase 0: Nổ ra
                        this.x += this.vx;
                        this.y += this.vy;
                        this.vx *= 0.92;
                        this.vy *= 0.92;
                    } else if (this.heartPhase < this.transitionTime * 2) {
                        // Phase 1: Định hình trái tim
                        const progress = (this.heartPhase - this.transitionTime) / this.transitionTime;
                        const elasticProgress = this.elasticEase(progress);
                        
                        const scale = 1 + Math.sin(progress * Math.PI) * 0.4;
                        const targetX = this.targetX + this.heartPosition.x * (scale - 1);
                        const targetY = this.targetY + this.heartPosition.y * (scale - 1);
                        
                        this.x = this.x + (targetX - this.x) * elasticProgress;
                        this.y = this.y + (targetY - this.y) * elasticProgress;
                    } else {
                        // Phase 2: Rơi xuống
                        const heartbeatScale = 1 + Math.sin(this.heartPhase * 2) * 0.15;
                        const fallProgress = (this.heartPhase - this.transitionTime * 2);
                        
                        this.x = this.targetX + this.heartPosition.x * heartbeatScale;
                        this.y = this.targetY + this.heartPosition.y * heartbeatScale + fallProgress * 1.2; 
                        
                        this.x += Math.sin(this.heartPhase * 1.5) * 0.6;
                    }

                    // Giảm thởi gian sống nhanh hơn sau khi định hình
                    if (this.heartPhase > this.transitionTime * 2.5) {
                        this.lifespan -= 0.015; 
                    } else {
                        this.lifespan -= 0.005; 
                    }
                } else {
                    this.x += this.vx;
                    this.y += this.vy;
                    this.vx *= this.friction;
                    this.vy *= this.friction;
                    this.vy += this.gravity * 0.6;
                    this.lifespan -= 0.02; 
                }

                return this.lifespan > 0;
            };

            burstParticle.elasticEase = function(t) {
                const p = 0.4;
                return Math.pow(2, -10 * t) * Math.sin((t - p/4) * (2 * Math.PI) / p) + 1;
            };

            this.particles.push(burstParticle);
        });

        // Particle trang trí
        const decorativeParticles = Math.floor(particleCount * 0.8);
        for (let i = 0; i < decorativeParticles; i++) {
            const angle = webRandom.randomFloat(0, Math.PI * 2);
            const velocity = webRandom.randomFloat(4, 7);
            const delay = webRandom.randomFloat(0, 0.4); 

            const particle = new Particle(
                this.x,
                this.y,
                Math.cos(angle) * velocity,
                Math.sin(angle) * velocity,
                (this.hue + webRandom.randomFloat(-30, 30)) % 360,
                'star',
                0,
                false,
                delay
            );
            
            particle.lifespan = 0.8; 
            
            this.particles.push(particle);
        }
        
        return this;
    }

    createStarEffect(particleCount) {
        const points = 5;  // Số điểm của ngôi sao
        const particlesPerPoint = Math.floor(particleCount / points);
        
        // Tạo các điểm của ngôi sao
        for (let point = 0; point < points; point++) {
            const pointAngle = (point / points) * Math.PI * 2;
            const pointHueShift = (360 / points) * point;
            
            // Tạo tia chính của mỗi điểm
            for (let i = 0; i < particlesPerPoint; i++) {
                const progress = i / particlesPerPoint;
                const radius = 2 + progress * 4;  // Độ dài tia
                const spread = Math.PI / 8;  // Độ rộng của tia
                
                // Thêm nhiễu vào góc và bán kính
                const starShape = Math.sin(progress * Math.PI) * spread + webRandom.randomFloat(-0.2, 0.2);
                const angle = pointAngle + starShape;
                const jitteredRadius = radius * (1 + webRandom.randomFloat(-0.15, 0.15));
                
                // Tính toán vị trí với nhiễu
                const x = Math.cos(angle) * jitteredRadius;
                const y = Math.sin(angle) * jitteredRadius;
                
                // Thêm hạt chính của tia
                this.particles.push(
                    new Particle(
                        this.x + webRandom.randomFloat(-0.5, 0.5),
                        this.y + webRandom.randomFloat(-0.5, 0.5),
                        x,
                        y,
                        (this.hue + pointHueShift + progress * 30) % 360,
                        'star',
                        webRandom.randomFloat(0.1, 0.3),
                        false,
                        webRandom.randomFloat(0, 0.3)
                    )
                );
                
                // Thêm tia sáng với xác suất
                if (Math.random() < 0.4) {
                    const sparkSpread = webRandom.randomFloat(-0.3, 0.3);
                    this.particles.push(
                        new Particle(
                            this.x,
                            this.y,
                            x + sparkSpread,
                            y + sparkSpread,
                            (this.hue + pointHueShift + 60) % 360,
                            'circle',
                            webRandom.randomFloat(0.1, 0.2),
                            false,
                            webRandom.randomFloat(0.1, 0.4)
                        )
                    );
                }
            }
            
            // Tạo đuôi sao cho mỗi điểm
            const tailParticles = Math.floor(particlesPerPoint * 0.3);
            for (let i = 0; i < tailParticles; i++) {
                const progress = i / tailParticles;
                const tailAngle = pointAngle + Math.PI + webRandom.randomFloat(-0.2, 0.2);
                const tailRadius = (0.5 + progress * 2) * (1 - progress);
                
                const x = Math.cos(tailAngle) * tailRadius;
                const y = Math.sin(tailAngle) * tailRadius;
                
                this.particles.push(
                    new Particle(
                        this.x,
                        this.y,
                        x,
                        y,
                        (this.hue + pointHueShift - 30) % 360,
                        'circle',
                        webRandom.randomFloat(0.05, 0.15),
                        false,
                        webRandom.randomFloat(0.2, 0.5)
                    )
                );
            }
        }
        
        return this;
    }
}

export default Firework;
