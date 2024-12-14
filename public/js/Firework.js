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
        
        this.curvature = (webRandom.randomFloat(0, 1) - 0.5) * 0.05;
        
        this.particles = [];
        this.hue = webRandom.randomFloat(0, 360);
        this.brightness = webRandom.randomFloat(0, 50) + 50;
        this.alpha = 1;
        this.trail = [];
        this.trailLength = 8;
        this.exploded = false;
        this.isRecursive = webRandom.randomFloat(0, 1) < 0.15;

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

    // Thiết lập tất cả thông số cùng lúc
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
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > this.trailLength) {
                this.trail.shift();
            }

            this.velocity.x += this.curvature * (webRandom.randomFloat(0, 1) - 0.5) * 0.02;

            this.x += this.velocity.x;
            this.y += this.velocity.y;
            
            this.velocity.y += 0.02;

            const distanceToTarget = Math.sqrt(
                Math.pow(this.targetX - this.x, 2) + 
                Math.pow(this.targetY - this.y, 2)
            );
            
            if (distanceToTarget < 10 || this.y <= this.targetY) {
                this.explode();
                this.exploded = true;
            }
            return true;
        } else {
            this.particles = this.particles.filter(particle => particle.update());
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
            ctx.strokeStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${this.alpha})`;
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        this.particles.forEach(particle => particle.draw());
    }

    explode() {
        playSound(0.3);
        
        // Danh sách các hiệu ứng có sẵn
        const effects = [
            'normal',     // Nổ đều các hướng
            'spiral',     // Xoắn ốc
            'heart',      // Hình trái tim
            'star',       // Hình ngôi sao
            'circle',     // Vòng tròn đồng tâm
            'rain',       // Mưa sao
            'phoenix',    // Chim phượng hoàng
            'butterfly',  // Hình bướm
            'flower',     // Hình hoa
            'galaxy'      // Thiên hà
        ];

        // Luôn random hiệu ứng, bỏ qua effectType đã set
        const selectedEffect = effects[webRandom.randomInt(0, effects.length - 1)];
        
        // Số lượng hạt mặc định nếu không được chỉ định
        this.particleCount = this.particleCount || (this.isRecursive ? 10 : 50);
        
        switch(selectedEffect) {
            case 'spiral':
                this.createSpiralEffect(this.particleCount);
                break;
            case 'heart':
                this.createHeartEffect(this.particleCount);
                break;
            case 'star':
                this.createStarEffect(this.particleCount);
                break;
            case 'circle':
                this.createCircleEffect(this.particleCount);
                break;
            case 'rain':
                this.createRainEffect(this.particleCount);
                break;
            case 'phoenix':
                this.createPhoenixEffect(this.particleCount);
                break;
            case 'butterfly':
                this.createButterflyEffect(this.particleCount);
                break;
            case 'flower':
                this.createFlowerEffect(this.particleCount);
                break;
            case 'galaxy':
                this.createGalaxyEffect(this.particleCount);
                break;
            default:
                this.createNormalEffect(this.particleCount);
        }
    }

    createNormalEffect(particleCount) {
        const angleStep = (Math.PI * 2) / particleCount;
        const types = ['circle', 'heart', 'star'];
        const type = types[webRandom.randomInt(0, types.length - 1)];

        // Main burst - increased velocity range
        for (let i = 0; i < particleCount; i++) {
            const velocity = webRandom.randomFloat(4, 7);  // Increased from 3-6
            const angle = angleStep * i + webRandom.randomFloat(-0.15, 0.15);
            
            this.particles.push(
                new Particle(
                    this.x,
                    this.y,
                    Math.cos(angle) * velocity,
                    Math.sin(angle) * velocity,
                    this.hue,
                    type,
                    0,
                    this.isRecursive
                )
            );
        }

        // Inner ring - reduced count but increased velocity
        const innerCount = particleCount * 0.4;  // Reduced from 0.5
        const innerAngleStep = (Math.PI * 2) / innerCount;
        for (let i = 0; i < innerCount; i++) {
            const velocity = webRandom.randomFloat(2, 4);  // Increased from 1.5-3
            const angle = innerAngleStep * i;
            const delay = 0.15;  // Reduced from 0.2
            
            this.particles.push(
                new Particle(
                    this.x,
                    this.y,
                    Math.cos(angle) * velocity,
                    Math.sin(angle) * velocity,
                    (this.hue + 30) % 360,
                    'circle',
                    0,
                    false,
                    delay
                )
            );
        }

        // Rays - increased length and velocity
        const rayCount = 16;  // Increased from 12
        const rayAngleStep = (Math.PI * 2) / rayCount;
        for (let i = 0; i < rayCount; i++) {
            const velocity = webRandom.randomFloat(8, 10);  // Increased from 7-9
            const angle = rayAngleStep * i;
            const delay = 0.08;  // Reduced from 0.1
            
            for (let j = 0; j < 4; j++) {  // Increased from 3
                const particleDelay = delay + j * 0.04;  // Reduced from 0.05
                const particleVelocity = velocity * (1 - j * 0.15);  // Reduced decay
                
                this.particles.push(
                    new Particle(
                        this.x,
                        this.y,
                        Math.cos(angle) * particleVelocity,
                        Math.sin(angle) * particleVelocity,
                        (this.hue + 60) % 360,
                        'star',
                        0,
                        false,
                        particleDelay
                    )
                );
            }
        }
    }

    createSpiralEffect(particleCount) {
        const types = ['circle', 'star'];
        const type = types[webRandom.randomInt(0, types.length - 1)];
        const numSpirals = webRandom.randomInt(4, 6);  // Increased from 3-5
        const numArms = webRandom.randomInt(3, 5);     // Increased from 2-4
        
        // Main spiral arms - increased velocity and reduced spread
        for (let arm = 0; arm < numArms; arm++) {
            const armOffset = (Math.PI * 2 * arm) / numArms;
            
            for (let i = 0; i < particleCount / numArms; i++) {
                const progress = i / (particleCount / numArms);
                const angle = progress * Math.PI * numSpirals * 2 + armOffset;
                const baseVelocity = 9 - progress * 3;  // Increased from 8
                
                for (let j = 0; j < 3; j++) {
                    const spread = webRandom.randomFloat(-0.15, 0.15);  // Reduced from -0.2,0.2
                    const velocityVar = webRandom.randomFloat(-0.4, 0.4);  // Reduced from -0.5,0.5
                    
                    this.particles.push(
                        new Particle(
                            this.x,
                            this.y,
                            Math.cos(angle + spread) * (baseVelocity + velocityVar),
                            Math.sin(angle + spread) * (baseVelocity + velocityVar),
                            (this.hue + progress * 40) % 360,  // Increased color variation
                            type,
                            0,
                            this.isRecursive,
                            j * 0.015  // Reduced from 0.02
                        )
                    );
                }
            }
        }
        
        // Inner ring - reduced count but increased velocity
        const ringCount = 3;
        for (let ring = 0; ring < ringCount; ring++) {
            const radius = 3 + ring * 2;
            const ringParticles = Math.floor(particleCount / 3);
            const angleStep = (Math.PI * 2) / ringParticles;
            const rotationSpeed = (ring % 2 === 0 ? 1 : -1) * 0.02;
            
            for (let i = 0; i < ringParticles; i++) {
                const angle = angleStep * i;
                const delay = 0.3 + ring * 0.1;
                
                this.particles.push(
                    new Particle(
                        this.x,
                        this.y,
                        Math.cos(angle) * radius + Math.sin(angle) * rotationSpeed,
                        Math.sin(angle) * radius - Math.cos(angle) * rotationSpeed,
                        (this.hue + ring * 40) % 360,
                        'circle',
                        0,
                        false,
                        delay
                    )
                );
            }
        }
        
        // Final burst - increased velocity and reduced delay
        const finalBurstCount = particleCount * 0.3;
        const burstDelay = 0.4;  // Reduced from 0.5
        for (let i = 0; i < finalBurstCount; i++) {
            const angle = (i / finalBurstCount) * Math.PI * 2;
            const velocity = webRandom.randomFloat(7, 9);  // Increased from 6-8
            
            this.particles.push(
                new Particle(
                    this.x,
                    this.y,
                    Math.cos(angle) * velocity,
                    Math.sin(angle) * velocity,
                    (this.hue + 120) % 360,
                    'star',
                    0,
                    false,
                    burstDelay
                )
            );
        }
    }

    createRippleEffect(particleCount) {
        const rings = 5;
        const particlesPerRing = Math.floor(particleCount / rings);
        const types = ['circle', 'star'];
        const velocityStep = 1.2;
        
        for (let ring = 0; ring < rings; ring++) {
            const velocity = 3 + ring * velocityStep;
            const angleStep = (Math.PI * 2) / particlesPerRing;
            const type = types[webRandom.randomInt(0, types.length - 1)];
            const ringHue = (this.hue + ring * 25) % 360;
            
            for (let i = 0; i < particlesPerRing; i++) {
                const angle = angleStep * i;
                const delay = ring * 0.06;
                
                const clusterSize = ring === 0 ? 4 : 3;
                for (let j = 0; j < clusterSize; j++) {
                    const spread = webRandom.randomFloat(-0.15, 0.15);
                    const velocityVar = webRandom.randomFloat(-0.3, 0.3);
                    
                    this.particles.push(
                        new Particle(
                            this.x,
                            this.y,
                            Math.cos(angle + spread) * (velocity + velocityVar),
                            Math.sin(angle + spread) * (velocity + velocityVar),
                            ringHue,
                            type,
                            0,
                            this.isRecursive,
                            delay + j * 0.02
                        )
                    );
                }
            }
        }
    }

    createFanEffect(particleCount) {
        const fanAngle = Math.PI * 0.7;
        const centerAngle = webRandom.randomFloat(0, Math.PI * 2);
        const types = ['circle', 'star'];
        const type = types[webRandom.randomInt(0, types.length - 1)];
        
        const numLayers = 3;
        for (let layer = 0; layer < numLayers; layer++) {
            const layerParticles = Math.floor(particleCount / numLayers);
            const baseVelocity = 5 + layer * 2;
            
            for (let i = 0; i < layerParticles; i++) {
                const progress = i / layerParticles;
                const angle = centerAngle - fanAngle/2 + (fanAngle * progress);
                
                const velocityMultiplier = 1 - Math.abs(progress - 0.5) * 0.5;
                const velocity = baseVelocity + velocityMultiplier * 2;
                
                const clusterSize = 4;
                for (let j = 0; j < clusterSize; j++) {
                    const spread = webRandom.randomFloat(-0.1, 0.1);
                    const velocityVar = webRandom.randomFloat(-0.5, 0.5);
                    
                    this.particles.push(
                        new Particle(
                            this.x,
                            this.y,
                            Math.cos(angle + spread) * (velocity + velocityVar),
                            Math.sin(angle + spread) * (velocity + velocityVar),
                            (this.hue + layer * 15) % 360,
                            type,
                            0,
                            this.isRecursive,
                            layer * 0.05 + j * 0.01
                        )
                    );
                }
            }
        }
    }

    createDoubleEffect(particleCount) {
        const halfCount = Math.floor(particleCount / 2);
        const angleStep = (Math.PI * 2) / halfCount;
        const types = ['circle', 'star'];
        
        for (let i = 0; i < halfCount; i++) {
            const angle = angleStep * i;
            const velocity = webRandom.randomFloat(3, 4);
            const type = types[webRandom.randomInt(0, types.length - 1)];
            
            for (let j = 0; j < 3; j++) {
                const spread = webRandom.randomFloat(-0.1, 0.1);
                const velocityVar = webRandom.randomFloat(-0.2, 0.2);
                
                this.particles.push(
                    new Particle(
                        this.x,
                        this.y,
                        Math.cos(angle + spread) * (velocity + velocityVar),
                        Math.sin(angle + spread) * (velocity + velocityVar),
                        this.hue,
                        type,
                        0,
                        this.isRecursive,
                        j * 0.02
                    )
                );
            }
        }
        
        for (let i = 0; i < halfCount; i++) {
            const angle = -angleStep * i;
            const velocity = webRandom.randomFloat(6, 7);
            const type = types[webRandom.randomInt(0, types.length - 1)];
            
            for (let j = 0; j < 2; j++) {
                const spread = webRandom.randomFloat(-0.15, 0.15);
                const velocityVar = webRandom.randomFloat(-0.3, 0.3);
                
                this.particles.push(
                    new Particle(
                        this.x,
                        this.y,
                        Math.cos(angle + spread) * (velocity + velocityVar),
                        Math.sin(angle + spread) * (velocity + velocityVar),
                        (this.hue + 140) % 360,
                        type,
                        0,
                        this.isRecursive,
                        0.1 + j * 0.03
                    )
                );
            }
        }
    }

    createHeartEffect(particleCount) {
        const types = ['heart'];
        const type = types[webRandom.randomInt(0, types.length - 1)];
        const heartSize = 8;
        const points = [];
        
        // Tạo điểm cho hình trái tim
        for (let i = 0; i < particleCount; i++) {
            const t = (i / particleCount) * Math.PI * 2;
            const x = 16 * Math.pow(Math.sin(t), 3);
            const y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
            points.push({x: x * heartSize / 16, y: -y * heartSize / 16});
        }
        
        // Tạo particle cho mỗi điểm
        points.forEach((point, i) => {
            const velocity = webRandom.randomFloat(2, 4);
            const angle = Math.atan2(point.y, point.x);
            const delay = (i / particleCount) * 0.3; // Hiệu ứng nở dần
            
            this.particles.push(
                new Particle(
                    this.x,
                    this.y,
                    Math.cos(angle) * velocity,
                    Math.sin(angle) * velocity,
                    this.hue,
                    type,
                    0,
                    this.isRecursive,
                    delay
                )
            );
        });
    }

    createStarEffect(particleCount) {
        const types = ['star'];
        const type = types[webRandom.randomInt(0, types.length - 1)];
        const points = 5;
        const innerRadius = 3;
        const outerRadius = 6;
        
        for (let i = 0; i < points * 2; i++) {
            const angle = (i * Math.PI) / points;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const velocity = webRandom.randomFloat(2, 5);
            
            // Tạo cluster cho mỗi đỉnh
            for (let j = 0; j < particleCount/10; j++) {
                const spread = webRandom.randomFloat(-0.2, 0.2);
                const velocityVar = webRandom.randomFloat(-0.5, 0.5);
                const delay = (i / (points * 2)) * 0.2;
                
                this.particles.push(
                    new Particle(
                        this.x,
                        this.y,
                        Math.cos(angle + spread) * (velocity + velocityVar),
                        Math.sin(angle + spread) * (velocity + velocityVar),
                        this.hue,
                        type,
                        0,
                        this.isRecursive,
                        delay
                    )
                );
            }
        }
    }

    createCircleEffect(particleCount) {
        const types = ['circle'];
        const type = types[webRandom.randomInt(0, types.length - 1)];
        const numCircles = 4;
        
        for (let circle = 0; circle < numCircles; circle++) {
            const radius = 3 + circle * 2;
            const particlesInCircle = Math.floor(particleCount / numCircles);
            const angleStep = (Math.PI * 2) / particlesInCircle;
            
            for (let i = 0; i < particlesInCircle; i++) {
                const angle = angleStep * i;
                const velocity = radius;
                const delay = circle * 0.1;
                
                // Tạo cluster cho mỗi điểm
                for (let j = 0; j < 3; j++) {
                    const spread = webRandom.randomFloat(-0.1, 0.1);
                    const velocityVar = webRandom.randomFloat(-0.2, 0.2);
                    
                    this.particles.push(
                        new Particle(
                            this.x,
                            this.y,
                            Math.cos(angle + spread) * (velocity + velocityVar),
                            Math.sin(angle + spread) * (velocity + velocityVar),
                            (this.hue + circle * 30) % 360,
                            type,
                            0,
                            this.isRecursive,
                            delay + j * 0.02
                        )
                    );
                }
            }
        }
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
                const velocity = webRandom.randomFloat(3, 5);
                
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
                        0,
                        this.isRecursive,
                        progress * 0.3
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
                        0,
                        false,
                        progress * 0.3 + 0.1
                    );
                    this.particles.push(connector);
                }
            }
        }
    }

    createGalaxyEffect(particleCount) {
        const types = ['circle', 'star'];
        const type = types[webRandom.randomInt(0, types.length - 1)];
        const arms = 4;
        const armLength = 8;
        
        for (let arm = 0; arm < arms; arm++) {
            const baseAngle = (arm * Math.PI * 2) / arms;
            
            for (let i = 0; i < particleCount/arms; i++) {
                const distance = (i / (particleCount/arms)) * armLength;
                const curve = distance * 0.5;
                const angle = baseAngle + curve;
                
                const velocity = 2 + distance * 0.3;
                
                for (let j = 0; j < 3; j++) {
                    const spread = webRandom.randomFloat(-0.2, 0.2);
                    const velocityVar = webRandom.randomFloat(-0.5, 0.5);
                    const delay = (distance / armLength) * 0.3;
                    
                    this.particles.push(
                        new Particle(
                            this.x,
                            this.y,
                            Math.cos(angle + spread) * (velocity + velocityVar),
                            Math.sin(angle + spread) * (velocity + velocityVar),
                            (this.hue + distance * 15) % 360,
                            type,
                            0,
                            this.isRecursive,
                            delay
                        )
                    );
                }
            }
        }
    }

    createButterflyEffect(particleCount) {
        const types = ['circle', 'heart'];
        const type = types[webRandom.randomInt(0, types.length - 1)];
        
        for (let i = 0; i < particleCount; i++) {
            const t = (i / particleCount) * Math.PI * 2;
            // Phương trình hình cánh bướm
            const r = Math.exp(Math.cos(t)) - 2 * Math.cos(4*t) + Math.pow(Math.sin(t/12), 5);
            const x = Math.sin(t) * r * 3;
            const y = Math.cos(t) * r * 3;
            
            const velocity = webRandom.randomFloat(2, 4);
            const angle = Math.atan2(y, x);
            const delay = (i / particleCount) * 0.5;
            
            // Tạo cụm hạt cho mỗi điểm
            for (let j = 0; j < 2; j++) {
                const spread = webRandom.randomFloat(-0.1, 0.1);
                const velocityVar = webRandom.randomFloat(-0.2, 0.2);
                
                this.particles.push(
                    new Particle(
                        this.x,
                        this.y,
                        Math.cos(angle + spread) * (velocity + velocityVar),
                        Math.sin(angle + spread) * (velocity + velocityVar),
                        (this.hue + i * 2) % 360,
                        type,
                        0,
                        this.isRecursive,
                        delay + j * 0.02
                    )
                );
            }
        }
    }

    createFlowerEffect(particleCount) {
        const types = ['circle', 'heart'];
        const type = types[webRandom.randomInt(0, types.length - 1)];
        const petals = 6;
        const layers = 3;
        
        for (let layer = 0; layer < layers; layer++) {
            const radius = 3 + layer * 2;
            
            for (let petal = 0; petal < petals; petal++) {
                const baseAngle = (petal * Math.PI * 2) / petals;
                
                for (let i = 0; i < particleCount/(petals * layers); i++) {
                    const progress = i / (particleCount/(petals * layers));
                    // Phương trình hình cánh hoa
                    const r = radius * (1 + Math.sin(progress * Math.PI));
                    const angle = baseAngle + progress * 0.5;
                    
                    const x = Math.cos(angle) * r;
                    const y = Math.sin(angle) * r;
                    
                    const velocity = webRandom.randomFloat(2, 4);
                    const particleAngle = Math.atan2(y, x);
                    const delay = layer * 0.2 + progress * 0.3;
                    
                    for (let j = 0; j < 2; j++) {
                        const spread = webRandom.randomFloat(-0.1, 0.1);
                        const velocityVar = webRandom.randomFloat(-0.2, 0.2);
                        
                        this.particles.push(
                            new Particle(
                                this.x,
                                this.y,
                                Math.cos(particleAngle + spread) * (velocity + velocityVar),
                                Math.sin(particleAngle + spread) * (velocity + velocityVar),
                                (this.hue + layer * 30) % 360,
                                type,
                                0,
                                this.isRecursive,
                                delay + j * 0.02
                            )
                        );
                    }
                }
            }
        }
    }

    createRainEffect(particleCount) {
        const types = ['circle', 'star'];
        const type = types[webRandom.randomInt(0, types.length - 1)];
        const width = 40;    // Tăng độ rộng từ 20 lên 40
        const height = 30;   // Tăng chiều cao từ 15 lên 30
        // Tạo nhiều cụm mưa
        const numClusters = 5;
        for (let cluster = 0; cluster < numClusters; cluster++) {
            const clusterOffsetX = webRandom.randomFloat(-width * 0.8, width * 0.8);
            const clusterOffsetY = webRandom.randomFloat(-height * 0.5, height * 0.5);
            const clusterParticles = Math.floor(particleCount / numClusters);
            
            for (let i = 0; i < clusterParticles; i++) {
                // Phân bố hạt trong một hình oval
                const angle = webRandom.randomFloat(0, Math.PI * 2);
                const radiusX = webRandom.randomFloat(0, width/2);
                const radiusY = webRandom.randomFloat(0, height/2);
                const x = Math.cos(angle) * radiusX + clusterOffsetX;
                const y = Math.sin(angle) * radiusY + clusterOffsetY;
                
                // Tạo góc rơi ngẫu nhiên cho mỗi cụm
                const baseAngle = Math.PI/2 + webRandom.randomFloat(-0.3, 0.3);
                const clusterSpread = webRandom.randomFloat(-0.2, 0.2);
                const finalAngle = baseAngle + clusterSpread;
                
                // Tốc độ rơi thay đổi theo vị trí
                const distanceFromCenter = Math.sqrt(x*x + y*y);
                const baseVelocity = 4 + distanceFromCenter * 0.1;
                const velocity = baseVelocity + webRandom.randomFloat(-1, 1);
                
                // Delay dựa trên vị trí Y để tạo hiệu ứng rơi tuần tự
                const delay = (y + height/2) / height * 0.5 + cluster * 0.1;
                
                // Tạo dải mưa sao với độ dài thay đổi
                const trailLength = webRandom.randomInt(2, 4);
                for (let j = 0; j < trailLength; j++) {
                    const trailDelay = delay + j * 0.03;
                    const trailVelocity = velocity * (1 - j * 0.15);  // Giảm tốc độ theo độ dài dải mưa
                    const alpha = 1 - (j / trailLength) * 0.5;  // Độ trong suốt giảm dần
                    
                    this.particles.push(
                        new Particle(
                            this.x + x,
                            this.y + y,
                            Math.cos(finalAngle) * trailVelocity,
                            Math.sin(finalAngle) * trailVelocity,
                            (this.hue + j * 5 + cluster * 20) % 360,
                            type,
                            0,
                            this.isRecursive,
                            trailDelay
                        )
                    );
                }
            }
        }
    }

    createPhoenixEffect(particleCount) {
        const types = ['circle', 'star'];
        const type = types[webRandom.randomInt(0, types.length - 1)];
        const wingSpan = 25;      // Tăng độ dài cánh từ 12 lên 25
        const bodyLength = 30;     // Tăng độ dài thân từ 15 lên 30
        const particleDensity = 2; // Tăng mật độ hạt
        
        // Tạo thân chim
        for (let i = 0; i < particleCount/2; i++) {  // Tăng số lượng hạt cho thân
            const progress = i / (particleCount/2);
            const x = -bodyLength/2 + progress * bodyLength;
            const y = Math.sin(progress * Math.PI * 2) * 4;  // Tăng biên độ dao động thân
            
            const velocity = 4 + Math.abs(y) * 0.3;  // Tăng tốc độ
            const angle = Math.atan2(y, x) + Math.PI/2;
            const delay = progress * 0.3;
            
            // Tăng số lượng hạt cho mỗi điểm
            for (let j = 0; j < 3; j++) {
                const spread = webRandom.randomFloat(-0.15, 0.15);  // Tăng độ spread
                const velocityVar = webRandom.randomFloat(-0.8, 0.8);  // Tăng biến thiên vận tốc
                
                this.particles.push(
                    new Particle(
                        this.x,
                        this.y,
                        Math.cos(angle + spread) * (velocity + velocityVar),
                        Math.sin(angle + spread) * (velocity + velocityVar),
                        (this.hue + progress * 50) % 360,
                        type,
                        0,
                        this.isRecursive,
                        delay + j * 0.02
                    )
                );
            }
        }
        
        // Tạo cánh
        for (let side = -1; side <= 1; side += 2) {
            for (let i = 0; i < particleCount * 0.8; i++) {  // Tăng số lượng hạt cho cánh
                const progress = i / (particleCount * 0.8);
                const angle = progress * Math.PI - Math.PI/2;
                const r = wingSpan * Math.sin(progress * Math.PI);
                
                // Thêm hiệu ứng uốn cong cho cánh
                const curve = Math.sin(progress * Math.PI) * 5;
                const x = Math.cos(angle) * r + curve;
                const y = Math.sin(angle) * r * side;
                
                const velocity = 4 + r * 0.3;  // Tăng tốc độ
                const particleAngle = Math.atan2(y, x);
                const delay = progress * 0.4;
                
                // Tăng số lượng hạt cho mỗi điểm
                for (let j = 0; j < 3; j++) {
                    const spread = webRandom.randomFloat(-0.2, 0.2);
                    const velocityVar = webRandom.randomFloat(-0.5, 0.5);
                    
                    this.particles.push(
                        new Particle(
                            this.x,
                            this.y,
                            Math.cos(particleAngle + spread) * (velocity + velocityVar),
                            Math.sin(particleAngle + spread) * (velocity + velocityVar),
                            (this.hue + 20 + progress * 30) % 360,
                            type,
                            0,
                            this.isRecursive,
                            delay + j * 0.02
                        )
                    );
                }
            }
        }
        
        // Thêm đuôi phượng hoàng
        const tailLength = wingSpan * 1.2;
        const tailSpread = Math.PI/6;
        for (let i = 0; i < particleCount/3; i++) {
            const progress = i / (particleCount/3);
            const baseAngle = -Math.PI/2;
            const spread = tailSpread * (progress - 0.5);
            const r = tailLength * Math.pow(progress, 0.8);
            
            const x = Math.cos(baseAngle + spread) * r;
            const y = Math.sin(baseAngle + spread) * r;
            
            const velocity = 5 + r * 0.2;
            const angle = Math.atan2(y, x);
            const delay = progress * 0.3;
            
            for (let j = 0; j < 3; j++) {
                const particleSpread = webRandom.randomFloat(-0.1, 0.1);
                const velocityVar = webRandom.randomFloat(-0.5, 0.5);
                
                this.particles.push(
                    new Particle(
                        this.x,
                        this.y,
                        Math.cos(angle + particleSpread) * (velocity + velocityVar),
                        Math.sin(angle + particleSpread) * (velocity + velocityVar),
                        (this.hue + 40 + progress * 40) % 360,
                        type,
                        0,
                        this.isRecursive,
                        delay + j * 0.02
                    )
                );
            }
        }
    }

    createParabolaEffect(particleCount) {
        const types = ['circle', 'star'];
        const type = types[webRandom.randomInt(0, types.length - 1)];
        const numParabolas = 5;
        
        for (let p = 0; p < numParabolas; p++) {
            const a = webRandom.randomFloat(0.1, 0.3); // Độ cong của parabol
            const h = webRandom.randomFloat(-5, 5);    // Dịch chuyển ngang
            const k = webRandom.randomFloat(-5, 5);    // Dịch chuyển dọc
            const direction = p % 2 === 0 ? 1 : -1;    // Hướng mở của parabol
            
            for (let i = 0; i < particleCount/numParabolas; i++) {
                const progress = i / (particleCount/numParabolas);
                const x = -10 + progress * 20;  // x từ -10 đến 10
                const y = direction * a * Math.pow(x - h, 2) + k;
                
                const velocity = 3 + Math.abs(y) * 0.2;
                const angle = Math.atan2(y, x);
                const delay = progress * 0.3 + p * 0.1;
                
                // Tạo chuỗi hạt dọc theo parabol
                for (let j = 0; j < 3; j++) {
                    const spread = webRandom.randomFloat(-0.1, 0.1);
                    const velocityVar = webRandom.randomFloat(-0.5, 0.5);
                    
                    this.particles.push(
                        new Particle(
                            this.x,
                            this.y,
                            Math.cos(angle + spread) * (velocity + velocityVar),
                            Math.sin(angle + spread) * (velocity + velocityVar),
                            (this.hue + p * 30 + j * 5) % 360,
                            type,
                            0,
                            this.isRecursive,
                            delay + j * 0.02
                        )
                    );
                }
            }
        }
    }

    createTextEffect(particleCount) {
        const types = ['circle', 'star'];
        const type = types[webRandom.randomInt(0, types.length - 1)];
        
        // Danh sách các chữ ngẫu nhiên
        const texts = ['2024', '❤️', '★', '✿', 'HNY'];
        const text = texts[webRandom.randomInt(0, texts.length - 1)];
        
        // Tạo canvas tạm để vẽ text
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        const fontSize = 30;
        tempCanvas.width = fontSize * text.length;
        tempCanvas.height = fontSize * 1.5;
        
        // Vẽ text
        tempCtx.font = `${fontSize}px Arial`;
        tempCtx.fillStyle = 'white';
        tempCtx.textAlign = 'center';
        tempCtx.textBaseline = 'middle';
        tempCtx.fillText(text, tempCanvas.width/2, tempCanvas.height/2);
        
        // Lấy pixel data
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const pixels = imageData.data;
        const points = [];
        
        // Tìm các điểm có pixel
        const step = 2; // Bước nhảy để giảm số lượng hạt
        for (let y = 0; y < tempCanvas.height; y += step) {
            for (let x = 0; x < tempCanvas.width; x += step) {
                const i = (y * tempCanvas.width + x) * 4;
                if (pixels[i + 3] > 0) { // Kiểm tra alpha channel
                    points.push({
                        x: (x - tempCanvas.width/2) / (fontSize/2),
                        y: (y - tempCanvas.height/2) / (fontSize/2)
                    });
                }
            }
        }
        
        // Tạo particles từ các điểm tìm được
        const numPoints = Math.min(points.length, particleCount);
        for (let i = 0; i < numPoints; i++) {
            const point = points[Math.floor(i / numPoints * points.length)];
            const velocity = webRandom.randomFloat(2, 4);
            const angle = Math.atan2(point.y, point.x);
            const distance = Math.sqrt(point.x * point.x + point.y * point.y);
            const delay = (distance / 10) * 0.3; // Delay dựa trên khoảng cách
            
            // Tạo cluster cho mỗi điểm
            for (let j = 0; j < 2; j++) {
                const spread = webRandom.randomFloat(-0.1, 0.1);
                const velocityVar = webRandom.randomFloat(-0.2, 0.2);
                
                this.particles.push(
                    new Particle(
                        this.x,
                        this.y,
                        Math.cos(angle + spread) * (velocity + velocityVar),
                        Math.sin(angle + spread) * (velocity + velocityVar),
                        (this.hue + i * 2) % 360,
                        type,
                        0,
                        this.isRecursive,
                        delay + j * 0.02
                    )
                );
            }
        }
    }
}

export default Firework;
